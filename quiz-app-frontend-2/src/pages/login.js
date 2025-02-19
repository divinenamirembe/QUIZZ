import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import "./login.css"; // ✅ Import the CSS file

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log("✅ Login successful! API Response:", data);

      // ✅ Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);

        // ✅ Properly decode JWT to extract `userId` and `name`
        try {
          const base64Url = data.token.split('.')[1]; // Get JWT payload
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const decodedPayload = JSON.parse(atob(base64)); // Decode JWT payload

          console.log("🔹 Decoded Token Payload:", decodedPayload);

          if (decodedPayload.id) {
            localStorage.setItem('userId', decodedPayload.id); // ✅ Store extracted userId
            console.log("✅ userId stored:", decodedPayload.id);
          } else {
            console.warn("⚠️ User ID is missing in the token payload.");
          }

          if (decodedPayload.name) {
            localStorage.setItem('name', decodedPayload.name); // ✅ Store `name`
            console.log("✅ name stored:", decodedPayload.name);
          } else {
            console.warn("⚠️ User name is missing in the token payload.");
          }
        } catch (decodeError) {
          console.error("❌ Error decoding token:", decodeError);
        }
      } else {
        console.warn("⚠️ Token is missing in the response.");
      }

      alert("✅ Login successful! Redirecting...");
      navigate('/landing'); 
    } catch (error) {
      console.error("❌ Login Error:", error);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      {/* ✅ QUIZIT Branding at Top Left */}
      <div className="logo">QUIZIT</div>

      <h2 className="login-header">Login</h2>
      {error && <p className="login-error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-input-container">
          <label className="login-label">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="login-input" 
          />
        </div>
        <div className="login-input-container">
          <label className="login-label">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="login-input" 
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
      <div className="login-signup-container">
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="login-signup-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
