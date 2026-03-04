import React, { useState } from 'react';
import axios from 'axios';

export default function Register({ onRegister }) {
  const [form, setForm] = useState({ name: '', age: '', gender: '', email: '' });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/patient/register', form);
      setMsg('✅ Registered! Redirecting...');
      setTimeout(onRegister, 1500);
    } catch (err) {
      setMsg('❌ Error');
    }
  };

  return (
    <div className="form-box" style={{maxWidth: '500px', margin: '2rem auto'}}>
      <h2>Register New Patient</h2>
      {msg && <div style={{marginBottom: '1rem', padding: '1rem', background: msg.includes('✅') ? '#d4edda' : '#f8d7da', borderRadius: '6px'}}>{msg}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Age *</label>
          <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Gender *</label>
          <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} required>
            <option>Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <button type="submit" style={{width: '100%'}}>Register</button>
      </form>
    </div>
  );
}
