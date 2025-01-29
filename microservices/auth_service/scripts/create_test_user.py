import sys
import os
import bcrypt
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Add parent directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(parent_dir)

from auth_service.utils.constants import VALID_ROLES

load_dotenv()

def create_test_user():
    try:
        # Connect to MongoDB
        client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
        db = client[os.getenv('DATABASE_NAME', 'upskill_vision')]
        users_collection = db['users']

        # Test user data
        test_user = {
            'email': 'Shubhamdilawar23@gmail.com',
            'password': bcrypt.hashpw('Shubhamdilawar23@gmail.com'.encode('utf-8'), bcrypt.gensalt()),
            'role': 'HR Admin',  # Make sure this matches exactly with VALID_ROLES
            'name': 'Shubham Dilawar',
            'status': 'active'
        }

        if test_user['role'] not in VALID_ROLES:
            print(f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
            return

        # Check if user already exists
        existing_user = users_collection.find_one({'email': test_user['email']})
        if existing_user:
            print(f"User {test_user['email']} already exists")
            # Update the existing user's role if needed
            if existing_user['role'] != test_user['role']:
                users_collection.update_one(
                    {'_id': existing_user['_id']},
                    {'$set': {'role': test_user['role']}}
                )
                print(f"Updated user role to {test_user['role']}")
            return

        # Insert the user
        result = users_collection.insert_one(test_user)
        print(f"Created test user with ID: {result.inserted_id}")
        print(f"Test user credentials:")
        print(f"Email: {test_user['email']}")
        print(f"Password: Shubhamdilawar23@gmail.com")
        print(f"Role: {test_user['role']}")

    except Exception as e:
        print(f"Error creating test user: {str(e)}")

if __name__ == "__main__":
    create_test_user() 