from database import db
from datetime import datetime
from datetime import datetime

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.String, unique=True, nullable=False)
    course_id = db.Column(db.String, unique=True, nullable=False)
    course_title = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    duration = db.Column(db.Integer)  # Duration in days
    status = db.Column(db.String(20), default='active')  # active, archived
    category = db.Column(db.String(50))
    difficulty_level = db.Column(db.String(50))
    prerequisites = db.Column(db.Text)
    learning_outcomes = db.Column(db.Text)
    max_participants = db.Column(db.Integer)
    
    # Relationships
    instructor = db.relationship("User", backref="courses")
    enrollments = db.relationship("Enrollment", backref="course", lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'course_id': self.course_id,
            'course_title': self.course_title,
            'description': self.description,
            'instructor_name': f"{self.instructor.first_name} {self.instructor.last_name}",
            'start_date': self.start_date.strftime('%Y-%m-%d'),
            'end_date': self.end_date.strftime('%Y-%m-%d'),
            'duration': self.duration,
            'category': self.category,
            'difficulty_level': self.difficulty_level,
            'prerequisites': self.prerequisites,
            'learning_outcomes': self.learning_outcomes,
            'max_participants': self.max_participants,
            'status': self.status
        }
    
   
