from flask import Flask
from flask_cors import CORS
import os
import sys

# Add the microservices directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from course_service.routes.course_routes import courses
from course_service.config.config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Configure CORS
CORS(app)

# Register the blueprint with the correct prefix
app.register_blueprint(courses, url_prefix='/courses')

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

if __name__ == '__main__':
    print("Starting Course Service on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=True)