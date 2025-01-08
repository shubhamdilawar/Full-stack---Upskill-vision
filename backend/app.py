from flask import Flask
from flask_cors import CORS
from backend.routes.auth_routes import auth
from backend.routes.course_routes import courses
from backend.routes.audit_routes import audit

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(courses, url_prefix='/courses')
    app.register_blueprint(audit, url_prefix='/audit')

    return app

app = create_app()

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, host='127.0.0.1', port=5000)