from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import sys
from bson import ObjectId
from datetime import datetime
from functools import wraps
import requests
import traceback

sys.path.append('../..')
from shared.config import MONGODB_URI, DATABASE_NAME

app = Flask(__name__)
CORS(app)

# MongoDB connection
try:
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    users_collection = db.users
    courses_collection = db.courses
    enrollments_collection = db.enrollments
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)

# Auth service URL
AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://localhost:5001')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            response = requests.post(
                f'{AUTH_SERVICE_URL}/auth/verify',
                headers={'Authorization': f'Bearer {token}'}
            )
            if response.status_code != 200:
                return jsonify({'error': 'Invalid token'}), 401
            
            current_user = response.json()
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Token verification failed'}), 401
    return decorated

@app.route('/users/profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    try:
        user = users_collection.find_one({'_id': ObjectId(current_user['user_id'])})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get enrolled courses
        enrollments = list(enrollments_collection.find({'student_id': current_user['user_id']}))
        enrolled_courses = []
        
        for enrollment in enrollments:
            course = courses_collection.find_one({'_id': ObjectId(enrollment['course_id'])})
            if course:
                enrolled_courses.append({
                    'course_id': str(course['_id']),
                    'title': course['course_title'],
                    'progress': enrollment.get('progress', 0),
                    'enrolled_date': enrollment.get('enrolled_date')
                })

        return jsonify({
            'user_id': str(user['_id']),
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'email': user['email'],
            'role': user['role'],
            'enrolled_courses': enrolled_courses
        }), 200

    except Exception as e:
        print(f"Error fetching user profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/users/update-profile', methods=['PUT'])
@token_required
def update_user_profile(current_user):
    try:
        data = request.get_json()
        
        # Update user document
        update_data = {
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'updated_at': datetime.utcnow()
        }
        
        result = users_collection.update_one(
            {'_id': ObjectId(current_user['user_id'])},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400
            
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/users/<user_id>/courses', methods=['GET'])
@token_required
def get_user_courses(current_user, user_id):
    try:
        enrollments = list(enrollments_collection.find({'student_id': user_id}))
        courses = []
        
        for enrollment in enrollments:
            course = courses_collection.find_one({'_id': ObjectId(enrollment['course_id'])})
            if course:
                courses.append({
                    'course_id': str(course['_id']),
                    'title': course['course_title'],
                    'progress': enrollment.get('progress', 0),
                    'status': enrollment.get('status', 'enrolled')
                })
                
        return jsonify({'courses': courses}), 200
        
    except Exception as e:
        print(f"Error fetching user courses: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'service': 'user-service',
            'mongodb': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'user-service',
            'error': str(e)
        }), 500

@app.route('/users/all', methods=['GET'])
@token_required
def get_all_users(current_user):
    try:
        if current_user['role'] != 'hr_admin':
            return jsonify({'error': 'Unauthorized'}), 403
            
        users = list(users_collection.find({}, {'password': 0}))
        formatted_users = []
        
        for user in users:
            user['_id'] = str(user['_id'])
            formatted_users.append(user)
            
        return jsonify({'users': formatted_users}), 200
        
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/users/approve/<user_id>', methods=['PUT'])
@token_required
def approve_user(current_user, user_id):
    try:
        if current_user['role'] != 'hr_admin':
            return jsonify({'error': 'Unauthorized'}), 403
            
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'status': 'active'}}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({'message': 'User approved successfully'}), 200
        
    except Exception as e:
        print(f"Error approving user: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    try:
        stats = {
            'total_users': users_collection.count_documents({}),
            'pending_approvals': users_collection.count_documents({'status': 'pending'}),
            'active_users': users_collection.count_documents({'status': 'active'})
        }
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004) 