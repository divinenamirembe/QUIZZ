import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateQuizForm.css"; // ✅ Import the CSS file

const CreateQuizForm = () => {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timer: 60,
    category: "",
    otherCategory: "",
  });

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    } else {
      fetchUserQuizzes();
    }
  }, [navigate]);

  const fetchUserQuizzes = async () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/creator/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const handleChange = (e) => {
    setQuizData({ ...quizData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setQuizData({ ...quizData, category: e.target.value, otherCategory: "" });
  };

  const handleOtherCategoryChange = (e) => {
    setQuizData({ ...quizData, otherCategory: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!quizData.title || !quizData.description || !quizData.category) {
      setLoading(false);
      setError("Please fill all required fields.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      setError("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      let apiUrl = `${process.env.REACT_APP_API_URL}/api/users/quizzes`;
      let method = "POST";
      let successMessage = "Quiz created successfully!";
      let quizId = null;
      let quizTitle = "";

      if (selectedQuizId) {
        apiUrl = `${process.env.REACT_APP_API_URL}/api/quizzes/${selectedQuizId}`;
        method = "PUT";
        successMessage = "Quiz updated successfully!";
      }

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: quizData.title,
          description: quizData.description,
          timer: quizData.timer,
          category:
            quizData.category === "Other" ? quizData.otherCategory : quizData.category,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (method === "POST" && data.quiz && data.quiz.id) {
        quizId = data.quiz.id;
        quizTitle = data.quiz.title || "Untitled Quiz";
      } else if (method === "PUT" && data.id) {
        quizId = data.id;
        quizTitle = data.title || "Untitled Quiz";
      } else {
        setError("Failed to retrieve quiz ID. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(successMessage);
      setQuizData({ title: "", description: "", timer: 60, category: "", otherCategory: "" });
      setSelectedQuizId(null);
      fetchUserQuizzes();

      sessionStorage.setItem("quizId", quizId);
      sessionStorage.setItem("quizTitle", quizTitle);

      navigate(`/add-questions/${quizId}`, { state: { quizTitle, quizId } });
    } catch (error) {
      console.error("❌ Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = (quiz) => {
    setQuizData({
      title: quiz.title,
      description: quiz.description,
      timer: quiz.timer,
      category: quiz.category,
      otherCategory: "",
    });
    setSelectedQuizId(quiz.id);
    setSuccess("");
    setError("");
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/quizzes/${quizId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      setSuccess("Quiz deleted successfully!");
      fetchUserQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setError("Failed to delete quiz. Please try again.");
    }
  };

  return (
    <div className="quiz-form">
      <h3>{selectedQuizId ? "Edit Quiz" : "Create Quiz"}</h3>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Quiz Title</label>
          <input type="text" id="title" name="title" value={quizData.title} onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor="description">Quiz Description</label>
          <textarea id="description" name="description" value={quizData.description} onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor="timer">Set Timer (minutes)</label>
          <input type="number" id="timer" name="timer" value={quizData.timer} onChange={handleChange} min="1" />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={quizData.category} onChange={handleCategoryChange} required>
            <option value="">Select Category</option>
            <option value="Maths">Maths</option>
            <option value="Literature">Literature</option>
            <option value="Science">Science</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {quizData.category === "Other" && (
          <div>
            <label htmlFor="otherCategory">Specify the category</label>
            <input type="text" id="otherCategory" name="otherCategory" value={quizData.otherCategory} onChange={handleOtherCategoryChange} required />
          </div>
        )}

        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? "Saving..." : selectedQuizId ? "Update Quiz" : "Create Quiz"}
        </button>
      </form>

      <div className="quiz-list">
        <h1>My Quizzes</h1>
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-item">
              <h2>{quiz.title}</h2>
              <button onClick={() => handleEditQuiz(quiz)}>Edit</button>
              <button onClick={() => handleDeleteQuiz(quiz.id)}>Delete</button>
            </div>
          ))
        ) : (
          <p>No quizzes created yet.</p>
        )}
      </div>
    </div>
  );
};

export default CreateQuizForm;
