from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

def check_mongodb():
    try:
        client = MongoClient('mongodb://localhost:27017/',
                           serverSelectionTimeoutMS=2000)
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        print("MongoDB is running!")
        return True
    except ConnectionFailure:
        print("MongoDB is not running. Please start MongoDB service.")
        print("\nFor Windows:")
        print("1. Open Command Prompt as Administrator")
        print("2. Run: net start MongoDB")
        print("\nOr start MongoDB Compass and connect to localhost:27017")
        return False

if __name__ == "__main__":
    check_mongodb() 