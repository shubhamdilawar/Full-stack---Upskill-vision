from database import db
from datetime import datetime

class Enrollment(db.Model):
    __tablename__ = 'enrollment'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    status = db.Column(db.String(20), default='enrolled')  # enrolled, completed
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    completion_date = db.Column(db.DateTime, nullable=True)

    def __init__(self, user_id, course_id):
        self.user_id = user_id
        self.course_id = course_id
