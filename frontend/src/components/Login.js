import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin, onSwitch }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/patient/login', { name });
      onLogin(res.data.id, res.data.name);
    } catch (err) {
      setError('Patient not found. Please register first.');
    }
  };

  return (
    <div className="form-box" style={{maxWidth: '400px', margin: '3rem auto'}}>
      <h2>👤 Patient Login</h2>
      {error && <div style={{color: 'red', marginBottom: '1rem', background: '#ffebee', padding: '1rem', borderRadius: '6px'}}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Enter Your Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., John Smith" required />
        </div>
        <button type="submit" style={{width: '100%'}}>Login</button>
      </form>
      <p style={{marginTop: '1rem', textAlign: 'center'}}>
        New user? <button onClick={onSwitch} style={{background: 'none', color: '#7d6aec', textDecoration: 'underline', padding: 0}}>Register here</button>
      </p>
    </div>
  );
}
