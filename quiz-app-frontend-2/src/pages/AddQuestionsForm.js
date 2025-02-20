import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./AddQuestionsForm.css";


const AddQuestionsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId: quizIdFromParams } = useParams();

  const { quizTitle: quizTitleFromState, quizId: quizIdFromState } = location.state || {};
  
  const storedQuizId = sessionStorage.getItem("quizId");
  const storedQuizTitle = sessionStorage.getItem("quizTitle");

  const quizId = quizIdFromState || quizIdFromParams || storedQuizId;
  const quizTitle = quizTitleFromState || storedQuizTitle || "Untitled Quiz";

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
      }
    };
    checkToken();
    fetchQuestions();
  }, [navigate]);

  if (!quizId) {
    return <p>Error: Quiz ID is missing. Please go back and try again.</p>;
  }

  // ✅ Fetch existing questions
  const fetchQuestions = async () => {
    setSubmittedQuestions([]); // 🟢 Clear state before fetching
  
    const token = localStorage.getItem("authToken");
    if (!token) return;
  
    const apiUrl = `${process.env.REACT_APP_API_URL}/api/questions/${quizId}`;
    console.log("🔍 Fetching questions from:", apiUrl);
  
    try {
      const response = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`Failed to fetch questions: ${await response.text()}`);
  
      const data = await response.json();
      console.log("✅ Fetched Questions:", data);
      setSubmittedQuestions([...data]); // 🟢 Ensure React recognizes state update
    } catch (error) {
      console.error("❌ Error fetching questions:", error);
    }
  };
  
  // ✅ Handle Image Upload & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle adding or updating a question
  const handleSubmitQuestion = async () => {
    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      alert("❌ Please fill in all fields.");
      return;
    }
  
    const token = localStorage.getItem("authToken");
    if (!token || !quizId) {
      alert("⚠️ Session expired. Please log in again.");
      navigate("/login");
      return;
    }
  
    const isUpdating = selectedQuestion && selectedQuestion.id;
    console.log("🟢 Is Updating?", isUpdating, "Selected Question:", selectedQuestion);
  
    let requestData;
    let requestHeaders = { Authorization: `Bearer ${token}` };
  
    // ✅ Ensure options is always stored as a JSON object
    const optionsObject = {
      A: optionA.trim(),
      B: optionB.trim(),
      C: optionC.trim(),
      D: optionD.trim(),
    };
  
    if (imageFile || isUpdating) {
      requestData = new FormData();
      requestData.append("quiz_id", quizId);
      requestData.append("question", questionText.trim());
      requestData.append("options", JSON.stringify(optionsObject));  // ✅ Ensure JSON format
      requestData.append("correct_answer", correctAnswer);
      requestData.append("number", selectedQuestion?.number || submittedQuestions.length + 1);
  
      if (imageFile) {
        requestData.append("image", imageFile); // ✅ Append image
      }
    } else {
      requestData = JSON.stringify({
        quiz_id: quizId,
        question: questionText.trim(),
        options: optionsObject,  // ✅ Send as JSON object
        correct_answer: correctAnswer,
        number: selectedQuestion?.number || submittedQuestions.length + 1,
      });
  
      requestHeaders["Content-Type"] = "application/json"; // ✅ Only set if NOT FormData
    }
  
    console.log("📤 Data being sent:", requestData);
  
    try {
      let response;
      if (isUpdating) {
        console.log(`🟢 Sending PUT request to: ${process.env.REACT_APP_API_URL}/api/questions/${selectedQuestion.id}`);
  
        response = await fetch(`${process.env.REACT_APP_API_URL}/api/questions/${selectedQuestion.id}`, {
          method: "PUT",
          headers: requestHeaders, // ✅ Do NOT set headers manually for FormData
          body: requestData,
        });
  
      } else {
        console.log("➕ Adding a new question");
  
        response = await fetch(`${process.env.REACT_APP_API_URL}/api/questions`, {
          method: "POST",
          headers: requestHeaders,
          body: requestData,
        });
      }
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("❌ Error Response:", errorMessage);
        throw new Error(`Failed to submit question: ${errorMessage}`);
      }
  
      alert(isUpdating ? "✅ Question updated successfully!" : "✅ Question added successfully!");
  
      // Refresh the questions list
      await fetchQuestions();
  
      // Reset form
      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("");
      setImageFile(null);
      setImagePreview(null);
      setSelectedQuestion(null);
    } catch (error) {
      console.error("❌ Error submitting question:", error);
      alert("❌ Error adding/updating question. Check the console for details.");
    }
  };
  
  
  // ✅ Handle editing a question
  const handleEditQuestion = (question) => {
    console.log("🟡 Editing Question:", question);
  
    setSelectedQuestion(question);
    setQuestionText(question.question);
    
    // Ensure options update correctly
    setOptionA(question.options?.A || ""); 
    setOptionB(question.options?.B || "");
    setOptionC(question.options?.C || "");
    setOptionD(question.options?.D || "");
  
    setCorrectAnswer(question.correct_answer);
  };
  
  

  // ✅ Handle deleting a question
  const handleDeleteQuestion = async (questionId) => {
    const token = localStorage.getItem("authToken");
    if (!token || !quizId) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/questions/${questionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("❌ Error Response:", errorMessage);
        throw new Error(`Failed to delete question: ${errorMessage}`);
      }

      alert("Question deleted successfully!");
      fetchQuestions();
    } catch (error) {
      console.error("❌ Error deleting question:", error);
      alert("Error deleting question. Check the console for details.");
    }
  };


  const handleSubmitQuiz = () => {
    console.log("📤 Submitting Quiz...");
    navigate("/create-quiz"); // Navigate to create quiz page
  };

  return (
    <div className="add-questions-container">
      <h3>{quizTitle}</h3>
      <div className="add-questions-form">
        <label>Question:</label>
        <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
  
        <label>Option A:</label>
        <input type="text" value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
  
        <label>Option B:</label>
        <input type="text" value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
  
        <label>Option C:</label>
        <input type="text" value={optionC} onChange={(e) => setOptionC(e.target.value)} required />
  
        <label>Option D:</label>
        <input type="text" value={optionD} onChange={(e) => setOptionD(e.target.value)} required />
  
        <label>Correct Answer:</label>
        <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required>
          <option value="">Select correct answer</option>
          <option value="A">Option A</option>
          <option value="B">Option B</option>
          <option value="C">Option C</option>
          <option value="D">Option D</option>
        </select>
  
        <label>Upload Image (Optional):</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
  
        <button className="button-primary" onClick={handleSubmitQuestion}>
          {selectedQuestion ? "Update Question" : "Add Question"}
        </button>
  
        {/* Display Submitted Questions */}
        <div className="submitted-questions">
          <h4>Submitted Questions:</h4>
          {loading ? (
            <p>Loading questions...</p>
          ) : submittedQuestions.length === 0 ? (
            <p>No questions added yet.</p>
          ) : (
            <ul>
              {submittedQuestions.map((question) => (
                <li key={question.id} className="submitted-question-item">
                  <div>
                    <strong>Question:</strong> {question.question}
                  </div>
                  <div>
                    <strong>Options:</strong> A: {question.options.A}, B: {question.options.B}, C: {question.options.C}, D: {question.options.D}
                  </div>
                  <div>
                    <strong>Correct Answer:</strong> {question.correct_answer}
                  </div>
                  {question.image && (
                    <div>
                      <strong>Image:</strong> <img src={question.image} alt="Question" />
                    </div>
                  )}
                  <button className="button-secondary" onClick={() => handleEditQuestion(question)}>Edit</button>
                  <button className="button-secondary" onClick={() => handleDeleteQuestion(question.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
  
        <button className="button-primary" onClick={handleSubmitQuiz}>
          Submit Quiz
        </button>
      </div>
    </div>
  );
  
};

export default AddQuestionsForm;