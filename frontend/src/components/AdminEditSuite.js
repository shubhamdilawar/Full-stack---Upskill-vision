import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from '../utils/axios';
import '../styles/AdminEditSuite.css';
import AuditTrail from './AuditTrail';

const AdminEditSuite = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formData, setFormData] = useState({
        course_title: '',
        description: '',
        start_date: new Date(),
        end_date: new Date(),
        duration: 0
    });
    const [instructors, setInstructors] = useState([]);
    const [approvedInstructors, setApprovedInstructors] = useState([]);
    const [newCourseCode, setNewCourseCode] = useState('');
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    useEffect(() => {
        fetchCourses();
        fetchInstructors();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/courses/courses');
            console.log('Courses response:', response.data);
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchInstructors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/auth/instructors', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.instructors) {
                setInstructors(response.data.instructors);
            }
        } catch (error) {
            console.error('Error fetching instructors:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditClick = (course) => {
        setSelectedCourse(course);
        setFormData({
            course_title: course.course_title,
            description: course.description,
            instructor_id: course.instructor_id,
            start_date: new Date(course.start_date),
            end_date: new Date(course.end_date),
            duration: course.duration
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCourse) {
                // Update existing course
                const response = await axios.put(`/courses/update-course/${selectedCourse._id}`, formData);
                console.log('Course update response:', response.data);
            } else {
                // Add new course
                const response = await axios.post('/courses/add-course', formData);
                console.log('Course creation response:', response.data);
                setNewCourseCode(response.data.course_code);
            }
            
            fetchCourses();
            if (!selectedCourse) {
                resetForm();
            }
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Failed to save course. Please try again.');
        }
    };

    const resetForm = () => {
        setSelectedCourse(null);
        setNewCourseCode('');
        setFormData({
            course_title: '',
            description: '',
            start_date: new Date(),
            end_date: new Date(),
            duration: 0
        });
    };

    const handleDeleteCourse = async (courseId) => {
        try {
            console.log('Attempting to delete course:', courseId);
            const response = await axios.delete(`/courses/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                // Remove course from state
                setCourses(courses.filter(course => course._id !== courseId));
                setShowDeleteModal(false);
                setCourseToDelete(null);
                // Show success message
                alert('Course deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course. Please try again.');
        }
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: date };
            
            if (field === 'start_date' || field === 'end_date') {
                const endDate = field === 'end_date' ? date : prev.end_date;
                const startDate = field === 'start_date' ? date : prev.start_date;
                newData.duration = calculateDuration(startDate, endDate);
            }
            
            return newData;
        });
    };

    return (
        <div className="admin-edit-suite">
            <div className="admin-header">
                <h2>{selectedCourse ? 'Edit Course' : 'Add New Course'}</h2>
                <button 
                    className="audit-trail-btn"
                    onClick={() => setShowAuditTrail(true)}
                >
                    View Audit Trail
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group course-code-field">
                    <label>Course Details</label>
                    <div className="course-code-value">
                        <div>
                            Course ID: {selectedCourse ? selectedCourse._id : 'Will be generated'}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Course Title</label>
                    <input
                        type="text"
                        name="course_title"
                        value={formData.course_title}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Start Date</label>
                    <DatePicker
                        selected={formData.start_date}
                        onChange={date => handleDateChange(date, 'start_date')}
                        minDate={new Date()}
                    />
                </div>

                <div className="form-group">
                    <label>End Date</label>
                    <DatePicker
                        selected={formData.end_date}
                        onChange={date => handleDateChange(date, 'end_date')}
                        minDate={formData.start_date}
                    />
                </div>

                <div className="form-group">
                    <label>Duration (days)</label>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        readOnly
                        className="duration-field"
                    />
                </div>

                <div className="form-group">
                    <label>Select Instructor</label>
                    <select
                        name="instructor_id"
                        value={formData.instructor_id || ''}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Instructor</option>
                        {instructors && instructors.map(instructor => (
                            <option 
                                key={instructor.id} 
                                value={instructor.id}
                            >
                                {`${instructor.first_name} ${instructor.last_name}`.trim()} ({instructor.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn">
                        {selectedCourse ? 'Update Course' : 'Add Course'}
                    </button>
                    <button type="button" onClick={resetForm} className="reset-btn">
                        Cancel
                    </button>
                </div>
            </form>

            <div className="approved-instructors-section">
                <h3>Active Approved Instructors</h3>
                <div className="instructors-list">
                    {instructors.length > 0 ? (
                        <table className="instructors-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instructors.map(instructor => (
                                    <tr key={instructor.id}>
                                        <td>{`${instructor.first_name} ${instructor.last_name}`.trim()}</td>
                                        <td>{instructor.email}</td>
                                        <td>
                                            <span className="status-badge approved">
                                                {instructor.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No approved instructors available</p>
                    )}
                </div>
            </div>

            <div className="courses-list">
                <h3>Existing Courses</h3>
                {courses.map(course => (
                    <div key={course._id || course.id} className="course-item">
                        <div className="course-info">
                            <h4>{course.course_title}</h4>
                            <p className="course-id">Course ID: {course._id}</p>
                            <p>{course.description}</p>
                            <p>Instructor: {course.instructor_name}</p>
                            <p>Duration: {calculateDuration(course.start_date, course.end_date)} days</p>
                            <p>Period: {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}</p>
                        </div>
                        <div className="course-actions">
                            <button 
                                onClick={() => handleEditClick(course)}
                                className="edit-btn"
                            >
                                Edit
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={() => {
                                    setShowDeleteModal(true);
                                    setCourseToDelete(course._id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showAuditTrail && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button 
                            className="close-btn"
                            onClick={() => setShowAuditTrail(false)}
                        >
                            ×
                        </button>
                        <AuditTrail />
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="delete-modal-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this course? This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="delete-confirm-btn"
                                onClick={() => handleDeleteCourse(courseToDelete)}
                            >
                                Delete
                            </button>
                            <button 
                                className="delete-cancel-btn"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setCourseToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEditSuite; 