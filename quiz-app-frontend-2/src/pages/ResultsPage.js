import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultsPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log(`Fetching results for Quiz ID: ${quizId}`); // Debugging log
  
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/results/user/${localStorage.getItem('userId')}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = await response.json();
        console.log("🔵 Full API Response:", JSON.stringify(data, null, 2)); // Debugging log
  
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch results');
        }
  
        // ✅ Filter only results for this quiz
        const quizResults = data.filter((attempt) => attempt.quiz_id === quizId);
  
        if (!quizResults.length) {
          setError("No results found for this quiz.");
          return;
        }
  
        // ✅ Sort results by `created_at` in descending order (latest first)
        const latestAttempt = quizResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  
        console.log("🟢 Latest Attempt:", latestAttempt);
        setResults(latestAttempt);
      } catch (error) {
        console.error("❌ Error fetching results:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchResults();
  }, [quizId, token]);
  
  
  // ✅ Function to Generate Comments Based on Score
  const getPerformanceComment = (score) => {
    if (score >= 90) {
      return "🎉 Amazing! You absolutely crushed it! Keep up the great work! 🚀";
    } else if (score >= 75) {
      return "👏 Great job! You're doing really well, just a little more to reach perfection!";
    } else if (score >= 50) {
      return "😊 Nice effort! Keep practicing and you'll improve even more!";
    } else if (score >= 30) {
      return "🤔 You're getting there! Keep learning and try again!";
    } else {
      return "💡 Don't give up! Review the questions and try again. You got this! 💪";
    }
  };

  if (loading) return <p>Loading results...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!results) return <p>No results found.</p>;

  return (
    <div className="results-container">
      <h1>Quiz Results</h1>
      <p><strong>Total Questions:</strong> {results.total_questions || 0}</p>
      <p><strong>Correct Answers:</strong> {results.correct_answers || 0}</p>
      <p><strong>Wrong Answers:</strong> {results.wrong_answers || 0}</p>
      <p><strong>Unanswered:</strong> {results.unanswered || 0}</p> 
      <h2><strong>Final Score:</strong> {results.score ? `${results.score}%` : "0%"}</h2> 

      {/* ✅ Display Performance Comment */}
      <p style={{ fontStyle: "italic", fontSize: "18px", color: "#2c3e50" }}>
        {getPerformanceComment(parseFloat(results.score))}
      </p>

      <button onClick={() => navigate('/take-quiz')}>Back to Quizzes</button>
    </div>
  );
};

export default ResultsPage;
