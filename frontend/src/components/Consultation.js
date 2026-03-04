import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function Consultation({ patientId }) {
  const [form, setForm] = useState({ doctor_name: '', treatment: '', notes: '' });
  const [consultations, setConsultations] = useState([]);
  const [msg, setMsg] = useState('');

  const fetchConsultations = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/consultation/${patientId}`);
      setConsultations(res.data);
    } catch (err) {
      console.error('Failed to fetch consultations', err);
    }
  }, [patientId]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/consultation', { patient_id: patientId, ...form });
      setMsg('✅ Consultation added!');
      setForm({ doctor_name: '', treatment: '', notes: '' });
      fetchConsultations();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('❌ Error');
    }
  };

  return (
    <div>
      <div className="form-box">
        <h2>👨‍⚕️ Doctor Consultation</h2>
        {msg && <div style={{marginBottom: '1rem', padding: '1rem', background: msg.includes('✅') ? '#d4edda' : '#f8d7da', borderRadius: '6px'}}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Doctor Name *</label>
            <input type="text" value={form.doctor_name} onChange={e => setForm({...form, doctor_name: e.target.value})} placeholder="Dr. Name" required />
          </div>
          <div className="form-group">
            <label>Treatment Recommended *</label>
            <textarea value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <button type="submit">Add Consultation</button>
        </form>
      </div>

      <div className="form-box">
        <h3>📋 Consultation History ({consultations.length})</h3>
        <div className="history-container">
          {consultations.map((c, i) => (
            <div key={i} style={{background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem'}}>
              <p style={{fontSize: '0.9rem', color: '#666'}}>{c.date} {c.time}</p>
              <h4>Dr. {c.doctor_name}</h4>
              <p><strong>Treatment:</strong> {c.treatment}</p>
              {c.notes && <p><strong>Notes:</strong> {c.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
