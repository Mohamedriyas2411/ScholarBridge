import React, { useState, useEffect } from 'react';
import AlumniSidebar from './AlumniSidebar';
import api from '../../utils/axios';
import './IncomingRequests.css';

const IncomingRequests = () => {
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
      const res = await api.get('/api/alumni/payment/alumni-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load payment requests.');
    } finally {
      setLoading(false);
    }
  };

  const initiateGPayPayment = (amount, upiId, recipientName, requestId) => {
    // First try Google Pay specific deep link
    const gpayIntent = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(recipientName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`ScholarBridge_Payment_${requestId}`)}`;
    
    // Fallback to generic UPI intent for any UPI app
    const upiIntent = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(recipientName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`ScholarBridge_Payment_${requestId}`)}`;
    
    try {
      // Try to open Google Pay app first
      window.location.href = gpayIntent;
      
      // Set a timeout to try generic UPI as fallback
      setTimeout(() => {
        window.location.href = upiIntent;
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('Error launching payment app:', err);
      
      // Last resort - try with a direct link
      const paymentButton = document.createElement('a');
      paymentButton.href = upiIntent;
      paymentButton.click();
      
      return true;
    }
  };

  const handlePayment = async (requestId, amount, recipientName) => {
    try {
      // First get the student's UPI ID for this request
      const studentDetailsResponse = await api.get(`/api/alumni/payment/request-details/${requestId}`);
      const { upiId } = studentDetailsResponse.data;
      
      if (!upiId) {
        alert('Student UPI ID not found. Please contact support.');
        return;
      }

      // Show payment instructions
      alert(
        'You will now be redirected to make the payment via Google Pay app.\n\n' +
        '1. Complete the payment in the Google Pay app\n' +
        '2. Copy the UPI Transaction ID\n' +
        '3. Return to this page to confirm the payment'
      );

      // Initiate Google Pay payment
      const paymentInitiated = initiateGPayPayment(amount, upiId, recipientName, requestId);
      
      if (!paymentInitiated) {
        alert('Failed to initiate payment. Please try again or use a different device.');
        return;
      }

      // Wait for user to complete payment and get transaction ID
      setTimeout(() => {
        const transactionId = prompt('After completing the payment, please enter the UPI Transaction ID:');
        if (!transactionId) {
          alert('Transaction ID is required to complete the payment.');
          return;
        }
        
        if (transactionId.trim().length < 8) {
          alert('Please enter a valid transaction ID (minimum 8 characters).');
          return;
        }

        // Complete the payment request with the transaction ID
        api.post(`/api/alumni/payment/complete/${requestId}`, { transactionId })
          .then(response => {
            alert(response.data.message || 'Payment marked as completed successfully!');
            fetchRequests(); // Refresh the list
          })
          .catch(err => {
            console.error('Error completing payment:', err);
            const errorMessage = err.response?.data?.message || 'Failed to complete payment. Please try again.';
            alert(errorMessage);
          });
      }, 2000);

    } catch (err) {
      console.error('Error initiating payment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to initiate payment. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="requests-layout">
      <AlumniSidebar />
      <div className="requests-main">
        <h2 className="requests-title">Payment Requests Status</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : requests.length === 0 ? (
          <div>No payment requests at this time.</div>
        ) : (
          requests.map((req) => (
            <div className="request-card" key={req._id}>
              <div className="request-header">
                <div className="request-from">
                  <strong>To:</strong> {req.recipient?.username || 'Unknown Student'}
                </div>
                <span className={`request-status ${req.status}`}>{req.status}</span>
              </div>
              <div className="request-info">
                <div><strong>Amount:</strong> ₹{req.amount}</div>
                <div><strong>Message:</strong> {req.message}</div>
                {req.approvedAt && (
                  <div><strong>Approved On:</strong> {new Date(req.approvedAt).toLocaleDateString()}</div>
                )}
                {req.completedAt && (
                  <div>
                    <strong>Completed On:</strong> {new Date(req.completedAt).toLocaleDateString()}
                    <br />
                    <strong>Transaction ID:</strong> {req.transactionId}
                  </div>
                )}
              </div>
              {req.status === 'approved' && (
                <div className="request-actions">
                  <button 
                    className="btn-accept" 
                    onClick={() => handlePayment(
                      req._id, 
                      req.amount,
                      req.recipient?.username || 'Student'
                    )}
                  >
                    Pay Now via Google Pay App
                  </button>
                </div>
              )}
              {req.status === 'pending' && (
                <div className="request-message">
                  Waiting for student's approval...
                </div>
              )}
              {req.status === 'rejected' && (
                <div className="request-message error">
                  Request was rejected by the student.
                </div>
              )}
              {req.status === 'completed' && (
                <div className="request-message success">
                  Payment completed successfully!
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncomingRequests;