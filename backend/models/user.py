from database import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    role = db.Column(db.String(50))
    status = db.Column(db.String(50))
    otp = db.Column(db.String(6))

    def __init__(self, first_name, last_name, email, password, role, status='pending'):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.role = role
        self.status = status