import React, { useState, useEffect, useRef } from 'react';
import AlumniSidebar from './AlumniSidebar';
import api from '../../utils/axios';
import './AlumniMessages.css';

const AlumniMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Safely get current user from localStorage
  const getUserFromStorage = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }
      // Fallback: try to get user ID from token
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { _id: payload._id, username: payload.username, email: payload.email };
      }
    } catch (error) {
      console.error('Error getting user from storage:', error);
    }
    return null;
  };
  
  const currentUser = getUserFromStorage();

  useEffect(() => {
    fetchConversations();
    fetchAvailableUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation._id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/api/messages/users');
      setAvailableUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const startConversation = async (user) => {
    try {
      setLoading(true);
      const response = await api.post('/api/messages/conversations', {
        otherUserId: user._id,
        otherUserType: user.userType
      });
      setSelectedConversation(response.data);
      setShowNewChat(false);
      fetchConversations();
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/api/messages/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.post('/api/messages/messages', {
        conversationId: selectedConversation._id,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedConversation._id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!currentUser || !conversation || !conversation.participants) return null;
    return conversation.participants.find(p => p.userId !== currentUser._id);
  };

  return (
    <div className='dashboard-containera' style={{ display: 'flex' }}>
      <AlumniSidebar />
      <div className="dashboard-content">
        <h1 className="dashboard-title">Messages 💬</h1>
        
        <div className="alumni-messages-container">
          <div className="alumni-conversations-list">
            <div className="alumni-conversations-header">
              <h3>Conversations</h3>
              <button 
                className="alumni-new-chat-btn"
                onClick={() => setShowNewChat(!showNewChat)}
              >
                + New
              </button>
            </div>

            {showNewChat && (
              <div className="alumni-new-chat-section">
                <h4>Start conversation with connections</h4>
                <div className="alumni-users-list">
                  {availableUsers.length > 0 ? (
                    availableUsers.map(user => (
                      <div 
                        key={user._id} 
                        className="alumni-user-item"
                        onClick={() => startConversation(user)}
                      >
                        <img 
                          src={user.profilePicture || '/default-avatar.png'} 
                          alt={user.username}
                          className="alumni-user-avatar"
                        />
                        <div className="alumni-user-info">
                          <strong>{user.username}</strong>
                          <p>{user.currentDegree || user.branch || 'Student'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="alumni-no-connections-msg">No connections yet. Connect with students to start messaging!</p>
                  )}
                </div>
              </div>
            )}

            <div className="alumni-conversations-items">
              {conversations.map(conversation => {
                const otherUser = getOtherParticipant(conversation);
                if (!otherUser) return null;
                return (
                  <div 
                    key={conversation._id}
                    className={`alumni-conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <img 
                      src={otherUser?.profilePicture || '/default-avatar.png'} 
                      alt={otherUser?.username}
                      className="alumni-conversation-avatar"
                    />
                    <div className="alumni-conversation-info">
                      <strong>{otherUser?.username}</strong>
                      <p className="alumni-last-message">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="alumni-messages-panel">
            {selectedConversation ? (
              <>
                <div className="alumni-messages-header">
                  <img 
                    src={getOtherParticipant(selectedConversation)?.profilePicture || '/default-avatar.png'} 
                    alt={getOtherParticipant(selectedConversation)?.username}
                    className="alumni-header-avatar"
                  />
                  <h3>{getOtherParticipant(selectedConversation)?.username}</h3>
                </div>

                <div className="alumni-messages-list">
  {messages.map(message => (
                    <div 
                      key={message._id}
                      className={`alumni-message ${currentUser && message.sender.userId === currentUser._id ? 'sent' : 'received'}`}
                    >
                      <div className="alumni-message-content">
                        <p>{message.content}</p>
                        <span className="alumni-message-time">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form className="alumni-message-input" onSubmit={sendMessage}>
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <button type="submit">Send</button>
                </form>
              </>
            ) : (
              <div className="alumni-no-conversation">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniMessages;
