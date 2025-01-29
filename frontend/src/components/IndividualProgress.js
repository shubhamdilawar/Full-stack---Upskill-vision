import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Bar, Pie } from 'react-chartjs-2';
import '../styles/IndividualProgress.css';

const IndividualProgress = () => {
    const [courseData, setCourseData] = useState([]);
    const [overallStats, setOverallStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedView, setSelectedView] = useState('all');
    
      useEffect(() => {
        fetchUserCourses();
    }, []);

    const fetchUserCourses = async () => {
        try {
            const response = await axios.get('/courses/user/progress');
            console.log("Data fetched from /courses/user/progress: ", response.data)
            setCourseData(response.data.courses);
            setOverallStats({
                totalPoints: response.data.total_learning_points,
                completionRate: response.data.completion_rate,
                averageQuizScore: response.data.average_quiz_score
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching course data:', error);
            setError('Failed to load your course data');
            setLoading(false);
        }
    };


    const completedCourses = courseData.filter(course => course.status === 'completed');
    const inProgressCourses = courseData.filter(course => course.status === 'in_progress');

     const pieChartData = {
        labels: ['Completed', 'In Progress'],
        datasets: [{
            data: [completedCourses.length, inProgressCourses.length],
            backgroundColor: ['#4CAF50', '#2196F3'],
            borderWidth: 0
        }]
    };

    const barChartData = {
       labels: courseData.map(course => course.course_title),
        datasets: [{
            label: 'Course Progress (%)',
            data: courseData.map(course => course.progress),
             backgroundColor: courseData.map(course =>
                 course.status === 'completed' ? '#4CAF50' : '#2196F3'
            ),
            borderWidth: 0
        }]
    };

    if (loading) return <div className="loading">Loading your progress...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="individual-progress">
            <div className="progress-header">
               <h2 style = {{textAlign : "center", marginBottom: '1rem', fontWeight: 700 }}>Your Learning Journey</h2>
            </div>

            <div className="progress-overview">
                <div className="stats-cards">
                         <div className="stat-card">
                             <h3>Total Courses</h3>
                            <p>{courseData.length}</p>
                        </div>
                        <div className="stat-card completed">
                            <h3>Completed</h3>
                            <p>{completedCourses.length}</p>
                        </div>
                        <div className="stat-card in-progress">
                             <h3>In Progress</h3>
                            <p>{inProgressCourses.length}</p>
                        </div>
                        {overallStats && (
                           <>
                                 <div className="stat-card">
                                        <h3>Total Points</h3>
                                        <p>{overallStats.totalPoints}</p>
                                     </div>
                                    <div className="stat-card completed">
                                       <h3>Completion Rate</h3>
                                        <p>{Math.round(overallStats.completionRate * 100)}%</p>
                                    </div>
                                    <div className="stat-card in-progress">
                                        <h3>Avg. Quiz Score</h3>
                                        <p>{Math.round(overallStats.averageQuizScore)}%</p>
                                    </div>
                             </>
                        )}


                  
                </div>

                <div className="charts-section">
                     <div className="chart-container">
                        <h3>Course Distribution</h3>
                        <Pie
                         data={pieChartData}
                           options={{
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                }
                           }}
                        />
                     </div>
                    <div className="chart-container">
                        <h3>Course Progress Overview</h3>
                        <Bar
                           data={barChartData}
                             options={{
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                },
                                scales: {
                                  x: {
                                      ticks: {
                                          color: 'black',
                                          font: {
                                               size: 10
                                          }
                                      }
                                    },
                                  y: {
                                       ticks: {
                                             color: 'black',
                                           }
                                    }
                                }
                            }}
                        />
                   </div>
                </div>

                 <div className="courses-list-container">
                      <div className="courses-header">
                           <h3>Your Courses</h3>
                            <div className="view-controls">
                                  <button 
                                      className={selectedView === 'all' ? 'active' : ''}
                                      onClick={() => setSelectedView('all')}
                                  >
                                    All Courses
                                   </button>
                                   <button 
                                      className={selectedView === 'completed' ? 'active' : ''}
                                      onClick={() => setSelectedView('completed')}
                                  >
                                    Completed
                                   </button>
                                   <button 
                                       className={selectedView === 'inProgress' ? 'active' : ''}
                                       onClick={() => setSelectedView('inProgress')}
                                  >
                                      In Progress
                                    </button>
                                </div>
                         </div>
                      
                    
                      <div className="courses-list">
                           {courseData
                            .filter(course => {
                                if (selectedView === 'completed') return course.status === 'completed';
                                if (selectedView === 'inProgress') return course.status === 'in_progress';
                                return true;
                            })
                            .map(course => (
                                <div key={course._id} className="course-progress-card">
                                     <div className="course-info">
                                            <h4>{course.course_title}</h4>
                                           <span className={`status-badge ${course.status === 'completed' ? 'completed' : 'in-progress'}`}>
                                               {course.status === 'completed' ? 'Completed' : 'In Progress'}
                                           </span>
                                        </div>
                                    <div className="progress-details">
                                        <div className="progress-bar">
                                           <div
                                             className="progress-fill"
                                            style={{ width: `${course.progress}%` }}
                                         >
                                            </div>
                                        </div>
                                      <span className="progress-text">{course.progress}% Complete</span>
                                    </div>
                                    <div className="performance-metrics">
                                        <div className="metric">
                                            <span>Modules Completed:</span>
                                            <span>{course.completed_modules}/{course.total_modules}</span>
                                        </div>
                                        <div className="metric">
                                            <span>Quiz Average:</span>
                                            <span>{course.quiz_average}%</span>
                                        </div>
                                          <div className="metric">
                                            <span>Learning Points:</span>
                                            <span>{course.learning_points}</span>
                                         </div>
                                    </div>
                                </div>
                            ))}
                       </div>
                 </div>
            </div>
         </div>
    );
};

export default IndividualProgress;