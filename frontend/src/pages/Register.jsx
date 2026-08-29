import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = "http://localhost:8080";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    let errs = {};
    if (!formData.fullName) errs.fullName = 'Please enter your full name';
    if (!formData.phone) errs.phone = 'Please enter your phone number';
    if (!formData.email) errs.email = 'Please enter your email';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      if (data.token) localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Create Account</h2>
        <p style={{ color: '#777', marginBottom: 20 }}>Sign up to start shopping</p>

        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} style={styles.input} />
        {errors.fullName && <span style={styles.error}>{errors.fullName}</span>}

        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} style={styles.input} />
        {errors.phone && <span style={styles.error}>{errors.phone}</span>}

        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} style={styles.input} />
        {errors.email && <span style={styles.error}>{errors.email}</span>}

        <input type="password" name="password" placeholder="Password (min 6 characters)" value={formData.password} onChange={handleChange} style={styles.input} />
        {errors.password && <span style={styles.error}>{errors.password}</span>}

        {errors.submit && <span style={{ ...styles.error, marginBottom: 10, display: 'block' }}>{errors.submit}</span>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        <p style={{ marginTop: 15, fontSize: 14 }}>Already have an account? <Link to="/" style={{ color: '#8a6242', fontWeight: 'bold' }}>Login</Link></p>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f2ef' },
  form: { padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', width: '350px', textAlign: 'center', backgroundColor: '#fff' },
  input: { width: '100%', padding: '12px', marginTop: '10px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  button: { width: '100%', padding: '12px', marginTop: '15px', backgroundColor: '#8a6242', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  error: { color: '#b42318', fontSize: '12px', display: 'block', textAlign: 'left' }
};

export default Register;
