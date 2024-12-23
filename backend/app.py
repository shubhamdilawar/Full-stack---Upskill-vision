import os
from flask import Flask, jsonify, request, session, abort
from flask_cors import CORS
from database import db, migrate
from flask_mail import Mail
from dotenv import load_dotenv
from models.user import User
from models.course import Course

load_dotenv()

mail = Mail()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USE_SSL'] = os.environ.get('MAIL_USE_SSL', 'false').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.secret_key = os.environ.get("FLASK_SECRET_KEY")
    if not app.secret_key:
        raise ValueError("No FLASK_SECRET_KEY set for Flask application")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    CORS(app)

    # Import blueprints within the app context
    from routes.auth_routes import auth_routes
    from routes.admin_routes import admin_routes
    from routes.course_routes import course_routes
    from main_routes import main_bp

    # Register blueprints
    app.register_blueprint(auth_routes, url_prefix='/auth')
    app.register_blueprint(admin_routes, url_prefix='/admin')
    app.register_blueprint(course_routes, url_prefix='/courses')
    app.register_blueprint(main_bp)

    # New route to get the current user
    @app.route('/auth/current_user', methods=['GET'])
    def get_current_user():
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'message': 'Not logged in'}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        return jsonify({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role,
            'status': user.status
        })

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)