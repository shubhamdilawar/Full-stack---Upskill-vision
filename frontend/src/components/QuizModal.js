import React, { useState } from 'react';
import '../styles/QuizModal.css';

const QuizModal = ({ courseId, quiz, onClose, onSave }) => {
    const [quizData, setQuizData] = useState({
        title: quiz?.title || '',
        description: quiz?.description || '',
        time_limit: quiz?.time_limit || 30,
        passing_score: quiz?.passing_score || 60,
        max_attempts: quiz?.max_attempts || 3,
        questions: quiz?.questions || []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        type: 'multiple_choice',
        question: '',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 1,
        difficulty: 'beginner',
        explanation: ''
    });

    const questionTypes = [
        { value: 'multiple_choice', label: 'Multiple Choice' },
        { value: 'true_false', label: 'True/False' },
        { value: 'short_answer', label: 'Short Answer' },
        { value: 'scenario_based', label: 'Scenario Based' }
    ];

    const difficultyLevels = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ];

    const handleQuestionTypeChange = (type) => {
        setCurrentQuestion(prev => ({
            ...prev,
            type,
            options: type === 'multiple_choice' ? ['', '', '', ''] : 
                     type === 'true_false' ? ['True', 'False'] : [],
            correct_answer: ''
        }));
    };

    const handleAddQuestion = () => {
        if (!currentQuestion.question.trim()) {
            alert('Question text is required');
            return;
        }

        if (currentQuestion.type === 'multiple_choice' && 
            currentQuestion.options.some(opt => !opt.trim())) {
            alert('All options must be filled');
            return;
        }

        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, currentQuestion]
        }));

        // Reset current question
        setCurrentQuestion({
            type: 'multiple_choice',
            question: '',
            options: ['', '', '', ''],
            correct_answer: '',
            points: 1,
            difficulty: 'beginner',
            explanation: ''
        });
    };

    const handleRemoveQuestion = (index) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!quizData.title.trim()) {
            alert('Quiz title is required');
            return;
        }

        if (quizData.questions.length === 0) {
            alert('Add at least one question');
            return;
        }

        try {
            await onSave(quizData);
            onClose();
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    return (
        <div className="quiz-modal">
            <div className="quiz-modal-content">
                <h2>{quiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Quiz Details Section */}
                    <div className="quiz-details">
                        <input
                            type="text"
                            placeholder="Quiz Title"
                            value={quizData.title}
                            onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                            required
                        />
                        <textarea
                            placeholder="Quiz Description"
                            value={quizData.description}
                            onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                        />
                        <div className="quiz-settings">
                            <div>
                                <label>Time Limit (minutes)</label>
                                <input
                                    type="number"
                                    value={quizData.time_limit}
                                    onChange={(e) => setQuizData({...quizData, time_limit: parseInt(e.target.value)})}
                                    min="1"
                                />
                            </div>
                            <div>
                                <label>Passing Score (%)</label>
                                <input
                                    type="number"
                                    value={quizData.passing_score}
                                    onChange={(e) => setQuizData({...quizData, passing_score: parseInt(e.target.value)})}
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <label>Max Attempts</label>
                                <input
                                    type="number"
                                    value={quizData.max_attempts}
                                    onChange={(e) => setQuizData({...quizData, max_attempts: parseInt(e.target.value)})}
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="questions-list">
                        <h3>Questions ({quizData.questions.length})</h3>
                        {quizData.questions.map((q, index) => (
                            <div key={index} className="question-item">
                                <div className="question-header">
                                    <span>{index + 1}. {q.question}</span>
                                    <span className="question-meta">
                                        {q.type} | {q.difficulty} | {q.points} pts
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveQuestion(index)}
                                        className="remove-btn"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Question Section */}
                    <div className="add-question">
                        <h3>Add New Question</h3>
                        <div className="question-type-container">
                            <div className="select-container">
                                <label>Question Type</label>
                                <select
                                    value={currentQuestion.type}
                                    onChange={(e) => handleQuestionTypeChange(e.target.value)}
                                >
                                    {questionTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="select-container">
                                <label>Difficulty Level</label>
                                <select
                                    value={currentQuestion.difficulty}
                                    onChange={(e) => setCurrentQuestion({
                                        ...currentQuestion,
                                        difficulty: e.target.value
                                    })}
                                >
                                    {difficultyLevels.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="select-container">
                            <label>Points</label>
                            <input
                                type="number"
                                placeholder="Points for this question"
                                value={currentQuestion.points}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion,
                                    points: parseInt(e.target.value) || 0
                                })}
                                min="1"
                            />
                        </div>

                        <textarea
                            placeholder="Question Text"
                            value={currentQuestion.question}
                            onChange={(e) => setCurrentQuestion({
                                ...currentQuestion,
                                question: e.target.value
                            })}
                        />

                        {currentQuestion.type === 'multiple_choice' && (
                            <div className="options">
                                <div className="option-label">Answer Options</div>
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="option">
                                        <div className="option-input">
                                            <input
                                                type="text"
                                                placeholder={`Enter option ${index + 1}`}
                                                value={option}
                                                onChange={(e) => {
                                                    const newOptions = [...currentQuestion.options];
                                                    newOptions[index] = e.target.value;
                                                    setCurrentQuestion({
                                                        ...currentQuestion,
                                                        options: newOptions
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className="correct-answer-selector">
                                            <input
                                                type="radio"
                                                name="correct_answer"
                                                checked={currentQuestion.correct_answer === option}
                                                onChange={() => setCurrentQuestion({
                                                    ...currentQuestion,
                                                    correct_answer: option
                                                })}
                                            />
                                            {currentQuestion.correct_answer === option && (
                                                <span className="correct-answer-indicator">
                                                    Correct Answer
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentQuestion.type === 'true_false' && (
                            <div className="true-false">
                                <label>
                                    <input
                                        type="radio"
                                        name="correct_answer"
                                        value="True"
                                        checked={currentQuestion.correct_answer === 'True'}
                                        onChange={(e) => setCurrentQuestion({
                                            ...currentQuestion,
                                            correct_answer: e.target.value
                                        })}
                                    /> True
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="correct_answer"
                                        value="False"
                                        checked={currentQuestion.correct_answer === 'False'}
                                        onChange={(e) => setCurrentQuestion({
                                            ...currentQuestion,
                                            correct_answer: e.target.value
                                        })}
                                    /> False
                                </label>
                            </div>
                        )}

                        {(currentQuestion.type === 'short_answer' || 
                          currentQuestion.type === 'scenario_based') && (
                            <textarea
                                placeholder="Model Answer/Solution"
                                value={currentQuestion.correct_answer}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion,
                                    correct_answer: e.target.value
                                })}
                            />
                        )}

                        <textarea
                            placeholder="Explanation (Optional)"
                            value={currentQuestion.explanation}
                            onChange={(e) => setCurrentQuestion({
                                ...currentQuestion,
                                explanation: e.target.value
                            })}
                        />

                        <button 
                            type="button" 
                            onClick={handleAddQuestion}
                            className="add-question-btn"
                        >
                            Add Question
                        </button>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">
                            {quiz ? 'Update Quiz' : 'Create Quiz'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizModal; 