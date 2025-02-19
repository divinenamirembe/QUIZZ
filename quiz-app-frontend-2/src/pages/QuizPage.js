import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [warning, setWarning] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null); // ✅ Added startTime state

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/quizzes/${quizId}`
        );
        const data = await response.json();
        console.log("Fetched Quiz Data:", data);
        if (!response.ok) throw new Error(data.message || "Failed to fetch quiz");
        setQuiz(data);
        setTimeLeft(data.timer * 60);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      if (timeLeft <= (quiz?.timer * 60) * 0.1) {
        setWarning(true);
      }

      return () => clearInterval(timer);
    } else if (quizStarted && timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted, quiz]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now()); // ✅ Store the exact time when the quiz starts
  };

  const handleSelectAnswer = (questionId, option) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: option });

    const correctAnswer = quiz.questions[currentQuestionIndex].correct_answer;
    setFeedback(option === correctAnswer ? "✅ Correct Answer" : "❌ Wrong Answer");
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    setFeedback(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const userId = localStorage.getItem("userId");

    if (!quiz || !quiz.questions) {
      console.error("❌ Error: Quiz data is missing.");
      return;
    }

    if (!startTime) {
      console.error("❌ Error: Start time is missing.");
      alert("Error: Start time is missing. Try again.");
      return;
    }

    // ✅ Calculate the actual time taken
    const endTime = Date.now();
    const timeTakenInSeconds = Math.floor((endTime - startTime) / 1000);
    const timeTakenInMinutes = Math.floor(timeTakenInSeconds / 60);

    console.log(`⏳ Time taken: ${timeTakenInMinutes} min (${timeTakenInSeconds} sec)`);

    let correctCount = 0;
    let wrongCount = 0;
    const totalQuestions = quiz.questions.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const unanswered = totalQuestions - answeredQuestions;

    quiz.questions.forEach((question) => {
      const userAnswer = selectedAnswers[question.id];
      if (userAnswer) {
        userAnswer === question.correct_answer ? correctCount++ : wrongCount++;
      }
    });

    const resultData = {
      user_id: userId,
      quiz_id: quizId,
      correct_answers: correctCount,
      wrong_answers: wrongCount,
      unanswered: unanswered,
      total_questions: totalQuestions,
      time_taken: timeTakenInMinutes, // ✅ Corrected time calculation
    };

    console.log("🟢 Checking if a previous attempt exists...");

    try {
      const checkResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/results/user/${userId}/quiz/${quizId}`
      );

      if (checkResponse.ok) {
        const existingResult = await checkResponse.json();
        console.log("🔄 Existing result found:", existingResult);

        if (existingResult && existingResult.id) {
          console.log("🔄 Updating previous attempt...");

          const updateResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/api/results/update/${existingResult.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resultData),
            }
          );

          if (!updateResponse.ok) {
            throw new Error(`Failed to update quiz result: ${await updateResponse.text()}`);
          }

          console.log("✅ Quiz results updated successfully!");
          alert("✅ Quiz results updated successfully!");
          navigate(`/results/${quizId}`);
          return;
        }
      }

      console.log("❌ No existing result found, creating a new one...");

      const createResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/results/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultData),
        }
      );

      if (!createResponse.ok) {
        throw new Error(`Failed to submit new quiz result: ${await createResponse.text()}`);
      }

      console.log("✅ New quiz result submitted!");
      alert("✅ New quiz result submitted!");
      navigate(`/results/${quizId}`);
    } catch (error) {
      console.error("❌ Error submitting quiz:", error);
      alert("Failed to submit quiz. Please check the console for details.");
    }
  };

  if (!quiz) return <p>Loading quiz...</p>;

  return (
    <div className="quiz-container">
      {!quizStarted ? (
        <div className="quiz-intro">
          <h2>{quiz.title}</h2>
          <p>{quiz.description}</p>
          <p>🕒 Duration: {quiz.timer} minutes</p>
          <button onClick={handleStartQuiz}>Start Quiz</button>
        </div>
      ) : (
        <>
          <h2>{quiz.title}</h2>
          <p>Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
          {warning && <p style={{ color: "red" }}>⚠️ Time is almost up!</p>}

          {quiz.questions.length > 0 && (
            <div className="question-container">
              <h3>Question {currentQuestionIndex + 1}:</h3>
              <p>{quiz.questions[currentQuestionIndex].question}</p>

              {quiz.questions[currentQuestionIndex].image_url && (
                <img
                  src={quiz.questions[currentQuestionIndex].image_url}
                  alt="Question Image"
                  style={{
                    maxWidth: "150px",
                    height: "auto",
                    display: "block",
                    margin: "10px auto",
                    borderRadius: "10px",
                  }}
                />
              )}

              <div className="options">
                {Object.entries(quiz.questions[currentQuestionIndex].options).map(([key, value]) => (
                  <label key={key} className="option-label">
                    <input
                      type="radio"
                      name={`question-${quiz.questions[currentQuestionIndex].id}`}
                      value={key}
                      onChange={() => handleSelectAnswer(quiz.questions[currentQuestionIndex].id, key)}
                      checked={selectedAnswers[quiz.questions[currentQuestionIndex].id] === key}
                    />
                    {key}: {value}
                  </label>
                ))}
              </div>
              {feedback && <p className="feedback">{feedback}</p>}
            </div>
          )}

          <div className="navigation">
            <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              Previous
            </button>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button onClick={handleNext}>Next</button>
            ) : (
              <button onClick={handleSubmitQuiz}>Submit</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuizPage;
