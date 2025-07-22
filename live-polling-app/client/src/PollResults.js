import React from 'react';
import './PollResults.css';

function PollResults({ question, options, answers, onAskNew }) {
  console.log('PollResults received:', { question, options, answers });
  
  // Ensure we have valid data
  if (!question || !options || !answers) {
    return <div>Loading results...</div>;
  }
  
  // Count votes for each option
  const counts = options.map(opt =>
    answers.filter(ans => ans === opt.text).length
  );
  const total = answers.length || 1;

  return (
    <div className="poll-results-panel">
      <div className="results-title">Question</div>
      <div className="results-question">{question}</div>
      <div className="results-options">
        {options.map((opt, idx) => {
          const percent = Math.round((counts[idx] / total) * 100);
          return (
            <div className="results-option-row" key={idx}>
              <div className="results-option-label">
                <span className="results-option-num">{idx + 1}</span>
                {opt.text}
              </div>
              <div className="results-bar-bg">
                <div
                  className="results-bar-fill"
                  style={{ width: `${percent}%` }}
                ></div>
                <span className="results-percent">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
      {onAskNew && (
        <button className="ask-new-btn" onClick={onAskNew}>
          + Ask a new question
        </button>
      )}
    </div>
  );
}

export default PollResults;