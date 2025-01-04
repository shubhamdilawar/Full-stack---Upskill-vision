from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import jwt
from backend.db import users_collection
from functools import wraps
import os
from dotenv import load_dotenv
from bson import ObjectId
import bcrypt

load_dotenv()

auth = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            response = jsonify({'message': 'OK'})
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            return response, 200

        token = None
        print("Headers:", request.headers)
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
                print("Token found:", token)
            except IndexError:
                print("Invalid Authorization header format")
                return jsonify({'message': 'Invalid Authorization header format'}), 401

        if not token:
            print("Token is missing")
            return jsonify({'message': 'Token is missing'}), 401

        try:
            secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
            print("Using secret key:", secret_key)
            
            decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
            print("Decoded token:", decoded_token)
            
            return f(decoded_token, *args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token error: {str(e)}")
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            print(f"Token verification error: {str(e)}")
            return jsonify({'message': f'Error: {str(e)}'}), 500

    return decorated

@auth.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print("Login request data:", data)  # Debug log
        
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')  # Add this line to get role from request

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user by email and role
        user = users_collection.find_one({
            'email': email,
            'role': role  # Add role to query
        })
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        # Debug print
        print(f"Found user: {user.get('email')}, Status: {user.get('status')}")

        # Check if user is approved
        if user.get('status') != 'approved':
            return jsonify({
                'error': 'Account not approved',
                'message': 'Your account is pending approval. Please wait for admin approval.'
            }), 403

        # Verify password - ensure password exists in user document
        stored_password = user.get('password')
        if not stored_password:
            print("No password found for user")
            return jsonify({'error': 'Invalid account configuration'}), 500

        try:
            # Convert stored password from binary to bytes if needed
            if isinstance(stored_password, str):
                stored_password = stored_password.encode('utf-8')
            
            # Verify password
            if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
                return jsonify({'error': 'Invalid email or password'}), 401
                
        except Exception as e:
            print(f"Password verification error: {str(e)}")
            return jsonify({'error': 'Error verifying password'}), 500

        # Generate token
        token_payload = {
            'user_id': str(user['_id']),
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.utcnow() + timedelta(days=1)
        }
        
        secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
        token = jwt.encode(token_payload, secret_key, algorithm="HS256")

        print(f"Login successful for user: {email}")  # Debug log

        return jsonify({
            'message': 'Login successful!',
            'token': token,
            'user_id': str(user['_id']),
            'user_email': user['email'],
            'role': user['role']
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed', 'message': str(e)}), 500

@auth.route('/current_user', methods=['GET'])
@token_required
def get_current_user(current_user):
    try:
        print("Current user data from token:", current_user)  # Debug print
        
        # Get user from database using user_id from token
        from bson import ObjectId
        user = users_collection.find_one({'_id': ObjectId(current_user['user_id'])})
        
        if not user:
            print(f"User not found for ID: {current_user['user_id']}")
            return jsonify({'error': 'User not found'}), 404

        # Convert ObjectId to string and remove sensitive data
        user_data = {
            'id': str(user['_id']),
            'email': user['email'],
            'role': user['role'],
            'name': user.get('name', ''),
            'profile_image': user.get('profile_image', '')
        }
        
        print(f"Returning user data: {user_data}")  # Debug print
        return jsonify(user_data), 200
        
    except Exception as e:
        print(f"Error in current_user: {str(e)}")
        return jsonify({
            'error': 'Failed to get user data',
            'details': str(e)
        }), 500

@auth.route('/check-email', methods=['POST', 'OPTIONS'])
def check_email():
    print("Received check-email request")  # Debug log
    
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response, 200

    try:
        data = request.get_json()
        print("Check email request data:", data)  # Debug log
        
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        existing_user = users_collection.find_one({'email': email})
        
        return jsonify({
            'available': not bool(existing_user),
            'message': 'Email is available' if not existing_user else 'Email already exists'
        })
        
    except Exception as e:
        print(f"Error checking email: {str(e)}")
        return jsonify({
            'error': 'Failed to check email',
            'message': str(e)
        }), 500

@auth.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        print("Signup request data:", data)  # Debug log
        
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        
        if not all([email, password, role]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if user exists
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400

        # Hash password
        try:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        except Exception as e:
            print(f"Password hashing error: {str(e)}")
            return jsonify({'error': 'Error processing password'}), 500

        # Create new user
        new_user = {
            'email': email,
            'password': hashed_password,
            'role': role,
            'first_name': first_name,
            'last_name': last_name,
            'status': 'pending',
            'created_at': datetime.utcnow()
        }

        # Insert user
        result = users_collection.insert_one(new_user)
        
        print(f"Created new user with ID: {result.inserted_id}")  # Debug log

        return jsonify({
            'message': 'Signup successful! Please wait for admin approval.',
            'user_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': 'Signup failed', 'message': str(e)}), 500

@auth.route('/approve_user/<user_id>', methods=['POST'])
@token_required
def approve_user(current_user, user_id):
    try:
        # Ensure the current user is an HR Admin
        if current_user['role'] != 'HR Admin':
            return jsonify({'error': 'Unauthorized'}), 403

        # Update user status to approved
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'status': 'approved'}}
        )

        if result.modified_count == 1:
            return jsonify({'message': 'User approved successfully'}), 200
        else:
            return jsonify({'error': 'User not found or already approved'}), 404

    except Exception as e:
        print(f"Error approving user: {str(e)}")
        return jsonify({'error': 'Failed to approve user'}), 500

@auth.route('/users', methods=['GET', 'OPTIONS'])
@token_required
def get_users(current_user):
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 200

    print("Fetching users...")  # Debug log
    try:
        # Ensure the current user is an HR Admin
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get all users from the database
        users = list(users_collection.find({}, {
            'password': 0  # Exclude password field
        }))

        # Format users for response
        formatted_users = [{
            '_id': str(user['_id']),
            'email': user['email'],
            'role': user['role'],
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', ''),
            'status': user.get('status', 'pending'),
            'created_at': user.get('created_at', '').isoformat() if user.get('created_at') else None,
            'last_login': user.get('last_login', '').isoformat() if user.get('last_login') else None,
            'is_active': user.get('is_active', True)
        } for user in users]

        print(f"Returning {len(formatted_users)} users")  # Debug log
        return jsonify({'users': formatted_users}), 200

    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        return jsonify({'error': 'Failed to fetch users'}), 500

# Add route to update user status
@auth.route('/users/<user_id>/status', methods=['PUT'])
@token_required
def update_user_status(current_user, user_id):
    try:
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400

        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'status': new_status}}
        )

        if result.modified_count == 1:
            return jsonify({'message': f'User status updated to {new_status}'}), 200
        return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        print(f"Error updating user status: {str(e)}")
        return jsonify({'error': 'Failed to update user status'}), 500

@auth.route('/reset-password', methods=['POST'])
@token_required
def reset_password(current_user):
    try:
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        email = data.get('email')
        new_password = "NewPassword123"  # Temporary password

        # Hash the new password
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

        # Update user's password
        result = users_collection.update_one(
            {'email': email},
            {'$set': {'password': hashed_password}}
        )

        if result.modified_count == 1:
            return jsonify({
                'message': 'Password reset successful',
                'temp_password': new_password
            }), 200
        return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        print(f"Error resetting password: {str(e)}")
        return jsonify({'error': 'Failed to reset password'}), 500