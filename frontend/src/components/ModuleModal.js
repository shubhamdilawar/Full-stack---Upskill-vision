import React, { useState, useEffect } from 'react';

const ModuleModal = ({ courseId, module, onClose, onSave }) => {
    const [moduleData, setModuleData] = useState({
        title: '',
        description: '',
        content: '',
        order: 0
    });

    useEffect(() => {
        if (module) {
            setModuleData({
                ...module
            });
        }
    }, [module]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate data
        const title = moduleData.title?.trim();
        if (!title) {
            alert('Module title is required');
            return;
        }

        // Prepare clean data
        const cleanData = {
            ...moduleData,
            title: title,
            description: moduleData.description?.trim() || '',
            content: moduleData.content?.trim() || '',
            order: parseInt(moduleData.order || 0)
        };

        try {
            await onSave(cleanData);
            onClose();
        } catch (error) {
            console.error('Error submitting module:', error);
            // Error is handled by parent component
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>{module ? 'Edit Module' : 'Add New Module'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Module Title"
                        value={moduleData.title}
                        onChange={(e) => setModuleData({
                            ...moduleData,
                            title: e.target.value
                        })}
                        required
                    />
                    <textarea
                        placeholder="Module Description"
                        value={moduleData.description}
                        onChange={(e) => setModuleData({
                            ...moduleData,
                            description: e.target.value
                        })}
                        required
                    />
                    <textarea
                        placeholder="Module Content"
                        value={moduleData.content}
                        onChange={(e) => setModuleData({
                            ...moduleData,
                            content: e.target.value
                        })}
                        required
                    />
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">
                            {module ? 'Update Module' : 'Add Module'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModuleModal; 