from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import sys
import traceback

sys.path.append('../..')
from shared.config import JWT_SECRET_KEY

app = Flask(__name__)
# Update CORS configuration to allow credentials
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "supports_credentials": True
    }
})

# Service URLs
AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://localhost:5001')
COURSE_SERVICE_URL = os.getenv('COURSE_SERVICE_URL', 'http://localhost:5002')
QUIZ_SERVICE_URL = os.getenv('QUIZ_SERVICE_URL', 'http://localhost:5003')
USER_SERVICE_URL = os.getenv('USER_SERVICE_URL', 'http://localhost:5004')
ASSIGNMENT_SERVICE_URL = os.getenv('ASSIGNMENT_SERVICE_URL', 'http://localhost:5005')

def forward_request(service_url, path='', method='GET'):
    try:
        url = f"{service_url}{path}"
        headers = {
            key: value for key, value in request.headers
            if key in ['Authorization', 'Content-Type']
        }
        
        if method == 'GET':
            response = requests.get(url, headers=headers, params=request.args)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=request.get_json())
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=request.get_json())
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers)
            
        return jsonify(response.json()), response.status_code, {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': 'http://localhost:3000'
        }
    except requests.exceptions.RequestException as e:
        print(f"Service request failed: {str(e)}")
        return jsonify({'error': 'Service unavailable'}), 503

# Auth routes
@app.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': 'http://localhost:3000'
        }
    return forward_request(AUTH_SERVICE_URL, '/auth/login', 'POST')

@app.route('/auth/signup', methods=['POST'])
def signup():
    return forward_request(AUTH_SERVICE_URL, '/auth/signup', 'POST')

@app.route('/auth/verify', methods=['POST'])
def verify():
    return forward_request(AUTH_SERVICE_URL, '/auth/verify', 'POST')

# Course routes
@app.route('/courses', methods=['GET'])
def get_courses():
    return forward_request(COURSE_SERVICE_URL, '/courses')

@app.route('/courses/create', methods=['POST'])
def create_course():
    return forward_request(COURSE_SERVICE_URL, '/courses/create', 'POST')

@app.route('/courses/<course_id>/details', methods=['GET'])
def get_course_details(course_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/{course_id}/details', 'GET')

@app.route('/courses/<course_id>/enrollments', methods=['GET'])
def get_course_enrollments(course_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/{course_id}/enrollments', 'GET')

@app.route('/courses/<course_id>/modules', methods=['GET', 'POST'])
def manage_modules(course_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/{course_id}/modules', request.method)

@app.route('/courses/enroll/<course_id>', methods=['POST'])
def enroll_course(course_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/enroll/{course_id}', 'POST')

@app.route('/courses/search', methods=['GET'])
def search_courses():
    return forward_request(COURSE_SERVICE_URL, '/courses/search', 'GET')

@app.route('/courses/<course_id>/progress', methods=['PUT'])
def update_course_progress(course_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/{course_id}/progress', 'PUT')

@app.route('/courses/instructor/<instructor_id>', methods=['GET'])
def get_instructor_courses(instructor_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/instructor/{instructor_id}', 'GET')

@app.route('/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/{course_id}', 'PUT')

# Quiz routes
@app.route('/quizzes/create', methods=['POST'])
def create_quiz():
    return forward_request(QUIZ_SERVICE_URL, '/quizzes/create', 'POST')

@app.route('/quizzes/<quiz_id>/submit', methods=['POST'])
def submit_quiz(quiz_id):
    return forward_request(QUIZ_SERVICE_URL, f'/quizzes/{quiz_id}/submit', 'POST')

@app.route('/quizzes/<quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    return forward_request(QUIZ_SERVICE_URL, f'/quizzes/{quiz_id}', 'GET')

# User routes
@app.route('/users', methods=['GET'])
def get_users():
    return forward_request(USER_SERVICE_URL, '/users')

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    return forward_request(USER_SERVICE_URL, f'/users/{user_id}')

@app.route('/users/update-profile', methods=['PUT'])
def update_user_profile():
    return forward_request(USER_SERVICE_URL, '/users/update-profile', 'PUT')

@app.route('/users/<user_id>/courses', methods=['GET'])
def get_user_courses(user_id):
    return forward_request(USER_SERVICE_URL, f'/users/{user_id}/courses', 'GET')

# Assignment routes
@app.route('/assignments/create', methods=['POST'])
def create_assignment():
    return forward_request(ASSIGNMENT_SERVICE_URL, '/assignments/create', 'POST')

@app.route('/assignments/<assignment_id>/submit', methods=['POST'])
def submit_assignment(assignment_id):
    return forward_request(ASSIGNMENT_SERVICE_URL, f'/assignments/{assignment_id}/submit', 'POST')

@app.route('/assignments/<assignment_id>', methods=['GET'])
def get_assignment(assignment_id):
    return forward_request(ASSIGNMENT_SERVICE_URL, f'/assignments/{assignment_id}', 'GET')

@app.route('/health', methods=['GET'])
def health_check():
    health_status = {
        'status': 'healthy',
        'service': 'api-gateway'
    }
    
    # Check all services
    services = {
        'auth': AUTH_SERVICE_URL,
        'course': COURSE_SERVICE_URL,
        'quiz': QUIZ_SERVICE_URL,
        'user': USER_SERVICE_URL,
        'assignment': ASSIGNMENT_SERVICE_URL
    }
    
    for service_name, url in services.items():
        try:
            response = requests.get(f"{url}/health")
            health_status[service_name] = 'up' if response.status_code == 200 else 'down'
        except:
            health_status[service_name] = 'down'
    
    return jsonify(health_status)

# User Management Routes
@app.route('/api/users/all', methods=['GET'])
def get_all_users():
    return forward_request(USER_SERVICE_URL, '/users/all')

@app.route('/api/users/approve/<user_id>', methods=['PUT'])
def approve_user(user_id):
    return forward_request(USER_SERVICE_URL, f'/users/approve/{user_id}', 'PUT')

@app.route('/api/users/reject/<user_id>', methods=['PUT'])
def reject_user(user_id):
    return forward_request(USER_SERVICE_URL, f'/users/reject/{user_id}', 'PUT')

# Course Management Routes
@app.route('/api/courses/all', methods=['GET'])
def get_all_courses():
    return forward_request(COURSE_SERVICE_URL, '/courses/all')

@app.route('/api/courses/instructor/<instructor_id>', methods=['GET'])
def get_instructor_courses(instructor_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/instructor/{instructor_id}')

@app.route('/api/courses/enrolled/<student_id>', methods=['GET'])
def get_enrolled_courses(student_id):
    return forward_request(COURSE_SERVICE_URL, f'/courses/enrolled/{student_id}')

# Dashboard Routes
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    return forward_request(USER_SERVICE_URL, '/dashboard/stats')

# Profile Routes
@app.route('/api/profile/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    return forward_request(USER_SERVICE_URL, f'/profile/{user_id}')

@app.route('/api/profile/update', methods=['PUT'])
def update_profile():
    return forward_request(USER_SERVICE_URL, '/profile/update', 'PUT')

# Admin Routes
@app.route('/api/admin/pending-approvals', methods=['GET'])
def get_pending_approvals():
    return forward_request(USER_SERVICE_URL, '/admin/pending-approvals')

@app.route('/api/admin/course-stats', methods=['GET'])
def get_course_stats():
    return forward_request(COURSE_SERVICE_URL, '/admin/course-stats')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 