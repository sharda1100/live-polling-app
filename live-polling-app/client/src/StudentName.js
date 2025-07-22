import React, { useState } from 'react';
import socket from './socket';
import './StudentName.css';

function StudentName({ onSetName }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Please enter a valid name.');
      return;
    }
    // Register student with backend
    socket.emit('register-student', { name: name.trim() });
    sessionStorage.setItem('studentName', name.trim());
    onSetName(name.trim());
  };

  return (
    <div className="student-name-container">
      <div className="poll-badge">✦ Intervue Poll</div>
      <h2>Enter Your Name</h2>
      <p className="subtitle">Please enter your name to join the poll as a student.</p>
      <form className="student-name-form" onSubmit={handleSubmit}>
        <input
          className="student-name-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        {error && <div className="error-msg">{error}</div>}
        <button className="continue-btn" type="submit">
          Continue
        </button>
      </form>
    </div>
  );
}

export default StudentName;