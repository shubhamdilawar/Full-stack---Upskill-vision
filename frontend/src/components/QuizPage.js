import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import '../styles/QuizPage.css';

const QuizPage = () => {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [feedback, setFeedback] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        fetchQuizDetails();
    }, [courseId, quizId]);

    useEffect(() => {
        if (quiz?.time_limit && !quizSubmitted) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [quiz, quizSubmitted]);

    const fetchQuizDetails = async () => {
        try {
            const response = await axios.get(`/courses/${courseId}/quizzes/${quizId}`);
            const quizData = response.data;
            
            // Ensure questions array exists and is properly formatted
            if (!Array.isArray(quizData.questions)) {
                quizData.questions = [];
            }

            // Format each question
            quizData.questions = quizData.questions.map(q => ({
                _id: q._id || '',
                question: q.question || '',
                options: Array.isArray(q.options) ? q.options : [],
                type: q.type || 'multiple_choice'
            }));

            setQuiz(quizData);
            setTimeLeft(quizData.time_limit * 60);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setError(error.response?.data?.error || 'Failed to load quiz');
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const renderQuestion = (question) => {
        switch(question.type) {
            case 'multiple_choice':
                return (
                    <div className="question-options">
                        {question.options.map((option, index) => (
                            <label key={`${question._id}-option-${index}`} className="option-label">
                                <input
                                    type="radio"
                                    name={question._id}
                                    value={option}
                                    checked={answers[question._id] === option}
                                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                />
                                <span className="option-text">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'true_false':
                return (
                    <div className="true-false-options">
                        <label key={`${question._id}-true`} className="option-label">
                            <input
                                type="radio"
                                name={question._id}
                                value="true"
                                checked={answers[question._id] === "true"}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            />
                            <span className="radio-custom"></span>
                            <span className="option-text">True</span>
                        </label>
                        <label key={`${question._id}-false`} className="option-label">
                            <input
                                type="radio"
                                name={question._id}
                                value="false"
                                checked={answers[question._id] === "false"}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            />
                            <span className="radio-custom"></span>
                            <span className="option-text">False</span>
                        </label>
                    </div>
                );
            case 'short_answer':
            case 'scenario_based':
                return (
                    <textarea
                        key={`${question._id}-textarea`}
                        className="answer-textarea"
                        value={answers[question._id] || ''}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={6}
                    />
                );
            default:
                return null;
        }
    };

    const handleSubmit = async () => {
        try {
            setError(null);
            
            if (!quiz?.questions?.length) {
                setError('No questions available');
                return;
            }

            // Validate all questions are answered
            const unansweredQuestions = quiz.questions.filter(q => !answers[q._id]);
            if (unansweredQuestions.length > 0) {
                setError('Please answer all questions before submitting');
                return;
            }

            // Format answers for submission
            const formattedAnswers = {};
            quiz.questions.forEach(q => {
                if (answers[q._id]) {
                    formattedAnswers[q._id] = answers[q._id];
                }
            });

            console.log('Submitting answers:', formattedAnswers); // Debug log

            const response = await axios.post(
                `/courses/${courseId}/quizzes/${quizId}/submit`,
                { answers: formattedAnswers }
            );
            
            if (response.status === 200) {
                console.log('Quiz submission response:', response.data); // Debug log
                setResults(response.data);
                setQuizSubmitted(true);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setError(error.response?.data?.error || 'Failed to submit quiz');
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleReturn = () => {
        const userRole = localStorage.getItem('role');
        if (userRole === 'Participant') {
            navigate(`/participantdashboard/${courseId}/viewdetails`);
        } else {
            navigate(`/courses/${courseId}`);
        }
    };

    if (loading) return <div className="loading">Loading quiz...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!quiz) return <div className="error-message">Quiz not found</div>;
    if (!quiz.questions || !quiz.questions.length) return <div className="error-message">No questions available</div>;

    if (quizSubmitted && results) {
        return (
            <div className="quiz-results">
                <h2>Quiz Results</h2>
                <div className="score-card">
                    <p className="score">Your Score: {results.score}%</p>
                    <div className="feedback-section">
                        {quiz.questions.map((question, index) => (
                            <div key={`feedback-${question._id}`} className="question-feedback">
                                <h3>Question {index + 1}</h3>
                                <p className="question-text">{question.question}</p>
                                <p className="your-answer">
                                    Your Answer: {answers[question._id]}
                                </p>
                                {results.feedback[question._id]?.status === 'pending_review' ? (
                                    <p className="pending-review">
                                        This answer will be reviewed by the instructor
                                    </p>
                                ) : (
                                    <p className={`feedback ${results.feedback[question._id]?.correct ? 'correct' : 'incorrect'}`}>
                                        {results.feedback[question._id]?.explanation || 
                                         (results.feedback[question._id]?.correct ? 'Correct!' : 'Incorrect')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <button 
                        className="return-btn"
                        onClick={handleReturn}
                    >
                        Return to Course
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestionData = quiz.questions[currentQuestion];
    if (!currentQuestionData) return <div className="error-message">Question not found</div>;

    return (
        <div className="quiz-page">
            <div className="quiz-header">
                <h2>{quiz.title || 'Untitled Quiz'}</h2>
                <div className="timer">Time Left: {formatTime(timeLeft)}</div>
            </div>

            <div className="question-section">
                <div className="question-count">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                </div>
                <div className="question-text">
                    {currentQuestionData.question}
                </div>
                {renderQuestion(currentQuestionData)}
            </div>

            <div className="quiz-navigation">
                <button
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                >
                    Previous
                </button>
                {currentQuestion === quiz.questions.length - 1 ? (
                    <button 
                        className="submit-btn"
                        onClick={handleSubmit}
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPage; 