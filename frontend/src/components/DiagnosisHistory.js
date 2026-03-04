import React, { useEffect, useState } from 'react';
import axios from '../api';

export default function DiagnosisHistory({ patientId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/diagnosis-history/${patientId}`).then(res => setHistory(res.data));
  }, [patientId]);

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this diagnosis?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/diagnosis/${id}`);
      setHistory(history.filter(h => h.id !== id));
    } catch (err) {
      alert('Error removing diagnosis');
    }
  }

  return (
    <div className="form-box">
      <h2>📋 Complete Diagnosis History</h2>
      {history.length === 0 ? (
        <p>No diagnoses yet.</p>
      ) : (
        <div className="history-container">
          {history.map((d, i) => (
            <div key={d.id || i} className="diagnosis-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4>{d.disease}</h4>
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                  <span style={{fontSize: '0.85rem', color: '#666'}}>{d.date} {d.time}</span>
                  <button onClick={() => handleRemove(d.id)} style={{background:'#ff6b6b', color:'#fff', border:'none', padding:'6px 8px', borderRadius:4, cursor:'pointer'}}>Remove</button>
                </div>
              </div>
              <p><strong>Symptoms:</strong> {d.symptoms}</p>
              <p><strong>Confidence:</strong> <span className="confidence">{d.confidence}%</span></p>
              <p><strong>Remedies:</strong> {d.remedies}</p>
              <p><strong>Medicines:</strong> {d.medicines}</p>
              {d.lifestyle && <p><strong>Lifestyle:</strong> {d.lifestyle}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
