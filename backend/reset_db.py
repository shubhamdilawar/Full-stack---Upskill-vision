from pymongo import MongoClient
from datetime import datetime

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['upskill_vision']

def reset_database():
    try:
        # Drop existing collections
        db.courses.drop()
        db.enrollments.drop()
        print("Dropped existing collections")

        # Create sample courses
        sample_courses = [
            {
                'course_title': 'Introduction to Python',
                'description': 'Learn the basics of Python programming',
                'instructor_name': 'John Doe',
                'start_date': '2024-01-01',
                'end_date': '2024-03-01',
                'duration': 60,
                'status': 'active'
            },
            {
                'course_title': 'Web Development Fundamentals',
                'description': 'Learn HTML, CSS, and JavaScript',
                'instructor_name': 'Jane Smith',
                'start_date': '2024-02-01',
                'end_date': '2024-04-01',
                'duration': 60,
                'status': 'active'
            }
        ]

        # Insert sample courses
        result = db.courses.insert_many(sample_courses)
        print(f"Added {len(result.inserted_ids)} sample courses")
        print("Course IDs:")
        for id in result.inserted_ids:
            print(f"- {id}")

        print("\nDatabase reset successful!")

    except Exception as e:
        print(f"Error resetting database: {str(e)}")

if __name__ == "__main__":
    reset_database()
