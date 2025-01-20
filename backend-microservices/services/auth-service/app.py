from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import jwt
from datetime import datetime, timedelta
import os
import sys
from bson import ObjectId
import traceback

sys.path.append('../..')
from shared.config import MONGODB_URI, DATABASE_NAME, JWT_SECRET_KEY

app = Flask(__name__)
CORS(app)

# MongoDB connection
try:
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    users_collection = db.users
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        user = users_collection.find_one({
            'email': email,
            'role': role
        })

        if not user or user['password'] != password:  # In production, use proper password hashing
            return jsonify({'error': 'Invalid credentials'}), 401

        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, JWT_SECRET_KEY)

        return jsonify({
            'token': token,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'role': user['role'],
                'firstName': user.get('first_name', ''),
                'lastName': user.get('last_name', '')
            },
            'message': 'Login successful'
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': data['email']})
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400

        # Create new user
        new_user = {
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'email': data['email'],
            'password': data['password'],  # In production, hash the password
            'role': data['role'],
            'status': 'pending',
            'created_at': datetime.utcnow()
        }

        result = users_collection.insert_one(new_user)
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/auth/verify', methods=['POST'])
def verify_token():
    try:
        token = request.headers.get('Authorization').split(" ")[1]
        decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        
        user = users_collection.find_one({'_id': ObjectId(decoded['user_id'])})
        if not user:
            return jsonify({'error': 'User not found'}), 401

        return jsonify({
            'user_id': str(user['_id']),
            'email': user['email'],
            'role': user['role']
        })

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'service': 'auth-service',
            'mongodb': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'auth-service',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) 