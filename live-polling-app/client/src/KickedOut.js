import React from 'react';
import './KickedOut.css';

function KickedOut() {
  return (
    <div className="kicked-out-container">
      <div className="poll-badge">✦ Intervue Poll</div>
      <div className="kicked-out-content">
        <h1 className="kicked-out-title">You've been Kicked out !</h1>
        <p className="kicked-out-message">
          Looks like the teacher had removed you from the poll system. Please Try again sometime.
        </p>
      </div>
    </div>
  );
}

export default KickedOut;
