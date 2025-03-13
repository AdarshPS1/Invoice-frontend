import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      const res = await axios.post('https://api-innoice.onrender.com/api/auth/register', formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Signup successful:', res.data);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token); // Save the token
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        setError('Signup successful, but no token received.');
      }
    } catch (err) {
      console.error('Signup failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign Up</h2>

        {error && <p className="error-message">{error}</p>}

        <label>Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit">Sign Up</button>
        <p>Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
};

export default SignupPage;
