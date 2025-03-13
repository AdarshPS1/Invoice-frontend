import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(''); // For displaying error messages
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('https://api-innoice.onrender.com/api/auth/login', formData);
      console.log('Login response:', res); // Debugging
  
      const { token, role } = res.data;
      if (token && role) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role); // Store role for fetching payments later
        console.log('Saved token:', localStorage.getItem('token'));
        console.log('Saved role:', localStorage.getItem('role'));
        navigate('/dashboard');
      } else {
        setError('Login failed: Missing token or user data.');
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };
  
  

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>} {/* Display error if any */}

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit">Login</button>
        <p>Don't have an account? <a href="/signup">Sign up</a></p>
      </form>
    </div>
  );
};

export default LoginPage;
