import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/Modal.css';

const QuizModal = ({ quiz = null, courseId, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        time_limit: 30,
        passing_score: 70,
        attempts_allowed: 3,
        show_results: true,
        randomize_questions: false,
        questions: [
            {
                question: '',
                type: 'multiple_choice', // multiple_choice, true_false, short_answer
                points: 10,
                options: ['', '', '', ''],
                correct_answer: 0,
                explanation: ''
            }
        ]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        if (quiz) {
            setFormData(quiz);
        }
    }, [quiz]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[index] = {
                ...newQuestions[index],
                [field]: value
            };
            return { ...prev, questions: newQuestions };
        });
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            const newOptions = [...newQuestions[questionIndex].options];
            newOptions[optionIndex] = value;
            newQuestions[questionIndex] = {
                ...newQuestions[questionIndex],
                options: newOptions
            };
            return { ...prev, questions: newQuestions };
        });
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                question: '',
                type: 'multiple_choice',
                points: 10,
                options: ['', '', '', ''],
                correct_answer: 0,
                explanation: ''
            }]
        }));
        setCurrentQuestionIndex(formData.questions.length);
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
        if (currentQuestionIndex >= index) {
            setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
        }
    };

    const handleAddOption = (questionIndex) => {
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[questionIndex] = {
                ...newQuestions[questionIndex],
                options: [...newQuestions[questionIndex].options, '']
            };
            return { ...prev, questions: newQuestions };
        });
    };

    const handleRemoveOption = (questionIndex) => {
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            const newOptions = [...newQuestions[questionIndex].options];
            newOptions.pop();
            newQuestions[questionIndex] = {
                ...newQuestions[questionIndex],
                options: newOptions,
                correct_answer: newQuestions[questionIndex].correct_answer >= newOptions.length 
                    ? 0 
                    : newQuestions[questionIndex].correct_answer
            };
            return { ...prev, questions: newQuestions };
        });
    };

    const validateQuiz = () => {
        if (!formData.title || !formData.description) {
            setError('Please fill in all required fields');
            return false;
        }

        for (let i = 0; i < formData.questions.length; i++) {
            const question = formData.questions[i];
            
            if (!question.question || !question.points) {
                setError(`Question ${i + 1} is incomplete`);
                setCurrentQuestionIndex(i);
                return false;
            }

            if (question.type === 'multiple_choice') {
                if (question.options.some(opt => !opt.trim())) {
                    setError(`All options in Question ${i + 1} must be filled`);
                    setCurrentQuestionIndex(i);
                    return false;
                }

                if (question.correct_answer === undefined || question.correct_answer === null) {
                    setError(`Please select the correct answer for Question ${i + 1}`);
                    setCurrentQuestionIndex(i);
                    return false;
                }
            }

            if (question.type === 'short_answer' && !question.correct_answer) {
                setError(`Please provide correct answer(s) for Question ${i + 1}`);
                setCurrentQuestionIndex(i);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateQuiz()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const endpoint = quiz 
                ? `/courses/${courseId}/quizzes/${quiz._id}`
                : `/courses/${courseId}/quizzes`;
            
            const method = quiz ? 'put' : 'post';
            
            const quizData = {
                ...formData,
                course_id: courseId,
                created_by: localStorage.getItem('user_id'),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                total_points: formData.questions.reduce((sum, q) => sum + q.points, 0)
            };
            
            const response = await axios[method](endpoint, quizData);

            if (response.status === 200 || response.status === 201) {
                onSave(response.data);
                onClose();
            }
        } catch (error) {
            console.error('Error saving quiz:', error);
            setError(error.response?.data?.message || 'Failed to save quiz');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            setFormData({
                title: '',
                description: '',
                time_limit: 30,
                passing_score: 70,
                attempts_allowed: 3,
                show_results: true,
                randomize_questions: false,
                questions: [
                    {
                        question: '',
                        type: 'multiple_choice',
                        points: 10,
                        options: ['', '', '', ''],
                        correct_answer: 0,
                        explanation: ''
                    }
                ]
            });
            setError('');
            setCurrentQuestionIndex(0);
        };
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content quiz-modal" onClick={e => e.stopPropagation()}>
                <h2>{quiz ? 'Edit Quiz' : 'Create Quiz'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Quiz Title</label>
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
                            <label>Time Limit (minutes)</label>
                            <input
                                type="number"
                                name="time_limit"
                                value={formData.time_limit}
                                onChange={handleInputChange}
                                min="1"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Passing Score (%)</label>
                            <input
                                type="number"
                                name="passing_score"
                                value={formData.passing_score}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Attempts Allowed</label>
                            <input
                                type="number"
                                name="attempts_allowed"
                                value={formData.attempts_allowed}
                                onChange={handleInputChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row settings">
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="show_results"
                                    checked={formData.show_results}
                                    onChange={e => handleInputChange({
                                        target: {
                                            name: 'show_results',
                                            value: e.target.checked
                                        }
                                    })}
                                />
                                Show Results After Submission
                            </label>
                        </div>
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="randomize_questions"
                                    checked={formData.randomize_questions}
                                    onChange={e => handleInputChange({
                                        target: {
                                            name: 'randomize_questions',
                                            value: e.target.checked
                                        }
                                    })}
                                />
                                Randomize Questions
                            </label>
                        </div>
                    </div>

                    <div className="questions-section">
                        <h3>Questions</h3>
                        <div className="questions-nav">
                            {formData.questions.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`question-nav-btn ${currentQuestionIndex === index ? 'active' : ''}`}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                >
                                    Q{index + 1}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="add-question-btn"
                                onClick={addQuestion}
                            >
                                +
                            </button>
                        </div>

                        {formData.questions.map((question, index) => (
                            <div
                                key={index}
                                className={`question-editor ${currentQuestionIndex === index ? 'active' : 'hidden'}`}
                            >
                                <div className="question-header">
                                    <h4>Question {index + 1}</h4>
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removeQuestion(index)}
                                        disabled={formData.questions.length === 1}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="question-content">
                                    <div className="form-group">
                                        <label>Question Text</label>
                                        <textarea
                                            value={question.question}
                                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Question Type</label>
                                            <select
                                                value={question.type}
                                                onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                                            >
                                                <option value="multiple_choice">Multiple Choice</option>
                                                <option value="true_false">True/False</option>
                                                <option value="short_answer">Short Answer</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Points</label>
                                            <input
                                                type="number"
                                                value={question.points}
                                                onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value))}
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {question.type === 'multiple_choice' && (
                                        <div className="options-section">
                                            <label>Options</label>
                                            {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="option-item">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                                        placeholder={`Option ${optionIndex + 1}`}
                                                        required
                                                    />
                                                    <label className="radio-label">
                                                        <input
                                                            type="radio"
                                                            name={`correct_${index}`}
                                                            checked={question.correct_answer === optionIndex}
                                                            onChange={() => handleQuestionChange(index, 'correct_answer', optionIndex)}
                                                        />
                                                        Correct Answer
                                                    </label>
                                                </div>
                                            ))}
                                            <div className="option-actions">
                                                <button
                                                    type="button"
                                                    className="add-option-btn"
                                                    onClick={() => handleAddOption(index)}
                                                >
                                                    Add Option
                                                </button>
                                                {question.options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        className="remove-option-btn"
                                                        onClick={() => handleRemoveOption(index)}
                                                    >
                                                        Remove Last Option
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {question.type === 'true_false' && (
                                        <div className="true-false-section">
                                            <label>Correct Answer</label>
                                            <div className="radio-group">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        checked={question.correct_answer === true}
                                                        onChange={() => handleQuestionChange(index, 'correct_answer', true)}
                                                    />
                                                    True
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        checked={question.correct_answer === false}
                                                        onChange={() => handleQuestionChange(index, 'correct_answer', false)}
                                                    />
                                                    False
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {question.type === 'short_answer' && (
                                        <div className="form-group">
                                            <label>Correct Answer(s)</label>
                                            <div className="short-answer-section">
                                                <textarea
                                                    value={question.correct_answer}
                                                    onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                                                    placeholder="Enter acceptable answers, separated by commas"
                                                    required
                                                />
                                                <p className="hint">Separate multiple acceptable answers with commas</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Explanation (Optional)</label>
                                        <textarea
                                            value={question.explanation}
                                            onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                                            placeholder="Explain why this answer is correct"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
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
                            {loading ? 'Saving...' : (quiz ? 'Update Quiz' : 'Create Quiz')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizModal; 