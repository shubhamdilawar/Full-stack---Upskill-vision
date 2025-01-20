import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from '../utils/axios';
import '../styles/Modal.css';

const EditCourseModal = ({ course, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        course_title: '',
        description: '',
        start_date: new Date(),
        end_date: new Date(),
        duration: 0,
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [auditLog, setAuditLog] = useState([]);
    const [showAuditLog, setShowAuditLog] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData({
                ...course,
                start_date: new Date(course.start_date),
                end_date: new Date(course.end_date)
            });
            fetchAuditLog();
        }
    }, [course]);

    const fetchAuditLog = async () => {
        try {
            const response = await axios.get(`/courses/course/${course._id}/audit-log`);
            setAuditLog(response.data.audit_logs);
        } catch (error) {
            console.error('Error fetching audit log:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date
        }));
    };

    const validateForm = () => {
        if (!formData.course_title.trim()) {
            setError('Course title is required');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Description is required');
            return false;
        }
        if (formData.end_date <= formData.start_date) {
            setError('End date must be after start date');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError('');

            // Get the course ID
            const courseId = course._id || course.id;
            if (!courseId) {
                throw new Error('Course ID is missing');
            }

            // Format dates for API
            const formattedData = {
                ...formData,
                start_date: formData.start_date.toISOString().split('T')[0],
                end_date: formData.end_date.toISOString().split('T')[0],
                instructor_id: course.instructor_id || localStorage.getItem('user_id')
            };

            console.log('Sending update request:', {
                courseId,
                data: formattedData
            });

            const response = await axios.put(
                `/courses/update-course/${courseId}`,
                formattedData
            );

            if (response.status === 200) {
                console.log('Course updated successfully');
                if (onUpdate) {
                    onUpdate(response.data);
                }
                onClose();
            }
        } catch (error) {
            console.error('Error updating course:', error);
            setError(error.response?.data?.message || 'Failed to update course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Course</h2>
                    <button className="audit-log-btn" onClick={() => setShowAuditLog(!showAuditLog)}>
                        {showAuditLog ? 'Hide Audit Log' : 'Show Audit Log'}
                    </button>
                </div>

                {showAuditLog ? (
                    <div className="audit-log">
                        <h3>Audit Log</h3>
                        <div className="audit-entries">
                            {auditLog.map((entry, index) => (
                                <div key={index} className="audit-entry">
                                    <p><strong>Action:</strong> {entry.action}</p>
                                    <p><strong>Date:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
                                    <p><strong>Details:</strong></p>
                                    <pre>{JSON.stringify(entry.details, null, 2)}</pre>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
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

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <DatePicker
                                    selected={formData.start_date}
                                    onChange={(date) => handleDateChange(date, 'start_date')}
                                    dateFormat="MMMM d, yyyy"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <DatePicker
                                    selected={formData.end_date}
                                    onChange={(date) => handleDateChange(date, 'end_date')}
                                    dateFormat="MMMM d, yyyy"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Duration (days)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="cancel-btn"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="save-btn"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditCourseModal; 