import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/signUp.js";
import Login from './pages/login.js'; 
import LandingPage from './pages/LandingPage';
import TakeQuiz from './pages/TakeQuiz';
import CreateQuiz from './pages/CreateQuiz';
import QuizPage from './pages/QuizPage';
import QuizQuestionPage from './pages/QuizQuestionPage';
import ResultsPage from './pages/ResultsPage.js';
import CreateQuizForm from './pages/CreateQuizForm';
import AddQuestionsForm from './pages/AddQuestionsForm';
import Participants from './pages/Participants.js';
import MyQuizzes from './pages/MyQuizzes'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/take-quiz" element={<TakeQuiz />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />

        {/* Quiz Routes */}
       
        <Route path="/quiz/questions/:questionNumber" element={<QuizQuestionPage />} />
        <Route path="/results/:quizId" element={<ResultsPage />} />
        <Route path="/create-quiz-form" element={<CreateQuizForm />} />
        <Route path="/add-questions/:quizId" element={<AddQuestionsForm />} />
        <Route path="/participants" element={<Participants />} />
        <Route path="/my-quizzes" element={<MyQuizzes />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
