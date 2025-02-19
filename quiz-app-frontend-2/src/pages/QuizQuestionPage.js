import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizQuestionPage.css';

function QuizQuestionPage({ quiz }) {
  const { questions, duration } = quiz;
  const { questionNumber } = useParams();
  const currentQuestionIndex = parseInt(questionNumber, 10) - 1;
  const question = questions[currentQuestionIndex];
  const navigate = useNavigate();

  const [timer, setTimer] = useState(duration * 60);
  const [warning, setWarning] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      alert(`Time's up! Your score: ${score}`);
      navigate('/quiz/results');
    }
  }, [timer, navigate, score]);

  // Show warning at 10% remaining time
  useEffect(() => {
    if (timer <= (duration * 60) * 0.1) {
      setWarning(true);
    }
  }, [timer, duration]);

  // Handle answer selection
  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  // Handle navigation to the next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      navigate(`/quiz/questions/${currentQuestionIndex + 2}`);
    } else {
      navigate('/quiz/results');
    }
  };

  const minutesLeft = Math.floor(timer / 60);
  const secondsLeft = timer % 60;

  return (
    <div className="question-page-container">
      <div className="question-header">
        <span className="question-number">Question {questionNumber}</span>
        <div className="timer">
          <span>{minutesLeft}:{secondsLeft < 10 ? '0' : ''}{secondsLeft}</span>
        </div>
      </div>

      {warning && (
        <div className="time-warning">
          <span>Hurry up! Less than 10% of your time is left.</span>
        </div>
      )}

      <div className="question-text">
        <h2>{question.text}</h2>
        <div className="answer-options">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`answer-option ${selectedAnswer === option ? (option === question.correctAnswer ? 'correct' : 'wrong') : ''}`}
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        {currentQuestionIndex === questions.length - 1 ? (
          <button className="submit-button" onClick={() => navigate('/quiz/results')}>
            Submit Quiz
          </button>
        ) : (
          <button className="next-button" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizQuestionPage;
