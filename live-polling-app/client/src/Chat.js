import React, { useState, useEffect, useRef } from 'react';
import socket from './socket';
import './Chat.css';

function Chat({ isVisible, onClose, userType, userName }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'participants'
    const [participants, setParticipants] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isVisible) {
            // Request chat history when chat opens
            socket.emit('request-chat-history');
            // Request participants list
            socket.emit('request-student-list');
        }
    }, [isVisible]);

    useEffect(() => {
        socket.on('chat-history', (history) => {
            setMessages(history);
        });

        socket.on('chat-message-received', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('students-updated', (students) => {
            // Only show students in participants list, not teacher
            const allParticipants = students.map(student => ({ ...student, type: 'student' }));
            setParticipants(allParticipants);
        });

        return () => {
            socket.off('chat-history');
            socket.off('chat-message-received');
            socket.off('students-updated');
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            socket.emit('send-chat-message', {
                sender: userName,
                senderType: userType,
                message: newMessage.trim()
            });
            setNewMessage('');
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isVisible) return null;

    return (
        <div className="chat-overlay">
            <div className="chat-container">
                <div className="chat-header">
                    <h3>💬 Live Chat</h3>
                    <button className="chat-close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="chat-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Chat
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('participants')}
                    >
                        Participants
                    </button>
                </div>

                {activeTab === 'chat' ? (
                    <>
                        <div className="chat-messages">
                            {messages.length === 0 ? (
                                <div className="no-messages">No messages yet. Start the conversation!</div>
                            ) : (
                                messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`message ${msg.senderType === userType && msg.sender === userName ? 'own-message' : ''}`}
                                    >
                                        <div className="message-header">
                                            <span className={`sender ${msg.senderType}`}>
                                                {msg.senderType === 'teacher' ? '👩‍🏫' : '👨‍🎓'} {msg.sender}
                                            </span>
                                            <span className="timestamp">{formatTime(msg.timestamp)}</span>
                                        </div>
                                        <div className="message-content">{msg.message}</div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="chat-input"
                                autoComplete="off"
                                maxLength={500}
                            />
                            <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="participants-list">
                        <div className="participants-header">
                            <span className="participants-count">{participants.length} Students</span>
                        </div>
                        <div className="participants-content">
                            {participants.map((participant) => (
                                <div key={participant.socketId} className="participant-item">
                                    <div className="participant-info">
                                        <span className="participant-icon">
                                            {participant.type === 'teacher' ? '👩‍🏫' : '👨‍🎓'}
                                        </span>
                                        <span className="participant-name">{participant.name}</span>
                                        {participant.type === 'teacher' && (
                                            <span className="teacher-badge">Teacher</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
