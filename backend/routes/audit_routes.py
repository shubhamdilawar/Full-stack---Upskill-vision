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
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 200
        
    try:
        if current_user['role'] not in ['HR Admin', 'Instructor']:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get query parameters for filtering
        filters = {}
        action_type = request.args.get('action_type')
        user_role = request.args.get('user_role')

        # Build the filter query
        if action_type:
            filters['action_type'] = action_type
            
        # For role filtering, we need to join with users collection
        user_query = {}
        if user_role and user_role != 'all':
            user_query['role'] = user_role

        # Get all matching user IDs if role filter is applied
        user_ids = []
        if user_query:
            matching_users = users_collection.find(user_query)
            user_ids = [str(user['_id']) for user in matching_users]
            if user_ids:
                filters['user_id'] = {'$in': user_ids}
            else:
                # If no users match the role filter, return empty result
                return jsonify({
                    'audit_logs': [],
                    'page': 1,
                    'per_page': 10,
                    'total_pages': 0,
                    'total_records': 0
                }), 200

        # Fetch audit logs with pagination
        page = max(1, int(request.args.get('page', 1)))
        per_page = int(request.args.get('per_page', 10))
        skip = (page - 1) * per_page

        # Get the raw logs
        raw_logs = list(audit_log_collection.find(filters)
                       .sort('timestamp', -1)
                       .skip(skip)
                       .limit(per_page))

        # Fetch all relevant course IDs
        course_ids = [log.get('course_id') for log in raw_logs if log.get('course_id')]
        courses_map = {}
        if course_ids:
            courses = courses_collection.find({'_id': {'$in': [ObjectId(cid) for cid in course_ids]}})
            courses_map = {str(course['_id']): course for course in courses}

        # Format the audit logs
        audit_logs = []
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

                # Get course details from the map
                course_id = log.get('course_id')
                course = courses_map.get(course_id) if course_id else None
                
                # Extract course title from details if not found in courses collection
                if not course:
                    try:
                        details = log.get('details', {})
                        if isinstance(details, str):
                            import json
                            details = json.loads(details)
                        course_title = details.get('course_title', 'Unknown Course')
                    except:
                        course_title = 'Unknown Course'
                else:
                    course_title = course.get('course_title', 'Unknown Course')

                formatted_log = {
                    'timestamp': log.get('timestamp').isoformat() if log.get('timestamp') else None,
                    'user_name': user_name,
                    'user_role': user.get('role') if user else 'Unknown Role',
                    'action_type': log.get('action_type', 'unknown_action'),
                    'details': log.get('details', {}),
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