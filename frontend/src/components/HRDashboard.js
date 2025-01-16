import React, { useState } from 'react';
import ParticipantPerformance from './ParticipantPerformance';

const HRDashboard = () => {
    const [activeTab, setActiveTab] = useState('performance');

    return (
        <div>
            <button 
                className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
            >
                Performance Analytics
            </button>

            {activeTab === 'performance' && (
                <ParticipantPerformance />
            )}
        </div>
    );
};

export default HRDashboard; 