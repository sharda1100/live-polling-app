import { io } from 'socket.io-client';

// Use environment variable for production, fallback to localhost for development
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
console.log('Connecting to socket URL:', SOCKET_URL);

const socket = io(SOCKET_URL, {
  transports: ['polling', 'websocket'], // Polling first, then WebSocket
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  maxReconnectionAttempts: 5,
  withCredentials: true,
  autoConnect: true,
  upgrade: true
});

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

export default socket;
