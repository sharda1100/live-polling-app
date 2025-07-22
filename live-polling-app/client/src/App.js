import React, { useState, useEffect } from 'react';
import StudentName from './StudentName';
import TeacherPanel from './TeacherPanel';
import StudentPoll from './StudentPoll';
import RoleSelection from './RoleSelection';
import Chat from './Chat';
import KickedOut from './KickedOut';
import socket from './socket';

function App() {
  const [studentName, setStudentName] = useState('');
  const [role, setRole] = useState(null); // null, 'student', or 'teacher'
  const [showChat, setShowChat] = useState(false);
  const [isKickedOut, setIsKickedOut] = useState(false);

  useEffect(() => {
    const name = sessionStorage.getItem('studentName');
    if (name) {
      setStudentName(name);
    }
    
    // Listen for kicked-out event only for students
    if (role === 'student') {
      socket.on('kicked-out', () => {
        setIsKickedOut(true);
        sessionStorage.removeItem('studentName'); // Clear stored name
      });
      
      return () => {
        socket.off('kicked-out');
      };
    }
  }, [role]);

  if (!role) {
    return <RoleSelection onSelect={setRole} />;
  }

  // Show kicked out page for students who have been kicked
  if (role === 'student' && isKickedOut) {
    return <KickedOut />;
  }

  return (
    <div>
      {role === 'teacher' ? (
        <TeacherPanel />
      ) : !studentName ? (
        <StudentName onSetName={setStudentName} />
      ) : (
        <>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 24px',
              background: '#f8f9fa',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Welcome, {studentName}!</p>
              <button 
                onClick={() => setShowChat(true)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                💬 Chat
              </button>
            </div>
            <StudentPoll studentName={studentName} />
            <Chat 
              isVisible={showChat}
              onClose={() => setShowChat(false)}
              userType="student"
              userName={studentName}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;