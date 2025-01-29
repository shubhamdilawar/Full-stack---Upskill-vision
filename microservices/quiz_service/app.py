from flask import Flask
from flask_cors import CORS
from quiz_service.routes.quiz_routes import quizzes
from quiz_service.db import db
from quiz_service.config.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app,
         origins=["http://localhost:3000"],
        allow_credentials=True,
        supports_credentials=True,
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization']
         )
    db.init_app(app)  # Initialize the db
    app.register_blueprint(quizzes, url_prefix='/quizzes')
    

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5003)