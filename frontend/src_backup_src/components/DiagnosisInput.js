import React, { useState } from 'react';
import axios from 'axios';

export default function DiagnosisInput({ patientId }) {
  const [symptoms, setSymptoms] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/diagnose', { patient_id: patientId, symptoms });
      setDiagnoses(res.data.diagnoses);
      setMsg('✅ Analysis complete!');
      setSymptoms('');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('❌ Error analyzing');
    }
    setLoading(false);
  };

  return (
    <div className="form-box">
      <h2>🔬 New Diagnosis - Enter Symptoms</h2>
      {msg && <div style={{marginBottom: '1rem', padding: '1rem', background: msg.includes('✅') ? '#d4edda' : '#f8d7da', borderRadius: '6px'}}>{msg}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Describe Your Symptoms *</label>
          <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g., headache, fever, cold, cough" required />
        </div>
        <button type="submit" disabled={loading} style={{width: '100%'}}>{loading ? 'Analyzing...' : 'Get Diagnosis'}</button>
      </form>

      {diagnoses.length > 0 && (
        <div style={{marginTop: '2rem'}}>
          <h3>📋 Top Diagnoses Found:</h3>
          {diagnoses.map((d, i) => (
            <div key={i} className="diagnosis-card">
              <h4>{i+1}. {d.disease} <span className="confidence">{d.confidence}% match</span></h4>
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
