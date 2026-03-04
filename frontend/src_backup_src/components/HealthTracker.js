import React, { useState } from 'react';
import axios from 'axios';

export default function HealthTracker({ patientId }) {
  const [form, setForm] = useState({ heart_rate: '', blood_pressure: '', mental_health: '', sleep_hours: '', exercise_mins: '', weight: '', temperature: '' });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/health-track', { patient_id: patientId, ...form });
      setMsg('✅ Health data saved!');
      setForm({ heart_rate: '', blood_pressure: '', mental_health: '', sleep_hours: '', exercise_mins: '', weight: '', temperature: '' });
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('❌ Error');
    }
  };

  return (
    <div className="form-box">
      <h2>📈 Track Daily Health</h2>
      {msg && <div style={{marginBottom: '1rem', padding: '1rem', background: msg.includes('✅') ? '#d4edda' : '#f8d7da', borderRadius: '6px'}}>{msg}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
          <div className="form-group">
            <label>Heart Rate (BPM)</label>
            <input type="number" value={form.heart_rate} onChange={e => setForm({...form, heart_rate: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Blood Pressure</label>
            <input type="text" value={form.blood_pressure} onChange={e => setForm({...form, blood_pressure: e.target.value})} placeholder="120/80" required />
          </div>
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input type="number" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} step="0.1" required />
          </div>
          <div className="form-group">
            <label>Mental Health (0-100)</label>
            <input type="number" value={form.mental_health} onChange={e => setForm({...form, mental_health: e.target.value})} min="0" max="100" required />
          </div>
          <div className="form-group">
            <label>Sleep Hours</label>
            <input type="number" value={form.sleep_hours} onChange={e => setForm({...form, sleep_hours: e.target.value})} step="0.5" required />
          </div>
          <div className="form-group">
            <label>Exercise (mins)</label>
            <input type="number" value={form.exercise_mins} onChange={e => setForm({...form, exercise_mins: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Weight (kg)</label>
            <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} step="0.5" required />
          </div>
        </div>
        <button type="submit" style={{width: '100%', marginTop: '1rem'}}>Save Health Data</button>
      </form>
    </div>
  );
}
