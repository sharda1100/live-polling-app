import React, { useState } from 'react';
import './RoleSelection.css';

function RoleSelection({ onSelect }) {
  const [selected, setSelected] = useState('student');

  return (
    <div className="role-selection-container">
      <div className="poll-badge">✦ Intervue Poll</div>
      <h1>
        Welcome to the <span className="highlight">Live Polling System</span>
      </h1>
      <p className="subtitle">
        Please select the role that best describes you to begin using the live polling system
      </p>
      <div className="role-cards">
        <div
          className={`role-card ${selected === 'student' ? 'selected' : ''}`}
          onClick={() => setSelected('student')}
        >
          <div className="role-title">I’m a Student</div>
          <div className="role-desc">
            Click here to enter your name and participate in the poll.
          </div>
        </div>
        <div
          className={`role-card ${selected === 'teacher' ? 'selected' : ''}`}
          onClick={() => setSelected('teacher')}
        >
          <div className="role-title">I’m a Teacher</div>
          <div className="role-desc">
            Submit answers and view live poll results in real-time.
          </div>
        </div>
      </div>
      <button
        className="continue-btn"
        onClick={() => onSelect(selected)}
      >
        Continue
      </button>
    </div>
  );
}

export default RoleSelection;