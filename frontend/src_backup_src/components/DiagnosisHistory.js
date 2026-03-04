import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DiagnosisHistory({ patientId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/diagnosis-history/${patientId}`).then(res => setHistory(res.data));
  }, [patientId]);

  return (
    <div className="form-box">
      <h2>📋 Complete Diagnosis History</h2>
      {history.length === 0 ? (
        <p>No diagnoses yet.</p>
      ) : (
        <div className="history-container">
          {history.map((d, i) => (
            <div key={i} className="diagnosis-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4>{d.disease}</h4>
                <span style={{fontSize: '0.85rem', color: '#666'}}>{d.date} {d.time}</span>
              </div>
              <p><strong>Symptoms:</strong> {d.symptoms}</p>
              <p><strong>Confidence:</strong> <span className="confidence">{d.confidence}%</span></p>
              <p><strong>Remedies:</strong> {d.remedies}</p>
              <p><strong>Medicines:</strong> {d.medicines}</p>
              <p><strong>Duration:</strong> {d.duration}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
