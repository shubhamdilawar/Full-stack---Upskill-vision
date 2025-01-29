import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/AuditTrail.css';

const AuditTrail = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        action_type: '',
        user_role: 'all'
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
            const response = await axios.get('/audit/audit-trail', {
                params: {
                    action_type: filters.action_type,
                    user_role: filters.user_role,
                    page: page,
                    per_page: 10
                }
            });
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

    const formatAction = (action) => {
        switch (action) {
            case 'course_created':
                return 'Course Created';
            case 'course_updated':
                return 'Course Updated';
            case 'course_deleted':
                return 'Course Deleted';
            case 'user_approved':
                return 'User Approved';
            case 'user_removed':
                return 'User Removed';
            case 'status_changed':
                return 'Status Changed';
            default:
                return action || 'Unknown Action';
        }
    };

    const actionOptions = [
        { value: '', label: 'All Actions' },
        { value: 'course_created', label: 'Course Created' },
        { value: 'course_updated', label: 'Course Updated' },
        { value: 'course_deleted', label: 'Course Deleted' },
        { value: 'user_approved', label: 'User Approved' },
        { value: 'user_removed', label: 'User Removed' },
        { value: 'status_changed', label: 'Status Changed' }
    ];

    const roleOptions = [
        { value: 'all', label: 'All Roles' },
        { value: 'HR Admin', label: 'HR Admin' },
        { value: 'Instructor', label: 'Instructor' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Participant', label: 'Participant' }
    ];

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
                    {actionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    name="user_role"
                    value={filters.user_role}
                    onChange={handleFilterChange}
                >
                    {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
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
                                    <td className={`action-type ${log.action_type}`}>
                                        {formatAction(log.action_type)}
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