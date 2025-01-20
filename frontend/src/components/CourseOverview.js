import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/CourseOverview.css';
<<<<<<< HEAD
import CourseDetails from '../pages/CourseDetails';
=======
<<<<<<< HEAD
import CourseDetails from '../pages/CourseDetails';
=======
import CourseDetails from './CourseDetails';
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
import CreateCourseModal from './CreateCourseModal';
import ErrorBoundary from './ErrorBoundary';
import EditCourseModal from './EditCourseModal';

<<<<<<< HEAD
const CourseOverview = ({ onViewDetails }) => {
=======
<<<<<<< HEAD
const CourseOverview = ({ onViewDetails }) => {
=======
const CourseOverview = () => {
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [enrollingCourseId, setEnrollingCourseId] = useState(null);
    const [completingCourseId, setCompletingCourseId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [deletingCourseId, setDeletingCourseId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourseForEdit, setSelectedCourseForEdit] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, [filter]);

    useEffect(() => {
        if (courses.length > 0) {
            const filtered = courses.filter(course => 
                (course.course_title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (course.instructor_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses([]);
        }
    }, [searchTerm, courses]);

    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role);
    }, []);

    const fetchCourses = async () => {
        try {
            console.log('Fetching courses with filter:', filter);
            const response = await axios.get(`/courses/courses?filter=${filter}`);
            
            if (response.data && Array.isArray(response.data.courses)) {
                // Clean and validate the courses data
                const cleanedCourses = response.data.courses.map(course => ({
                    _id: String(course._id),
                    course_title: course.course_title || 'Untitled',
                    description: course.description || '',
                    instructor_name: course.instructor_name || 'Unknown',
                    instructor_id: course.instructor_id || '',
                    start_date: course.start_date || null,
                    end_date: course.end_date || null,
                    duration: Number(course.duration) || 0,
                    enrollment_status: course.enrollment_status || 'Not Enrolled',
                    progress: Number(course.progress) || 0
                }));

                console.log('Cleaned courses:', cleanedCourses);
                setCourses(cleanedCourses);
                setFilteredCourses(cleanedCourses);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setError('Error fetching courses');
            setCourses([]);
            setFilteredCourses([]);
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrollingCourseId(courseId);
            console.log('Enrolling in course:', courseId); // Debug log

            const response = await axios.post(`/courses/enroll/${courseId}`);
            console.log('Enrollment response:', response); // Debug log

            if (response.status === 200) {
                // Show success message
                setError(null);
                // Refresh courses after successful enrollment
                await fetchCourses();
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
            setError(error.response?.data?.error || 'Error enrolling in course');
            
            // Log more details about the error
            if (error.response) {
                console.log('Error response:', error.response.data);
            }
        } finally {
            setEnrollingCourseId(null);
        }
    };

    const handleComplete = async (courseId) => {
        try {
            setCompletingCourseId(courseId);
            const response = await axios.post(`/courses/complete/${courseId}`);
            if (response.status === 200) {
                // Refresh courses after marking as complete
                await fetchCourses();
            }
        } catch (error) {
            console.error('Error marking course as complete:', error);
            setError('Error marking course as complete');
        } finally {
            setCompletingCourseId(null);
        }
    };

    const getProgressIndicator = (course) => {
        if (course?.enrollment_status === 'enrolled') {
            const startDate = new Date(course.start_date);
            const endDate = new Date(course.end_date);
            const today = new Date();
            
            const total = endDate - startDate;
            const progress = today - startDate;
            const percentage = Math.min(Math.max((progress / total) * 100, 0), 100);
            
            return (
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${percentage}%` }} />
                    <span className="progress-text">{Math.round(percentage)}% Complete</span>
                </div>
            );
        }
        return null;
    };

    const handleViewDetails = (course) => {
        try {
            // Add debug logs
            console.log('View Details clicked for course:', course);

            // Validate course data
            if (!course) {
                console.error('Course data is null or undefined');
                setError('Invalid course data');
                return;
            }

            // Ensure course has an _id
            if (!course._id && !course.id) {
                console.error('Course is missing ID:', course);
                setError('Course data is invalid');
                return;
            }

            // Create a clean course object with all required fields
            const cleanCourse = {
                _id: course._id || course.id, // Handle both _id and id
                course_title: course.course_title || course.title || 'Untitled Course',
                description: course.description || 'No description available',
                instructor_name: course.instructor_name || 'Unknown Instructor',
                instructor_id: course.instructor_id || '',
                start_date: course.start_date || null,
                end_date: course.end_date || null,
                duration: Number(course.duration) || 0,
                enrollment_status: course.enrollment_status || 'Not Enrolled',
                progress: Number(course.progress) || 0
            };

            console.log('Setting selected course:', cleanCourse);
            setSelectedCourse(cleanCourse);
            setError(null);
        } catch (err) {
            console.error('Error in handleViewDetails:', err);
            setError('Failed to view course details');
        }
    };

    const handleDelete = async (course) => {
        try {
            // Validate course object and ID
            if (!course || (!course._id && !course.id)) {
                console.error('Invalid course data:', course);
                setError('Cannot delete course: Invalid course data');
                return;
            }

            // Get the correct course ID
            const courseId = course._id || course.id;
            
            // Debug log
            console.log('Delete request:', {
                courseId,
                course: course,
                userRole: localStorage.getItem('role'),
                userId: localStorage.getItem('user_id')
            });

            // Confirm deletion
            if (!window.confirm(`Are you sure you want to delete "${course.course_title}"?`)) {
                return;
            }

            setDeletingCourseId(courseId);

            const response = await axios.delete(`/courses/delete_course/${courseId}`);
            
            if (response.status === 200) {
                console.log('Course deleted successfully:', response.data);
                setError(null);
                await fetchCourses(); // Refresh the course list
                alert('Course deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting course:', error.response || error);
            setError(
                error.response?.data?.message || 
                error.response?.data?.error || 
                'Failed to delete course'
            );
        } finally {
            setDeletingCourseId(null);
        }
    };

    const isValidCourse = (course) => {
        return course && 
               typeof course === 'object' && 
               course._id && 
               typeof course._id === 'string';
    };

    const handleEditCourse = (course) => {
        try {
            if (!course || (!course._id && !course.id)) {
                console.error('Invalid course data:', course);
                setError('Cannot edit course: Invalid course data');
                return;
            }

            // Create a clean course object for editing
            const cleanCourse = {
                _id: course._id || course.id,
                course_title: course.course_title || course.title || 'Untitled Course',
                description: course.description || '',
                instructor_name: course.instructor_name || 'Unknown Instructor',
                instructor_id: course.instructor_id || localStorage.getItem('user_id'),
                start_date: course.start_date ? new Date(course.start_date) : new Date(),
                end_date: course.end_date ? new Date(course.end_date) : new Date(),
                duration: Number(course.duration) || 0,
                status: course.status || 'active'
            };

            console.log('Setting course for edit:', cleanCourse);
            setSelectedCourseForEdit(cleanCourse);
            setShowEditModal(true);
        } catch (err) {
            console.error('Error preparing course for edit:', err);
            setError('Failed to prepare course for editing');
        }
    };

    const handleCourseUpdate = async (updatedCourse) => {
        try {
            await fetchCourses(); // Refresh the courses list
            setError(null);
        } catch (error) {
            console.error('Error refreshing courses:', error);
            setError('Failed to refresh courses');
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

    if (loading) {
        return (
            <div className="loading">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="loading-card" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="course-overview">
            <div className="course-controls">
                <div className="filter-section">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-dropdown"
                    >
                        <option value="all">All Courses</option>
                        <option value="enrolled">Enrolled Courses</option>
                        <option value="completed">Completed Courses</option>
                    </select>
                </div>
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search courses or instructors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="courses-grid">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => {
                        // Debug log for each course
                        console.log('Rendering course:', course);
                        
                        return (
                            <div key={course._id || course.id} className="course-card">
                                <div className="course-header">
                                    <h3>{course.course_title || course.title || 'Untitled Course'}</h3>
                                </div>
                                <div className="course-details">
                                    <p className="course-id">Course ID: {course._id}</p>
                                    <p><strong>Instructor:</strong> {course.instructor_name || 'Not assigned'}</p>
                                    <p><strong>Duration:</strong> {calculateDuration(course.start_date, course.end_date)} days</p>
                                    <p><strong>Start Date:</strong> {new Date(course.start_date).toLocaleDateString()}</p>
                                    <p><strong>End Date:</strong> {new Date(course.end_date).toLocaleDateString()}</p>
                                    <p className={`status ${(course.enrollment_status || '').toLowerCase()}`}>
                                        Status: {course.enrollment_status || 'Not Enrolled'}
                                    </p>
                                </div>
                                {getProgressIndicator(course)}
                                <div className="course-actions">
<<<<<<< HEAD
                                    
=======
<<<<<<< HEAD
                                    
=======
                                    {(!course.enrollment_status || course.enrollment_status === 'Not Enrolled') && (
                                        <button 
                                            onClick={() => handleEnroll(course._id || course.id)}
                                            className="enroll-btn"
                                            disabled={enrollingCourseId === course._id}
                                        >
                                            {enrollingCourseId === course._id ? 'Enrolling...' : 'Enroll'}
                                        </button>
                                    )}
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                                    {course.enrollment_status === 'enrolled' && (
                                        <button 
                                            onClick={() => handleComplete(course._id || course.id)}
                                            className="complete-btn"
                                            disabled={completingCourseId === course._id}
                                        >
                                            {completingCourseId === course._id ? 'Marking Complete...' : 'Mark Complete'}
                                        </button>
                                    )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                                    {userRole === 'Participant' && (
                                        <button 
                                            className="view-details-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const courseId = course._id || course.id;
                                                if (!courseId) {
                                                    console.error('Course ID is missing');
                                                    return;
                                                }
                                                console.log('Viewing course details for:', courseId);
                                                onViewDetails(courseId);
                                            }}
                                        >
                                            View Details
                                        </button>
                                    )}
<<<<<<< HEAD
=======
=======
                                    <button 
                                        className="details-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (course && (course._id || course.id)) {
                                                handleViewDetails(course);
                                            }
                                        }}
                                        disabled={!course || (!course._id && !course.id)}
                                    >
                                        View Details
                                    </button>
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                                    {userRole === 'Instructor' && 
                                     course.instructor_id === localStorage.getItem('user_id') && (
                                        <>
                                            <button 
                                                className="edit-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleEditCourse(course);
                                                }}
                                                disabled={loading}
                                            >
                                                Edit Course
                                            </button>
                                            <button 
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (course && (course._id || course.id)) {
                                                        handleDelete(course);
                                                    } else {
                                                        setError('Invalid course data');
                                                    }
                                                }}
                                                disabled={deletingCourseId === (course._id || course.id)}
                                            >
                                                {deletingCourseId === (course._id || course.id) ? 'Deleting...' : 'Delete Course'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-results">
                        No courses found matching your search criteria
                    </div>
                )}
            </div>

            {/* Course Details Modal */}
            {selectedCourse && selectedCourse._id && (
                <ErrorBoundary key={`error-boundary-${selectedCourse._id}`}>
                    <CourseDetails 
                        key={`course-details-${selectedCourse._id}`}
                        initialCourse={selectedCourse}
                        onClose={() => {
                            setSelectedCourse(null);
                            setError(null);
                        }}
                    />
                </ErrorBoundary>
            )}

            {userRole === 'Instructor' && (
                <div className="create-course-section">
                    <button 
                        className="create-course-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        Create New Course
                    </button>
                </div>
            )}

            {showCreateModal && (
                <CreateCourseModal 
                    onClose={() => setShowCreateModal(false)}
                    onCourseCreated={() => {
                        setShowCreateModal(false);
                        fetchCourses();
                    }}
                />
            )}

            {showEditModal && selectedCourseForEdit && (
                <EditCourseModal
                    course={selectedCourseForEdit}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedCourseForEdit(null);
                    }}
                    onUpdate={handleCourseUpdate}
                />
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};

export default CourseOverview; 