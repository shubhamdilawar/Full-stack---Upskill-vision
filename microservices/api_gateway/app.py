from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import os
import sys

# Get the absolute path of the current file's directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Add the current directory to Python path
sys.path.append(os.path.dirname(current_dir))

app = Flask(__name__)

# Configure CORS once at the app level
CORS(app, 
    resources={
        r"/api/*": {
            "origins": "http://localhost:3000",  # String instead of list
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    }
)

# Service URLs
AUTH_SERVICE_URL = "http://localhost:5001"
COURSE_SERVICE_URL = "http://localhost:5002"
QUIZ_SERVICE_URL = "http://localhost:5003"
AUDIT_SERVICE_URL = "http://localhost:5004"

@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def gateway(path):
    try:
        print(f"Received request for path: {path}")  # Debug log
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        if 'Authorization' in request.headers:
            headers['Authorization'] = request.headers['Authorization']

        # Get request data
        data = request.get_json() if request.is_json else None
        print(f"Request data: {data}")  # Debug log

        # Route to appropriate service
        if path.startswith('auth/'):
            service_path = path[5:]  # Remove 'auth/' from the path
            target_url = f"{AUTH_SERVICE_URL}/auth/{service_path}"
        elif path.startswith('courses'):
            # Handle course deletion
            parts = path.split('/')
            if len(parts) > 2 and parts[1] == "course":
                target_url = f"{COURSE_SERVICE_URL}/courses/delete_course/{parts[2]}"
            else:
                target_url = f"{COURSE_SERVICE_URL}/{path}"
        elif path.startswith('quizzes/'):
            service_path = path[8:]  # Remove 'quizzes/' from the path
            target_url = f"{QUIZ_SERVICE_URL}/quizzes/{service_path}"
        else:
            return jsonify({'error': 'Invalid route'}), 404

        print(f"Forwarding to: {target_url}")  # Debug log

        # Forward the request
        response = None
        if request.method == 'GET':
            response = requests.get(target_url, headers=headers, params=request.args)
        elif request.method == 'POST':
            response = requests.post(target_url, headers=headers, json=data)
        elif request.method == 'PUT':
            response = requests.put(target_url, headers=headers, json=data)
        elif request.method == 'DELETE':
            response = requests.delete(target_url, headers=headers)
        else:
            return jsonify({'message': 'OK'}), 200

        # Debug log
        print(f"Service response: {response.status_code} - {response.text}")

        # Handle non-JSON responses
        if response and response.headers.get('content-type', '').lower() != 'application/json':
            return response.text, response.status_code

        return response.json(), response.status_code

    except Exception as e:
        print(f"Gateway error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Audit Service Routes
@app.route('/api/audit/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def audit_service_proxy(path):
    if request.method == 'OPTIONS':
        return '', 200  # Let the CORS decorator handle OPTIONS

    try:
        # Forward the request to the audit service
        url = f"{AUDIT_SERVICE_URL}/api/audit/{path}"
        headers = {key: value for key, value in request.headers if key != 'Host'}
        
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            params=request.args,
            json=request.get_json() if request.is_json else None
        )
        
        # Return just the JSON response and status code
        return response.json(), response.status_code

    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500

# Update the audit service proxy route to handle course audit logs
@app.route('/api/courses/course/<course_id>/audit-log', methods=['GET', 'OPTIONS'])
def course_audit_log_proxy(course_id):
    if request.method == 'OPTIONS':
        return '', 200  # Let the CORS decorator handle OPTIONS

    try:
        # Forward the request to the audit service
        url = f"{AUDIT_SERVICE_URL}/api/audit/course/{course_id}/audit-log"
        headers = {key: value for key, value in request.headers if key != 'Host'}
        
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            params=request.args
        )
        
        return response.json(), response.status_code

    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500

# Add these routes for user metrics
@app.route('/api/courses/user/<user_id>/metrics', methods=['GET'])
def user_metrics_proxy(user_id):
    try:
        url = f"{COURSE_SERVICE_URL}/courses/user/{user_id}/metrics"
        headers = {key: value for key, value in request.headers if key != 'Host'}
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            params=request.args
        )
        return response.json(), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/courses/user/<user_id>/detailed-metrics', methods=['GET'])
def user_detailed_metrics_proxy(user_id):
    try:
        url = f"{COURSE_SERVICE_URL}/courses/user/{user_id}/detailed-metrics"
        headers = {key: value for key, value in request.headers if key != 'Host'}
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            params=request.args
        )
        return response.json(), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
