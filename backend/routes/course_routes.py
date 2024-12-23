from flask import Blueprint, request, jsonify, current_app, session
from database import db
from models.course import Course
from models.user import User
from flask_mail import Message
from datetime import datetime
import jwt
from functools import wraps

course_routes = Blueprint('course', __name__)

# A decorator to protect routes that require authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = data.get('user_id')
            user_role = data.get('role') # Get role from token

            if not user_id:
                return jsonify({'message': 'Invalid token format, no user id!'}), 401

            if not user_role: # check if role is present
                 return jsonify({'message': 'Invalid token format, no role!'}), 401

            current_user = User.query.filter_by(id=user_id).first()
            if not current_user:
                 return jsonify({'message': 'User not found!'}), 401

            if current_user.role != user_role: # Compare role from token with role from user object
                print(f"Token role {user_role} does not match user's role {current_user.role}")
                return jsonify({'message': 'Unauthorized to create courses'}), 403

            if current_user.role not in ['HR Admin', 'Instructor', 'Manager']:
                print(f"User with id {current_user.id} and role {current_user.role} is unauthorized") # Log the role
                return jsonify({'message': 'Unauthorized to create courses'}), 403

            session['role'] = current_user.role # Set session variable
            print(f"User authorized successfully with role: {current_user.role}")
            return f(current_user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            print("Token is Invalid")
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
             print(f"Token verification error: {e}")
             return jsonify({'message': 'Token is invalid or an error occurred!'}), 401
    return decorated

@course_routes.route('/create_course', methods=['POST'])
@token_required
def create_course(current_user):
    data = request.get_json()

    course_id = f"CID-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    course_title = data.get('course_title')
    description = data.get('description')

    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')

    try:
         start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
         end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400


    if current_user.role == 'Instructor':
        instructor_id = current_user.id
        instructor_email = current_user.email # Get instructor email from current user
    else:
        instructor_email = data.get('instructor_email')
        if not instructor_email:
            return jsonify({'message': 'Instructor email is required'}), 400

        instructor = User.query.filter_by(email=instructor_email).first()
        if not instructor or instructor.role != 'Instructor':
            return jsonify({'message': 'Invalid instructor email or role'}), 400
        instructor_id = instructor.id
    new_course = Course(
        course_id=course_id,
        course_title=course_title,
        description=description,
        instructor_id=instructor_id,
        start_date=start_date,
        end_date=end_date
    )

    try:
        db.session.add(new_course)
        db.session.commit()

        # Send email notification using current_app
        with current_app.app_context():
            send_course_creation_email(new_course, current_user)

        return jsonify({'message': 'Course created successfully', 'course_id': new_course.course_id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating course: {e}")
        return jsonify({'message': 'Error creating course'}), 500

def send_course_creation_email(course, creator):
    try:
        recipients = [user.email for user in User.query.all()]

        msg = Message(
            "New Course Created: " + course.course_title,
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=recipients
        )

        msg.body = f"""
        A new course has been created by {creator.first_name} {creator.last_name}.

        Course Details:
        - Course ID: {course.course_id}
        - Title: {course.course_title}
        - Description: {course.description}
        - Instructor: {course.instructor.first_name} {course.instructor.last_name}
        - Start Date: {course.start_date}
        - End Date: {course.end_date}

        You are receiving this notification because you are a registered member of the organization.
        """

        current_app.extensions['mail'].send(msg)
        print("Course creation email sent successfully!")

    except Exception as e:
        print(f"Error sending course creation email: {e}")


@course_routes.route('/get_user_id', methods=['GET'])
@token_required
def get_user_id(current_user):
    # Now directly returning the ID of the logged-in user
    if current_user:
        return jsonify({'user_id': current_user.id}), 200
    else:
        return jsonify({'message': 'User not logged in'}), 401


@course_routes.route('/courses', methods=['GET'])
@token_required
def get_courses(current_user):
    if current_user.role == 'Participant':
        courses = Course.query.all()  # Participants see all courses
    elif current_user.role == 'Instructor':
        courses = Course.query.filter_by(instructor_id=current_user.id).all()  # Instructors only see their own courses
    else:
        courses = Course.query.all() #HR and manager sees all the courses

    courses_list = []
    for course in courses:
        instructor = User.query.filter_by(id=course.instructor_id).first()
        instructor_name = f"{instructor.first_name} {instructor.last_name}" if instructor else "Unknown Instructor"
        courses_list.append({
            'id': course.id,
            'course_id': course.course_id,
            'course_title': course.course_title,
            'description': course.description,
            'instructor_name': instructor_name,
            'start_date': course.start_date.isoformat(),
            'end_date': course.end_date.isoformat()
        })

    return jsonify({'courses': courses_list})

@course_routes.route('/remove_course/<int:course_id>', methods=['DELETE'])
@token_required
def remove_course(current_user, course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': 'Course not found'}), 404
    if current_user.role == "Instructor" and course.instructor_id != current_user.id:
        return jsonify({'message': 'You can only delete courses you created'}), 403
    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({'message': 'Course removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error removing course: {e}")
        return jsonify({'message': 'Error removing course'}), 500