from pymongo import MongoClient
import sys
<<<<<<< HEAD
from bson import ObjectId
=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

def get_db_connection():
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['upskill_vision']
        return db
    except Exception as e:
        print(f"Failed to connect to MongoDB: {str(e)}")
        sys.exit(1)

# Get database connection
try:
    db = get_db_connection()
    
    # Initialize all collections
    courses_collection = db['courses']
    enrollments_collection = db['enrollments']
    users_collection = db['users']
    modules_collection = db['modules']
    assignments_collection = db['assignments']
    quizzes_collection = db['quizzes']
    submissions_collection = db['submissions']
    audit_log_collection = db['audit_log']
    
    # Create indexes for better performance
    modules_collection.create_index([("course_id", 1), ("order", 1)])
    assignments_collection.create_index([("course_id", 1), ("due_date", 1)])
    quizzes_collection.create_index([("course_id", 1)])
    submissions_collection.create_index([("assignment_id", 1), ("student_id", 1)])
    audit_log_collection.create_index([("course_id", 1), ("timestamp", -1)])
    
<<<<<<< HEAD
    # Create indexes if needed
    modules_collection.create_index([('course_id', 1)])
    modules_collection.create_index([('instructor_id', 1)])
    
=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
    print("Database and collections are ready!")
except Exception as e:
    print(f"Failed to initialize database: {str(e)}")
    sys.exit(1)

# Test the connection
try:
    test_id = courses_collection.insert_one({"test": True}).inserted_id
    courses_collection.delete_one({"_id": test_id})
    print("MongoDB connection test successful!")
except Exception as e:
    print(f"MongoDB connection test failed: {str(e)}")
    sys.exit(1)

# Export all collections
__all__ = [
    'courses_collection',
    'enrollments_collection',
    'users_collection',
    'modules_collection',
    'assignments_collection',
    'quizzes_collection',
    'submissions_collection',
    'audit_log_collection'
] 