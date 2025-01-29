from pymongo import MongoClient
import sys
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'upskill_vision')

try:
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    users_collection = db['users']
    
    # Test the connection
    client.admin.command('ismaster')
    print("MongoDB connection successful!")
    
except Exception as e:
    print(f"MongoDB connection error: {str(e)}")
    raise e

# Create indexes for better performance

print("Database and collections are ready!")

__all__ = [
   'users_collection'
]