import React from "react";
import { Link } from "react-router-dom";
import "./landing.css"; // ✅ Import the CSS file

const LandingPage = () => {
  return (
    <div className="landing-container">
      <h1 className="landing-header">WELCOME TO QUIZIT!</h1>
      <p className="landing-paragraph">
        Your ultimate destination for fun, knowledge, and challenges. Get ready
        to explore a wide range of categories ranging from general knowledge to
        niche topics and find quizzes tailored just for you. Sharpen your mind,
        enjoy the thrill, and let the fun begin!
      </p>

      <div className="landing-button-container">
        <Link to="/take-quiz" className="landing-button">
          Take the Quiz
        </Link>
        <Link to="/create-quiz" className="landing-button">
          Create a Quiz
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
