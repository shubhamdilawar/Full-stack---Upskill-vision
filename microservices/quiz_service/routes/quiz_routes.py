from flask import Blueprint, request, jsonify
from quiz_service.db.db import quizzes_collection, enrollments_collection, submissions_collection
from bson import ObjectId
from datetime import datetime
import jwt
import os
from functools import wraps
from quiz_service.config.config import Config

quizzes = Blueprint('quizzes', __name__)

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

@quizzes.route('/<course_id>/quizzes', methods=['GET'])
@token_required
def get_course_quizzes(current_user, course_id):
    try:
        quizzes = list(quizzes_collection.find({'course_id': course_id}))
        return jsonify({
            'quizzes': [{
                '_id': str(quiz['_id']),
                'title': quiz.get('title'),
                'description': quiz.get('description', ''),
                'questionCount': len(quiz.get('questions', [])),
                'timeLimit': quiz.get('time_limit'),
                'attempts': quiz.get('max_attempts')
            } for quiz in quizzes]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quizzes.route('/<course_id>/quizzes/<quiz_id>', methods=['GET', 'DELETE', 'OPTIONS'])
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
            user_response = requests.get(f"{AUTH_SERVICE_URL}/current_user", headers=request.headers)
            user_response.raise_for_status()
            user_data = user_response.json()

            # Verify instructor permission
            if user_data.get('role') != 'Instructor':
                return jsonify({'error': 'Unauthorized access'}), 403
           
            # Delete the quiz
            result = quizzes_collection.delete_one({
                '_id': ObjectId(quiz_id),
                'course_id': str(course_id)
            })

            if result.deleted_count > 0:
                # Remove quiz reference from course if exists
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
        
        # Check if user has instructor role
        user_response = requests.get(f"{AUTH_SERVICE_URL}/current_user", headers=request.headers)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        if not enrollment and user_data.get('role') != 'Instructor':
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
                'correct_answer': question.get('correct_answer') if user_data.get('role') == 'Instructor' else None
            }
            formatted_quiz['questions'].append(formatted_question)

        return jsonify(formatted_quiz), 200

    except Exception as e:
        print(f"Error getting quiz details: {str(e)}")
        return jsonify({
            'error': 'Failed to get quiz details',
            'details': str(e)
        }), 500

@quizzes.route('/<course_id>/quizzes/<quiz_id>/submit', methods=['POST', 'OPTIONS'])
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