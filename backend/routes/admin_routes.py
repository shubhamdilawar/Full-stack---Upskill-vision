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
            user = User.query.filter_by(id=data['user_id']).first()
            if user and user.role in ['HR Admin', 'Manager']:
                session['role'] = user.role
                return f(*args, **kwargs)
            else:
                return jsonify({'message': 'Admin access required!'}), 403
        except Exception as e:
            print(e)
            return jsonify({'message': 'Token is invalid!'}), 401
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

    if user.status == 'pending' and user.role in ['Manager', 'HR', 'HR Admin']:  # Added "HR Admin"
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