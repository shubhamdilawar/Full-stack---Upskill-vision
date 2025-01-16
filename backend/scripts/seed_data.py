from datetime import datetime, timedelta
from bson import ObjectId
from backend.db import modules_collection, assignments_collection, quizzes_collection

def seed_course_content(course_id, instructor_id):
    try:
        print(f"Starting to seed content for course {course_id}")
        
        # Sample Modules
        modules = [
            {
                'course_id': str(course_id),
                'title': 'Introduction to the Course',
                'description': 'Overview and basic concepts',
                'content': [
                    {'type': 'Video', 'title': 'Course Overview'},
                    {'type': 'Reading', 'title': 'Course Materials'},
                    {'type': 'Quiz', 'title': 'Introduction Quiz'}
                ],
                'order': 1,
                'created_by': instructor_id,
                'created_at': datetime.utcnow()
            },
            {
                'course_id': str(course_id),
                'title': 'Core Concepts',
                'description': 'Fundamental principles and theories',
                'content': [
                    {'type': 'Video', 'title': 'Core Principles'},
                    {'type': 'Assignment', 'title': 'Practice Exercise'},
                    {'type': 'Quiz', 'title': 'Chapter Quiz'}
                ],
                'order': 2,
                'created_by': instructor_id,
                'created_at': datetime.utcnow()
            }
        ]
        
        # Insert modules
        module_result = modules_collection.insert_many(modules)
        print(f"Created {len(module_result.inserted_ids)} modules")

        # Sample Assignments
        assignments = [
            {
                'course_id': str(course_id),
                'title': 'Project Proposal',
                'description': 'Submit your project proposal',
                'due_date': datetime.utcnow() + timedelta(days=7),
                'points': 100,
                'submission_count': 0,
                'created_by': instructor_id,
                'created_at': datetime.utcnow()
            },
            {
                'course_id': str(course_id),
                'title': 'Final Project',
                'description': 'Submit your final project',
                'due_date': datetime.utcnow() + timedelta(days=14),
                'points': 200,
                'submission_count': 0,
                'created_by': instructor_id,
                'created_at': datetime.utcnow()
            }
        ]
        
        # Insert assignments
        assignment_result = assignments_collection.insert_many(assignments)
        print(f"Created {len(assignment_result.inserted_ids)} assignments")

        # Sample Quizzes
        quizzes = [
            {
                'course_id': str(course_id),
                'title': 'Week 1 Quiz',
                'description': 'Test your knowledge of week 1 material',
                'questions': [
                    {
                        'question': 'Sample question 1?',
                        'options': ['A', 'B', 'C', 'D'],
                        'correct': 'A'
                    },
                    {
                        'question': 'Sample question 2?',
                        'options': ['A', 'B', 'C', 'D'],
                        'correct': 'B'
                    }
                ],
                'time_limit': 30,
                'max_attempts': 2,
                'created_by': instructor_id,
                'created_at': datetime.utcnow()
            }
        ]
        
        # Insert quizzes
        quiz_result = quizzes_collection.insert_many(quizzes)
        print(f"Created {len(quiz_result.inserted_ids)} quizzes")
        
        print(f"Successfully seeded all content for course {course_id}")
        return True
        
    except Exception as e:
        print(f"Error seeding course content: {str(e)}")
        return False

# Run this function after creating a new course 