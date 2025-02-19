import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Participants = () => {
  const [quizzes, setQuizzes] = useState([]); // Stores user's quizzes
  const [selectedQuiz, setSelectedQuiz] = useState(null); // Selected quiz ID
  const [participants, setParticipants] = useState([]); // Stores participants
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuizzes, setShowQuizzes] = useState(false); // Toggle quiz list

  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  // ✅ Fetch user's quizzes when component loads
  useEffect(() => {
    if (!token || !userId) return;

    const fetchQuizzes = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/creator/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }

        const data = await response.json();
        setQuizzes(data);
        setShowQuizzes(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [token, userId]);

  // ✅ Fetch participants when a quiz is selected
  const handleQuizClick = async (quizId) => {
    if (!token) {
      alert('Your session has expired. Please log in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setSelectedQuiz(quizId);
    setParticipants([]);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/participants/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }

      const data = await response.json();
      setParticipants(data.participants);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Participants</h2>

      {/* Show Error Message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show Loading State */}
      {loading && <p>Loading...</p>}

      {/* Show Quizzes List */}
      {showQuizzes && (
        <div>
          <h3>Select a Quiz</h3>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => handleQuizClick(quiz.id)}
                className="quiz-item"
              >
                {quiz.title}
              </button>
            ))
          ) : (
            <p>No quizzes found.</p>
          )}
        </div>
      )}

      {/* Show Participants List */}
      {selectedQuiz && (
        <div>
          <h3>Participants for Selected Quiz</h3>
          {participants.length > 0 ? (
            <ul>
              {participants.map((participant, index) => (
                <li key={index}>
                  {participant.name} - {participant.email}
                </li>
              ))}
            </ul>
          ) : (
            <p>No participants have taken this quiz yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Participants;
