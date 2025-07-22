import React from 'react';
import socket from './socket';
import './StudentManagement.css';

function StudentManagement({ isVisible, onClose, students }) {
    console.log('StudentManagement received students:', students);

    const kickStudent = (studentSocketId, studentName) => {
        if (window.confirm(`Are you sure you want to kick ${studentName}?`)) {
            socket.emit('kick-student', { socketId: studentSocketId });
        }
    };

    if (!isVisible) return null;

    return (
        <div className="student-management-overlay">
            <div className="student-management-panel">
                <div className="panel-header">
                    <h3>Connected Students ({students.length})</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="students-list">
                    {students.length === 0 ? (
                        <p className="no-students">No students connected</p>
                    ) : (
                        students.map((student) => (
                            <div key={student.socketId} className="student-item">
                                <div className="student-info">
                                    <span className="student-name">{student.name}</span>
                                    <span className="student-time">
                                        Joined: {new Date(student.joinedAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <button 
                                    className="kick-btn"
                                    onClick={() => kickStudent(student.socketId, student.name)}
                                >
                                    Kick
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentManagement;
