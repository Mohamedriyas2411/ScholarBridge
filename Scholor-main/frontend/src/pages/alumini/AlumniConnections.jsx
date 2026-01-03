import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlumniSidebar from './AlumniSidebar';
import api from '../../utils/axios';
import './AlumniConnections.css';

const AlumniConnections = () => {
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
      const allStudents = response.data;
      
      // Get connection statuses for all students
      const statuses = {};
      for (const student of allStudents) {
        try {
          const statusResponse = await api.get(`/api/connections/status/${student._id}`);
          statuses[student._id] = statusResponse.data;
        } catch (error) {
          console.error('Error fetching status:', error);
        }
      }
      setConnectionStatuses(statuses);
      
      // Filter out already connected or pending users
      const filtered = allStudents.filter(student => {
        const status = statuses[student._id];
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

  const sendConnectionRequest = async (studentId, studentType) => {
    try {
      await api.post('/api/connections/send', {
        receiverId: studentId,
        receiverType: studentType || 'Student',
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
      navigate('/alumni-messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Error starting conversation. Please try again.');
    }
  };

  return (
    <div className='dashboard-containera' style={{ display: 'flex' }}>
      <AlumniSidebar />
      <div className="dashboard-content">
        <h1 className="dashboard-title">Network 🤝</h1>
        
        <div className="alumni-tabs">
          <button 
            className={`alumni-tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions
          </button>
          <button 
            className={`alumni-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button 
            className={`alumni-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Requests ({sentRequests.length})
          </button>
          <button 
            className={`alumni-tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            My Connections ({connections.length})
          </button>
        </div>

        <div className="alumni-tab-content">
          {activeTab === 'suggestions' && (
            <div className="alumni-suggestions-grid">
              {suggestions.map(student => (
                <div key={student._id} className="alumni-connection-card">
                  <img 
                    src={student.profilePicture || '/default-avatar.png'} 
                    alt={student.username}
                    className="alumni-connection-avatar"
                  />
                  <h3>{student.username}</h3>
                  <p className="alumni-connection-detail">{student.currentDegree || 'Student'}</p>
                  <p className="alumni-connection-detail">{student.branch || ''}</p>
                  <button 
                    className="alumni-connect-btn"
                    onClick={() => sendConnectionRequest(student._id, 'Student')}
                  >
                    Connect
                  </button>
                </div>
              ))}
              {suggestions.length === 0 && (
                <p className="alumni-no-data">No more suggestions available</p>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="alumni-requests-list">
              {pendingRequests.map(request => (
                <div key={request._id} className="alumni-request-item">
                  <img 
                    src={request.sender.profilePicture || '/default-avatar.png'} 
                    alt={request.sender.username}
                    className="alumni-request-avatar"
                  />
                  <div className="alumni-request-info">
                    <h3>{request.sender.username}</h3>
                    <p>{request.message}</p>
                    <span className="alumni-request-date">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="alumni-request-actions">
                    <button 
                      className="alumni-accept-btn"
                      onClick={() => acceptRequest(request._id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="alumni-reject-btn"
                      onClick={() => rejectRequest(request._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <p className="alumni-no-data">No pending connection requests</p>
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="alumni-requests-list">
              {sentRequests.map(request => (
                <div key={request._id} className="alumni-request-item">
                  <img 
                    src={request.receiver.profilePicture || '/default-avatar.png'} 
                    alt={request.receiver.username}
                    className="alumni-request-avatar"
                  />
                  <div className="alumni-request-info">
                    <h3>{request.receiver.username}</h3>
                    <p>{request.message}</p>
                    <span className="alumni-request-date">
                      Sent on {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="alumni-request-status">
                    <span className="alumni-pending-badge">Pending</span>
                  </div>
                </div>
              ))}
              {sentRequests.length === 0 && (
                <p className="alumni-no-data">No sent requests</p>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="alumni-connections-grid">
              {connections.map(connection => {
                const otherUser = getOtherUser(connection);
                return (
                  <div key={connection._id} className="alumni-connection-card">
                    <img 
                      src={otherUser.profilePicture || '/default-avatar.png'} 
                      alt={otherUser.username}
                      className="alumni-connection-avatar"
                    />
                    <h3>{otherUser.username}</h3>
                    <p className="alumni-connection-detail">{otherUser.userType}</p>
                    <p className="alumni-connection-date">
                      Connected since {new Date(connection.updatedAt).toLocaleDateString()}
                    </p>
                    <button 
                      className="alumni-message-btn"
                      onClick={() => startConversation(otherUser.userId, otherUser.userType)}
                    >
                      Message
                    </button>
                  </div>
                );
              })}
              {connections.length === 0 && (
                <p className="alumni-no-data">No connections yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniConnections;
