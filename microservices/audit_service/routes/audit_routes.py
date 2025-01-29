from flask import Blueprint, jsonify, request
from datetime import datetime
from bson import ObjectId
from functools import wraps
from flask_cors import cross_origin
import jwt
import os
import requests
from audit_service.db.db import audit_log_collection, users_collection, courses_collection
import json

audit = Blueprint('audit', __name__)

AUTH_SERVICE_URL = "http://127.0.0.1:5001"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            response = jsonify({'message': 'OK'})
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            return response, 200

        token = None
        print("Headers:", request.headers)

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
                print("Token found:", token)
            except IndexError:
                print("Invalid Authorization header format")
                return jsonify({'message': 'Invalid Authorization header format'}), 401

        if not token:
            print("Token is missing")
            return jsonify({'message': 'Token is missing'}), 401

        try:
            secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
            print("Using secret key:", secret_key)
            
            decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
            print("Decoded token:", decoded_token)
            
            return f(decoded_token, *args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token error: {str(e)}")
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            print(f"Token verification error: {str(e)}")
            return jsonify({'message': f'Error: {str(e)}'}), 500

    return decorated

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
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
        
    try:
        # Use role from decoded token instead of making request to auth service
        if current_user.get('role') not in ['HR Admin', 'Instructor']:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get query parameters for filtering
        filters = {}
        action_type = request.args.get('action_type')
        user_role = request.args.get('user_role')
        page = max(1, int(request.args.get('page', 1)))
        per_page = int(request.args.get('per_page', 10))
        skip = (page - 1) * per_page

        # Build the filter query
        if action_type:
            filters['action_type'] = action_type

        # Get the raw logs
        raw_logs = list(audit_log_collection.find(filters)
                    .sort('timestamp', -1)
                    .skip(skip)
                    .limit(per_page))

        # Fetch all valid course IDs
        course_ids = []
        for log in raw_logs:
            course_id = log.get('course_id')
            if course_id and isinstance(course_id, str):
                try:
                    # Validate if it's a valid ObjectId
                    ObjectId(course_id)
                    course_ids.append(course_id)
                except:
                    continue

        # Fetch courses
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
                user = None
                if user_id:
                    try:
                        user = users_collection.find_one({'_id': ObjectId(user_id)})
                    except:
                        pass

                # Create user display name
                user_name = user.get('email', 'Unknown User') if user else 'Unknown User'

                # Get course details
                course_id = log.get('course_id')
                course_title = 'Unknown Course'
                
                if course_id:
                    course = courses_map.get(course_id)
                    if course:
                        course_title = course.get('title', 'Unknown Course')
                    else:
                        # Try to get course title from details
                        details = log.get('details', {})
                        if isinstance(details, str):
                            try:
                                details = json.loads(details)
                            except:
                                details = {}
                        course_title = details.get('course_title', 'Unknown Course')

                formatted_log = {
                    'timestamp': log.get('timestamp').isoformat() if log.get('timestamp') else None,
                    'user_name': user_name,
                    'user_role': user.get('role', 'Unknown Role') if user else 'Unknown Role',
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
        return jsonify({'error': 'Failed to fetch audit trail', 'details': str(e)}), 500

@audit.route('/course/<course_id>/audit-log', methods=['GET', 'OPTIONS'])
@cross_origin()
@token_required
def get_course_audit_log(current_user, course_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200

    try:
        # Verify user has permission
        if current_user.get('role') not in ['HR Admin', 'Instructor']:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get audit logs for this course
        logs = list(audit_log_collection.find(
            {'course_id': course_id}
        ).sort('timestamp', -1))

        # Format the logs
        formatted_logs = []
        for log in logs:
            try:
                # Get user details
                user_id = log.get('user_id')
                user = None
                if user_id:
                    try:
                        user = users_collection.find_one({'_id': ObjectId(user_id)})
                    except:
                        pass

                formatted_log = {
                    'timestamp': log.get('timestamp').isoformat() if log.get('timestamp') else None,
                    'user_name': user.get('email', 'Unknown User') if user else 'Unknown User',
                    'user_role': user.get('role', 'Unknown Role') if user else 'Unknown Role',
                    'action_type': log.get('action_type', 'unknown_action'),
                    'details': log.get('details', {})
                }
                formatted_logs.append(formatted_log)
            except Exception as e:
                print(f"Error formatting log entry: {str(e)}")
                continue

        return jsonify({
            'audit_logs': formatted_logs,
            'course_id': course_id
        }), 200

    except Exception as e:
        print(f"Error fetching course audit log: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch course audit log',
            'details': str(e)
        }), 500