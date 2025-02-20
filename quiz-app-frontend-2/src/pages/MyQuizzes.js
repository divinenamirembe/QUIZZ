import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyQuizzes.css"; // ✅ Import CSS

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.warn("Missing token or userId. Redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        console.log(`Fetching quizzes for creatorId: ${userId}`);

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/creator/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 401 || response.status === 403) {
          console.warn("Unauthorized. Redirecting to login...");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }

        const data = await response.json();
        console.log("Fetched quizzes:", data);
        setQuizzes(data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [navigate]);

  return (
    <div className="my-quizzes-container">
      <h2>My Created Quizzes</h2>

      {loading && <p className="loading-message">Loading quizzes...</p>}
      {error && <p className="error-message">{error}</p>}
      {quizzes.length === 0 && !loading && <p className="no-quizzes-message">No quizzes found.</p>}

      {quizzes.map((quiz) => (
        <div key={quiz.id} className="quiz-item">
          <h3>{quiz.title}</h3>
          <p>{quiz.description}</p>
          <h4>Questions:</h4>
          <ul>
            {quiz.questions.map((question) => (
              <li key={question.id}>
                {question.number}. {question.question} (Answer: {question.correct_answer})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MyQuizzes;
