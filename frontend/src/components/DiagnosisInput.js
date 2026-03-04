import React, { useState } from 'react';
import axios from '../api';

export default function DiagnosisInput({ patientId }) {
  const [symptoms, setSymptoms] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/diagnose', { patient_id: patientId, symptoms });
      setDiagnoses(res.data.diagnoses || []);
      if (res.data && res.data.message && (!res.data.diagnoses || res.data.diagnoses.length===0)) {
        setMsg('⚠️ ' + res.data.message);
      }
      setMsg('✅ Analysis complete!');
      setSymptoms('');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('❌ Error: ' + (err.message || 'Analyzing failed'));
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
              {d.lifestyle && <p><strong>Lifestyle:</strong> {d.lifestyle}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
