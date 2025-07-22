import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://polling-app-backend-mu.vercel.app/');

function TestSocket() {
  useEffect(() => {
    // Send a test message to server
    socket.emit('test-message', { message: 'Hello from client!' });

    // Listen for reply from server
    socket.on('test-reply', (data) => {
      alert('Received from server: ' + data.message);
    });

    // Cleanup on unmount
    return () => {
      socket.off('test-reply');
    };
  }, []);

  return <div>Socket.IO Test Component</div>;
}

export default TestSocket;