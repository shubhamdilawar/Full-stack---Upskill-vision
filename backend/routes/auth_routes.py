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
<<<<<<< HEAD
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
=======
        print("Login request data:", data)
        
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        # Find user and print full document for debugging
        user = users_collection.find_one({
            'email': email,
            'role': role
        })
        
        # Debug: Print full user document
        print("Full user document from database:", user)
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        print(f"Found user: {user.get('email')}, Status: {user.get('status')}")
        print(f"Stored password type: {type(user.get('password'))}")
        print(f"Stored password value: {user.get('password')}")

        # Check if user is suspended first
        if user.get('status') == 'suspended':
            return jsonify({
                'error': 'Your account has been suspended. Please contact the administrator.',
                'message': 'Your account has been suspended.'
            }), 403
        
        # Then check if user is approved
        if user.get('status') != 'approved':
            return jsonify({
                'error': 'Account not approved',
                'message': 'Your account is pending approval.'
            }), 403

        # Verify password
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
        stored_password = user.get('password')
        if not stored_password:
            print("No password found for user")
            return jsonify({'error': 'Invalid account configuration'}), 500

<<<<<<< HEAD
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
=======
        # Convert stored password from binary to bytes if needed
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')
            
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Generate token if password matches
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
        token_payload = {
            'user_id': str(user['_id']),
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.utcnow() + timedelta(days=1)
        }
        
<<<<<<< HEAD
        secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
        token = jwt.encode(token_payload, secret_key, algorithm="HS256")

        print(f"Login successful for user: {email}")  # Debug log
=======
        token = jwt.encode(token_payload, os.getenv('JWT_SECRET_KEY', 'your-secret-key'), algorithm="HS256")

        # Update last login time
        users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

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

<<<<<<< HEAD
        # Hash password
        try:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
=======
        # Hash password - ensure it's properly stored as bytes
        try:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            print("Password hashed successfully")  # Debug log
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
        except Exception as e:
            print(f"Password hashing error: {str(e)}")
            return jsonify({'error': 'Error processing password'}), 500

<<<<<<< HEAD
        # Create new user
        new_user = {
            'email': email,
            'password': hashed_password,
=======
        # Create new user with hashed password
        new_user = {
            'email': email,
            'password': hashed_password,  # Store the hashed password
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
            'role': role,
            'first_name': first_name,
            'last_name': last_name,
            'status': 'pending',
            'created_at': datetime.utcnow()
        }

<<<<<<< HEAD
        # Insert user
        result = users_collection.insert_one(new_user)
        
=======
        # Insert user and verify password was stored
        result = users_collection.insert_one(new_user)
        created_user = users_collection.find_one({'_id': result.inserted_id})
        if not created_user.get('password'):
            print("Warning: Password not stored properly")
            return jsonify({'error': 'Error storing user data'}), 500
            
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
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
<<<<<<< HEAD
        # Check if trying to modify self
        if current_user['user_id'] == user_id:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Cannot modify own account status'
            }), 403

=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
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

<<<<<<< HEAD
@auth.route('/remove-user/<user_id>', methods=['DELETE'])
@token_required
def remove_user(current_user, user_id):
    try:
        # Check if user has admin privileges
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        # Check if user exists
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Don't allow admin to delete themselves
        if str(user['_id']) == current_user['user_id']:
            return jsonify({'error': 'Cannot delete your own account'}), 400

        # Delete the user
        result = users_collection.delete_one({'_id': ObjectId(user_id)})
        
        if result.deleted_count > 0:
            return jsonify({'message': 'User successfully removed'}), 200
        
        return jsonify({'error': 'Failed to remove user'}), 400

    except Exception as e:
        print(f"Error removing user: {str(e)}")
        return jsonify({'error': 'Failed to remove user'}), 500
=======
@auth.route('/update-user-password', methods=['POST'])
@token_required
def update_user_password(current_user):
    try:
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        email = data.get('email')
        new_password = data.get('password')

        if not email or not new_password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Hash the new password
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

        # Update user's password
        result = users_collection.update_one(
            {'email': email},
            {'$set': {'password': hashed_password}}
        )

        if result.modified_count == 1:
            return jsonify({'message': 'Password updated successfully'}), 200
        return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        print(f"Error updating password: {str(e)}")
        return jsonify({'error': 'Failed to update password'}), 500

@auth.route('/create-admin', methods=['POST'])
def create_admin():
    try:
        # Create admin user with hashed password
        hashed_password = bcrypt.hashpw('Admin@123'.encode('utf-8'), bcrypt.gensalt())
        
        admin_user = {
            'email': 'admin@upskill.com',
            'password': hashed_password,
            'role': 'HR Admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'status': 'approved',  # Directly approved
            'created_at': datetime.utcnow()
        }

        # Check if admin already exists
        existing_admin = users_collection.find_one({'email': 'admin@upskill.com'})
        if existing_admin:
            return jsonify({'message': 'Admin account already exists'}), 200

        # Insert the admin user
        result = users_collection.insert_one(admin_user)
        
        return jsonify({
            'message': 'Admin account created successfully',
            'credentials': {
                'email': 'admin@upskill.com',
                'password': 'Admin@123'
            }
        }), 201

    except Exception as e:
        print(f"Error creating admin: {str(e)}")
        return jsonify({'error': 'Failed to create admin account'}), 500

@auth.route('/approve-admin', methods=['POST'])
def approve_admin():
    try:
        # Update admin status to approved
        result = users_collection.update_one(
            {'email': 'admin@upskill.com'},
            {'$set': {'status': 'approved'}}
        )

        if result.modified_count == 1:
            return jsonify({
                'message': 'Admin account approved successfully',
                'credentials': {
                    'email': 'admin@upskill.com',
                    'password': 'Admin@123'
                }
            }), 200
        return jsonify({'error': 'Admin account not found'}), 404

    except Exception as e:
        print(f"Error approving admin: {str(e)}")
        return jsonify({'error': 'Failed to approve admin account'}), 500

@auth.route('/users/<user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    try:
        if current_user.get('role') != 'HR Admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        result = users_collection.delete_one({'_id': ObjectId(user_id)})

        if result.deleted_count == 1:
            return jsonify({'message': 'User deleted successfully'}), 200
        return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        return jsonify({'error': 'Failed to delete user'}), 500
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

@auth.route('/instructors', methods=['GET'])
@token_required
def get_instructors(current_user):
    try:
<<<<<<< HEAD
        # Check if user has appropriate role
        if current_user.get('role') not in ['HR Admin', 'Manager']:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Find all instructors with status 'approved'
        instructors = list(users_collection.find({
            'role': 'Instructor',
            'status': 'approved'
        }, {
            'password': 0  # Exclude password field
        }))

        # Format instructors for response
        formatted_instructors = [{
            'id': str(instructor['_id']),
            'first_name': instructor.get('first_name', ''),
            'last_name': instructor.get('last_name', ''),
            'email': instructor.get('email', ''),
            'status': instructor.get('status', ''),
            'created_at': instructor.get('created_at', '').isoformat() if instructor.get('created_at') else None,
            'last_login': instructor.get('last_login', '').isoformat() if instructor.get('last_login') else None
        } for instructor in instructors]

        return jsonify({
            'instructors': formatted_instructors,
            'count': len(formatted_instructors)
        }), 200

    except Exception as e:
        print(f"Error fetching instructors: {str(e)}")
        return jsonify({'error': 'Failed to fetch instructors'}), 500
=======
        print("\n=== Fetching Instructors ===")
        print(f"Request by: {current_user.get('email')} (Role: {current_user.get('role')})")

        if current_user.get('role') != 'HR Admin':
            print("Unauthorized access attempt")
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get all approved instructors
        instructors = list(users_collection.find(
            {
                'role': 'Instructor',
                'status': 'approved'
            }
        ))

        print(f"\nFound {len(instructors)} approved instructors")
        for inst in instructors:
            print(f"- {inst.get('first_name')} {inst.get('last_name')} ({inst.get('email')})")

        formatted_instructors = []
        for instructor in instructors:
            formatted_instructor = {
                'id': str(instructor['_id']),
                'first_name': instructor.get('first_name', ''),
                'last_name': instructor.get('last_name', ''),
                'email': instructor.get('email', ''),
                'status': instructor.get('status', '')
            }
            formatted_instructors.append(formatted_instructor)

        print("\nSending response with formatted instructors")
        return jsonify({'instructors': formatted_instructors}), 200

    except Exception as e:
        print(f"\nError in get_instructors: {str(e)}")
        return jsonify({'error': f'Failed to fetch instructors: {str(e)}'}), 500
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
