import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/TeamPerformance.css';
import { Bar } from 'react-chartjs-2';

const TeamPerformance = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
        courseId: '',
         startDate: '',
        endDate: '',
        participant: ''
    });
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchTeamData();
        fetchCourses();
    }, []);

     const fetchTeamData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/courses/team/performance', {
               params: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' ))
           });
            setTeamMembers(response.data || []);
        } catch (error) {
            console.error('Error fetching team data:', error);
            setError('Failed to load team performance data');
        } finally {
            setLoading(false);
        }
    };


    const fetchCourses = async () => {
        try {
            const response = await axios.get('/courses/all');
             setCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

      const applyFilters = () => {
        fetchTeamData();
    };
    const clearFilters = () => {
      setFilters({
          courseId: '',
            startDate: '',
           endDate: '',
           participant: ''
      })
        fetchTeamData();
    }
    if (loading) return <div className="loading">Loading team performance data...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="team-performance">
            <div className="performance-header">
                <h2>Team Performance Dashboard</h2>
            </div>

           <div className="filters-section">
                <select 
                   name="courseId" 
                    value={filters.courseId}
                    onChange={handleFilterChange}
                 >
                     <option value="">All Courses</option>
                       {courses.map(course => (
                          <option key={course.id || course._id} value={course.id || course._id}>
                                 {course.title || course.course_title}
                            </option>
                         ))}
                   </select>

                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                     />
                    <input
                         type="date"
                         name="endDate"
                        value={filters.endDate}
                         onChange={handleFilterChange}
                    />

                     <input
                        type="text"
                        name="participant"
                         value={filters.participant}
                       onChange={handleFilterChange}
                         placeholder="Filter By Name or Email"
                    />


                    <button onClick={applyFilters} className="apply-filters">
                        Apply Filters
                    </button>
                     <button onClick={clearFilters} className="apply-filters">
                         Clear Filters
                    </button>
            </div>


            <div className="team-stats">
                {teamMembers.map(member => (
                    <div key={member.id} className="member-card">
                         <div className="member-header">
                            <h3>{member.name}</h3>
                            <span className={`status ${member.status}`}>
                                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </span>
                        </div>
                        
                        <div className="progress-section">
                            <div className="progress-label">
                                <span>Course Completion</span>
                                <span>{member.completionPercentage}%</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${member.completionPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="metrics-grid">
                            <div className="metric">
                                <span>Active Courses</span>
                                <strong>{member.activeCourses}</strong>
                            </div>
                            <div className="metric">
                                <span>Completed Courses</span>
                                <strong>{member.completedCourses}</strong>
                            </div>
                            <div className="metric">
                                <span>Avg. Quiz Score</span>
                                <strong>{member.averageQuizScore}%</strong>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamPerformance;