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
    courses_collection = db.courses
    enrollments_collection = db.enrollments
    modules_collection = db.modules
    assignments_collection = db.assignments
    quizzes_collection = db.quizzes
    submissions_collection = db.submissions
    users_collection = db.users
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

# Course Routes
@app.route('/courses/create_course', methods=['POST'])
@token_required
def create_course(current_user):
    try:
        data = request.get_json()
        
        # Create course document
        course = {
            'course_title': data['course_title'],
            'description': data['description'],
            'instructor_id': current_user['user_id'],
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'duration': data['duration'],
            'category': data.get('category', 'General'),
            'difficulty_level': data.get('difficulty_level', 'Intermediate'),
            'prerequisites': data.get('prerequisites', ''),
            'learning_outcomes': data.get('learning_outcomes', ''),
            'max_participants': data.get('max_participants', 30),
            'created_at': datetime.utcnow(),
            'status': 'active'
        }
        
        result = courses_collection.insert_one(course)
        
        return jsonify({
            'message': 'Course created successfully',
            'course_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Error creating course: {str(e)}")
        return jsonify({
            'error': 'Failed to create course',
            'details': str(e)
        }), 500

@app.route('/courses/<course_id>/modules', methods=['GET', 'POST'])
@token_required
def manage_modules(current_user, course_id):
    try:
        # Convert course_id to ObjectId
        course_object_id = ObjectId(course_id)
        
        # Verify course exists
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        if request.method == 'POST':
            data = request.get_json()
            
            # Create new module
            new_module = {
                'course_id': str(course_id),
                'title': data['title'],
                'description': data.get('description', ''),
                'content': data.get('content', ''),
                'order': data.get('order', 0),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'status': 'active'
            }
            
            result = modules_collection.insert_one(new_module)
            
            return jsonify({
                'message': 'Module created successfully',
                'module_id': str(result.inserted_id)
            }), 201
            
        # GET method - List all modules
        modules = list(modules_collection.find({'course_id': str(course_id)}))
        formatted_modules = []
        
        for module in modules:
            module['_id'] = str(module['_id'])
            formatted_modules.append(module)
            
        return jsonify({'modules': formatted_modules}), 200
        
    except Exception as e:
        print(f"Error in manage_modules: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/courses/enroll/<course_id>', methods=['POST'])
@token_required
def enroll_course(current_user, course_id):
    try:
        # Check if already enrolled
        existing_enrollment = enrollments_collection.find_one({
            'course_id': course_id,
            'student_id': current_user['user_id']
        })
        
        if existing_enrollment:
            return jsonify({'error': 'Already enrolled in this course'}), 400
            
        # Create enrollment
        enrollment = {
            'course_id': course_id,
            'student_id': current_user['user_id'],
            'enrolled_date': datetime.utcnow(),
            'status': 'active',
            'progress': 0
        }
        
        result = enrollments_collection.insert_one(enrollment)
        
        return jsonify({
            'message': 'Successfully enrolled in course',
            'enrollment_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Error enrolling in course: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'service': 'course-service',
            'mongodb': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'course-service',
            'error': str(e)
        }), 500

@app.route('/courses/<course_id>/details', methods=['GET'])
@token_required
def get_course_details(current_user, course_id):
    try:
        # Convert course_id to ObjectId
        course_object_id = ObjectId(course_id)

        # Get course details
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        # Get enrollments with student details
        enrolled_students = []
        enrollments = list(enrollments_collection.find({'course_id': str(course_id)}))
        
        for enrollment in enrollments:
            student = users_collection.find_one({'_id': ObjectId(enrollment['student_id'])})
            if student:
                # Get assignment completion stats
                student_assignments = list(assignments_collection.find({
                    'course_id': str(course_id),
                    'student_id': str(student['_id']),
                    'status': 'completed'
                }))

                # Get quiz completion stats
                student_quizzes = list(quizzes_collection.find({
                    'course_id': str(course_id),
                    'student_id': str(student['_id']),
                    'status': 'completed'
                }))

                enrolled_students.append({
                    'student_id': str(student['_id']),
                    'name': f"{student.get('first_name', '')} {student.get('last_name', '')}",
                    'email': student.get('email', ''),
                    'progress': enrollment.get('progress', 0),
                    'assignments_completed': len(student_assignments),
                    'quizzes_completed': len(student_quizzes),
                    'last_active': enrollment.get('last_accessed')
                })

        # Format response
        course_details = {
            'course_id': str(course['_id']),
            'title': course['course_title'],
            'description': course['description'],
            'instructor_id': course['instructor_id'],
            'start_date': course['start_date'],
            'end_date': course['end_date'],
            'duration': course['duration'],
            'enrolled_students': enrolled_students,
            'total_enrollments': len(enrollments),
            'status': course['status']
        }

        return jsonify(course_details), 200

    except Exception as e:
        print(f"Error getting course details: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/courses/search', methods=['GET'])
@token_required
def search_courses(current_user):
    try:
        query = request.args.get('q', '')
        category = request.args.get('category')
        difficulty = request.args.get('difficulty')
        
        # Build search filter
        search_filter = {}
        if query:
            search_filter['$or'] = [
                {'course_title': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}}
            ]
        if category:
            search_filter['category'] = category
        if difficulty:
            search_filter['difficulty_level'] = difficulty
            
        # Get courses
        courses = list(courses_collection.find(search_filter))
        formatted_courses = []
        
        for course in courses:
            # Get enrollment count
            enrollment_count = enrollments_collection.count_documents({
                'course_id': str(course['_id'])
            })
            
            # Get instructor details
            instructor = users_collection.find_one({'_id': ObjectId(course['instructor_id'])})
            
            formatted_courses.append({
                'course_id': str(course['_id']),
                'title': course['course_title'],
                'description': course['description'],
                'instructor_name': f"{instructor['first_name']} {instructor['last_name']}" if instructor else "Unknown",
                'category': course.get('category', 'General'),
                'difficulty_level': course.get('difficulty_level', 'Intermediate'),
                'enrollment_count': enrollment_count,
                'start_date': course['start_date'],
                'duration': course['duration']
            })
            
        return jsonify({'courses': formatted_courses}), 200
        
    except Exception as e:
        print(f"Error searching courses: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/courses/<course_id>/progress', methods=['PUT'])
@token_required
def update_course_progress(current_user, course_id):
    try:
        data = request.get_json()
        progress = data.get('progress', 0)
        
        result = enrollments_collection.update_one(
            {
                'course_id': course_id,
                'student_id': current_user['user_id']
            },
            {
                '$set': {
                    'progress': progress,
                    'last_accessed': datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No enrollment found'}), 404
            
        return jsonify({'message': 'Progress updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating progress: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/courses/instructor/<instructor_id>', methods=['GET'])
@token_required
def get_instructor_courses(current_user, instructor_id):
    try:
        courses = list(courses_collection.find({'instructor_id': instructor_id}))
        formatted_courses = []
        
        for course in courses:
            enrollment_count = enrollments_collection.count_documents({
                'course_id': str(course['_id'])
            })
            
            course['_id'] = str(course['_id'])
            course['enrollment_count'] = enrollment_count
            formatted_courses.append(course)
            
        return jsonify({'courses': formatted_courses}), 200
        
    except Exception as e:
        print(f"Error fetching instructor courses: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/courses/<course_id>', methods=['PUT'])
@token_required
def update_course(current_user, course_id):
    try:
        data = request.get_json()
        course_object_id = ObjectId(course_id)
        
        # Verify course exists and user is instructor
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
            
        if course['instructor_id'] != current_user['user_id']:
            return jsonify({'error': 'Unauthorized to modify this course'}), 403
            
        # Update course
        update_data = {
            'course_title': data.get('course_title', course['course_title']),
            'description': data.get('description', course['description']),
            'start_date': data.get('start_date', course['start_date']),
            'end_date': data.get('end_date', course['end_date']),
            'duration': data.get('duration', course['duration']),
            'updated_at': datetime.utcnow()
        }
        
        courses_collection.update_one(
            {'_id': course_object_id},
            {'$set': update_data}
        )
        
        return jsonify({'message': 'Course updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating course: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002) 