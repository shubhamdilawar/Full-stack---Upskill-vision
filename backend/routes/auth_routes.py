from flask import Blueprint, request, jsonify, current_app, session
from models.user import User
from database import db
from flask_mail import Message
import random
import validators
import jwt
from datetime import datetime, timedelta
import threading
import re
import uuid
from functools import wraps
from flask_login import LoginManager, login_user, UserMixin, current_user, logout_user

auth_routes = Blueprint('auth', __name__)

login_manager = LoginManager() # Initialize LoginManager
login_manager.id_attribute = 'get_auth_session_token' # Set the id attribute


# Lock for synchronizing database operations to prevent SQLITE concurrency errors
db_lock = threading.Lock()

def is_strong_password(password):
    # Define criteria for a strong password
     if len(password) < 8:
        return False
     if not re.search("[a-z]", password):
        return False
     if not re.search("[A-Z]", password):
        return False
     if not re.search("[0-9]", password):
        return False
     if not re.search("[!@#$%^&*(),.?\":{}|<>]", password):
        return False
     return True

def set_user_auth_session_token(user, auth_session_token):
    user.auth_session_token = auth_session_token
    db.session.commit()

def login_user_with_secret_session(user, remember=False, force=False):
     auth_session_token = random.getrandbits(128)
     auth_session_token = '%032x' % auth_session_token
    # store `auth_session_token` in user table
     set_user_auth_session_token(user, auth_session_token)
     login_user(user, remember=remember, force=force)
     return  auth_session_token



@auth_routes.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    print("Received Data:", data)

    first_name = data.get("firstName")
    last_name = data.get("lastName")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if role not in ["Manager", "HR", "Instructor", "Participant", "HR Admin"]:  # Include "HR Admin"
        print(f"Signup failed: Invalid Role {role}")
        return jsonify({"message": "Invalid role"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email already exists"}), 400

    if not validators.email(email):
        return jsonify({"message": "Invalid email format"}), 400

    if not is_strong_password(password):
        return jsonify({"message": "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character"}), 400

    # Set status to pending for HR Admin, Manager, and HR, otherwise approved
    status = "pending" if role in ["Manager", "HR", "HR Admin"] else "approved"
    print(f"Setting status as {status} for role {role}")

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
        role=role,
        status=status
    )
    try:
        with db_lock:
            db.session.add(new_user)
            db.session.commit()
        return jsonify({"message": "User created successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error during signup: {e}")
        return jsonify({"message": "Error creating user", "error": str(e)}), 500


@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    print("Login Data Received:", data)

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    user = User.query.filter_by(email=email).first()

    if user:
        print(f"User found in DB: Email={user.email}, Role={user.role}, Status={user.status}, Password={user.password}")
        if user.password == password and user.role == role:
            db.session.refresh(user)
             # Generate a new session token
            auth_session_token = login_user_with_secret_session(user) # Using custom function to generate session token
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(hours=24),
                'role': user.role,
                'session_token': auth_session_token
            }, current_app.config['SECRET_KEY'], algorithm='HS256')


            session['user_id'] = user.id
            session['role'] = user.role
            session.modified = True
            session['session_token'] = auth_session_token

            if user.role in ["Manager", "HR", "HR Admin"] and user.status == "pending":
                return jsonify({"message": "Admin approval required"}), 403
            elif user.status == "approved":
                return jsonify({"message": "Login successful!", "token": token, "user_id": user.id, "role": user.role}), 200
            else:
                return jsonify({"message": "Admin approval required"}), 403
        else:
            print("Invalid Credentials")
            return jsonify({"message": "Invalid credentials"}), 401
    else:
        print("User not found")
        return jsonify({"message": "Invalid credentials"}), 401


@auth_routes.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()

    if user:
        otp = random.randint(100000, 999999)
        user.otp = str(otp)
        db.session.commit()

        try:
            mail = current_app.extensions['mail']
            msg = Message(
                "Password Reset OTP",
                sender=current_app.config['MAIL_DEFAULT_SENDER'],
                recipients=[email],
            )
            msg.body = f"Your OTP for password reset is {otp}. Use this OTP to reset your password."
            mail.send(msg)

            return jsonify({"message": f"Password reset OTP sent to: {email}"}), 200
        except Exception as e:
            print(f"Error sending email: {e}")
            return jsonify({"message": "Failed to send email", "error": str(e)}), 500
    else:
        return jsonify({"message": "Email not found"}), 404

@auth_routes.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    user = User.query.filter_by(email=email, otp=otp).first()

    if user:
        return jsonify({"message": "OTP verified successfully!"}), 200
    else:
        return jsonify({"message": "Invalid OTP"}), 400

@auth_routes.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    new_password = data.get("newPassword")

    user = User.query.filter_by(email=email).first()

    if user:
        if not is_strong_password(new_password):
            return jsonify({"message": "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character"}), 400
        user.password = new_password
        user.otp = None
        db.session.commit()
        return jsonify({"message": "Password reset successfully!"}), 200
    else:
        return jsonify({"message": "User not found"}), 404