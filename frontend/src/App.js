import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './index.css';

const API_URL = 'http://localhost:8000/analyze';

const App = () => {
  const [input, setInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState({ type: '', text: '' });

  const normalizedSymptoms = useMemo(
    () => symptoms.map((s) => s.toLowerCase().trim()),
    [symptoms]
  );

  const addSymptom = () => {
    const value = input.trim();
    if (!value) {
      setUiMessage({ type: 'warning', text: 'Please enter a symptom first.' });
      return;
    }

    if (normalizedSymptoms.includes(value.toLowerCase())) {
      setUiMessage({ type: 'warning', text: 'This symptom is already added.' });
      setInput('');
      return;
    }

    setSymptoms((prev) => [...prev, value]);
    setInput('');
    setUiMessage({ type: 'success', text: 'Symptom added successfully.' });
  };

  const removeSymptom = (index) => {
    setSymptoms((prev) => prev.filter((_, i) => i !== index));
    setUiMessage({ type: '', text: '' });
  };

  const clearAll = () => {
    setInput('');
    setSymptoms([]);
    setResults([]);
    setUiMessage({ type: '', text: '' });
  };

  const analyzeHealth = async () => {
    if (symptoms.length === 0) {
      setUiMessage({ type: 'warning', text: 'Please add at least one symptom before analysis.' });
      return;
    }

    setLoading(true);
    setUiMessage({ type: 'info', text: 'Analyzing symptoms...' });

    try {
      const res = await axios.post(API_URL, { symptoms });
      const apiResults = res?.data?.results || [];
      setResults(apiResults);
      setUiMessage({ type: 'success', text: 'Analysis completed successfully.' });
    } catch (err) {
      console.error(err);
      setUiMessage({
        type: 'error',
        text: 'Could not connect to backend. Make sure FastAPI is running on port 8000.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="header"
      >
        <h1 className="title">
          RareDisease <span>AI</span>
        </h1>
        <p className="subtitle">Early detection through precision analysis.</p>
      </motion.div>

      <div className="container">
        <div className="card">
          <div className="input-row">
            <input
              className="input"
              placeholder="Enter symptom (e.g. tremors)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
            />
            <button onClick={addSymptom} className="add-btn" type="button">
              Add
            </button>
          </div>

          <AnimatePresence>
            {uiMessage.text && (
              <motion.div
                key={uiMessage.text}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`message ${uiMessage.type}`}
              >
                {uiMessage.text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="tags">
            {symptoms.length === 0 ? (
              <div className="empty-state">No symptoms added yet.</div>
            ) : (
              symptoms.map((s, i) => (
                <motion.div
                  key={`${s}-${i}`}
                  className="tag"
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {s}
                  <button onClick={() => removeSymptom(i)} type="button" aria-label="Remove symptom">
                    ×
                  </button>
                </motion.div>
              ))
            )}
          </div>

          <div className="action-row">
            <button onClick={analyzeHealth} disabled={loading} className="run-btn" type="button">
              {loading ? 'Analyzing Data...' : 'Run Diagnostic'}
            </button>

            <button onClick={clearAll} disabled={loading} className="secondary-btn" type="button">
              Reset
            </button>
          </div>

          <div className="disclaimer">
            This tool is for educational support only and is not a medical diagnosis.
          </div>
        </div>

        <div className="results">
          <AnimatePresence>
            {results.map((res, i) => (
              <motion.div
                key={`${res.disease}-${i}`}
                className="result-card"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="result-top">
                  <div>
                    <h3 className="result-title">{res.disease}</h3>
                    <div className="result-probability">Probability: {res.probability}%</div>
                  </div>
                  <div className="badge">MATCH</div>
                </div>

                <div className="info-grid">
                  <div className="info-box">
                    <div className="info-label">Recommended Specialist</div>
                    <div className="info-value">{res.specialist || '—'}</div>
                  </div>

                  <div className="info-box">
                    <div className="info-label">Next Recommended Test</div>
                    <div className="info-value">{res.next_test || '—'}</div>
                  </div>
                </div>

                <div className="explanation-box">
                  <strong>Why AI thinks this: </strong>
                  {res.explanation}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;