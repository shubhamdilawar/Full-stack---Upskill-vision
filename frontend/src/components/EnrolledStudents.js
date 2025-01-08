const StudentRow = ({ student }) => {
    return (
        <tr>
            <td>{student.name}</td>
            <td>{student.email}</td>
            <td>
                <div className="progress-cell">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${student.progress}%` }}
                        ></div>
                    </div>
                    <span>{student.progress.toFixed(2)}%</span>
                </div>
            </td>
            <td>
                {student.assignments.completed}/{student.assignments.total}
                <br />
                <span className="percentage">({student.assignments.percentage}%)</span>
            </td>
            <td>
                {student.quizzes.completed}/{student.quizzes.total}
                <br />
                <span className="percentage">({student.quizzes.percentage}%)</span>
            </td>
            <td>{new Date(student.last_active).toLocaleDateString()}</td>
            <td>
                <span className={`performance-badge ${student.performance.toLowerCase()}`}>
                    {student.performance}
                </span>
            </td>
            <td>
                <button 
                    className="view-details-btn"
                    onClick={() => navigate(`/courses/${courseId}/students/${student.id}`)}
                >
                    View Details
                </button>
            </td>
        </tr>
    );
}; 