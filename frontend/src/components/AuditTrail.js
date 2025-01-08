import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/AuditTrail.css';

const AuditTrail = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        action_type: '',
        user_role: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (page < 1) setPage(1);
        else fetchAuditLogs();
    }, [page, filters]);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                ...filters,
                page: Math.max(1, page),
                per_page: 10
            });

            const response = await axios.get(`/audit/audit-trail?${queryParams}`);
            setAuditLogs(response.data.audit_logs);
            setTotalPages(response.data.total_pages);
            setError(null);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            setError('Failed to fetch audit trail');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1);
    };

    return (
        <div className="audit-trail-container">
            <div className="audit-trail-banner">
                <h2>Audit Trail</h2>
                <p>Track and review all changes made to course details, schedules, and statuses.</p>
            </div>

            <div className="audit-filters">
                <select
                    name="action_type"
                    value={filters.action_type}
                    onChange={handleFilterChange}
                >
                    <option value="">All Actions</option>
                    <option value="course_created">Course Created</option>
                    <option value="course_updated">Course Updated</option>
                    <option value="course_deleted">Course Deleted</option>
                </select>

                <select
                    name="user_role"
                    value={filters.user_role}
                    onChange={handleFilterChange}
                >
                    <option value="">All Roles</option>
                    <option value="HR Admin">HR Admin</option>
                    <option value="Instructor">Instructor</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading audit trail...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <>
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Details</th>
                                <th>Course</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log, index) => (
                                <tr key={index}>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>{log.user_name}</td>
                                    <td>
                                        {log.action_type === 'course_created' && 'Course Created'}
                                        {log.action_type === 'course_updated' && 'Course Updated'}
                                        {log.action_type === 'course_deleted' && 'Course Deleted'}
                                    </td>
                                    <td>{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</td>
                                    <td>{log.course_title}</td>
                                </tr>
                            ))}
                            {auditLogs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="no-records">
                                        No audit records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AuditTrail; 