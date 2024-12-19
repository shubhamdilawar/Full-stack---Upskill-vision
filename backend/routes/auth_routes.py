from flask import Blueprint, request, jsonify

auth_blueprint = Blueprint("auth", __name__)

# Login Route
@auth_blueprint.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Mock authentication logic
    if username == "admin" and password == "password":
        return jsonify({"message": "Login successful", "user": username}), 200
    return jsonify({"error": "Invalid credentials"}), 401

# Signup Route
@auth_blueprint.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Mock user creation logic
    if username and password:
        return jsonify({"message": "User created successfully", "user": username}), 201
    return jsonify({"error": "Missing credentials"}), 400

# Forgot Password Route
@auth_blueprint.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    # Mock forgot password logic
    if email:
        return jsonify({"message": f"Password reset link sent to {email}"}), 200
    return jsonify({"error": "Email is required"}), 400
