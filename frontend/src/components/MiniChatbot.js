import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function MiniChatbot() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [msg, setMsg] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const speakText = (text, lang = 'en-US') => {
    const synth = synthRef.current;
    if (!synth) return;
    try {
      if (synth.speaking) synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 1;
      utter.pitch = 1;
      synth.speak(utter);
    } catch (e) {
      console.warn('Speech synthesis failed', e);
    }
  };

  const stopSpeaking = () => {
    const synth = synthRef.current;
    if (synth && synth.speaking) synth.cancel();
  };

  const send = async (e) => {
    e && e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setResults([]);
    setMsg('');
    try {
      const res = await axios.post('http://localhost:5000/api/chat', { message: input });
      if (res.data.matches && res.data.matches.length) {
        setResults(res.data.matches);
        if (autoSpeak) {
          const lines = res.data.matches.map(m => `${m.symptom}. Remedy: ${m.remedy_en}`);
          speakText(lines.join('. \n'));
        }
      } else {
        const fallback = res.data.message || 'No matches found';
        setMsg(fallback);
        if (autoSpeak) speakText(fallback);
      }
    } catch (err) {
      const eMsg = err.response?.data?.error || 'Server error';
      setMsg(eMsg);
      if (autoSpeak) speakText(eMsg);
    }
    setLoading(false);
  };

  return (
    <div className="form-box" style={{maxWidth: 800, margin: '2rem auto'}}>
      <h2>🗣️ Ask Veda </h2>
      <form onSubmit={send} style={{display: 'flex', gap: '0.5rem'}}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Describe your symptoms (e.g., cough, fever)" style={{flex: 1, padding: '0.8rem'}} />
        <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Ask'}</button>
      </form>

      <div style={{marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
        <label style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
          <input type="checkbox" checked={autoSpeak} onChange={e => setAutoSpeak(e.target.checked)} />
          <span>Speak replies</span>
        </label>
        <button onClick={() => stopSpeaking()} style={{marginLeft: 'auto'}}>🔇 Stop</button>
      </div>

      {msg && <div style={{marginTop: '1rem', padding: '0.8rem', background: '#fff3cd', borderRadius: 6}}>{msg}</div>}

      {results.length > 0 && (
        <div style={{marginTop: '1rem'}}>
          <h3>Possible Matches</h3>
          {results.map((r, i) => (
            <div key={i} className="diagnosis-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4 style={{textTransform: 'capitalize'}}>{r.symptom}</h4>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button onClick={() => speakText(`${r.symptom}. Remedy: ${r.remedy_en}`, 'en-US')}>🔊 Speak EN</button>
                  {r.remedy_local && <button onClick={() => speakText(r.remedy_local, 'kn-IN')}>🔊 Speak Local</button>}
                </div>
              </div>
              <p><strong>Remedy (EN):</strong> {r.remedy_en}</p>
              <p><strong>Remedy (Local):</strong> {r.remedy_local}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
