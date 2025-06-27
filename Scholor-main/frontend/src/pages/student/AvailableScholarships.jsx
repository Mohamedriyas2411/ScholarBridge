import React, { useEffect, useState } from 'react';
import Sidebar from './SideBar';
import api from '../../utils/axios';
import './AvailableScholarships.css';

const AvailableScholarships = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/student/payment/student-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load payment requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      if (action === 'accept') {
        // Prompt for UPI ID if needed
        const upiId = prompt('Enter your UPI ID for payment:');
        if (!upiId) return;
        await api.post(`/api/student/payment/approve/${requestId}`, { upiId });
      } else if (action === 'reject') {
        const reason = prompt('Enter a reason for rejection (optional):');
        await api.post(`/api/student/payment/reject/${requestId}`, { reason });
      }
      fetchRequests(); // Refresh the list after action
    } catch (err) {
      console.error('Error updating request:', err);
      alert('Failed to update request status. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
        <h1>Payment Requests from Alumni</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : requests.length === 0 ? (
          <div>No payment requests at this time.</div>
        ) : (
          <div className="payment-requests-list">
            {requests.map((req) => (
              <div className="payment-request-card" key={req._id}>
                <div className="request-info">
                  <div><strong>Alumni:</strong> {req.sender?.username || 'Unknown'}</div>
                  <div><strong>Amount:</strong> ₹{req.amount}</div>
                  <div><strong>Status:</strong> {req.status}</div>
                  {req.message && <div><strong>Message:</strong> {req.message}</div>}
                </div>
                {req.status === 'pending' && (
                  <div className="request-actions">
                    <button className="btn-accept" onClick={() => handleAction(req._id, 'accept')}>Accept</button>
                    <button className="btn-reject" onClick={() => handleAction(req._id, 'reject')}>Reject</button>
                  </div>
                )}
                {req.status === 'approved' && (
                  <div className="request-approved">You have approved this request. Awaiting payment.</div>
                )}
                {req.status === 'rejected' && (
                  <div className="request-rejected">You have rejected this request.</div>
                )}
                {req.status === 'completed' && (
                  <div className="request-completed">Payment completed.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableScholarships;
