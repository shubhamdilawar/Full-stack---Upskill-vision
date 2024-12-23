from database import db

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.String, unique=True, nullable=False)  # Unique Course ID
    course_title = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # Link to the instructor
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)  # You might calculate this based on duration

    # Relationships
    instructor = db.relationship("User", backref="courses")

    def __init__(self, course_id, course_title, description, instructor_id, start_date, end_date):
        self.course_id = course_id
        self.course_title = course_title
        self.description = description
        self.instructor_id = instructor_id
        self.start_date = start_date
        self.end_date = end_date