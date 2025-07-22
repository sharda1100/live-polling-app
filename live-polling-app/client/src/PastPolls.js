import React, { useState, useEffect } from 'react';
import socket from './socket';
import './PastPolls.css';

function PastPolls({ isVisible, onClose }) {
    const [pastPolls, setPastPolls] = useState([]);
    const [selectedPoll, setSelectedPoll] = useState(null);

    useEffect(() => {
        if (isVisible) {
            // Request past polls when component becomes visible
            socket.emit('request-past-polls');
        }
    }, [isVisible]);

    useEffect(() => {
        socket.on('past-polls-history', (polls) => {
            setPastPolls(polls);
        });

        return () => {
            socket.off('past-polls-history');
        };
    }, []);

    const calculateResults = (poll) => {
        const optionCounts = {};
        poll.options.forEach(option => {
            optionCounts[option.text] = 0;
        });

        poll.answers.forEach(answer => {
            if (optionCounts.hasOwnProperty(answer)) {
                optionCounts[answer]++;
            }
        });

        return optionCounts;
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getCorrectAnswers = (poll) => {
        return poll.options.filter(opt => opt.isCorrect).map(opt => opt.text);
    };

    if (!isVisible) return null;

    return (
        <div className="past-polls-overlay">
            <div className="past-polls-container">
                <div className="past-polls-header">
                    <h3>📊 Past Poll Results</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {selectedPoll ? (
                    // Detailed view of a specific poll
                    <div className="poll-detail-view">
                        <button 
                            className="back-btn"
                            onClick={() => setSelectedPoll(null)}
                        >
                            ← Back to List
                        </button>
                        
                        <div className="poll-detail-content">
                            <h4>{selectedPoll.question}</h4>
                            <p className="poll-meta">
                                Ended: {formatDate(selectedPoll.endedAt)} | 
                                Responses: {selectedPoll.totalResponses}
                                {selectedPoll.manuallyEnded && ' (Manually ended)'}
                            </p>

                            <div className="correct-answers">
                                <strong>Correct Answer(s): </strong>
                                {getCorrectAnswers(selectedPoll).join(', ') || 'None specified'}
                            </div>

                            <div className="results-breakdown">
                                {Object.entries(calculateResults(selectedPoll)).map(([option, count]) => {
                                    const percentage = selectedPoll.totalResponses > 0 
                                        ? ((count / selectedPoll.totalResponses) * 100).toFixed(1)
                                        : 0;
                                    const isCorrect = getCorrectAnswers(selectedPoll).includes(option);
                                    
                                    return (
                                        <div key={option} className={`result-bar ${isCorrect ? 'correct' : ''}`}>
                                            <div className="result-label">
                                                {option} {isCorrect && '✓'}
                                            </div>
                                            <div className="result-stats">
                                                <div 
                                                    className="result-fill"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                                <span className="result-text">
                                                    {count} ({percentage}%)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    // List view of all past polls
                    <div className="polls-list">
                        {pastPolls.length === 0 ? (
                            <div className="no-polls">
                                <p>No past polls available</p>
                                <p className="subtitle">Poll results will appear here after you conduct polls</p>
                            </div>
                        ) : (
                            <>
                                <div className="polls-count">
                                    {pastPolls.length} poll{pastPolls.length !== 1 ? 's' : ''} in history
                                </div>
                                {pastPolls.map((poll) => (
                                    <div 
                                        key={poll.id} 
                                        className="poll-item"
                                        onClick={() => setSelectedPoll(poll)}
                                    >
                                        <div className="poll-question">{poll.question}</div>
                                        <div className="poll-summary">
                                            <span className="poll-date">{formatDate(poll.endedAt)}</span>
                                            <span className="poll-responses">{poll.totalResponses} responses</span>
                                            {poll.manuallyEnded && <span className="manual-tag">Manual</span>}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PastPolls;
