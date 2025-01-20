<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
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
<<<<<<< HEAD
=======
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
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
<<<<<<< HEAD
=======
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                                    >
                                        Remove
                                    </button>
                                </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======

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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                            </div>
                        ))}
                    </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
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
<<<<<<< HEAD
=======
=======
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
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizModal; 