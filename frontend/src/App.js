import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DiagnosisInput from './components/DiagnosisInput';
import DiagnosisHistory from './components/DiagnosisHistory';
import HealthTracker from './components/HealthTracker';
import HealthGraphs from './components/HealthGraphs';
import Consultation from './components/Consultation';
import MiniChatbot from './components/MiniChatbot';

function App() {
  const [page, setPage] = useState('login');
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('');

  const handleLogin = (id, name) => {
    setPatientId(id);
    setPatientName(name);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setPatientId(null);
    setPage('login');
  };

  return (
    <div>
      <nav className="navbar">
      <span className="brand">
  <img
    src="https://www.tataaia.com/content/dam/tataaialifeinsurancecompanylimited/healthwealth/demop.png"
    alt="Health Buddy logo"
    className="brand-logo"
  />
  Health Buddy
</span>



        <div className="nav-links" style={{gap: '0.3rem'}}>
          {patientId && (
          <div className="nav-links">
            <button onClick={() => setPage('dashboard')}>📊 Dashboard</button>
            <button onClick={() => setPage('diagnosis')}>🔬 New Diagnosis</button>
            <button onClick={() => setPage('diagnosis-history')}>📋 Diagnosis History</button>
            <button onClick={() => setPage('health-tracker')}>📈 Track Health</button>
            <button onClick={() => setPage('graphs')}>📉 Health Graphs</button>
            <button onClick={() => setPage('consultation')}>👨‍⚕️ Doctor Consultation</button>
            <button onClick={handleLogout}>🚪 Logout</button>
          </div>
          )}
          <button onClick={() => setPage('chatbot')} className="ask-veda-btn">
  <img
    src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?semt=ais_se_enriched&w=740&q=80"
    alt="AI robot"
    className="ask-veda-icon"
  />
   Ask Veda
</button>

        </div>
        {patientId && <span className="patient-name">👤 {patientName}</span>}
      </nav>
      <div className="container">
        {!patientId && page === 'login' && <Login onLogin={handleLogin} onSwitch={() => setPage('register')} />}
        {!patientId && page === 'register' && <Register onRegister={() => setPage('login')} />}
        {patientId && page === 'dashboard' && <Dashboard patientId={patientId} patientName={patientName} />}
        {patientId && page === 'diagnosis' && <DiagnosisInput patientId={patientId} />}
        {patientId && page === 'diagnosis-history' && <DiagnosisHistory patientId={patientId} />}
        {patientId && page === 'health-tracker' && <HealthTracker patientId={patientId} />}
        {patientId && page === 'graphs' && <HealthGraphs patientId={patientId} />}
        {patientId && page === 'consultation' && <Consultation patientId={patientId} />}
        {page === 'chatbot' && <MiniChatbot />}
      </div>
    </div>
  );
}

export default App;
