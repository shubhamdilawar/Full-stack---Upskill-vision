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
    quizzes_collection = db.quizzes
    courses_collection = db.courses
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

@app.route('/quizzes/create', methods=['POST'])
@token_required
def create_quiz(current_user):
    try:
        data = request.get_json()
        course_id = data.get('course_id')
        
        # Create quiz document
        quiz = {
            'course_id': course_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'questions': data['questions'],
            'time_limit': data.get('time_limit', 30),
            'passing_score': data.get('passing_score', 60),
            'max_attempts': data.get('max_attempts', 3),
            'created_by': current_user['user_id'],
            'created_at': datetime.utcnow(),
            'status': 'active'
        }
        
        result = quizzes_collection.insert_one(quiz)
        
        return jsonify({
            'message': 'Quiz created successfully',
            'quiz_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Error creating quiz: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/quizzes/<quiz_id>/submit', methods=['POST'])
@token_required
def submit_quiz(current_user, quiz_id):
    try:
        data = request.get_json()
        answers = data.get('answers', {})
        
        quiz = quizzes_collection.find_one({'_id': ObjectId(quiz_id)})
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
            
        # Calculate score
        total_questions = len(quiz['questions'])
        correct_answers = 0
        
        for question in quiz['questions']:
            question_id = str(question['_id'])
            if question_id in answers:
                if answers[question_id] == question['correct_answer']:
                    correct_answers += 1
                    
        score = (correct_answers / total_questions) * 100
        
        # Save submission
        submission = {
            'quiz_id': quiz_id,
            'student_id': current_user['user_id'],
            'answers': answers,
            'score': score,
            'submitted_at': datetime.utcnow(),
            'status': 'completed'
        }
        
        quizzes_collection.insert_one(submission)
        
        return jsonify({
            'message': 'Quiz submitted successfully',
            'score': score,
            'passed': score >= quiz['passing_score']
        }), 200
        
    except Exception as e:
        print(f"Error submitting quiz: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/quizzes/<quiz_id>', methods=['GET'])
@token_required
def get_quiz(current_user, quiz_id):
    try:
        quiz = quizzes_collection.find_one({'_id': ObjectId(quiz_id)})
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
            
        quiz['_id'] = str(quiz['_id'])
        return jsonify(quiz), 200
        
    except Exception as e:
        print(f"Error fetching quiz: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'service': 'quiz-service',
            'mongodb': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'quiz-service',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003) 