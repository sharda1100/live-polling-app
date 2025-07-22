import React, { useState, useEffect } from 'react';
import socket from './socket';
import './TeacherPanel.css';
import PollResults from './PollResults';
import StudentManagement from './StudentManagement';
import Chat from './Chat';
import PastPolls from './PastPolls';

// Function to create fresh default options (prevents mutation issues)
const createDefaultOptions = () => [
  { text: '', isCorrect: false },
  { text: '', isCorrect: false }
];

function TeacherPanel() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(createDefaultOptions());
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showPastPolls, setShowPastPolls] = useState(false);

  useEffect(() => {
    socket.on('poll-results', (data) => {
      console.log('Teacher received poll-results:', data);
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
    socket.on('poll-reset', () => {
      console.log('Poll reset received in teacher panel');
      setResults(null);
      setError('');
    });
    return () => socket.off('poll-reset');
  }, []);

  useEffect(() => {
    socket.on('students-updated', (students) => {
      console.log('Teacher received students-updated:', students);
      setStudentCount(students.length);
      setStudents(students); // Store the full student list
    });
    
    // Request current student list when component mounts
    socket.emit('request-student-list');
    
    return () => socket.off('students-updated');
  }, []);

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx].text = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (idx, isCorrect) => {
    const newOptions = options.map((opt, i) =>
      i === idx ? { ...opt, isCorrect } : opt
    );
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.text.trim())) {
      setError('Please fill in the question and all options.');
      return;
    }
    setError('');
    socket.emit('create-question', {
      question: question.trim(),
      options,
      timer
    });
    setQuestion('');
    setOptions(createDefaultOptions()); // Use function to create fresh options
  };

  // Show poll results if available
  if (results) {
    return (
      <PollResults
        question={results.question}
        options={results.options}
        answers={results.answers}
        onAskNew={() => {
          // Reset poll state on backend
          socket.emit('reset-poll');
          // Clear the results to show the form
          setResults(null);
          // Reset all form fields to initial state with fresh objects
          setQuestion('');
          setOptions(createDefaultOptions()); // Use function to create completely fresh options
          setTimer(60);
          setError('');
        }}
      />
    );
  }

  return (
    <div className="teacher-panel-container">
      <div className="teacher-header">
        <div className="poll-badge">✦ Intervue Poll</div>
        <div className="teacher-controls">
          <button 
            className="past-polls-btn"
            onClick={() => setShowPastPolls(true)}
          >
            📊 History
          </button>
          <button 
            className="chat-btn"
            onClick={() => setShowChat(true)}
          >
            💬 Chat
          </button>
          <button 
            className="manage-students-btn"
            onClick={() => setShowStudentManagement(true)}
          >
            Students ({studentCount})
          </button>
        </div>
      </div>
      <h1>
        Let's <span className="highlight">Get Started</span>
      </h1>
      <p className="subtitle">
        you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">Enter your question</label>
          <select
            className="timer-select"
            value={timer}
            onChange={e => setTimer(Number(e.target.value))}
          >
            <option value={30}>30 seconds</option>
            <option value={45}>45 seconds</option>
            <option value={60}>1 minute</option>
            <option value={90}>1.5 minutes</option>
            <option value={120}>2 minutes</option>
            <option value={180}>3 minutes</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>
        <textarea
          className="question-input"
          maxLength={100}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your question here"
        />
        <div className="char-count">{question.length}/100</div>
        <div className="options-row">
          <div className="options-col">
            <div className="options-label">Edit Options</div>
            {options.map((opt, idx) => (
              <div className="option-item" key={idx}>
                <span className="option-num">{idx + 1}</span>
                <input
                  className="option-input"
                  value={opt.text}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                />
              </div>
            ))}
            <button type="button" className="add-option-btn" onClick={addOption}>
              + Add More option
            </button>
          </div>
          <div className="correct-col">
            <div className="correct-label">Is it Correct?</div>
            {options.map((opt, idx) => (
              <div className="correct-radio-group" key={idx}>
                <label>
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={opt.isCorrect === true}
                    onChange={() => handleCorrectChange(idx, true)}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={opt.isCorrect === false}
                    onChange={() => handleCorrectChange(idx, false)}
                  />
                  No
                </label>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="ask-btn" type="submit">
          Ask Question
        </button>
      </form>
      <StudentManagement 
        isVisible={showStudentManagement}
        onClose={() => setShowStudentManagement(false)}
        students={students}
      />
      <Chat 
        isVisible={showChat}
        onClose={() => setShowChat(false)}
        userType="teacher"
        userName="Teacher"
      />
      <PastPolls 
        isVisible={showPastPolls}
        onClose={() => setShowPastPolls(false)}
      />
    </div>
  );
}

export default TeacherPanel;