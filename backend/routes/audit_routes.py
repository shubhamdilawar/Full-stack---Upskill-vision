from flask import Blueprint, jsonify, request
from datetime import datetime
from bson import ObjectId
from functools import wraps
from flask_cors import cross_origin
from .auth_routes import token_required
from ..db import audit_log_collection, users_collection, courses_collection

audit = Blueprint('audit', __name__)

def log_action(user_id, action_type, course_id, details):
    """Helper function to log actions"""
    try:
        log_entry = {
            'user_id': str(user_id),
            'action_type': action_type,
            'course_id': str(course_id),
            'details': details,
            'timestamp': datetime.utcnow()
        }
        audit_log_collection.insert_one(log_entry)
    except Exception as e:
        print(f"Error logging action: {str(e)}")

@audit.route('/audit-trail', methods=['GET', 'OPTIONS'])
@cross_origin()
@token_required
def get_audit_trail(current_user):
    try:
        if current_user['role'] not in ['HR Admin', 'Instructor']:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get query parameters for filtering
        filters = {}
        action_type = request.args.get('action_type')
        user_role = request.args.get('user_role')

        if action_type:
            filters['action_type'] = action_type
        if user_role:
            filters['user_role'] = user_role

        # Fetch audit logs with pagination
        page = max(1, int(request.args.get('page', 1)))  # Ensure page is at least 1
        per_page = int(request.args.get('per_page', 10))
        skip = (page - 1) * per_page

        # Format the audit logs
        audit_logs = []
        raw_logs = list(audit_log_collection.find(
            filters
        ).sort('timestamp', -1).skip(skip).limit(per_page))

        for log in raw_logs:
            try:
                # Get user details
                user_id = log.get('user_id')
                user = users_collection.find_one({'_id': ObjectId(user_id)}) if user_id else None
                
                # Create user display name
                user_name = 'Unknown User'
                if user:
                    first_name = user.get('first_name', '')
                    last_name = user.get('last_name', '')
                    if first_name or last_name:
                        user_name = f"{first_name} {last_name}".strip()
                    else:
                        user_name = user.get('email', 'Unknown User')

                # Get course details
                course_id = log.get('course_id')
                course = courses_collection.find_one({'_id': ObjectId(course_id)}) if course_id else None
                course_title = course.get('course_title', 'Unknown Course') if course else 'Unknown Course'

                formatted_log = {
                    'timestamp': log.get('timestamp').isoformat() if log.get('timestamp') else None,
                    'user_id': str(log.get('user_id')),
                    'user_name': user_name,
                    'action_type': str(log.get('action_type')),
                    'details': str(log.get('details')),
                    'course_id': str(course_id) if course_id else '',
                    'course_title': course_title
                }
                audit_logs.append(formatted_log)
            except Exception as e:
                print(f"Error formatting log entry: {str(e)}")
                continue

        total_logs = audit_log_collection.count_documents(filters)
        total_pages = (total_logs + per_page - 1) // per_page

        return jsonify({
            'audit_logs': audit_logs,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages,
            'total_records': total_logs
        }), 200

    except Exception as e:
        print(f"Error fetching audit trail: {str(e)}")
        return jsonify({'error': 'Failed to fetch audit trail'}), 500 