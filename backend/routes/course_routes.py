from flask import Blueprint, request, jsonify
<<<<<<< HEAD
from flask_cors import cross_origin
=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
from backend.db import (
    courses_collection, 
    enrollments_collection,
    users_collection,
    assignments_collection,
    modules_collection,
    quizzes_collection,
<<<<<<< HEAD
    audit_log_collection,
    submissions_collection
=======
    audit_log_collection
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
)
from backend.routes.auth_routes import token_required
from backend.scripts.seed_data import seed_course_content
from bson import ObjectId
from datetime import datetime
<<<<<<< HEAD
from werkzeug.utils import secure_filename
import os

courses = Blueprint('courses', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_formatted_modules(course_id):
    """Get formatted modules for a course"""
    try:
        modules = list(modules_collection.find({
            'course_id': str(course_id)
        }).sort('order', 1))

        return [{
            '_id': str(module['_id']),
            'title': module.get('title', ''),
            'description': module.get('description', ''),
            'content': module.get('content', ''),
            'order': module.get('order', 0),
            'created_at': module.get('created_at', datetime.utcnow()).isoformat(),
            'updated_at': module.get('updated_at', datetime.utcnow()).isoformat(),
            'status': module.get('status', 'active')
        } for module in modules]
    except Exception as e:
        print(f"Error formatting modules: {str(e)}")
        return []

def get_formatted_assignments(course_id):
    """Get formatted assignments for a course"""
    try:
        assignments = list(assignments_collection.find({
            'course_id': str(course_id)
        }))

        return [{
            '_id': str(assignment['_id']),
            'title': assignment.get('title', ''),
            'description': assignment.get('description', ''),
            'due_date': assignment.get('due_date'),
            'total_points': assignment.get('total_points', 0),
            'submissions_count': assignment.get('submissions_count', 0),
            'average_score': assignment.get('average_score', 0)
        } for assignment in assignments]
    except Exception as e:
        print(f"Error formatting assignments: {str(e)}")
        return []

def get_formatted_quizzes(course_id):
    """Get formatted quizzes for a course"""
    try:
        quizzes = list(quizzes_collection.find({
            'course_id': str(course_id)
        }))

        return [{
            '_id': str(quiz['_id']),
            'title': quiz.get('title', ''),
            'description': quiz.get('description', ''),
            'time_limit': quiz.get('time_limit', 0),
            'questions': quiz.get('questions', []),
            'attempts_count': quiz.get('attempts_count', 0),
            'average_score': quiz.get('average_score', 0),
            'pass_rate': quiz.get('pass_rate', 0)
        } for quiz in quizzes]
    except Exception as e:
        print(f"Error formatting quizzes: {str(e)}")
        return []

=======
from .audit_routes import log_action

courses = Blueprint('courses', __name__)

>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
@courses.route('/courses', methods=['GET'])
@token_required
def get_courses(current_user):
    try:
        # Get filter parameter
        filter_type = request.args.get('filter', 'all')
<<<<<<< HEAD
        print(f"Filter type: {filter_type}")
=======
        print(f"Filter type: {filter_type}")  # Debug log
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
        
        # Get all courses
        courses = list(courses_collection.find())
        
        # Format courses for response
        formatted_courses = []
        for course in courses:
            try:
                # Ensure _id is properly converted to string
                course_id = str(course['_id'])
<<<<<<< HEAD
                
                # Get enrollment count for this course
                enrollment_count = enrollments_collection.count_documents({
                    'course_id': course_id,
                    'status': 'enrolled'  # Only count active enrollments
                })
                
                course_data = {
                    '_id': course_id,
                    'course_title': course.get('course_title', 'Untitled'),
                    'description': course.get('description', ''),
                    'instructor_name': course.get('instructor_name', 'Unknown'),
                    'instructor_id': str(course.get('instructor_id', '')),
                    'start_date': course.get('start_date'),
                    'end_date': course.get('end_date'),
                    'duration': course.get('duration'),
                    'enrollment_status': 'Not Enrolled',
                    'enrolled_count': enrollment_count  # Add enrollment count
                }

                # Check enrollment status for current user
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
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
<<<<<<< HEAD
                print(f"Formatted course: {course_data}")

=======
                print(f"Formatted course: {course_data}")  # Debug log
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
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

<<<<<<< HEAD
@courses.route('/<course_id>/enroll', methods=['POST', 'OPTIONS'])
@token_required
def enroll_course(current_user, course_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        # Convert course_id to ObjectId
        course_object_id = ObjectId(course_id)
        
        # Check if course exists
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

        # Check if already enrolled
        existing_enrollment = enrollments_collection.find_one({
            'course_id': str(course_id),
            'student_id': current_user['user_id']
        })

        if existing_enrollment:
<<<<<<< HEAD
=======
            print(f"User already enrolled in course: {course_id}")
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
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

<<<<<<< HEAD
        result = enrollments_collection.insert_one(enrollment)

        if result.inserted_id:
            return jsonify({
                'message': 'Successfully enrolled in course',
                'enrollment_id': str(result.inserted_id)
            }), 200
        else:
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
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
<<<<<<< HEAD
=======
            # Log the course creation
            log_action(
                user_id=current_user['user_id'],
                action_type='course_created',
                course_id=str(result.inserted_id),
                details=f"Course '{data.get('course_title')}' created"
            )
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
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
<<<<<<< HEAD
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
                    'last_active': enrollment.get('last_accessed'),
                    'performance_metrics': {
                        'assignments': {
                            'completed': len(student_assignments),
                            'total': len(list(assignments_collection.find({'course_id': str(course_id)}))),
                            'average_score': sum(a.get('score', 0) for a in student_assignments) / len(student_assignments) if student_assignments else 0
                        },
                        'quizzes': {
                            'completed': len(student_quizzes),
                            'total': len(list(quizzes_collection.find({'course_id': str(course_id)}))),
                            'average_score': sum(q.get('score', 0) for q in student_quizzes) / len(student_quizzes) if student_quizzes else 0
                        },
                        'overall': calculate_overall_performance(enrollment)
                    }
                })

        # Calculate overall stats
        total_enrolled = len(enrolled_students)
        stats = calculate_course_stats(enrolled_students, course_id)

        # Format response using helper functions
        response_data = {
            'course': {
                '_id': str(course['_id']),
                'course_title': course.get('course_title', ''),
                'description': course.get('description', ''),
                'category': course.get('category', 'Uncategorized'),
                'difficulty_level': course.get('difficulty_level', 'Beginner'),
                'prerequisites': course.get('prerequisites', 'None'),
                'learning_outcomes': course.get('learning_outcomes', ''),
                'start_date': course.get('start_date'),
                'end_date': course.get('end_date'),
                'max_participants': course.get('max_participants', 0),
                'instructor_id': str(course.get('instructor_id', '')),
                'instructor_name': course.get('instructor_name', '')
            },
            'modules': get_formatted_modules(course_id),
            'assignments': get_formatted_assignments(course_id),
            'quizzes': get_formatted_quizzes(course_id),
            'enrollments': enrolled_students,
            'stats': stats
        }

=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error getting course details: {str(e)}")
        return jsonify({
            'error': 'Failed to get course details',
            'details': str(e)
        }), 500

<<<<<<< HEAD
def calculate_overall_performance(enrollment):
    progress = enrollment.get('progress', 0)
    if progress >= 90:
        return 'Excellent'
    elif progress >= 75:
        return 'Good'
    elif progress >= 60:
        return 'Average'
    else:
        return 'Poor'

def calculate_course_stats(enrolled_students, course_id):
    total_enrolled = len(enrolled_students)
    if total_enrolled == 0:
        return {
            'totalEnrolled': 0,
            'averageProgress': 0,
            'completionRate': 0,
            'assignmentCompletion': 0,
            'quizCompletion': 0,
            'averagePerformance': 0
        }

    total_progress = sum(student['progress'] for student in enrolled_students)
    completed_count = sum(1 for student in enrolled_students if student['progress'] >= 100)
    
    total_assignments = len(list(assignments_collection.find({'course_id': str(course_id)})))
    total_quizzes = len(list(quizzes_collection.find({'course_id': str(course_id)})))
    
    assignment_completion = sum(student['assignments_completed'] for student in enrolled_students) / (total_assignments * total_enrolled) * 100 if total_assignments > 0 else 0
    quiz_completion = sum(student['quizzes_completed'] for student in enrolled_students) / (total_quizzes * total_enrolled) * 100 if total_quizzes > 0 else 0

    return {
        'totalEnrolled': total_enrolled,
        'averageProgress': round(total_progress / total_enrolled, 2),
        'completionRate': round((completed_count / total_enrolled) * 100, 2),
        'assignmentCompletion': round(assignment_completion, 2),
        'quizCompletion': round(quiz_completion, 2),
        'averagePerformance': round(total_progress / total_enrolled, 2)
    }

def calculate_performance_score(enrollment):
    """Calculate a numeric performance score from 0-100"""
    progress = enrollment.get('progress', 0)
    assignments_score = enrollment.get('assignments_average', 0)
    quizzes_score = enrollment.get('quizzes_average', 0)
    
    # Weight the different components
    progress_weight = 0.4
    assignments_weight = 0.3
    quizzes_weight = 0.3
    
    return (
        progress * progress_weight +
        assignments_score * assignments_weight +
        quizzes_score * quizzes_weight
    )

@courses.route('/delete_course/<course_id>', methods=['DELETE', 'OPTIONS'])
@token_required
def delete_course(current_user, course_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200  # Make sure OPTIONS returns 200

    try:
        # Allow both HR Admin and Instructor to delete their own courses
        if current_user['role'] not in ['HR Admin', 'Instructor']:
            return jsonify({'error': 'Unauthorized access'}), 403

        # If instructor, verify they own the course
        if current_user['role'] == 'Instructor':
            course = courses_collection.find_one({
                '_id': ObjectId(course_id),
                'instructor_id': current_user['user_id']
            })
            if not course:
                return jsonify({'error': 'Course not found or unauthorized'}), 404
        else:
            # HR Admin can delete any course
            course = courses_collection.find_one({'_id': ObjectId(course_id)})
            if not course:
                return jsonify({'error': 'Course not found'}), 404

        # Delete course and associated data
        result = courses_collection.delete_one({'_id': ObjectId(course_id)})
        
        if result.deleted_count > 0:
            # Delete associated data
            enrollments_collection.delete_many({'course_id': str(course_id)})
            quizzes_collection.delete_many({'course_id': str(course_id)})
            modules_collection.delete_many({'course_id': str(course_id)})
            
            # Log the action
            log_instructor_action(
                current_user['user_id'],
                course_id,
                'delete_course',
                f"Course '{course.get('course_title', '')}' deleted"
            )

            return jsonify({
                'message': 'Course and all associated data deleted successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to delete course'}), 500

    except Exception as e:
        print(f"Error deleting course: {str(e)}")
        return jsonify({
            'error': 'Failed to delete course',
            'details': str(e)
        }), 500
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

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

<<<<<<< HEAD
@courses.route('/<course_id>/modules', methods=['GET', 'POST'])
@token_required
def manage_modules(current_user, course_id):
    try:
        print("Starting module management...")
        
        # Convert IDs to ObjectId
        try:
            course_object_id = ObjectId(course_id)
            user_object_id = ObjectId(current_user['user_id'])
        except Exception as e:
            print(f"Invalid ID format: {str(e)}")
            return jsonify({'error': 'Invalid course or user ID format'}), 400

        # Verify course exists
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        # Verify instructor ownership
        if str(course.get('instructor_id')) != str(user_object_id):
            return jsonify({'error': 'Unauthorized to manage modules'}), 403

        if request.method == 'POST':
            print("Processing POST request for new module")
            data = request.get_json()
            print(f"Received data: {data}")
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            if not data.get('title'):
                return jsonify({'error': 'Module title is required'}), 400

            try:
                # Create new module document
                new_module = {
                    'course_id': str(course_id),
                    'instructor_id': str(user_object_id),
                    'title': str(data.get('title', '')).strip(),
                    'description': str(data.get('description', '')).strip(),
                    'content': str(data.get('content', '')).strip(),
                    'order': int(data.get('order', 0)),
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                    'status': 'active'
                }
                print(f"Prepared module document: {new_module}")

                # Insert the module
                result = modules_collection.insert_one(new_module)
                module_id = str(result.inserted_id)
                print(f"Module inserted with ID: {module_id}")

                # Update course with module reference
                courses_collection.update_one(
                    {'_id': course_object_id},
                    {'$push': {'modules': module_id}}
                )
                print(f"Course updated with module reference")

                # Prepare response data
                response_data = {
                    'message': 'Module created successfully',
                    'module': {
                        '_id': module_id,
                        'course_id': str(course_id),
                        'instructor_id': str(user_object_id),
                        'title': new_module['title'],
                        'description': new_module['description'],
                        'content': new_module['content'],
                        'order': new_module['order'],
                        'created_at': new_module['created_at'].isoformat(),
                        'updated_at': new_module['updated_at'].isoformat(),
                        'status': new_module['status']
                    }
                }
                print(f"Sending response: {response_data}")
                return jsonify(response_data), 201

            except Exception as module_error:
                print(f"Error creating module: {str(module_error)}")
        return jsonify({
                    'error': 'Failed to create module',
                    'details': str(module_error)
                }), 500

        # GET method
        print("Processing GET request for modules")
        try:
            modules = list(modules_collection.find({
                'course_id': str(course_id)
            }).sort('order', 1))

            formatted_modules = [{
                '_id': str(module['_id']),
                'title': module.get('title', ''),
                'description': module.get('description', ''),
                'content': module.get('content', ''),
                'order': module.get('order', 0),
                'created_at': module.get('created_at', datetime.utcnow()).isoformat(),
                'updated_at': module.get('updated_at', datetime.utcnow()).isoformat(),
                'status': module.get('status', 'active')
            } for module in modules]

            return jsonify({'modules': formatted_modules}), 200

        except Exception as get_error:
            print(f"Error fetching modules: {str(get_error)}")
            return jsonify({
                'error': 'Failed to fetch modules',
                'details': str(get_error)
            }), 500

    except Exception as e:
        print(f"Unexpected error in manage_modules: {str(e)}")
        return jsonify({
            'error': 'Failed to manage modules',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/modules/<module_id>/assignments', methods=['POST'])
@token_required
def add_assignment(current_user, course_id, module_id):
    try:
        # Verify instructor ownership
        course = courses_collection.find_one({
            '_id': ObjectId(course_id),
            'instructor_id': ObjectId(current_user['user_id'])
        })
        
        if not course:
            return jsonify({'error': 'Course not found or unauthorized'}), 404

        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({'error': 'Assignment title is required'}), 400

        new_assignment = {
            'course_id': course_id,
            'module_id': module_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'due_date': data.get('due_date'),
            'points': data.get('points', 100),
            'created_at': datetime.utcnow()
        }
        
        result = assignments_collection.insert_one(new_assignment)
        
        # Log the action
        log_action(
            current_user['user_id'],
            'assignment_created',
            course_id,
            {'assignment_id': str(result.inserted_id)}
        )
        
        return jsonify({
            'message': 'Assignment created successfully',
            'assignment_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Error adding assignment: {str(e)}")
        return jsonify({'error': 'Failed to add assignment'}), 500
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

@courses.route('/<course_id>/quizzes', methods=['GET'])
@token_required
def get_course_quizzes(current_user, course_id):
    try:
        quizzes = list(quizzes_collection.find({'course_id': course_id}))
        return jsonify({
            'quizzes': [{
                '_id': str(quiz['_id']),
                'title': quiz.get('title'),
<<<<<<< HEAD
                'description': quiz.get('description', ''),
=======
                'description': quiz.get('description'),
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
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

<<<<<<< HEAD
@courses.route('/update-course/<course_id>', methods=['PUT', 'OPTIONS'])
@token_required
def update_course(current_user, course_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 200
        
    try:
        # Get update data
        data = request.get_json()
        print("Received update data:", data)

        # Validate course_id
        if not course_id:
            return jsonify({'error': 'Course ID is required'}), 400

        try:
            course_object_id = ObjectId(course_id)
        except:
            return jsonify({'error': 'Invalid course ID format'}), 400

        # Validate required fields
        required_fields = ['course_title', 'description', 'start_date', 'end_date']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Create update document
        update_data = {
            'course_title': data['course_title'],
            'description': data['description'],
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'duration': data.get('duration'),
            'status': data.get('status', 'active'),
            'updated_at': datetime.utcnow()
        }

        # Update course
        result = courses_collection.update_one(
            {'_id': course_object_id},
            {'$set': update_data}
        )

        if result.modified_count > 0:
            # Get updated course
            updated_course = courses_collection.find_one({'_id': course_object_id})
            return jsonify({
                'message': 'Course updated successfully',
                'course': {
                    '_id': str(updated_course['_id']),
                    'course_title': updated_course['course_title'],
                    'description': updated_course['description'],
                    'start_date': updated_course['start_date'],
                    'end_date': updated_course['end_date'],
                    'duration': updated_course.get('duration'),
                    'status': updated_course.get('status')
                }
            }), 200
        
        return jsonify({'error': 'No changes made'}), 400

    except Exception as e:
        print(f"Error updating course: {str(e)}")
        return jsonify({
            'error': 'Failed to update course',
            'details': str(e)
        }), 500
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

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

<<<<<<< HEAD
@courses.route('/<course_id>/modules/<module_id>/upload', methods=['POST'])
@token_required
def upload_module_content(current_user, course_id, module_id):
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # Update module with file information
            modules_collection.update_one(
                {'_id': ObjectId(module_id)},
                {'$push': {'content': {
                    'filename': filename,
                    'path': file_path,
                    'uploaded_at': datetime.utcnow()
                }}}
            )
            
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename
            }), 200
            
        return jsonify({'error': 'File type not allowed'}), 400

    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        return jsonify({'error': 'Failed to upload file'}), 500

@courses.route('/<course_id>/modules/<module_id>/assignments/<assignment_id>/upload', methods=['POST'])
@token_required
def upload_assignment_file(current_user, course_id, module_id, assignment_id):
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # Update assignment with file information
            assignments_collection.update_one(
                {'_id': ObjectId(assignment_id)},
                {'$push': {'files': {
                    'filename': filename,
                    'path': file_path,
                    'uploaded_at': datetime.utcnow()
                }}}
            )
            
            return jsonify({
                'message': 'Assignment file uploaded successfully',
                'filename': filename
            }), 200
            
        return jsonify({'error': 'File type not allowed'}), 400

    except Exception as e:
        print(f"Error uploading assignment file: {str(e)}")
        return jsonify({'error': 'Failed to upload assignment file'}), 500

@courses.route('/user/<user_id>', methods=['GET', 'OPTIONS'])
@token_required
def get_user_details(current_user, user_id):
    try:
        if request.method == "OPTIONS":
            response = jsonify({'message': 'OK'})
            response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            return response, 200

        # Verify user exists
        user = users_collection.find_one({'_id': ObjectId(user_id)})
=======
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
        
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Return user details
<<<<<<< HEAD
        return jsonify({
=======
        user_data = {
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', ''),
            'email': user.get('email', ''),
            'role': user.get('role', '')
<<<<<<< HEAD
        }), 200

    except Exception as e:
        print(f"Error getting user details: {str(e)}")
        return jsonify({'error': 'Failed to get user details'}), 500

@courses.route('/<course_id>/modules/<module_id>', methods=['DELETE'])
@token_required
def delete_module(current_user, course_id, module_id):
    try:
        # Convert string IDs to ObjectId
        try:
            course_object_id = ObjectId(course_id)
            module_object_id = ObjectId(module_id)
            user_object_id = ObjectId(current_user['user_id'])
        except Exception as e:
            print(f"Invalid ID format: {str(e)}")
            return jsonify({'error': 'Invalid ID format'}), 400

        # Verify course exists
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        # Verify instructor ownership
        if str(course.get('instructor_id')) != str(user_object_id):
            return jsonify({'error': 'Unauthorized to delete this module'}), 403

        # Verify module exists
        module = modules_collection.find_one({
            '_id': module_object_id,
            'course_id': str(course_id)
        })
        
        if not module:
            return jsonify({'error': 'Module not found'}), 404

        # Delete the module
        result = modules_collection.delete_one({
            '_id': module_object_id,
            'course_id': str(course_id)
        })

        if result.deleted_count > 0:
            # Log the action
            try:
                log_action(
                    str(user_object_id),
                    'module_deleted',
                    str(course_id),
                    {'module_id': str(module_id)}
                )
            except Exception as log_error:
                print(f"Error logging action: {str(log_error)}")
                # Continue even if logging fails

            return jsonify({
                'message': 'Module deleted successfully',
                'module_id': str(module_id)
            }), 200
        
        return jsonify({'error': 'Module not found or already deleted'}), 404

    except Exception as e:
        print(f"Error deleting module: {str(e)}")
        return jsonify({
            'error': 'Failed to delete module',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/modules', methods=['POST'])
@token_required
def create_module(current_user, course_id):
    try:
        print("Starting module creation process...")
        
        # Get and validate request data
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Module title is required'}), 400

        # Convert IDs and validate them
        try:
            course_object_id = ObjectId(course_id)
            user_object_id = ObjectId(current_user['user_id'])
        except Exception as e:
            print(f"Invalid ID format: {str(e)}")
            return jsonify({'error': 'Invalid course or user ID format'}), 400

        # Verify course exists
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        # Verify instructor ownership
        if str(course.get('instructor_id')) != str(user_object_id):
            return jsonify({'error': 'Unauthorized to create modules for this course'}), 403

        # Create new module document with all fields as strings
        try:
            new_module = {
                'course_id': str(course_id),
                'instructor_id': str(user_object_id),
                'title': str(data.get('title', '')).strip(),
                'description': str(data.get('description', '')).strip(),
                'content': str(data.get('content', '')).strip(),
                'order': int(data.get('order', 0)),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'status': 'active'
            }

            print(f"Prepared module document: {new_module}")

            # Insert the module
            result = modules_collection.insert_one(new_module)
            module_id = str(result.inserted_id)
            print(f"Module inserted with ID: {module_id}")

            # Update course with module reference
            courses_collection.update_one(
                {'_id': course_object_id},
                {'$push': {'modules': module_id}}
            )
            print(f"Course updated with new module reference")

            # Prepare response data
            created_at_str = new_module['created_at'].isoformat()
            updated_at_str = new_module['updated_at'].isoformat()

            response_data = {
                'message': 'Module created successfully',
                'module': {
                    '_id': module_id,
                    'course_id': new_module['course_id'],
                    'instructor_id': new_module['instructor_id'],
                    'title': new_module['title'],
                    'description': new_module['description'],
                    'content': new_module['content'],
                    'order': new_module['order'],
                    'created_at': created_at_str,
                    'updated_at': updated_at_str,
                    'status': new_module['status']
                }
            }

            print(f"Sending response: {response_data}")
            return jsonify(response_data), 201

        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({
                'error': 'Database error while saving module',
                'details': str(db_error)
            }), 500

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Server error while creating module',
            'details': str(e)
        }), 500

def log_action(user_id, action_type, course_id, details=None):
    try:
        log_entry = {
            'user_id': str(user_id),
            'course_id': str(course_id),
            'action_type': action_type,
            'details': details or {},
            'timestamp': datetime.utcnow()
        }
        audit_log_collection.insert_one(log_entry)
    except Exception as e:
        print(f"Error logging action: {str(e)}")
        # Don't raise the exception, just log it

@courses.route('/<course_id>/assignments', methods=['POST'])
@token_required
def create_assignment(current_user, course_id):
    try:
        print(f"Creating assignment for course {course_id}")
        print(f"Current user: {current_user}")
        
        # Convert IDs to ObjectId
        try:
            course_object_id = ObjectId(course_id)
            user_object_id = ObjectId(current_user['user_id'])
            print(f"Converted IDs - Course: {course_object_id}, User: {user_object_id}")
        except Exception as e:
            print(f"Invalid ID format: {str(e)}")
            return jsonify({'error': 'Invalid course or user ID format'}), 400

        # First, check if the course exists
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            print(f"Course {course_id} not found")
            return jsonify({'error': 'Course not found'}), 404

        # Then check if the user is the instructor
        print(f"Course instructor_id: {course.get('instructor_id')}")
        print(f"Current user_id: {user_object_id}")
        
        # Convert instructor_id to string for comparison
        course_instructor_id = str(course.get('instructor_id'))
        current_user_id = str(user_object_id)
        
        print(f"Comparing instructor_id: {course_instructor_id} with user_id: {current_user_id}")
        
        if course_instructor_id != current_user_id:
            print("User is not the course instructor")
            return jsonify({'error': 'Unauthorized - not the course instructor'}), 403

        # Get and validate request data
        data = request.get_json()
        print(f"Received assignment data: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        if not data.get('title'):
            return jsonify({'error': 'Assignment title is required'}), 400

        try:
            # Create new assignment document
            new_assignment = {
                'course_id': str(course_id),
                'instructor_id': current_user_id,
                'title': str(data.get('title', '')).strip(),
                'description': str(data.get('description', '')).strip(),
                'due_date': data.get('due_date'),
                'total_points': int(data.get('total_points', 100)),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'status': 'active',
                'submissions_count': 0,
                'average_score': 0
            }
            
            print(f"Prepared assignment document: {new_assignment}")

            # Insert the assignment
            result = assignments_collection.insert_one(new_assignment)
            assignment_id = str(result.inserted_id)
            print(f"Assignment inserted with ID: {assignment_id}")

            # Update course with assignment reference
            update_result = courses_collection.update_one(
                {'_id': course_object_id},
                {'$push': {'assignments': assignment_id}}
            )
            print(f"Course updated with assignment reference: {update_result.modified_count} document(s) modified")

            # Format the response - ensure all ObjectId are converted to strings
            response_assignment = {
                '_id': assignment_id,
                'course_id': new_assignment['course_id'],
                'instructor_id': new_assignment['instructor_id'],
                'title': new_assignment['title'],
                'description': new_assignment['description'],
                'due_date': new_assignment['due_date'],
                'total_points': new_assignment['total_points'],
                'created_at': new_assignment['created_at'].isoformat(),
                'updated_at': new_assignment['updated_at'].isoformat(),
                'status': new_assignment['status'],
                'submissions_count': new_assignment['submissions_count'],
                'average_score': new_assignment['average_score']
            }
            
            response_data = {
                'message': 'Assignment created successfully',
                'assignment': response_assignment
            }
            
            print(f"Sending response: {response_data}")
            return jsonify(response_data), 201

        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({
                'error': 'Database error while saving assignment',
                'details': str(db_error)
            }), 500

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Failed to create assignment',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/quizzes', methods=['POST'])
@token_required
def create_quiz(current_user, course_id):
    try:
        print(f"Creating quiz for course {course_id}")
        print(f"Current user: {current_user}")
        
        # Convert IDs to ObjectId
        try:
            course_object_id = ObjectId(course_id)
            user_object_id = ObjectId(current_user['user_id'])
            print(f"Converted IDs - Course: {course_object_id}, User: {user_object_id}")
        except Exception as e:
            print(f"Invalid ID format: {str(e)}")
            return jsonify({'error': 'Invalid course or user ID format'}), 400

        # First, check if the course exists
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            print(f"Course {course_id} not found")
            return jsonify({'error': 'Course not found'}), 404

        # Then check if the user is the instructor
        print(f"Course instructor_id: {course.get('instructor_id')}")
        print(f"Current user_id: {user_object_id}")
        
        # Convert instructor_id to string for comparison
        course_instructor_id = str(course.get('instructor_id'))
        current_user_id = str(user_object_id)
        
        print(f"Comparing instructor_id: {course_instructor_id} with user_id: {current_user_id}")
        
        if course_instructor_id != current_user_id:
            print("User is not the course instructor")
            return jsonify({'error': 'Unauthorized - not the course instructor'}), 403

        # Get and validate request data
        data = request.get_json()
        print(f"Received quiz data: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        if not data.get('title'):
            return jsonify({'error': 'Quiz title is required'}), 400

        try:
            # Create new quiz document
            new_quiz = {
                'course_id': str(course_id),
                'instructor_id': current_user_id,
                'title': str(data.get('title', '')).strip(),
                'description': str(data.get('description', '')).strip(),
                'time_limit': int(data.get('time_limit', 30)),
                'passing_score': int(data.get('passing_score', 60)),
                'max_attempts': int(data.get('max_attempts', 3)),
                'questions': data.get('questions', []),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'status': 'active',
                'attempts_count': 0,
                'average_score': 0,
                'pass_rate': 0
            }
            
            print(f"Prepared quiz document: {new_quiz}")

            # Insert the quiz
            result = quizzes_collection.insert_one(new_quiz)
            quiz_id = str(result.inserted_id)
            print(f"Quiz inserted with ID: {quiz_id}")

            # Update course with quiz reference
            update_result = courses_collection.update_one(
                {'_id': course_object_id},
                {'$push': {'quizzes': quiz_id}}
            )
            print(f"Course updated with quiz reference: {update_result.modified_count} document(s) modified")

            # Format the response
            response_quiz = {
                '_id': quiz_id,
                'course_id': new_quiz['course_id'],
                'instructor_id': new_quiz['instructor_id'],
                'title': new_quiz['title'],
                'description': new_quiz['description'],
                'time_limit': new_quiz['time_limit'],
                'passing_score': new_quiz['passing_score'],
                'max_attempts': new_quiz['max_attempts'],
                'questions': new_quiz['questions'],
                'created_at': new_quiz['created_at'].isoformat(),
                'updated_at': new_quiz['updated_at'].isoformat(),
                'status': new_quiz['status'],
                'attempts_count': new_quiz['attempts_count'],
                'average_score': new_quiz['average_score'],
                'pass_rate': new_quiz['pass_rate']
            }
            
            response_data = {
                'message': 'Quiz created successfully',
                'quiz': response_quiz
            }
            
            print(f"Sending response: {response_data}")
            return jsonify(response_data), 201

        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({
                'error': 'Database error while saving quiz',
                'details': str(db_error)
            }), 500

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Failed to create quiz',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/assignments/<assignment_id>', methods=['DELETE'])
@token_required
def delete_assignment(current_user, course_id, assignment_id):
    try:
        print(f"Attempting to delete assignment {assignment_id} from course {course_id}")
        print(f"Current user: {current_user}")
        
        # Convert IDs to ObjectId
        try:
            course_object_id = ObjectId(course_id)
            assignment_object_id = ObjectId(assignment_id)
            user_object_id = ObjectId(current_user['user_id'])
            print(f"Converted IDs - Course: {course_object_id}, Assignment: {assignment_object_id}, User: {user_object_id}")
        except Exception as e:
            print(f"Invalid ID format: {str(e)}")
            return jsonify({'error': 'Invalid ID format'}), 400

        # First, check if the course exists
        course = courses_collection.find_one({'_id': course_object_id})
        if not course:
            print(f"Course {course_id} not found")
            return jsonify({'error': 'Course not found'}), 404

        # Then check if the user is the instructor
        print(f"Course instructor_id: {course.get('instructor_id')}")
        print(f"Current user_id: {user_object_id}")
        
        # Convert instructor_id to string for comparison
        course_instructor_id = str(course.get('instructor_id'))
        current_user_id = str(user_object_id)
        
        print(f"Comparing instructor_id: {course_instructor_id} with user_id: {current_user_id}")
        
        if course_instructor_id != current_user_id:
            print("User is not the course instructor")
            return jsonify({'error': 'Unauthorized - not the course instructor'}), 403

        # Check if assignment exists
        assignment = assignments_collection.find_one({
            '_id': assignment_object_id,
            'course_id': str(course_id)
        })
        
        if not assignment:
            print(f"Assignment {assignment_id} not found")
            return jsonify({'error': 'Assignment not found'}), 404

        # Delete the assignment
        result = assignments_collection.delete_one({
            '_id': assignment_object_id,
            'course_id': str(course_id)
        })

        if result.deleted_count > 0:
            # Remove assignment reference from course
            update_result = courses_collection.update_one(
                {'_id': course_object_id},
                {'$pull': {'assignments': str(assignment_id)}}
            )
            print(f"Course updated: {update_result.modified_count} document(s) modified")
            
            # Log the deletion
            try:
                log_action(
                    current_user_id,
                    'assignment_deleted',
                    str(course_id),
                    {'assignment_id': str(assignment_id)}
                )
            except Exception as log_error:
                print(f"Error logging deletion: {str(log_error)}")

            return jsonify({
                'message': 'Assignment deleted successfully',
                'assignment_id': str(assignment_id)
            }), 200
        
        print("Assignment not found or already deleted")
        return jsonify({'error': 'Assignment not found or already deleted'}), 404

    except Exception as e:
        print(f"Error deleting assignment: {str(e)}")
        return jsonify({
            'error': 'Failed to delete assignment',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/quizzes/<quiz_id>', methods=['GET', 'DELETE', 'OPTIONS'])
@token_required
def quiz_operations(current_user, course_id, quiz_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    if request.method == "DELETE":
        try:
            # Verify instructor permission
            course = courses_collection.find_one({
                '_id': ObjectId(course_id),
                'instructor_id': current_user['user_id']
            })
            
            if not course:
                return jsonify({'error': 'Course not found or unauthorized'}), 403

            # Delete the quiz
            result = quizzes_collection.delete_one({
                '_id': ObjectId(quiz_id),
                'course_id': str(course_id)
            })

            if result.deleted_count > 0:
                # Remove quiz reference from course if exists
                courses_collection.update_one(
                    {'_id': ObjectId(course_id)},
                    {'$pull': {'quizzes': str(quiz_id)}}
                )

                # Remove quiz attempts from enrollments
                enrollments_collection.update_many(
                    {'course_id': str(course_id)},
                    {'$unset': {f'quiz_attempts.{quiz_id}': ''}}
                )

                return jsonify({
                    'message': 'Quiz deleted successfully',
                    'quiz_id': quiz_id
                }), 200
            else:
                return jsonify({'error': 'Quiz not found'}), 404

        except Exception as e:
            print(f"Error deleting quiz: {str(e)}")
            return jsonify({
                'error': 'Failed to delete quiz',
                'details': str(e)
            }), 500

    # GET method handling
    try:
        # Check if user is enrolled
        enrollment = enrollments_collection.find_one({
            'course_id': str(course_id),
            'student_id': current_user['user_id']
        })
        
        if not enrollment and current_user['role'] != 'Instructor':
            return jsonify({'error': 'Not enrolled in this course'}), 403

        # Get quiz details
        quiz = quizzes_collection.find_one({'_id': ObjectId(quiz_id)})
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404

        # Format quiz data
        formatted_quiz = {
            '_id': str(quiz['_id']),
            'title': quiz.get('title', ''),
            'description': quiz.get('description', ''),
            'time_limit': quiz.get('time_limit', 30),
            'passing_score': quiz.get('passing_score', 60),
            'questions': []
        }

        # Get questions
        questions = quiz.get('questions', [])
        for question in questions:
            formatted_question = {
                '_id': str(question['_id']) if '_id' in question else str(ObjectId()),
                'question': question.get('question', ''),
                'options': question.get('options', []),
                'type': question.get('type', 'multiple_choice'),
                'correct_answer': question.get('correct_answer') if current_user['role'] == 'Instructor' else None
            }
            formatted_quiz['questions'].append(formatted_question)

        return jsonify(formatted_quiz), 200

    except Exception as e:
        print(f"Error getting quiz details: {str(e)}")
        return jsonify({
            'error': 'Failed to get quiz details',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/quizzes/<quiz_id>/submit', methods=['POST', 'OPTIONS'])
@token_required
def submit_quiz_answer(current_user, course_id, quiz_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200

    try:
        data = request.get_json()
        answers = data.get('answers', {})
        
        # Get quiz and validate it exists
        quiz = quizzes_collection.find_one({'_id': ObjectId(quiz_id)})
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404

        # Initialize scoring variables
        score = 0
        total_points = 0
        feedback = {}
        
        # Get questions from quiz
        questions = quiz.get('questions', [])
        
        # Create a map of question IDs to questions for easier lookup
        question_map = {str(q.get('_id', '')): q for q in questions}
        
        # Process each submitted answer
        for question_id, submitted_answer in answers.items():
            # Get question from map
            question = question_map.get(question_id)
            if not question:
                continue

            # Get points for this question (default to 1 if not specified)
            points = question.get('points', 1)
            total_points += points
            
            # Process based on question type
            question_type = question.get('type', 'multiple_choice')
            
            if question_type == 'multiple_choice':
                # Convert both answers to strings and compare
                correct_answer = str(question.get('correct_answer', '')).strip().lower()
                student_answer = str(submitted_answer).strip().lower()
                is_correct = student_answer == correct_answer
                
                if is_correct:
                    score += points
                
                feedback[question_id] = {
                    'correct': is_correct,
                    'explanation': question.get('explanation', ''),
                    'submitted_answer': submitted_answer,
                    'correct_answer': question.get('correct_answer', '')
                }
                
            elif question_type == 'true_false':
                # Convert to boolean and compare
                correct_answer = str(question.get('correct_answer', '')).strip().lower() == 'true'
                student_answer = str(submitted_answer).strip().lower() == 'true'
                is_correct = student_answer == correct_answer
                
                if is_correct:
                    score += points
                    
                feedback[question_id] = {
                    'correct': is_correct,
                    'explanation': question.get('explanation', '')
                }
                
            elif question_type in ['short_answer', 'scenario_based']:
                feedback[question_id] = {
                    'answer': submitted_answer,
                    'status': 'pending_review',
                    'max_points': points
                }

        # Calculate percentage score
        percentage_score = (score / total_points * 100) if total_points > 0 else 0

        # Create submission record
        submission = {
            'student_id': current_user['user_id'],
            'quiz_id': quiz_id,
            'course_id': course_id,
            'answers': answers,
            'feedback': feedback,
            'score': percentage_score,
            'total_points': total_points,
            'points_scored': score,
            'status': 'pending_review' if any(q.get('type') in ['short_answer', 'scenario_based'] 
                                            for q in questions) else 'completed',
            'submitted_at': datetime.utcnow()
        }
        
        # Save submission
        result = submissions_collection.insert_one(submission)
        
        # Update enrollment with quiz completion
        enrollments_collection.update_one(
            {
                'course_id': str(course_id),
                'student_id': current_user['user_id']
            },
            {
                '$set': {
                    f'quiz_attempts.{quiz_id}': {
                        'submission_id': str(result.inserted_id),
                        'score': percentage_score,
                        'submitted_at': datetime.utcnow(),
                        'status': 'completed'
                    }
                }
            }
        )

        return jsonify({
            'message': 'Quiz submitted successfully',
            'feedback': feedback,
            'score': round(percentage_score, 2)
        }), 200

    except Exception as e:
        print(f"Error submitting quiz: {str(e)}")
        return jsonify({'error': 'Failed to submit quiz'}), 500

@courses.route('/<course_id>/students/<student_id>/details', methods=['GET'])
@token_required
def get_student_details(current_user, course_id, student_id):
    try:
        # Verify instructor permission
        course = courses_collection.find_one({
            '_id': ObjectId(course_id),
            'instructor_id': current_user['user_id']
        })
        
        if not course:
            return jsonify({'error': 'Course not found or unauthorized'}), 404

        # Get student enrollment
        enrollment = enrollments_collection.find_one({
            'course_id': str(course_id),
            'student_id': student_id
        })
        
        if not enrollment:
            return jsonify({'error': 'Student not enrolled in this course'}), 404

        # Get student info
        student = users_collection.find_one({'_id': ObjectId(student_id)})
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        # Get quiz attempts from enrollment
        quiz_attempts = []
        if 'quiz_attempts' in enrollment:
            for quiz_id, attempt in enrollment['quiz_attempts'].items():
                quiz = quizzes_collection.find_one({'_id': ObjectId(quiz_id)})
                if quiz:
                    quiz_attempts.append({
                        'quiz_id': quiz_id,
                        'quiz_title': quiz.get('title', ''),
                        'status': attempt.get('status', 'not_started'),
                        'score': attempt.get('score', 0),
                        'passed': attempt.get('passed', False),
                        'submitted_at': attempt.get('submitted_at'),
                        'correct_answers': attempt.get('correct_answers', 0),
                        'incorrect_answers': attempt.get('total_questions', 0) - attempt.get('correct_answers', 0),
                        'total_questions': attempt.get('total_questions', 0),
                        'attempt_number': attempt.get('attempt_number', 1)
                    })

        # Format response
        response_data = {
            'student_info': {
                'name': f"{student.get('first_name', '')} {student.get('last_name', '')}",
                'email': student.get('email'),
                'enrollment_date': enrollment.get('enrolled_at'),
            },
            'progress': {
                'overall': enrollment.get('progress', 0),
                'modules_completed': len(enrollment.get('completed_modules', [])),
                'total_modules': len(course.get('modules', [])),
            },
            'quiz_attempts': quiz_attempts,
            'assignments': {
                'completed': len([a for a in enrollment.get('submissions', {}).values() if a.get('status') == 'completed']),
                'total': len(course.get('assignments', [])),
                'average_score': sum(a.get('score', 0) for a in enrollment.get('submissions', {}).values()) / 
                               len(enrollment.get('submissions', {})) if enrollment.get('submissions') else 0
            },
            'last_activity': enrollment.get('last_accessed')
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error getting student details: {str(e)}")
        return jsonify({
            'error': 'Failed to get student details',
            'details': str(e)
        }), 500

def get_recent_activities(student_id, course_id):
    # Get recent activities from audit log
    activities = list(audit_log_collection.find({
        'user_id': str(student_id),
        'course_id': str(course_id)
    }).sort('timestamp', -1).limit(10))

    return [{
        'type': activity.get('action_type'),
        'description': activity.get('details', {}).get('description', ''),
        'timestamp': activity.get('timestamp').isoformat()
    } for activity in activities]

@courses.route('/<course_id>/viewdetails', methods=['GET'])
@token_required
def get_participant_course_details(current_user, course_id):
    try:
        # Get course details
        course = courses_collection.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        # Get enrollment if exists
        enrollment = enrollments_collection.find_one({
            'course_id': str(course_id),
            'student_id': current_user['user_id']
        })

        # Format course data
        response_data = {
            'course': {
                '_id': str(course['_id']),
                'title': course.get('course_title', ''),
                'description': course.get('description', ''),
                'instructor_name': course.get('instructor_name', ''),
                'duration': course.get('duration', 0),
                'start_date': course.get('start_date'),
                'end_date': course.get('end_date'),
                'is_enrolled': bool(enrollment)
            },
            'modules': [],
            'assignments': [],
            'quizzes': []
        }

        # Get modules with completion status
        modules = list(modules_collection.find({'course_id': str(course_id)}).sort('order', 1))
        for module in modules:
            module_data = {
                '_id': str(module['_id']),
                'title': module.get('title', ''),
                'description': module.get('description', ''),
                'content': module.get('content', ''),
                'order': module.get('order', 0),
                'completed': False
            }
            
            if enrollment:
                completed_modules = enrollment.get('completed_modules', [])
                module_data['completed'] = str(module['_id']) in completed_modules
            
            response_data['modules'].append(module_data)

        # Get assignments with submission status
        assignments = list(assignments_collection.find({'course_id': str(course_id)}))
        for assignment in assignments:
            assignment_data = {
                '_id': str(assignment['_id']),
                'title': assignment.get('title', ''),
                'description': assignment.get('description', ''),
                'due_date': assignment.get('due_date'),
                'total_points': assignment.get('total_points', 0),
                'file_url': assignment.get('file_url', ''),
                'status': 'pending',
                'score': None,
                'submission_date': None
            }
            
            if enrollment:
                submissions = enrollment.get('submissions', {})
                submission = submissions.get(str(assignment['_id']), {})
                assignment_data.update({
                    'status': submission.get('status', 'pending'),
                    'score': submission.get('score'),
                    'submission_date': submission.get('submitted_at'),
                    'feedback': submission.get('feedback', '')
                })
            
            response_data['assignments'].append(assignment_data)

        # Get quizzes with attempt status
        quizzes = list(quizzes_collection.find({'course_id': str(course_id)}))
        for quiz in quizzes:
            quiz_data = {
                '_id': str(quiz['_id']),
                'title': quiz.get('title', ''),
                'description': quiz.get('description', ''),
                'time_limit': quiz.get('time_limit', 30),
                'passing_score': quiz.get('passing_score', 60),
                'total_questions': len(quiz.get('questions', [])),
                'status': 'not_started',
                'score': None,
                'attempt_date': None,
                'passed': None
            }
            
            if enrollment:
                quiz_attempts = enrollment.get('quiz_attempts', {})
                attempt = quiz_attempts.get(str(quiz['_id']), {})
                quiz_data.update({
                    'status': attempt.get('status', 'not_started'),
                    'score': attempt.get('score'),
                    'attempt_date': attempt.get('submitted_at'),
                    'passed': attempt.get('passed', False),
                    'correct_answers': attempt.get('correct_answers', 0),
                    'total_questions': attempt.get('total_questions', quiz_data['total_questions'])
                })
            
            response_data['quizzes'].append(quiz_data)

        # Add progress if enrolled
        if enrollment:
            response_data['progress'] = enrollment.get('progress', 0)

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error getting participant course details: {str(e)}")
        return jsonify({
            'error': 'Failed to get course details',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/enrollment-status', methods=['GET', 'OPTIONS'])
@token_required
def get_enrollment_status(current_user, course_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        # Check if user is enrolled in the course
        enrollment = enrollments_collection.find_one({
            'course_id': str(course_id),
            'student_id': current_user['user_id']
        })

        # Calculate progress if enrolled
        progress = 0
        if enrollment:
            completed_modules = len([m for m in enrollment.get('completed_modules', []) if m])
            total_modules = modules_collection.count_documents({'course_id': str(course_id)})
            progress = (completed_modules / total_modules * 100) if total_modules > 0 else 0

        return jsonify({
            'is_enrolled': bool(enrollment),
            'progress': round(progress, 2),
            'enrollment_date': enrollment.get('enrolled_at').isoformat() if enrollment else None,
            'last_accessed': enrollment.get('last_accessed').isoformat() if enrollment else None
        }), 200

    except Exception as e:
        print(f"Error getting enrollment status: {str(e)}")
        return jsonify({
            'error': 'Failed to get enrollment status',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/modules/<module_id>/complete', methods=['POST', 'OPTIONS'])
@token_required
def complete_module(current_user, course_id, module_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        # Verify the module exists
        module = modules_collection.find_one({
            '_id': ObjectId(module_id),
            'course_id': str(course_id)
        })
        
        if not module:
            return jsonify({'error': 'Module not found'}), 404

        # Get user's enrollment
        enrollment = enrollments_collection.find_one({
            'course_id': str(course_id),
            'student_id': current_user['user_id']
        })

        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 403

        # Update completed modules in enrollment
        completed_modules = enrollment.get('completed_modules', [])
        if module_id not in completed_modules:
            completed_modules.append(module_id)

        # Calculate new progress
        total_modules = modules_collection.count_documents({'course_id': str(course_id)})
        new_progress = (len(completed_modules) / total_modules * 100) if total_modules > 0 else 0

        # Update enrollment
        result = enrollments_collection.update_one(
            {'_id': enrollment['_id']},
            {
                '$set': {
                    'completed_modules': completed_modules,
                    'progress': round(new_progress, 2),
                    'last_accessed': datetime.utcnow()
                }
            }
        )

        if result.modified_count:
            return jsonify({
                'message': 'Module marked as complete',
                'progress': round(new_progress, 2)
            }), 200
        else:
            return jsonify({'error': 'Failed to update module status'}), 500

    except Exception as e:
        print(f"Error completing module: {str(e)}")
        return jsonify({
            'error': 'Failed to complete module',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/enrolled-students', methods=['GET'])
@token_required
def get_enrolled_students(current_user, course_id):
    try:
        # Verify instructor permission
        course = courses_collection.find_one({
            '_id': ObjectId(course_id),
            'instructor_id': current_user['user_id']
        })
        
        if not course:
            return jsonify({'error': 'Course not found or unauthorized'}), 404

        # Get all enrollments for the course
        enrollments = list(enrollments_collection.find({'course_id': str(course_id)}))
        
        # Get total assignments and quizzes for percentage calculations
        total_assignments = len(course.get('assignments', []))
        total_quizzes = quizzes_collection.count_documents({'course_id': str(course_id)})

        students_data = []
        for enrollment in enrollments:
            student = users_collection.find_one({'_id': ObjectId(enrollment['student_id'])})
            if student:
                # Calculate quiz statistics
                quiz_attempts = enrollment.get('quiz_attempts', {})
                completed_quizzes = len([q for q in quiz_attempts.values() 
                                       if q.get('status') == 'completed'])
                quiz_percentage = (completed_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0

                # Calculate assignment statistics
                submissions = enrollment.get('submissions', {})
                completed_assignments = len([s for s in submissions.values() 
                                          if s.get('status') == 'completed'])
                assignment_percentage = (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0

                student_data = {
                    'id': str(student['_id']),
                    'name': f"{student.get('first_name', '')} {student.get('last_name', '')}",
                    'email': student.get('email', ''),
                    'progress': enrollment.get('progress', 0),
                    'assignments': {
                        'completed': completed_assignments,
                        'total': total_assignments,
                        'percentage': round(assignment_percentage, 2)
                    },
                    'quizzes': {
                        'completed': completed_quizzes,
                        'total': total_quizzes,
                        'percentage': round(quiz_percentage, 2)
                    },
                    'last_active': enrollment.get('last_accessed'),
                    'performance': calculate_performance(enrollment)
                }
                students_data.append(student_data)

        return jsonify({
            'students': students_data,
            'total_count': len(students_data)
        }), 200

    except Exception as e:
        print(f"Error getting enrolled students: {str(e)}")
        return jsonify({
            'error': 'Failed to get enrolled students',
            'details': str(e)
        }), 500

@courses.route('/participants/performance', methods=['GET', 'OPTIONS'])
@token_required
def get_participants_performance(current_user):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        # Verify HR Admin permission
        if current_user['role'] != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get all participants
        participants_data = []
        participants = users_collection.find({'role': 'Participant'})

        for participant in participants:
            # Get enrollments for this participant
            enrollments = list(enrollments_collection.find({'student_id': str(participant['_id'])}))
            
            # Calculate overall metrics
            total_courses = len(enrollments)
            completed_courses = len([e for e in enrollments if e.get('progress', 0) == 100])
            
            # Calculate quiz performance
            quiz_scores = []
            total_quizzes = 0
            completed_quizzes = 0
            
            for enrollment in enrollments:
                quiz_attempts = enrollment.get('quiz_attempts', {})
                total_quizzes += len(quiz_attempts)
                for attempt in quiz_attempts.values():
                    if attempt.get('status') == 'completed':
                        completed_quizzes += 1
                        quiz_scores.append(attempt.get('score', 0))
            
            # Calculate assignment performance
            assignment_scores = []
            for enrollment in enrollments:
                submissions = enrollment.get('submissions', {})
                for submission in submissions.values():
                    if submission.get('status') == 'completed':
                        assignment_scores.append(submission.get('score', 0))

            # Calculate averages
            quiz_average = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0
            assignment_average = sum(assignment_scores) / len(assignment_scores) if assignment_scores else 0
            
            # Calculate overall score
            overall_score = (
                (quiz_average * 0.4) +  # 40% weight to quizzes
                (assignment_average * 0.3) +  # 30% weight to assignments
                ((completed_courses / total_courses * 100 if total_courses > 0 else 0) * 0.3)  # 30% weight to course completion
            )

            participant_data = {
                'id': str(participant['_id']),
                'name': f"{participant.get('first_name', '')} {participant.get('last_name', '')}",
                'email': participant.get('email', ''),
                'overallScore': round(overall_score, 2),
                'completedCourses': completed_courses,
                'totalCourses': total_courses,
                'quizAverage': round(quiz_average, 2),
                'assignmentAverage': round(assignment_average, 2),
                'completedQuizzes': completed_quizzes,
                'totalQuizzes': total_quizzes
            }
            
            participants_data.append(participant_data)

        return jsonify(participants_data), 200

    except Exception as e:
        print(f"Error getting participants performance: {str(e)}")
        return jsonify({
            'error': 'Failed to get participants performance',
            'details': str(e)
        }), 500

# Add this route handler for updating modules
@courses.route('/<course_id>/modules/<module_id>', methods=['PUT', 'OPTIONS'])
@token_required
def update_module(current_user, course_id, module_id):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        # Verify instructor permission
        if current_user['role'] != 'Instructor':
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get the update data
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['title', 'description', 'content']):
            return jsonify({'error': 'Missing required fields'}), 400

        # Update module
        update_result = modules_collection.update_one(
            {
                '_id': ObjectId(module_id),
                'course_id': course_id
            },
            {
                '$set': {
                    'title': data['title'],
                    'description': data['description'],
                    'content': data['content'],
                    'order': data.get('order', 0),
                    'updated_at': datetime.utcnow()
                }
            }
        )

        if update_result.modified_count > 0:
            # Log the action
            log_instructor_action(
                current_user['user_id'],
                course_id,
                'update_module',
                f"Module '{data['title']}' updated"
            )
            
            # Get updated module
            updated_module = modules_collection.find_one({'_id': ObjectId(module_id)})
            return jsonify({
                'message': 'Module updated successfully',
                'module': {
                    '_id': str(updated_module['_id']),
                    'title': updated_module['title'],
                    'description': updated_module['description'],
                    'content': updated_module['content'],
                    'order': updated_module.get('order', 0),
                    'updated_at': updated_module.get('updated_at')
                }
            }), 200
        else:
            return jsonify({'error': 'Module not found or no changes made'}), 404

    except Exception as e:
        print(f"Error updating module: {str(e)}")
        return jsonify({
            'error': 'Failed to update module',
            'details': str(e)
        }), 500

@courses.route('/<course_id>/assignments/<assignment_id>/submit', methods=['POST'])
@token_required
def submit_assignment(current_user, course_id, assignment_id):
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        # Create secure filename and save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Save submission record
        submission = {
            'student_id': current_user['user_id'],
            'assignment_id': assignment_id,
            'course_id': course_id,
            'file_path': file_path,
            'status': 'submitted',
            'submitted_at': datetime.utcnow()
        }
        
        submissions_collection.insert_one(submission)
        
        return jsonify({
            'message': 'Assignment submitted successfully',
            'submission_id': str(submission['_id'])
        }), 200

    except Exception as e:
        print(f"Error submitting assignment: {str(e)}")
        return jsonify({'error': 'Failed to submit assignment'}), 500
=======
        }
        
        print(f"Returning user details for {user_id}:", user_data)  # Debug log
        
        return jsonify(user_data), 200

    except Exception as e:
        print(f"Error fetching user details: {str(e)}")
        return jsonify({'error': 'Failed to fetch user details'}), 500
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
