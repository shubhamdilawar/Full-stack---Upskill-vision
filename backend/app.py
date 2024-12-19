from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail, Message
import random
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize the Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # SQLite database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'your_secret_key'  # Secret key for JWT

# Flask-Mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your_gmail_address@gmail.com'  # Replace with your Gmail address
app.config['MAIL_PASSWORD'] = 'your_app_password'  # Replace with your Gmail App Password
app.config['MAIL_DEFAULT_SENDER'] = 'your_gmail_address@gmail.com'
app.config['MAIL_DEBUG'] = True


db = SQLAlchemy(app)
CORS(app)
mail = Mail(app)  # Initialize Flask-Mail

# User model for database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)  # Hashed password
    role = db.Column(db.String(20), nullable=False)
    otp = db.Column(db.String(6), nullable=True)  # For OTP verification

# Create database tables
with app.app_context():
    db.create_all()

# Middleware for verifying JWT token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing!"}), 401
        try:
            decoded_token = jwt.decode(token, app.secret_key, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401
        return f(decoded_token, *args, **kwargs)
    return decorated

# Route for root path
@app.route('/')
def home():
    return "Welcome to Upskill Vision!"

# POST route for SignUp (user registration)
@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already registered"}), 400

    hashed_password = generate_password_hash(data['password'], method='sha256')  # Hash password
    new_user = User(
        first_name=data['firstName'],
        last_name=data['lastName'],
        email=data['email'],
        password=hashed_password,
        role=data['role']
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

# POST route for Login (user authentication)
@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials"}), 401

    if user.role != data['role']:
        return jsonify({"message": "Incorrect role selected"}), 403

    token = jwt.encode(
        {
            "email": user.email,
            "role": user.role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        },
        app.secret_key,
        algorithm="HS256"
    )

    return jsonify({"message": "Login successful", "token": token, "role": user.role}), 200

# POST route for Forgot Password
@app.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({"message": "Email not registered"}), 404

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    db.session.commit()

    try:
        msg = Message(
            'Your OTP for Password Reset',
            recipients=[user.email]
        )
        msg.body = f"Hello {user.first_name},\n\nYour OTP for password reset is: {otp}.\n\nIf you did not request this, please ignore this email."
        mail.send(msg)
        print(f"OTP sent to {user.email}: {otp}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        return jsonify({"message": "Failed to send OTP email. Please try again later."}), 500

    return jsonify({"message": "OTP sent to your email"}), 200

# POST route for OTP Verification
@app.route('/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if not user or user.otp != data['otp']:
        return jsonify({"message": "Invalid OTP"}), 400

    return jsonify({"message": "OTP verified"}), 200

# POST route for Reset Password
@app.route('/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({"message": "Email not found"}), 404

    hashed_new_password = generate_password_hash(data['newPassword'], method='sha256')
    user.password = hashed_new_password
    user.otp = None
    db.session.commit()

    return jsonify({"message": "Password reset successfully!"}), 200

# Example of a protected route
@app.route('/admin', methods=['GET'])
@token_required
def admin_dashboard(decoded_token):
    if decoded_token["role"] != "HR Admin":
        return jsonify({"message": "Access denied!"}), 403
    return jsonify({"message": "Welcome to the HR Admin Dashboard!"})

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)
