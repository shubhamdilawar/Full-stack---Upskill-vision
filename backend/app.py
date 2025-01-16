from flask import Flask
from flask_cors import CORS
from backend.routes.auth_routes import auth
from backend.routes.course_routes import courses
from backend.routes.audit_routes import audit

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
<<<<<<< HEAD
    CORS(app, 
        origins=["http://localhost:3000"],
        allow_credentials=True,
        supports_credentials=True,
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization']
    )
=======
    CORS(app, supports_credentials=True)
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

    # Register blueprints
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(courses, url_prefix='/courses')
    app.register_blueprint(audit, url_prefix='/audit')
<<<<<<< HEAD

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

    return app

app = create_app()

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, host='127.0.0.1', port=5000)