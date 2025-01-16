import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, onEdit, onRemove }) => {
    return (
        <div className="course-card">
            <h3>{course.course_title}</h3>
            <p>{course.description}</p>
            <div className="course-meta">
                <p>Course ID: {course._id}</p>
                <p>Duration: {course.duration} days</p>
                <p>Start Date: {new Date(course.start_date).toLocaleDateString()}</p>
                <p>End Date: {new Date(course.end_date).toLocaleDateString()}</p>
                <p>Enrolled: {course.enrolled_count || 0} students</p>
            </div>
            <div className="course-actions">
                <button onClick={() => onEdit(course)}>Edit Course</button>
                <Link to={`/courses/${course._id}/details`}>View Details</Link>
                <button onClick={() => onRemove(course._id)}>Remove Course</button>
            </div>
        </div>
    );
};

export default CourseCard; 