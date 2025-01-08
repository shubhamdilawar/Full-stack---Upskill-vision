import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/CreateCourseModal.css';
import axios from '../utils/axios';

const CreateCourseModal = ({ onClose, onCourseCreated }) => {
    const [formData, setFormData] = useState({
        course_title: '',
        description: '',
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        max_participants: 30,
        category: '',
        difficulty_level: 'intermediate',
        prerequisites: '',
        learning_outcomes: '',
        thumbnail: null,
        course_materials: []
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [newCourseCode, setNewCourseCode] = useState('');
    const [courseIds, setCourseIds] = useState({
        courseId: '',
        courseCode: ''
    });
    const [instructorDetails, setInstructorDetails] = useState({
        name: '',
        email: '',
        id: ''
    });

    useEffect(() => {
        // Get user details from localStorage
        const userId = localStorage.getItem('user_id');
        
        // Fetch instructor details from the backend
        const fetchInstructorDetails = async () => {
            try {
                // Changed from /auth/user to /courses/user
                const response = await axios.get(`/courses/user/${userId}`);
                console.log('User details response:', response.data); // Debug log
                
                if (response.data) {
                    const { first_name, last_name, email } = response.data;
                    const fullName = `${first_name} ${last_name}`.trim();
                    
                    // Set the details in localStorage and state
                    localStorage.setItem('user_name', fullName);
                    localStorage.setItem('user_email', email);
                    
                    setInstructorDetails({
                        name: fullName,
                        email: email,
                        id: userId
                    });
                    
                    console.log('Instructor details set:', {
                        name: fullName,
                        email: email,
                        id: userId
                    });
                }
            } catch (error) {
                console.error('Error fetching instructor details:', error.response?.data || error.message);
                setError('Failed to fetch instructor details. Please try again.');
            }
        };

        if (userId) {
            fetchInstructorDetails();
        } else {
            console.error('No user ID found in localStorage');
            setError('User authentication required');
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: date };
            
            // If start date is being changed and it's after end date
            if (field === 'start_date' && date > prev.end_date) {
                newData.end_date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
            }
            
            // If end date is being changed and it's before start date
            if (field === 'end_date' && date < prev.start_date) {
                return prev; // Don't allow invalid end date
            }
            
            // Calculate duration
            newData.duration = calculateDuration(
                field === 'start_date' ? date : prev.start_date,
                field === 'end_date' ? date : prev.end_date
            );
            
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!instructorDetails.id) {
                throw new Error('User ID not found. Please log in again.');
            }
            
            if (!instructorDetails.name || !instructorDetails.email) {
                throw new Error('Instructor details incomplete. Please wait for details to load.');
            }

            const courseData = {
                ...formData,
                start_date: formData.start_date.toISOString().split('T')[0],
                end_date: formData.end_date.toISOString().split('T')[0],
                instructor_id: instructorDetails.id,
                instructor_name: instructorDetails.name,
                instructor_email: instructorDetails.email
            };

            console.log('Submitting course with instructor details:', {
                id: instructorDetails.id,
                name: instructorDetails.name,
                email: instructorDetails.email
            });

            const response = await axios.post('/courses/create_course', courseData);

            if (response.status === 201) {
                setCourseIds({
                    courseId: response.data.course_id
                });
                setSuccess(true);
                
                setTimeout(() => {
                    onCourseCreated();
                    onClose();
                }, 3000);
            }
        } catch (error) {
            console.error('Error creating course:', error);
            setError(error.response?.data?.error || error.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'thumbnail') {
            if (files[0]) {
                setFormData(prev => ({
                    ...prev,
                    thumbnail: files[0]
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                course_materials: [...prev.course_materials, ...files]
            }));
        }
    };

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            course_materials: prev.course_materials.filter((_, i) => i !== index)
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (type === 'thumbnail') {
            const imageFile = files.find(file => file.type.startsWith('image/'));
            if (imageFile) {
                setFormData(prev => ({
                    ...prev,
                    thumbnail: imageFile
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                course_materials: [...prev.course_materials, ...files]
            }));
        }
    };

    const CoursePreview = () => (
        <div className="course-preview">
            <h3>Course Preview</h3>
            <div className="preview-content">
                <h4>{formData.course_title || 'Course Title'}</h4>
                <div className="preview-details">
                    <p><strong>Instructor:</strong> {instructorDetails.name}</p>
                    <p><strong>Category:</strong> {formData.category}</p>
                    <p><strong>Difficulty:</strong> {formData.difficulty_level}</p>
                    <p><strong>Max Participants:</strong> {formData.max_participants}</p>
                    <p><strong>Start Date:</strong> {formData.start_date.toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {formData.end_date.toLocaleDateString()}</p>
                </div>
                <div className="preview-section">
                    <h5>Description</h5>
                    <p>{formData.description || 'No description provided'}</p>
                </div>
                <div className="preview-section">
                    <h5>Prerequisites</h5>
                    <p>{formData.prerequisites || 'No prerequisites specified'}</p>
                </div>
                <div className="preview-section">
                    <h5>Learning Outcomes</h5>
                    <p>{formData.learning_outcomes || 'No learning outcomes specified'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Create New Course</h2>
                <div className="modal-tabs">
                    <button
                        className={`tab-btn ${!showPreview ? 'active' : ''}`}
                        onClick={() => setShowPreview(false)}
                    >
                        Edit
                    </button>
                    <button
                        className={`tab-btn ${showPreview ? 'active' : ''}`}
                        onClick={() => setShowPreview(true)}
                    >
                        Preview
                    </button>
                </div>

                {showPreview ? (
                    <CoursePreview />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group course-code-field">
                            <label>Course Details</label>
                            <div className="course-code-value">
                                <div>
                                    Course ID: {courseIds.courseId || 'Will be generated'}
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
                                placeholder="Enter course title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter course description"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <DatePicker
                                    selected={formData.start_date}
                                    onChange={(date) => handleDateChange(date, 'start_date')}
                                    minDate={new Date()}
                                    dateFormat="MMMM d, yyyy"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <DatePicker
                                    selected={formData.end_date}
                                    onChange={(date) => handleDateChange(date, 'end_date')}
                                    minDate={formData.start_date}
                                    dateFormat="MMMM d, yyyy"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Maximum Participants</label>
                            <input
                                type="number"
                                name="max_participants"
                                value={formData.max_participants}
                                onChange={handleInputChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="programming">Programming</option>
                                    <option value="design">Design</option>
                                    <option value="business">Business</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="data_science">Data Science</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Difficulty Level</label>
                                <select
                                    name="difficulty_level"
                                    value={formData.difficulty_level}
                                    onChange={handleInputChange}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Prerequisites</label>
                            <textarea
                                name="prerequisites"
                                value={formData.prerequisites}
                                onChange={handleInputChange}
                                placeholder="Enter course prerequisites (optional)"
                            />
                        </div>

                        <div className="form-group">
                            <label>Learning Outcomes</label>
                            <textarea
                                name="learning_outcomes"
                                value={formData.learning_outcomes}
                                onChange={handleInputChange}
                                placeholder="Enter expected learning outcomes"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Course Thumbnail</label>
                            <div 
                                className={`file-upload ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'thumbnail')}
                            >
                                <p>Drag and drop an image here or click to select</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                                />
                                {formData.thumbnail && (
                                    <div className="thumbnail-preview">
                                        <img
                                            src={URL.createObjectURL(formData.thumbnail)}
                                            alt="Course thumbnail"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Course Materials</label>
                            <div 
                                className={`file-upload ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'materials')}
                            >
                                <p>Drag and drop files here or click to select</p>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => handleFileChange(e, 'materials')}
                                />
                                <div className="file-list">
                                    {formData.course_materials.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <span>{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="remove-file"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
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

                        {uploadProgress > 0 && (
                            <div className="upload-progress">
                                <div 
                                    className="progress-bar"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                                <span>{uploadProgress}% Uploaded</span>
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">Course created successfully!</div>}

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
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateCourseModal; 