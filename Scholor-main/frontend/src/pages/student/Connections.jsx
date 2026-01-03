import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './SideBar';
import api from '../../utils/axios';
import './Connections.css';

const Connections = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSuggestions(),
        fetchPendingRequests(),
        fetchSentRequests(),
        fetchConnections()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/api/student/list');
      const allAlumni = response.data;
      
      // Get connection statuses for all alumni
      const statuses = {};
      for (const alumni of allAlumni) {
        try {
          const statusResponse = await api.get(`/api/connections/status/${alumni._id}`);
          statuses[alumni._id] = statusResponse.data;
        } catch (error) {
          console.error('Error fetching status:', error);
        }
      }
      setConnectionStatuses(statuses);
      
      // Filter out already connected or pending users
      const filtered = allAlumni.filter(alumni => {
        const status = statuses[alumni._id];
        return !status || status.status === 'none' || status.status === 'rejected';
      });
      
      setSuggestions(filtered);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/api/connections/pending');
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await api.get('/api/connections/sent');
      setSentRequests(response.data.filter(req => req.status === 'pending'));
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await api.get('/api/connections/connections');
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const sendConnectionRequest = async (alumniId, alumniType) => {
    try {
      await api.post('/api/connections/send', {
        receiverId: alumniId,
        receiverType: alumniType || 'Alumni',
        message: "Hi, I'd like to connect with you on ScholarBridge."
      });
      alert('Connection request sent successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert(error.response?.data?.message || 'Error sending connection request');
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await api.put(`/api/connections/accept/${requestId}`);
      alert('Connection request accepted!');
      fetchAllData();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error accepting connection request');
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await api.put(`/api/connections/reject/${requestId}`);
      alert('Connection request rejected');
      fetchAllData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting connection request');
    }
  };

  const getOtherUser = (connection) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (connection.sender.userId === currentUser._id) {
      return connection.receiver;
    }
    return connection.sender;
  };

  const startConversation = async (userId, userType) => {
    try {
      const response = await api.post('/api/messages/conversations', {
        otherUserId: userId,
        otherUserType: userType
      });
      // Navigate to messages page
      navigate('/messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Error starting conversation. Please try again.');
    }
  };

  return (
    <div className='dash' style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content">
        <h1>Network 🤝</h1>
        
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Requests ({sentRequests.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            My Connections ({connections.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'suggestions' && (
            <div className="suggestions-grid">
              {suggestions.map(alumni => (
                <div key={alumni._id} className="connection-card">
                  <img 
                    src={alumni.profilePicture || '/default-avatar.png'} 
                    alt={alumni.username}
                    className="connection-avatar"
                  />
                  <h3>{alumni.username}</h3>
                  <p className="connection-detail">{alumni.company || alumni.currentDegree || 'Alumni'}</p>
                  <p className="connection-detail">{alumni.designation || alumni.branch || ''}</p>
                  <button 
                    className="connect-btn"
                    onClick={() => sendConnectionRequest(alumni._id, 'Alumni')}
                  >
                    Connect
                  </button>
                </div>
              ))}
              {suggestions.length === 0 && (
                <p className="no-data">No more suggestions available</p>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="requests-list">
              {pendingRequests.map(request => (
                <div key={request._id} className="request-item">
                  <img 
                    src={request.sender.profilePicture || '/default-avatar.png'} 
                    alt={request.sender.username}
                    className="request-avatar"
                  />
                  <div className="request-info">
                    <h3>{request.sender.username}</h3>
                    <p>{request.message}</p>
                    <span className="request-date">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => acceptRequest(request._id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => rejectRequest(request._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <p className="no-data">No pending connection requests</p>
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="requests-list">
              {sentRequests.map(request => (
                <div key={request._id} className="request-item">
                  <img 
                    src={request.receiver.profilePicture || '/default-avatar.png'} 
                    alt={request.receiver.username}
                    className="request-avatar"
                  />
                  <div className="request-info">
                    <h3>{request.receiver.username}</h3>
                    <p>{request.message}</p>
                    <span className="request-date">
                      Sent on {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="request-status">
                    <span className="pending-badge">Pending</span>
                  </div>
                </div>
              ))}
              {sentRequests.length === 0 && (
                <p className="no-data">No sent requests</p>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="connections-grid">
              {connections.map(connection => {
                const otherUser = getOtherUser(connection);
                return (
                  <div key={connection._id} className="connection-card">
                    <img 
                      src={otherUser.profilePicture || '/default-avatar.png'} 
                      alt={otherUser.username}
                      className="connection-avatar"
                    />
                    <h3>{otherUser.username}</h3>
                    <p className="connection-detail">{otherUser.userType}</p>
                    <p className="connection-date">
                      Connected since {new Date(connection.updatedAt).toLocaleDateString()}
                    </p>
                    <button 
                      className="message-btn"
                      onClick={() => startConversation(otherUser.userId, otherUser.userType)}
                    >
                      Message
                    </button>
                  </div>
                );
              })}
              {connections.length === 0 && (
                <p className="no-data">No connections yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
