import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/ModuleManager.css';

const ModuleManager = ({ courseId }) => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newModule, setNewModule] = useState({
        title: '',
        description: '',
        content: ''
    });
    const [editingModule, setEditingModule] = useState(null);

    useEffect(() => {
        fetchModules();
    }, [courseId]);

    const fetchModules = async () => {
        try {
            const response = await axios.get(`/courses/${courseId}/modules`);
            setModules(response.data.modules || []);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch modules');
            setLoading(false);
        }
    };

    const handleModuleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/courses/${courseId}/modules`, newModule);
            if (response.status === 201) {
                setNewModule({ title: '', description: '', content: '' });
                fetchModules();
            }
        } catch (error) {
            setError('Failed to create module');
        }
    };

    const handleEditModule = (moduleId) => {
        const moduleToEdit = modules.find(m => m._id === moduleId);
        if (moduleToEdit) {
            setEditingModule(moduleToEdit);
        }
    };

    const handleUpdateModule = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/courses/${courseId}/modules/${editingModule._id}`, editingModule);
            setEditingModule(null);
            fetchModules();
        } catch (error) {
            setError('Failed to update module');
        }
    };

    const handleDeleteModule = async (moduleId) => {
        try {
            await axios.delete(`/courses/${courseId}/modules/${moduleId}`);
            fetchModules();
        } catch (error) {
            setError('Failed to delete module');
        }
    };

    if (loading) return <div className="loading">Loading modules...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="module-manager">
            <div className="module-form-section">
                <h3>Add New Module</h3>
                <form onSubmit={handleModuleSubmit}>
                    <input
                        type="text"
                        placeholder="Module Title"
                        value={newModule.title}
                        onChange={(e) => setNewModule({
                            ...newModule,
                            title: e.target.value
                        })}
                        required
                    />
                    <textarea
                        placeholder="Module Description"
                        value={newModule.description}
                        onChange={(e) => setNewModule({
                            ...newModule,
                            description: e.target.value
                        })}
                    />
                    <textarea
                        placeholder="Module Content"
                        value={newModule.content}
                        onChange={(e) => setNewModule({
                            ...newModule,
                            content: e.target.value
                        })}
                    />
                    <button type="submit">Add Module</button>
                </form>
            </div>

            <div className="modules-list">
                <h3>Course Modules</h3>
                {modules.length === 0 ? (
                    <p className="no-modules">No modules added yet. Create your first module above.</p>
                ) : (
                    modules.map((module, index) => (
                        <div key={module._id || index} className="module-item">
                            <div className="module-header">
                                <h4>{module.title}</h4>
                                <div className="module-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditModule(module._id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteModule(module._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="module-content">
                                <p className="module-description">{module.description}</p>
                                {module.content && (
                                    <div className="module-content-text">
                                        {module.content}
                                    </div>
                                )}
                                {module.assignments && module.assignments.length > 0 && (
                                    <div className="module-assignments">
                                        <h5>Assignments</h5>
                                        {module.assignments.map(assignment => (
                                            <div key={assignment._id} className="assignment-item">
                                                <h6>{assignment.title}</h6>
                                                <p>{assignment.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {editingModule && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit Module</h3>
                        <form onSubmit={handleUpdateModule}>
                            <input
                                type="text"
                                value={editingModule.title}
                                onChange={(e) => setEditingModule({
                                    ...editingModule,
                                    title: e.target.value
                                })}
                                required
                            />
                            <textarea
                                value={editingModule.description}
                                onChange={(e) => setEditingModule({
                                    ...editingModule,
                                    description: e.target.value
                                })}
                            />
                            <textarea
                                value={editingModule.content}
                                onChange={(e) => setEditingModule({
                                    ...editingModule,
                                    content: e.target.value
                                })}
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setEditingModule(null)}>
                                    Cancel
                                </button>
                                <button type="submit">
                                    Update Module
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModuleManager; 