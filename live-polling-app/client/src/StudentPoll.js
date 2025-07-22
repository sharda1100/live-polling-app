import React, { useState, useEffect } from 'react';
import socket from './socket';
import './StudentPoll.css';
import PollResults from './PollResults';

function StudentPoll({ studentName }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [timer, setTimer] = useState(60);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // All useEffect hooks must be at the top level of the component
  useEffect(() => {
    const handleNewQuestion = (data) => {
      console.log('Student received new-question:', data);
      setQuestion(data.question);
      setOptions(data.options || []);
      setTimer(data.timer || 60);
      setSelected(null);
      setSubmitted(false);
      setResults(null);
      setError('');
    };

    console.log('Setting up new-question listener, socket connected:', socket.connected);
    socket.on('new-question', handleNewQuestion);

    return () => {
      socket.off('new-question', handleNewQuestion);
    };
  }, []);

  useEffect(() => {
    socket.on('poll-results', (data) => {
      console.log('Student received poll-results:', data);
      setResults(data);
    });
    return () => socket.off('poll-results');
  }, []);

  useEffect(() => {
    socket.on('poll-ended', (data) => {
      setResults(data);
    });
    return () => socket.off('poll-ended');
  }, []);

  useEffect(() => {
    socket.on('submission-error', (data) => {
      setError(data.message);
    });
    return () => socket.off('submission-error');
  }, []);

  useEffect(() => {
    socket.on('poll-reset', () => {
      console.log('Poll reset received');
      setQuestion('');
      setOptions([]);
      setTimer(60);
      setSelected(null);
      setSubmitted(false);
      setResults(null);
      setError('');
    });
    return () => socket.off('poll-reset');
  }, []);

  useEffect(() => {
    socket.on('clear-results', () => {
      console.log('Clear results received - clearing poll results');
      setResults(null);
    });
    return () => socket.off('clear-results');
  }, []);

  // Add a test effect to check socket events
  useEffect(() => {
    const testHandler = () => {
      console.log('Socket connected successfully');
    };
    
    const testBroadcastHandler = (data) => {
      console.log('Test broadcast received:', data);
    };
    
    socket.on('connect', testHandler);
    socket.on('test-broadcast', testBroadcastHandler);
    
    // Test if socket is working by emitting a test event
    if (socket.connected) {
      console.log('Socket is connected, testing...');
    }
    
    return () => {
      socket.off('connect', testHandler);
      socket.off('test-broadcast', testBroadcastHandler);
    };
  }, []);

  useEffect(() => {
    if (!question || submitted) return;
    if (timer === 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [timer, question, submitted]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (selected === null) return;
    socket.emit('submit-answer', {
      answer: options[selected]?.text,
      studentName
    });
    setSubmitted(true);
  };

  console.log('StudentPoll state:', { question, options, submitted, results, error });

  // Show poll results if available (check first)
  if (results) {
    console.log('Student showing results:', results);
    return (
      <PollResults
        question={results.question}
        options={results.options}
        answers={results.answers}
      />
    );
  }

  // Waiting screen (already handled in previous steps)
  if (!question) {
    return (
      <div className="student-waiting-container">
        <div className="poll-badge">✦ Intervue Poll</div>
        <div className="waiting-loader">
          <svg width="60" height="60" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#6C3DF4"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
              transform="rotate(-90 25 25)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
        <div className="waiting-message">
          Wait for the teacher to ask questions..
        </div>
      </div>
    );
  }

  // Poll question panel
  if (!submitted) {
    return (
      <div className="student-poll-panel">
        <div className="poll-badge">✦ Intervue Poll</div>
        <div className="poll-header">
          <div className="poll-timer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#6C3DF4" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="#6C3DF4" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{timer}s</span>
          </div>
        </div>
        <div className="poll-question">{question}</div>
        <form className="poll-options-form" onSubmit={handleSubmit}>
          <div className="poll-options-list">
            {options.map((opt, idx) => (
              <label
                key={idx}
                className={`poll-option ${selected === idx ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="poll-option"
                  checked={selected === idx}
                  onChange={() => setSelected(idx)}
                />
                <span className="custom-radio"></span>
                {opt.text}
              </label>
            ))}
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button
            className="submit-btn"
            type="submit"
            disabled={selected === null}
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  // After submission (can be customized for results)
  return (
    <div className="student-poll-container">
      <div className="submitted-title">Answer Submitted!</div>
      <div className="submitted-desc">Waiting for poll results...</div>
    </div>
  );
}

export default StudentPoll;