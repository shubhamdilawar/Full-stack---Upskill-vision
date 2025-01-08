import React, { useState } from 'react';
import axios from '../utils/axios';

const AssignmentSubmission = ({ courseId, assignmentId }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const response = await axios.post(
                `/courses/${courseId}/assignments/${assignmentId}/submit`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                alert('Assignment submitted successfully!');
                setFile(null);
            }
        } catch (error) {
            setError('Failed to submit assignment. Please try again.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="assignment-submission">
            <form onSubmit={handleSubmit}>
                <input 
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                />
                {error && <div className="error-message">{error}</div>}
                <button 
                    type="submit" 
                    disabled={loading || !file}
                >
                    {loading ? 'Uploading...' : 'Submit Assignment'}
                </button>
            </form>
        </div>
    );
};

export default AssignmentSubmission; 