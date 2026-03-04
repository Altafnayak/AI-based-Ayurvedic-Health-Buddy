import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard({ patientId, patientName }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/dashboard/${patientId}`).then(res => setData(res.data));
  }, [patientId]);

  if (!data) return <div style={{textAlign: 'center', padding: '2rem'}}>Loading...</div>;

  const health = data.latest_health;

  return (
    <div>
      <h2>📊 Dashboard - {patientName}</h2>
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-value">❤️ {health.heart_rate || '--'}</div>
          <div className="stat-label">Heart Rate (BPM)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🩸 {health.blood_pressure || '--'}</div>
          <div className="stat-label">Blood Pressure</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🌡️ {health.temperature || '--'}°C</div>
          <div className="stat-label">Temperature</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🧠 {health.mental_health || '--'}%</div>
          <div className="stat-label">Mental Health</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🔬 {data.total_diagnoses}</div>
          <div className="stat-label">Total Diagnoses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">👨‍⚕️ {data.total_consultations}</div>
          <div className="stat-label">Doctor Visits</div>
        </div>
      </div>
    </div>
  );
}
