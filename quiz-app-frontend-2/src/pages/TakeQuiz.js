import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TakeQuiz = () => {
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [takenQuizzes, setTakenQuizzes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  // ✅ Extract `name` and `email` from JWT token
  const getUserDetailsFromToken = () => {
    if (!token) return { name: null, email: null };

    try {
      const base64Url = token.split('.')[1]; // Get JWT payload
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(base64)); // Decode JWT payload

      return {
        name: decodedPayload.name || null,
        email: decodedPayload.email || null,
      };
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      return { name: null, email: null };
    }
  };

  const { name, email } = getUserDetailsFromToken();

  console.log("🔍 Debugging localStorage:");
  console.log("Stored userId:", userId);
  console.log("Extracted userName from Token:", name);
  console.log("Extracted email from Token:", email);
  console.log("Stored token:", token);

  // Fetch quiz categories
  const fetchCategories = async () => {
    setShowCategories(true);
    setSelectedCategory(null);
    setLoading(true);

    try {
      console.log("Fetching categories...");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quizzes/categories`);
      const data = await response.json();

      console.log("API Response:", data);

      if (!response.ok) {
        console.error("Error fetching categories:", data);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage('Failed to fetch categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch quizzes by category
  const fetchQuizzesByCategory = async (category) => {
    setLoading(true);
    setSelectedCategory(category);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quizzes/category/${encodeURIComponent(category)}`);
      const data = await response.json();

      console.log(`Quizzes for ${category}:`, data);

      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      setQuizzes(data.quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle joining a quiz
  
const navigate = useNavigate(); // ✅ Use React Router navigation

const handleJoinQuiz = async (quizId) => { 
  if (!token || !userId || !name || !email) {
    alert('Please log in to join a quiz.');
    return;
  }

  console.log("🟢 Checking if user already joined quiz:", { userId, quizId });

  try {
    // ✅ First, check if the user has already joined this quiz
    const checkResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/participants/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, quizId }),
    });

    const checkData = await checkResponse.json();
    
    if (checkResponse.status === 404) {
      console.warn("⚠️ Participants check endpoint not found!");
      return;
    }

    if (checkData.joined) {
      console.log("✅ User already joined quiz, redirecting...");
      navigate(`/quiz/${quizId}`); // ✅ Redirect to the quiz page
      return;
    }

    console.log("🟢 Sending Join Request:", { userId, quizId, name, email });

    setLoading(true);
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/participants/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, quizId, name, email }),
    });

    const data = await response.json();
    console.log("🔵 API Response:", data);

    if (!response.ok) {
      // ✅ If user already joined, redirect instead of throwing an error
      if (data.error === "User already joined this quiz") {
        console.log("🔄 Redirecting to quiz page...");
        navigate(`/quiz/${quizId}`);
        return;
      }

      throw new Error(data.message || 'Failed to join quiz');
    }

    setMessage('Successfully joined quiz! Redirecting...');
    
    // ✅ Navigate to the quiz landing page after successfully joining
    navigate(`/quiz/${quizId}`);

  } catch (error) {
    console.error("🔴 Join Quiz Error:", error);
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
};


const fetchTakenQuizzes = async () => {
  if (!userId) {
    console.warn("⚠️ User ID not found in localStorage");
    return;
  }
  setLoading(true);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/results/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 404) {
      console.warn("⚠️ No results found for this user.");
      setTakenQuizzes([]); 
      return;
    }

    const data = await response.json();
    console.log("🟢 Taken Quizzes API Response:", data); // ✅ Debug log

    // ✅ Filter to only **keep the latest** attempt per quiz
    const latestQuizzes = {};
    data.forEach((quiz) => {
      latestQuizzes[quiz.quiz_id] = quiz; // ✅ Overwrites older attempts with the latest
    });

    setTakenQuizzes(Object.values(latestQuizzes)); // ✅ Only latest attempts remain
  } catch (error) {
    console.error("❌ Error fetching taken quizzes:", error);
    setMessage("Failed to fetch your quiz history.");
  } finally {
    setLoading(false);
  }
};

  
  // ✅ Fetch quizzes the user has taken on component mount
  useEffect(() => {
    fetchTakenQuizzes();
  }, [userId, token]);


  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="take-quiz-container">
      <h3>Welcome, {name || 'Guest'}</h3> {/* ✅ Displays extracted name from token */}
      <div className="menu">
        <input
          type="text"
          placeholder="Search quizzes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '10px', padding: '5px' }}
        />
        <button onClick={fetchCategories}>Categories</button>
        <button onClick={() => setShowCategories(false)}>My Quizzes</button>
      </div>

      <div className="content">
        {message && <p style={{ color: message.includes('Success') ? 'green' : 'red' }}>{message}</p>}

        {/* Display Categories */}
        {showCategories && (
          <div>
            <h3>Select a Category</h3>
            {loading ? (
              <p>Loading categories...</p>
            ) : categories.length > 0 ? (
              <div className="category-buttons">
                {categories.map((category, index) => (
                  <button key={index} onClick={() => fetchQuizzesByCategory(category)}>
                    {category}
                  </button>
                ))}
              </div>
            ) : (
              <p>No categories found.</p>
            )}
          </div>
        )}

        {/* Display Quizzes Under Selected Category */}
        {selectedCategory && (
          <div>
            <h3>Quizzes in "{selectedCategory}"</h3>
            {loading ? (
              <p>Loading quizzes...</p>
            ) : filteredQuizzes.length > 0 ? (
              <div className="quiz-list">
                {filteredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="quiz-item">
                    <h4>{quiz.title}</h4>
                    <button onClick={() => handleJoinQuiz(quiz.id)}>Join Quiz</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No quizzes available in this category.</p>
            )}
          </div>
        )}

        {/* Display Taken Quizzes */}
        {!showCategories && !selectedCategory && (
  <div>
    <h3>My Quizzes</h3>
    {loading ? (
      <p>Loading your quiz history...</p>
    ) : takenQuizzes.length > 0 ? (
      <div className="taken-quiz-list">
        {takenQuizzes.map((quiz, index) => (
          <div key={index} className="quiz-item">
            <h4>{quiz.quiz_title ? quiz.quiz_title : "Untitled Quiz"}</h4> {/* ✅ Display title */}
            <p>Score: {quiz.score}%</p>
            <p>Time Taken: {quiz.time_taken} min</p>
            <button onClick={() => navigate(`/results/${quiz.quiz_id}`)}>
              View Results
            </button> {/* ✅ View Results Button */}
          </div>
        ))}
      </div>
    ) : (
      <p>You haven't taken any quizzes yet.</p>
    )}
  </div>
)}


      </div>
    </div>
  );
};

export default TakeQuiz;
