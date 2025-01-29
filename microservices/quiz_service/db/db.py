from pymongo import MongoClient
import sys
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
        db = client[os.getenv('DATABASE_NAME','upskill_vision')]
        return db
    except Exception as e:
        print(f"Failed to connect to MongoDB: {str(e)}")
        sys.exit(1)
# Get database connection
try:
    db = get_db_connection()
    
    # Initialize all collections
    quizzes_collection = db['quizzes']
    enrollments_collection = db['enrollments']
    submissions_collection = db['submissions']

    # Create indexes for better performance

    print("Database and collections are ready!")
except Exception as e:
    print(f"Failed to initialize database: {str(e)}")
    sys.exit(1)

# Test the connection
try:
    test_id = quizzes_collection.insert_one({"test": True}).inserted_id
    quizzes_collection.delete_one({"_id": test_id})
    print("MongoDB connection test successful!")
except Exception as e:
    print(f"MongoDB connection test failed: {str(e)}")
    sys.exit(1)

__all__ = [
    'quizzes_collection',
    'enrollments_collection',
    'submissions_collection'
]