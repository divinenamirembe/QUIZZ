import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateQuiz.css';
import CreateQuizForm from './CreateQuizForm';
import AddQuestionsForm from './AddQuestionsForm';


const CreateQuiz = () => {
  const [activeTab, setActiveTab] = useState('createQuiz'); // Default tab
  const [quizzes, setQuizzes] = useState([]); // Stores user's quizzes
  const [selectedQuiz, setSelectedQuiz] = useState(null); // Stores selected quiz details
  const [results, setResults] = useState([]); // Stores quiz results
  const [participants, setParticipants] = useState([]); // Stores quiz participants
  const [showQuizzes, setShowQuizzes] = useState(false); // Toggle quiz list under Results/Participants
  const [loadingResults, setLoadingResults] = useState(false); // Track results loading state
  const [loadingParticipants, setLoadingParticipants] = useState(false); // Track participants loading state
  const [noResultsFound, setNoResultsFound] = useState(false); // Track empty results
  const [noParticipantsFound, setNoParticipantsFound] = useState(false); // Track empty participants

  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedQuiz(null); // Reset selection
    setShowQuizzes(false);
    if (tab === 'viewQuiz') {
      navigate('/my-quizzes');
    } else if (tab === 'participants' || tab === 'results') {
      fetchUserQuizzes(); // Fetch quizzes when switching to these tabs
    }
  };

  // ✅ Fetch quizzes created by the logged-in user
  const fetchUserQuizzes = async () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      alert('Your session has expired. Please log in again.');
      return;
    }

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
      console.error('Error fetching quizzes:', error);
    }
  };

  // ✅ Fetch results when a quiz is clicked
  // ✅ Fetch results when a quiz is clicked (Only latest result per user)
  const handleQuizClickForResults = async (quizId) => {
    const token = localStorage.getItem('authToken');
  
    setLoadingResults(true);
    setNoResultsFound(false);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/results/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch quiz results');
      }
  
      const data = await response.json();
      setSelectedQuiz({ id: quizId, title: data.quizTitle });
  
      if (!data.results || data.results.length === 0) {
        setNoResultsFound(true);
        return;
      }
  
      console.log("🔵 Full API Response:", data.results); // Debugging log
  
      // ✅ Count the number of attempts per user
      const attemptsMap = {};
      data.results.forEach((result) => {
        if (!attemptsMap[result.user_id]) {
          attemptsMap[result.user_id] = { latestAttempt: result, count: 1 };
        } else {
          attemptsMap[result.user_id].count += 1;
  
          // Keep the latest attempt
          if (new Date(result.created_at) > new Date(attemptsMap[result.user_id].latestAttempt.created_at)) {
            attemptsMap[result.user_id].latestAttempt = result;
          }
        }
      });
  
      // Convert to an array format for rendering
      const filteredResults = Object.values(attemptsMap).map(({ latestAttempt, count }) => ({
        ...latestAttempt,
        attempts: count,
      }));
  
      console.log("✅ Latest results per user with attempt count:", filteredResults);
      setResults(filteredResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      setNoResultsFound(true);
    } finally {
      setLoadingResults(false);
    }
  };
  

  // ✅ Fetch participants when a quiz is clicked
  const handleQuizClickForParticipants = async (quizId) => {
    const token = localStorage.getItem('authToken');

    setLoadingParticipants(true);
    setNoParticipantsFound(false);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/participants/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz participants');
      }

      const data = await response.json();
      setSelectedQuiz({ id: quizId, title: data.quizTitle });

      if (data.participants.length === 0) {
        setNoParticipantsFound(true);
      }

      setParticipants(data.participants);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setNoParticipantsFound(true);
    } finally {
      setLoadingParticipants(false);
    }
  };

  return (
    <div className="create-quiz-container">
      <div className="menu">
        <button onClick={() => handleTabChange('createQuiz')}>Create Quiz</button>
        <button onClick={() => handleTabChange('questions')}>Add Questions</button>
        <button onClick={() => handleTabChange('participants')}>Participants</button>
        <button onClick={() => handleTabChange('results')}>Results</button>
        <button onClick={() => handleTabChange('viewQuiz')}>My Quizzes</button>
      </div>

      <div className="content">
        {activeTab === 'createQuiz' && <CreateQuizForm />}
        {activeTab === 'questions' && <AddQuestionsForm />}

        {/* ✅ Participants Section */}
        {activeTab === 'participants' && (
          <div>
            <h3>Quiz Participants</h3>

            {/* Display Quizzes */}
            {showQuizzes && (
              <div className="quiz-list">
                <h4>Select a Quiz</h4>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => handleQuizClickForParticipants(quiz.id)}
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

            {/* Display Participants */}
            {selectedQuiz && (
              <div className="participants-list">
                <h4>Participants for {selectedQuiz.title}</h4>

                {loadingParticipants && <p>Loading participants...</p>}
                {noParticipantsFound && !loadingParticipants && <p>No participants for this quiz.</p>}

                {!noParticipantsFound && !loadingParticipants && (
                  <ul>
                    {participants.map((participant, index) => (
                      <li key={index}>{participant.name} - {participant.email}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* ✅ Results Section */}
        {activeTab === 'results' && (
          <div>
            <h3>Quiz Results</h3>

            {/* Display Quizzes */}
            {showQuizzes && (
              <div className="quiz-list">
                <h4>Select a Quiz</h4>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => handleQuizClickForResults(quiz.id)}
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

            {/* Display Quiz Results */}
           {/* Display Quiz Results */}
{selectedQuiz && (
  <div className="results-list">
    <h4>Results for {selectedQuiz.title}</h4>

    {loadingResults && <p>Loading results...</p>}
    {noResultsFound && !loadingResults && <p>No results available for this quiz.</p>}

    {!noResultsFound && !loadingResults && (
      <table className="results-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Score (%)</th>
            <th>Time Taken (min)</th>
            <th>Attempts</th> {/* ✅ New column */}
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.name}</td>
              <td>{result.score}%</td>
              <td>{result.time_taken} min</td>
              <td>{result.attempts}</td> {/* ✅ Show number of attempts */}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}

          </div>
        )}
      </div>
    </div>
  );
};

export default CreateQuiz;
