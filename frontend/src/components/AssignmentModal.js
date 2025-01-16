<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/Modal.css';

const AssignmentModal = ({ assignment = null, courseId, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        total_points: 100,
        instructions: '',
        submission_type: 'file', // file, text, link
        allowed_file_types: '.pdf,.doc,.docx',
        max_file_size: 5, // in MB
        rubric: [
            { criteria: '', points: 0, description: '' }
        ],
        resources: [
            { title: '', url: '' }
        ]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (assignment) {
            setFormData({
                ...assignment,
                due_date: assignment.due_date.split('T')[0]
            });
        }
    }, [assignment]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRubricChange = (index, field, value) => {
        setFormData(prev => {
            const newRubric = [...prev.rubric];
            newRubric[index] = {
                ...newRubric[index],
                [field]: value
            };
            return { ...prev, rubric: newRubric };
        });
    };

    const addRubricCriteria = () => {
        setFormData(prev => ({
            ...prev,
            rubric: [...prev.rubric, { criteria: '', points: 0, description: '' }]
        }));
    };

    const removeRubricCriteria = (index) => {
        setFormData(prev => ({
            ...prev,
            rubric: prev.rubric.filter((_, i) => i !== index)
        }));
    };

    const handleResourceChange = (index, field, value) => {
        setFormData(prev => {
            const newResources = [...prev.resources];
            newResources[index] = {
                ...newResources[index],
                [field]: value
            };
            return { ...prev, resources: newResources };
        });
    };

    const addResource = () => {
        setFormData(prev => ({
            ...prev,
            resources: [...prev.resources, { title: '', url: '' }]
        }));
    };

    const removeResource = (index) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = assignment 
                ? `/courses/${courseId}/assignments/${assignment._id}`
                : `/courses/${courseId}/assignments`;
            
            const method = assignment ? 'put' : 'post';
            
            const response = await axios[method](endpoint, formData);

            if (response.status === 200 || response.status === 201) {
                onSave(response.data);
                onClose();
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            setError(error.response?.data?.message || 'Failed to save assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{assignment ? 'Edit Assignment' : 'Create Assignment'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
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
                            <label>Due Date</label>
                            <input
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Total Points</label>
                            <input
                                type="number"
                                name="total_points"
                                value={formData.total_points}
                                onChange={handleInputChange}
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Detailed Instructions</label>
                        <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleInputChange}
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Submission Type</label>
                        <select
                            name="submission_type"
                            value={formData.submission_type}
                            onChange={handleInputChange}
                        >
                            <option value="file">File Upload</option>
                            <option value="text">Text Submission</option>
                            <option value="link">Link Submission</option>
                        </select>
                    </div>

                    {formData.submission_type === 'file' && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Allowed File Types</label>
                                <input
                                    type="text"
                                    name="allowed_file_types"
                                    value={formData.allowed_file_types}
                                    onChange={handleInputChange}
                                    placeholder=".pdf,.doc,.docx"
                                />
                            </div>
                            <div className="form-group">
                                <label>Max File Size (MB)</label>
                                <input
                                    type="number"
                                    name="max_file_size"
                                    value={formData.max_file_size}
                                    onChange={handleInputChange}
                                    min="1"
                                />
                            </div>
                        </div>
                    )}

                    <div className="section">
                        <h3>Rubric</h3>
                        {formData.rubric.map((criteria, index) => (
                            <div key={index} className="rubric-item">
                                <input
                                    type="text"
                                    placeholder="Criteria"
                                    value={criteria.criteria}
                                    onChange={e => handleRubricChange(index, 'criteria', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Points"
                                    value={criteria.points}
                                    onChange={e => handleRubricChange(index, 'points', e.target.value)}
                                />
                                <textarea
                                    placeholder="Description"
                                    value={criteria.description}
                                    onChange={e => handleRubricChange(index, 'description', e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    className="remove-btn"
                                    onClick={() => removeRubricCriteria(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            className="add-btn"
                            onClick={addRubricCriteria}
                        >
                            Add Criteria
                        </button>
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
                            {loading ? 'Saving...' : (assignment ? 'Update' : 'Create')}
                        </button>
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentModal; 