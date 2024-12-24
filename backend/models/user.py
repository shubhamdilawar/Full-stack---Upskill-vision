from database import db
from sqlalchemy import UniqueConstraint
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    role = db.Column(db.String(50))
    status = db.Column(db.String(50))
    otp = db.Column(db.String(6))
    auth_session_token = db.Column(db.String(100), nullable=True) # Renamed session_token to auth_session_token
    __table_args__ = (UniqueConstraint('auth_session_token', name='uq_user_auth_session_token'),)

    def __init__(self, first_name, last_name, email, password, role, status='pending'):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.role = role
        self.status = status

    def get_auth_session_token(self): # Added to return auth session token
        return self.auth_session_token