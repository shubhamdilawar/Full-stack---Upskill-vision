from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import sys
from bson import ObjectId
from datetime import datetime
from werkzeug.utils import secure_filename
from functools import wraps
import requests
import traceback

sys.path.append('../..')
from shared.config import MONGODB_URI, DATABASE_NAME

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# MongoDB connection
try:
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    assignments_collection = db.assignments
    submissions_collection = db.submissions
    courses_collection = db.courses
    users_collection = db.users
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)

# Auth service URL
AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://localhost:5001')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

@app.route('/assignments/create', methods=['POST'])
@token_required
def create_assignment(current_user):
    try:
        data = request.get_json()
        course_id = data.get('course_id')
        
        # Create assignment document
        assignment = {
            'course_id': course_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'due_date': data['due_date'],
            'total_points': data.get('total_points', 100),
            'created_by': current_user['user_id'],
            'created_at': datetime.utcnow(),
            'status': 'active'
        }
        
        result = assignments_collection.insert_one(assignment)
        
        return jsonify({
            'message': 'Assignment created successfully',
            'assignment_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Error creating assignment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/assignments/<assignment_id>/submit', methods=['POST'])
@token_required
def submit_assignment(current_user, assignment_id):
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
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Save submission record
        submission = {
            'student_id': current_user['user_id'],
            'assignment_id': assignment_id,
            'file_path': file_path,
            'status': 'submitted',
            'submitted_at': datetime.utcnow()
        }
        
        result = submissions_collection.insert_one(submission)
        
        return jsonify({
            'message': 'Assignment submitted successfully',
            'submission_id': str(result.inserted_id)
        }), 200

    except Exception as e:
        print(f"Error submitting assignment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/assignments/<assignment_id>', methods=['GET'])
@token_required
def get_assignment(current_user, assignment_id):
    try:
        assignment = assignments_collection.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
            
        assignment['_id'] = str(assignment['_id'])
        return jsonify(assignment), 200
        
    except Exception as e:
        print(f"Error fetching assignment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'service': 'assignment-service',
            'mongodb': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'assignment-service',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005) 