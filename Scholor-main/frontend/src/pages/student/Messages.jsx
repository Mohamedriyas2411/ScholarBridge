import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './SideBar';
import api from '../../utils/axios';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
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

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await api.delete(`/api/messages/messages/${messageId}`);
      fetchMessages(selectedConversation._id);
      fetchConversations();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  const clearAllMessages = async () => {
    if (!window.confirm('Are you sure you want to clear all messages in this conversation?')) return;
    
    try {
      await api.delete(`/api/messages/conversations/${selectedConversation._id}/messages`);
      fetchMessages(selectedConversation._id);
      fetchConversations();
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Error clearing messages');
    }
  };

  const deleteConversation = async () => {
    if (!window.confirm('Are you sure you want to delete this entire conversation?')) return;
    
    try {
      await api.delete(`/api/messages/conversations/${selectedConversation._id}`);
      setSelectedConversation(null);
      setMessages([]);
      fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error deleting conversation');
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!currentUser || !conversation || !conversation.participants) return null;
    return conversation.participants.find(p => p.userId !== currentUser._id);
  };

  return (
    <div className='dash' style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content">
        <h1>Messages 💬</h1>
        
        <div className="messages-container">
          <div className="conversations-list">
            <div className="conversations-header">
              <h3>Conversations</h3>
              <button 
                className="new-chat-btn"
                onClick={() => setShowNewChat(!showNewChat)}
              >
                + New
              </button>
            </div>

            {showNewChat && (
              <div className="new-chat-section">
                <h4>Start conversation with connections</h4>
                <div className="users-list">
                  {availableUsers.length > 0 ? (
                    availableUsers.map(user => (
                      <div 
                        key={user._id} 
                        className="user-item"
                        onClick={() => startConversation(user)}
                      >
                        <img 
                          src={user.profilePicture || '/default-avatar.png'} 
                          alt={user.username}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <strong>{user.username}</strong>
                          <p>{user.company || user.designation || 'Alumni'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-connections-msg">No connections yet. Connect with alumni to start messaging!</p>
                  )}
                </div>
              </div>
            )}

            <div className="conversations-items">
              {conversations.map(conversation => {
                const otherUser = getOtherParticipant(conversation);
                if (!otherUser) return null;
                return (
                  <div 
                    key={conversation._id}
                    className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <img 
                      src={otherUser?.profilePicture || '/default-avatar.png'} 
                      alt={otherUser?.username}
                      className="conversation-avatar"
                    />
                    <div className="conversation-info">
                      <strong>{otherUser?.username}</strong>
                      <p className="last-message">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="messages-panel">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  <div className="header-user-info">
                    <img 
                      src={getOtherParticipant(selectedConversation)?.profilePicture || '/default-avatar.png'} 
                      alt={getOtherParticipant(selectedConversation)?.username}
                      className="header-avatar"
                    />
                    <h3>{getOtherParticipant(selectedConversation)?.username}</h3>
                  </div>
                  <div className="header-actions">
                    <button 
                      className="options-btn"
                      onClick={() => setShowOptions(!showOptions)}
                    >
                      ⋮
                    </button>
                    {showOptions && (
                      <div className="options-menu">
                        <button onClick={clearAllMessages}>Clear All Messages</button>
                        <button onClick={deleteConversation} className="delete-option">Delete Conversation</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="messages-list">
                  {messages.map(message => (
                    <div 
                      key={message._id}
                      className={`message ${currentUser && message.sender.userId === currentUser._id ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{message.content}</p>
                        <div className="message-footer">
                          <span className="message-time">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {currentUser && message.sender.userId === currentUser._id && (
                            <button 
                              className="delete-message-btn"
                              onClick={() => deleteMessage(message._id)}
                              title="Delete message"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form className="message-input" onSubmit={sendMessage}>
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
              <div className="no-conversation">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
