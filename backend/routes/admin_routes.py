from flask import Blueprint, jsonify, request, session
from database import db
from models.user import User
from functools import wraps
import jwt
from flask import current_app

admin_routes = Blueprint('admin', __name__)

# A decorator to protect admin routes
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
       token = None
       if 'Authorization' in request.headers:
           token = request.headers['Authorization'].split(" ")[1]

       if not token:
           return jsonify({'message': 'Token is missing!'}), 401

       try:
           data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
           user_id = data.get('user_id')
           user_role = data.get('role')
           session_token = data.get('session_token')

           if not user_id:
               return jsonify({'message': 'Invalid token format, no user id!'}), 401

           if not user_role:
                return jsonify({'message': 'Invalid token format, no role!'}), 401
           if not session_token:
                return jsonify({'message': 'Invalid token format, no session token!'}), 401

           current_user = User.query.filter_by(id=user_id).first()
           if not current_user:
              return jsonify({'message': 'User not found!'}), 401

           if current_user.auth_session_token != session_token: #Validating Session Token from Database
             return jsonify({'message': 'Invalid or expired session'}), 401


           if current_user and current_user.role in ['HR Admin', 'Manager']:
                session['role'] = current_user.role
                return f(*args, **kwargs)
           else:
             return jsonify({'message': 'Admin access required!'}), 403
       except jwt.ExpiredSignatureError:
             print("Token has expired")
             return jsonify({'message': 'Token has expired'}), 401
       except jwt.InvalidTokenError:
              print("Token is Invalid")
              return jsonify({'message': 'Invalid token'}), 401
       except Exception as e:
             print(f"Token verification error: {e}")
             return jsonify({'message': 'Token is invalid or an error occurred!'}), 401
    return decorated_function


@admin_routes.route('/users', methods=['GET'])
@admin_required
def get_users():
    # Fetch all users from the database
    users = User.query.all()

    # Convert the users to a list of dictionaries for JSON serialization
    users_list = []
    for user in users:
        users_list.append({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role,
            'status': user.status
        })

    return jsonify({'users': users_list})


@admin_routes.route('/approve/<int:user_id>', methods=['POST'])
@admin_required
def approve_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found!'}), 404

    if user.status == 'pending' and user.role in ['Manager', 'HR', 'HR Admin']:
        user.status = 'approved'
        db.session.commit()
        return jsonify({'message': 'User approved successfully!'})
    elif user.status == 'pending':
        return jsonify({'message': 'User cannot be approved. Only HR, Manager and HR Admin roles are eligible for approval'}), 400
    else:
        return jsonify({'message': 'User is not in pending status!'}), 400


@admin_routes.route('/remove/<int:user_id>', methods=['DELETE'])
@admin_required
def remove_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    try:
         db.session.delete(user)
         db.session.commit()
         return jsonify({'message': 'User removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error removing user: {e}")
        return jsonify({'message': 'Error removing user'}), 500