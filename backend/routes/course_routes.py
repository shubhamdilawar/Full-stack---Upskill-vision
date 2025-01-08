from flask import Blueprint, request, jsonify
from backend.db import (
    courses_collection, 
    enrollments_collection,
    users_collection,
    assignments_collection,
    modules_collection,
    quizzes_collection,
    audit_log_collection
)
from backend.routes.auth_routes import token_required
from backend.scripts.seed_data import seed_course_content
from bson import ObjectId
from datetime import datetime
from .audit_routes import log_action

courses = Blueprint('courses', __name__)

@courses.route('/courses', methods=['GET'])
@token_required
def get_courses(current_user):
    try:
        # Get filter parameter
        filter_type = request.args.get('filter', 'all')
        print(f"Filter type: {filter_type}")  # Debug log
        
        # Get all courses
        courses = list(courses_collection.find())
        
        # Format courses for response
        formatted_courses = []
        for course in courses:
            try:
                # Ensure _id is properly converted to string
                course_id = str(course['_id'])
                course_data = {
                    '_id': course_id,  # Use consistent _id field
                    'course_title': course.get('course_title', 'Untitled'),
                    'description': course.get('description', ''),
                    'instructor_name': course.get('instructor_name', 'Unknown'),
                    'instructor_id': str(course.get('instructor_id', '')),  # Convert to string
                    'start_date': course.get('start_date'),
                    'end_date': course.get('end_date'),
                    'duration': course.get('duration'),
                    'enrollment_status': 'Not Enrolled'
                }

                # Check enrollment status
                enrollment = enrollments_collection.find_one({
                    'course_id': course_id,
                    'student_id': current_user['user_id']
                })
                
                if enrollment:
                    course_data['enrollment_status'] = enrollment.get('status', 'enrolled')
                    course_data['progress'] = enrollment.get('progress', 0)

                # Apply filtering
                if filter_type == 'enrolled' and course_data['enrollment_status'] != 'enrolled':
                    continue
                elif filter_type == 'completed' and course_data['enrollment_status'] != 'completed':
                    continue

                formatted_courses.append(course_data)
                print(f"Formatted course: {course_data}")  # Debug log
            except Exception as course_error:
                print(f"Error processing course: {str(course_error)}")
                continue

        return jsonify({'courses': formatted_courses}), 200

    except Exception as e:
        print(f"Error in get_courses: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch courses',
            'details': str(e)
        }), 500

@courses.route('/enroll/<course_id>', methods=['POST', 'OPTIONS'])
@token_required
def enroll_course(current_user, course_id):
    try:
        print(f"\n=== Enrollment Request ===")
        print(f"Course ID: {course_id}")
        print(f"User ID: {current_user.get('user_id')}")
        print(f"Headers: {dict(request.headers)}")

        # Check if course exists
        try:
            course = courses_collection.find_one({'_id': ObjectId(course_id)})
            print(f"\nFound course: {course}")
        except Exception as e:
            print(f"\nError finding course: {str(e)}")
            return jsonify({'error': f'Invalid course ID format: {str(e)}'}), 400

        if not course:
            print(f"\nCourse not found with ID: {course_id}")
            # Get list of all courses
            all_courses = list(courses_collection.find())
            print(f"Available courses: {[str(c.get('_id')) for c in all_courses]}")
            return jsonify({
                'error': 'Course not found',
                'message': 'The specified course does not exist',
                'available_courses': [str(c.get('_id')) for c in all_courses]
            }), 404

        # Check if already enrolled
        existing_enrollment = enrollments_collection.find_one({
            'course_id': str(course_id),
            'student_id': current_user['user_id']
        })

        if existing_enrollment:
            print(f"User already enrolled in course: {course_id}")
            return jsonify({'message': 'Already enrolled in this course'}), 400

        # Create new enrollment
        enrollment = {
            'course_id': str(course_id),
            'student_id': current_user['user_id'],
            'status': 'enrolled',
            'progress': 0,
            'enrolled_at': datetime.utcnow(),
            'last_accessed': datetime.utcnow()
        }

        print(f"Creating enrollment: {enrollment}")

        # Insert enrollment
        result = enrollments_collection.insert_one(enrollment)

        if result.inserted_id:
            print(f"Successfully enrolled. Enrollment ID: {result.inserted_id}")
            return jsonify({
                'message': 'Successfully enrolled in course',
                'enrollment_id': str(result.inserted_id),
                'course_title': course.get('course_title')
            }), 200
        else:
            print("Failed to insert enrollment")
            return jsonify({'error': 'Failed to enroll in course'}), 500

    except Exception as e:
        print(f"Error enrolling in course: {str(e)}")
        return jsonify({
            'error': 'Failed to enroll in course',
            'details': str(e)
        }), 500

@courses.route('/complete/<course_id>', methods=['POST'])
@token_required
def complete_course(current_user, course_id):
    try:
        # Check if enrolled
        enrollment = enrollments_collection.find_one({
            'course_id': course_id,
            'student_id': current_user['user_id']
        })

        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 404

        # Update enrollment status
        result = enrollments_collection.update_one(
            {
                'course_id': course_id,
                'student_id': current_user['user_id']
            },
            {
                '$set': {
                    'status': 'completed',
                    'progress': 100,
                    'completed_at': datetime.utcnow()
                }
            }
        )

        if result.modified_count > 0:
            return jsonify({'message': 'Course marked as completed'}), 200
        else:
            return jsonify({'error': 'Failed to update course status'}), 500

    except Exception as e:
        print(f"Error completing course: {str(e)}")
        return jsonify({
            'error': 'Failed to complete course',
            'details': str(e)
        }), 500

@courses.route('/check_course/<course_id>', methods=['GET'])
@token_required
def check_course(current_user, course_id):
    try:
        # Try to find the course
        course = courses_collection.find_one({'_id': ObjectId(course_id)})
        
        if course:
            return jsonify({
                'message': 'Course found',
                'course': {
                    'id': str(course['_id']),
                    'title': course.get('course_title', 'No title'),
                    'instructor': course.get('instructor_name', 'No instructor')
                }
            }), 200
        else:
            return jsonify({'error': 'Course not found'}), 404
            
    except Exception as e:
        return jsonify({
            'error': 'Error checking course',
            'details': str(e)
        }), 500

@courses.route('/available-courses', methods=['GET'])
@token_required
def get_available_courses(current_user):
    try:
        courses = list(courses_collection.find())
        course_list = [{
            'id': str(course['_id']),
            'title': course.get('course_title', 'Untitled')
        } for course in courses]
        return jsonify({'courses': course_list}), 200
    except Exception as e:
        print(f"Error getting available courses: {str(e)}")
        return jsonify({'error': 'Failed to get courses'}), 500

@courses.route('/debug/courses', methods=['GET'])
def debug_courses():
    try:
        courses = list(courses_collection.find())
        return jsonify({
            'course_count': len(courses),
            'courses': [{
                'id': str(course['_id']),
                'title': course.get('course_title'),
                'instructor': course.get('instructor_name')
            } for course in courses]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses.route('/create_course', methods=['POST', 'OPTIONS'])
@token_required
def create_course(current_user):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 200

    try:
        print("Current user:", current_user)  # Debug log
        
        # Check if user is an instructor
        if current_user.get('role') != 'Instructor':
            print(f"User role {current_user.get('role')} is not Instructor")  # Debug log
            return jsonify({'error': 'Only instructors can create courses'}), 403

        # Get course data from request
        data = request.get_json()
        print("Received course data:", data)  # Debug log

        # Validate required fields
        required_fields = ['course_title', 'description', 'start_date', 'end_date']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'fields': missing_fields
            }), 400

        # Create course document
        course = {
            'course_title': data.get('course_title'),
            'description': data.get('description'),
            'instructor_name': data.get('instructor_name'),
            'instructor_id': current_user['user_id'],
            'start_date': data.get('start_date'),
            'end_date': data.get('end_date'),
            'duration': data.get('duration', 60),
            'created_at': datetime.utcnow(),
            'status': 'active'
        }

        print("Creating course:", course)  # Debug log

        # Insert course into database
        result = courses_collection.insert_one(course)
        
        if result.inserted_id:
            # Create default course content
            seed_success = seed_course_content(result.inserted_id, current_user['user_id'])
            if not seed_success:
                print("Warning: Failed to seed course content")
            
            print(f"Course created with ID: {result.inserted_id}")  # Debug log
            # Log the course creation
            log_action(
                user_id=current_user['user_id'],
                action_type='course_created',
                course_id=str(result.inserted_id),
                details=f"Course '{data.get('course_title')}' created"
            )
            return jsonify({
                'message': 'Course created successfully',
                'course_id': str(result.inserted_id)
            }), 201

    except Exception as e:
        print(f"Error creating course: {str(e)}")  # Debug log
        return jsonify({
            'error': 'Failed to create course',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/details', methods=['GET'])
@token_required
def get_course_details(current_user, course_id):
    try:
        # Validate course_id
        if not course_id or course_id == 'undefined':
            return jsonify({
                'error': 'Invalid course ID',
                'message': 'Course ID cannot be empty or undefined'
            }), 400

        try:
            course_object_id = ObjectId(course_id)
        except Exception as e:
            return jsonify({
                'error': 'Invalid course ID format',
                'message': str(e)
            }), 400

        # Find course
        course = courses_collection.find_one({'_id': course_object_id})
        
        if not course:
            return jsonify({
                'error': 'Course not found',
                'message': f'No course found with ID: {course_id}'
            }), 404

        print(f"Found course: {course}")

        # Get enrollments and calculate statistics
        enrollments = list(enrollments_collection.find({'course_id': str(course_id)}))
        enrollment_stats = {
            'totalEnrolled': len(enrollments),
            'activeStudents': len([e for e in enrollments if e.get('status') == 'active']),
            'completedStudents': len([e for e in enrollments if e.get('status') == 'completed']),
            'averageProgress': sum(e.get('progress', 0) for e in enrollments) / len(enrollments) if enrollments else 0
        }

        # Format the response data
        response_data = {
            'course': {
                '_id': str(course['_id']),
                'course_title': course.get('course_title', 'Untitled'),
                'description': course.get('description', ''),
                'instructor_name': course.get('instructor_name', 'Unknown'),
                'instructor_id': str(course.get('instructor_id', '')),
                'start_date': course.get('start_date'),
                'end_date': course.get('end_date'),
                'duration': course.get('duration'),
                'status': course.get('status', 'active'),
                'created_at': course.get('created_at'),
                'enrollment_status': 'Not Enrolled',
                'progress': 0
            },
            'enrollmentStats': enrollment_stats,
            'modules': [],
            'assignments': [],
            'quizzes': [],
            'enrollments': []
        }

        # Get related data
        try:
            # Get modules
            modules = list(modules_collection.find({'course_id': str(course_id)}))
            modules_data = [{
                '_id': str(module['_id']),
                'title': module.get('title', ''),
                'description': module.get('description', ''),
                'content': module.get('content', []),
                'order': module.get('order', 0)
            } for module in modules]

            # Get assignments
            assignments = list(assignments_collection.find({'course_id': str(course_id)}))
            assignments_data = [{
                '_id': str(assignment['_id']),
                'title': assignment.get('title', ''),
                'description': assignment.get('description', ''),
                'due_date': assignment.get('due_date'),
                'total_points': assignment.get('points', 0)
            } for assignment in assignments]

            # Get quizzes
            quizzes = list(quizzes_collection.find({'course_id': str(course_id)}))
            quizzes_data = [{
                '_id': str(quiz['_id']),
                'title': quiz.get('title', ''),
                'description': quiz.get('description', ''),
                'time_limit': quiz.get('time_limit'),
                'passing_score': quiz.get('passing_score', 70),
                'attempts_allowed': quiz.get('attempts_allowed', 1)
            } for quiz in quizzes]

            # Check if current user is enrolled
            user_enrollment = next((e for e in enrollments if str(e.get('student_id')) == str(current_user['user_id'])), None)
            if user_enrollment:
                response_data['course']['enrollment_status'] = user_enrollment.get('status', 'enrolled')
                response_data['course']['progress'] = user_enrollment.get('progress', 0)

            response_data.update({
                'modules': modules_data,
                'assignments': assignments_data,
                'quizzes': quizzes_data,
                'enrollments': [{
                    'student_id': str(enrollment['student_id']),
                    'status': enrollment['status'],
                    'progress': enrollment['progress'],
                    'enrolled_at': enrollment['enrolled_at']
                } for enrollment in enrollments]
            })

        except Exception as e:
            print(f"Error fetching related data: {str(e)}")

        print(f"Returning formatted response: {response_data}")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error getting course details: {str(e)}")
        return jsonify({
            'error': 'Failed to get course details',
            'details': str(e)
        }), 500

@courses.route('/course/<course_id>', methods=['DELETE'])
@token_required
def delete_course(current_user, course_id):
    try:
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        print(f"Attempting to delete course: {course_id}")  # Debug log

        # Convert string ID to ObjectId
        course_object_id = ObjectId(course_id)
        
        # Delete the course
        result = courses_collection.delete_one({'_id': course_object_id})

        if result.deleted_count == 1:
            # Delete related enrollments
            enrollments_collection.delete_many({'course_id': course_id})
            print(f"Course and related enrollments deleted successfully")
            # Log the course deletion
            log_action(
                user_id=current_user['user_id'],
                action_type='course_deleted',
                course_id=course_id,
                details=f"Course deleted"
            )
            return jsonify({'message': 'Course deleted successfully'}), 200
            
        print(f"Course not found with ID: {course_id}")
        return jsonify({'error': 'Course not found'}), 404

    except Exception as e:
        print(f"Error deleting course: {str(e)}")
        return jsonify({'error': 'Failed to delete course'}), 500

@courses.route('/<course_id>/students', methods=['GET'])
@token_required
def get_course_students(current_user, course_id):
    try:
        if current_user.get('role') != 'Instructor':
            return jsonify({'error': 'Unauthorized'}), 403

        # Get all enrollments for this course
        enrollments = list(enrollments_collection.find({'course_id': course_id}))
        
        # Get student details for each enrollment
        students = []
        for enrollment in enrollments:
            student = users_collection.find_one({'_id': ObjectId(enrollment['student_id'])})
            if student:
                students.append({
                    '_id': str(student['_id']),
                    'name': student.get('name', 'Unknown'),
                    'email': student.get('email'),
                    'progress': enrollment.get('progress', 0),
                    'lastActive': enrollment.get('last_accessed'),
                    'performance': calculate_performance(enrollment)
                })

        return jsonify({'students': students}), 200

    except Exception as e:
        print(f"Error getting course students: {str(e)}")
        return jsonify({'error': 'Failed to get students'}), 500

@courses.route('/<course_id>/assignments', methods=['GET'])
@token_required
def get_course_assignments(current_user, course_id):
    try:
        assignments = list(assignments_collection.find({'course_id': course_id}))
        return jsonify({
            'assignments': [{
                '_id': str(assignment['_id']),
                'title': assignment.get('title'),
                'description': assignment.get('description'),
                'dueDate': assignment.get('due_date'),
                'submissions': assignment.get('submission_count', 0)
            } for assignment in assignments]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses.route('/<course_id>/modules', methods=['GET'])
@token_required
def get_course_modules(current_user, course_id):
    try:
        modules = list(modules_collection.find({'course_id': course_id}))
        return jsonify({
            'modules': [{
                '_id': str(module['_id']),
                'title': module.get('title'),
                'description': module.get('description'),
                'content': module.get('content', [])
            } for module in modules]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses.route('/<course_id>/quizzes', methods=['GET'])
@token_required
def get_course_quizzes(current_user, course_id):
    try:
        quizzes = list(quizzes_collection.find({'course_id': course_id}))
        return jsonify({
            'quizzes': [{
                '_id': str(quiz['_id']),
                'title': quiz.get('title'),
                'description': quiz.get('description'),
                'questionCount': len(quiz.get('questions', [])),
                'timeLimit': quiz.get('time_limit'),
                'attempts': quiz.get('max_attempts')
            } for quiz in quizzes]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_performance(enrollment):
    # Calculate student performance based on various metrics
    progress = enrollment.get('progress', 0)
    if progress >= 90:
        return 'excellent'
    elif progress >= 75:
        return 'good'
    elif progress >= 60:
        return 'average'
    else:
        return 'poor'

def log_instructor_action(user_id, course_id, action, details):
    try:
        audit_log = {
            'user_id': user_id,
            'course_id': course_id,
            'action': action,
            'details': details,
            'timestamp': datetime.utcnow()
        }
        audit_log_collection.insert_one(audit_log)
    except Exception as e:
        print(f"Error logging action: {str(e)}")

@courses.route('/update-course/<course_id>', methods=['PUT'])
@token_required
def update_course(current_user, course_id):
    try:
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        print(f"Updating course {course_id} with data:", data)

        # Validate required fields
        required_fields = ['course_title', 'description', 'instructor_id', 'start_date', 'end_date', 'duration']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Verify instructor exists
        instructor = users_collection.find_one({
            '_id': ObjectId(data['instructor_id']),
            'role': 'Instructor',
            'status': 'approved'
        })
        
        if not instructor:
            return jsonify({'error': 'Invalid instructor selected'}), 400

        # Update course
        update_data = {
            'course_title': data['course_title'],
            'description': data['description'],
            'instructor_id': ObjectId(data['instructor_id']),
            'instructor_name': f"{instructor.get('first_name', '')} {instructor.get('last_name', '')}",
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'duration': data['duration'],
            'updated_at': datetime.utcnow()
        }

        result = courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {'$set': update_data}
        )

        if result.modified_count == 1:
            # Log the course update
            log_action(
                user_id=current_user['user_id'],
                action_type='course_updated',
                course_id=course_id,
                details=f"Course '{data.get('course_title')}' updated"
            )
            return jsonify({'message': 'Course updated successfully'}), 200
        return jsonify({'error': 'Course not found'}), 404

    except Exception as e:
        print(f"Error updating course: {str(e)}")
        return jsonify({'error': 'Failed to update course'}), 500

@courses.route('/course/<course_id>/audit-log', methods=['GET'])
@token_required
def get_course_audit_log(current_user, course_id):
    try:
        # Verify instructor role and ownership
        course = courses_collection.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        if current_user.get('role') != 'Instructor' or \
           str(course.get('instructor_id')) != str(current_user.get('user_id')):
            return jsonify({'error': 'Unauthorized'}), 403

        # Get audit log entries
        audit_logs = list(audit_log_collection.find(
            {'course_id': course_id},
            {'_id': 0}  # Exclude MongoDB _id
        ).sort('timestamp', -1))  # Most recent first

        return jsonify({
            'audit_logs': audit_logs
        }), 200

    except Exception as e:
        print(f"Error fetching audit log: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch audit log',
            'details': str(e)
        }), 500

@courses.route('/add-course', methods=['POST'])
@token_required
def add_course(current_user):
    try:
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        
        # Generate a course ID (e.g., COURSE001, COURSE002, etc.)
        last_course = courses_collection.find_one(
            {},
            sort=[('course_code', -1)]  # Get the last course by course_code
        )
        
        if last_course and 'course_code' in last_course:
            last_num = int(last_course['course_code'].replace('COURSE', ''))
            new_code = f'COURSE{str(last_num + 1).zfill(3)}'
        else:
            new_code = 'COURSE001'

        # Validate instructor exists
        instructor = users_collection.find_one({
            '_id': ObjectId(data.get('instructor_id')),
            'role': 'Instructor',
            'status': 'approved'
        })
        
        if not instructor:
            return jsonify({'error': 'Invalid instructor selected'}), 400

        # Create course document
        course = {
            'course_code': new_code,  # Add course code
            'course_title': data.get('course_title'),
            'description': data.get('description'),
            'instructor_id': ObjectId(data.get('instructor_id')),
            'instructor_name': f"{instructor.get('first_name', '')} {instructor.get('last_name', '')}",
            'start_date': data.get('start_date'),
            'end_date': data.get('end_date'),
            'duration': data.get('duration'),
            'status': 'active',
            'created_at': datetime.utcnow()
        }

        result = courses_collection.insert_one(course)
        
        return jsonify({
            'message': 'Course created successfully',
            'course_id': str(result.inserted_id),
            'course_code': new_code
        }), 201

    except Exception as e:
        print(f"Error creating course: {str(e)}")
        return jsonify({'error': 'Failed to create course'}), 500

@courses.route('/user/<user_id>', methods=['GET'])
@token_required
def get_user_details(current_user, user_id):
    try:
        # Verify the user is requesting their own details
        if str(current_user.get('user_id')) != str(user_id):
            return jsonify({'error': 'Unauthorized access'}), 403

        # Find user in database
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Return user details
        user_data = {
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', ''),
            'email': user.get('email', ''),
            'role': user.get('role', '')
        }
        
        print(f"Returning user details for {user_id}:", user_data)  # Debug log
        
        return jsonify(user_data), 200

    except Exception as e:
        print(f"Error fetching user details: {str(e)}")
        return jsonify({'error': 'Failed to fetch user details'}), 500