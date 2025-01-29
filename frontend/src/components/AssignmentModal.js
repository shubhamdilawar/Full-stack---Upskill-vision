import React, { useState } from 'react';

const AssignmentModal = ({ courseId, onClose, onSave }) => {
    const [assignmentData, setAssignmentData] = useState({
        title: '',
        description: '',
        due_date: '',
        total_points: 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(assignmentData);
        onClose();
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Add Assignment</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Assignment Title"
                        value={assignmentData.title}
                        onChange={(e) => setAssignmentData({
                            ...assignmentData,
                            title: e.target.value
                        })}
                        required
                    />
                    <textarea
                        placeholder="Assignment Description"
                        value={assignmentData.description}
                        onChange={(e) => setAssignmentData({
                            ...assignmentData,
                            description: e.target.value
                        })}
                        required
                    />
                    <input
                        type="date"
                        value={assignmentData.due_date}
                        onChange={(e) => setAssignmentData({
                            ...assignmentData,
                            due_date: e.target.value
                        })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Total Points"
                        value={assignmentData.total_points}
                        onChange={(e) => setAssignmentData({
                            ...assignmentData,
                            total_points: parseInt(e.target.value)
                        })}
                        required
                    />
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Save Assignment</button>


                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentModal; 