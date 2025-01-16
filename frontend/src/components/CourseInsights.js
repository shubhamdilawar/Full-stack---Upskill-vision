import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axios';
import '../styles/CourseInsights.css';
import { Chart as ChartJS } from 'chart.js/auto';
import { Doughnut, Bar } from 'react-chartjs-2';

const CourseInsights = () => {
    const { courseId } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEnrollment, setUserEnrollment] = useState(null);

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const [courseResponse, enrollmentResponse] = await Promise.all([
                axios.get(`/courses/${courseId}/details`),
                axios.get(`/courses/${courseId}/enrollment`)
            ]);

            setCourseData(courseResponse.data);
            setUserEnrollment(enrollmentResponse.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load course details');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading course insights...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!courseData) return <div className="error">Course not found</div>;

    const progressData = {
        labels: ['Completed', 'Remaining'],
        datasets: [{
            data: [userEnrollment?.progress || 0, 100 - (userEnrollment?.progress || 0)],
            backgroundColor: ['#4CAF50', '#f5f5f5']
        }]
    };

    const quizData = {
        labels: courseData.modules?.map(module => module.title) || [],
        datasets: [{
            label: 'Quiz Scores',
            data: courseData.modules?.map(module => module.quiz?.score || 0) || [],
            backgroundColor: '#2196F3'
        }]
    };

    return (
        <div className="course-insights">
            <div className="course-header">
                <h2>{courseData.course_title}</h2>
                <div className="instructor-info">
                    <span>Instructor: {courseData.instructor_name}</span>
                </div>
            </div>

            <div className="insights-grid">
                <div className="overview-section">
                    <h3>Course Overview</h3>
                    <div className="overview-details">
                        <p><strong>Start Date:</strong> {new Date(courseData.start_date).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(courseData.end_date).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> {courseData.duration} days</p>
                    </div>
                </div>

                {userEnrollment && (
                    <>
                        <div className="progress-section">
                            <h3>Overall Progress</h3>
                            <div className="chart-container">
                                <Doughnut 
                                    data={progressData}
                                    options={{
                                        cutout: '70%',
                                        plugins: {
                                            legend: { display: false }
                                        }
                                    }}
                                />
                                <div className="progress-label">
                                    {userEnrollment.progress}%
                                </div>
                            </div>
                        </div>

                        <div className="quiz-performance">
                            <h3>Quiz Performance</h3>
                            <div className="chart-container">
                                <Bar 
                                    data={quizData}
                                    options={{
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 100
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="modules-section">
                    <h3>Course Modules</h3>
                    <div className="modules-list">
                        {courseData.modules?.map((module, index) => (
                            <div key={index} className="module-item">
                                <div className="module-header">
                                    <h4>{module.title}</h4>
                                    <span className={`status ${module.status?.toLowerCase()}`}>
                                        {module.status}
                                    </span>
                                </div>
                                <div className="module-content">
                                    <p>{module.description}</p>
                                    {module.quiz && (
                                        <div className="quiz-info">
                                            <span>Quiz Score: {module.quiz.score}%</span>
                                            <span className={`quiz-status ${module.quiz.status}`}>
                                                {module.quiz.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseInsights; 