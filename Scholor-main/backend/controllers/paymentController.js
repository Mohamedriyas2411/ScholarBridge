import PaymentRequest from '../models/PaymentRequest.js';
import Notification from '../models/Notification.js';
import Student from '../models/Student.js';
import Alumni from '../models/Alumini.js';
import mongoose from 'mongoose';

// Create a new payment request
export const createPaymentRequest = async (req, res) => {
  try {
    const alumniId = req.user._id;
    const { studentId, amount, message } = req.body;
    
    // Validate input
    if (!studentId || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid request. Please provide valid studentId and amount.' });
    }
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    
    // Create payment request
    const paymentRequest = new PaymentRequest({
      sender: alumniId,
      recipient: studentId,
      amount: Number(amount),
      message: message || `Payment request of ₹${amount}`
    });
    
    await paymentRequest.save();
    
    // Create notification for student
    const notification = new Notification({
      recipient: studentId,
      recipientModel: 'Student',
      sender: alumniId,
      senderModel: 'Alumni',
      type: 'payment_request',
      title: 'New Payment Request',
      message: `An alumni has requested to support you with ₹${amount}`,
      relatedId: paymentRequest._id,
      relatedModel: 'PaymentRequest',
      actionUrl: '/student/notifications'
    });
    
    await notification.save();
    
    res.status(201).json({ 
      message: 'Payment request created successfully',
      paymentRequest
    });
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(500).json({ message: 'Failed to create payment request', error: error.message });
  }
};

// Get all payment requests for a student
export const getStudentPaymentRequests = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const paymentRequests = await PaymentRequest.find({ recipient: studentId })
      .populate('sender', 'username email profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(paymentRequests);
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    res.status(500).json({ message: 'Failed to fetch payment requests', error: error.message });
  }
};

// Get all payment requests sent by an alumni
export const getAlumniPaymentRequests = async (req, res) => {
  try {
    const alumniId = req.user._id;
    
    const paymentRequests = await PaymentRequest.find({ sender: alumniId })
      .populate('recipient', 'username email profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(paymentRequests);
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    res.status(500).json({ message: 'Failed to fetch payment requests', error: error.message });
  }
};

// Approve a payment request
export const approvePaymentRequest = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { requestId } = req.params;
    const { upiId } = req.body;
    
    // Validate input
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }
    
    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required' });
    }
    
    // Find and check payment request
    const paymentRequest = await PaymentRequest.findById(requestId);
    
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }
    
    if (paymentRequest.recipient.toString() !== studentId.toString()) {
      return res.status(403).json({ message: 'Unauthorized. This payment request is not for you.' });
    }
    
    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: `Payment request already ${paymentRequest.status}` });
    }
    
    // Update the payment request status
    paymentRequest.status = 'approved';
    paymentRequest.approvedAt = new Date();
    await paymentRequest.save();
    
    // Update student's UPI ID if not set already
    const student = await Student.findById(studentId);
    if (!student.upiId) {
      student.upiId = upiId;
      await student.save();
    }
    
    // Create notification for the alumni
    const notification = new Notification({
      recipient: paymentRequest.sender,
      recipientModel: 'Alumni',
      sender: studentId,
      senderModel: 'Student',
      type: 'payment_approved',
      title: 'Payment Request Approved',
      message: `Your payment request of ₹${paymentRequest.amount} has been approved. Pay to UPI ID: ${upiId}`,
      relatedId: paymentRequest._id,
      relatedModel: 'PaymentRequest',
      actionUrl: '/alumni/notifications'
    });
    
    await notification.save();
    
    res.json({ 
      message: 'Payment request approved successfully',
      paymentRequest
    });
  } catch (error) {
    console.error('Error approving payment request:', error);
    res.status(500).json({ message: 'Failed to approve payment request', error: error.message });
  }
};

// Reject a payment request
export const rejectPaymentRequest = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { requestId } = req.params;
    const { reason } = req.body;
    
    // Validate input
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }
    
    // Find and check payment request
    const paymentRequest = await PaymentRequest.findById(requestId);
    
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }
    
    if (paymentRequest.recipient.toString() !== studentId.toString()) {
      return res.status(403).json({ message: 'Unauthorized. This payment request is not for you.' });
    }
    
    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: `Payment request already ${paymentRequest.status}` });
    }
    
    // Update the payment request status
    paymentRequest.status = 'rejected';
    await paymentRequest.save();
    
    // Create notification for the alumni
    const notification = new Notification({
      recipient: paymentRequest.sender,
      recipientModel: 'Alumni',
      sender: studentId,
      senderModel: 'Student',
      type: 'payment_request',
      title: 'Payment Request Rejected',
      message: reason ? `Your payment request was rejected. Reason: ${reason}` : 'Your payment request was rejected.',
      relatedId: paymentRequest._id,
      relatedModel: 'PaymentRequest'
    });
    
    await notification.save();
    
    res.json({ 
      message: 'Payment request rejected successfully',
      paymentRequest
    });
  } catch (error) {
    console.error('Error rejecting payment request:', error);
    res.status(500).json({ message: 'Failed to reject payment request', error: error.message });
  }
};

// Mark a payment as completed
export const completePayment = async (req, res) => {
  try {
    const alumniId = req.user._id;
    const { requestId } = req.params;
    const { transactionId } = req.body;
    
    // Validate input
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }
    
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }
    
    // Find and check payment request
    const paymentRequest = await PaymentRequest.findById(requestId);
    
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }
    
    if (paymentRequest.sender.toString() !== alumniId.toString()) {
      return res.status(403).json({ message: 'Unauthorized. This is not your payment request.' });
    }
    
    if (paymentRequest.status !== 'approved') {
      return res.status(400).json({ message: `Payment request is not approved. Current status: ${paymentRequest.status}` });
    }
    
    // Update the student's financial need
    const student = await Student.findById(paymentRequest.recipient);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // If student has a financial need field, reduce it by the payment amount
    if (student.financialNeed) {
      const updatedNeed = Math.max(0, student.financialNeed - paymentRequest.amount);
      student.financialNeed = updatedNeed;
      await student.save();
    }
    
    // Update the payment request
    paymentRequest.status = 'completed';
    paymentRequest.transactionId = transactionId;
    paymentRequest.completedAt = new Date();
    await paymentRequest.save();
    
    // Create notification for the student
    const notification = new Notification({
      recipient: paymentRequest.recipient,
      recipientModel: 'Student',
      sender: alumniId,
      senderModel: 'Alumni',
      type: 'payment_completed',
      title: 'Payment Completed',
      message: `An alumni has completed payment of ₹${paymentRequest.amount}. Transaction ID: ${transactionId}`,
      relatedId: paymentRequest._id,
      relatedModel: 'PaymentRequest'
    });
    
    await notification.save();
    
    res.json({ 
      message: 'Payment completed successfully',
      paymentRequest
    });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ message: 'Failed to complete payment', error: error.message });
  }
};

// Get payment request details including student's UPI ID
export const getPaymentRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const alumniId = req.user._id;

    // Find the payment request and populate student details
    const paymentRequest = await PaymentRequest.findById(requestId)
      .populate('recipient', 'username upiId');

    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    // Check if the request belongs to the alumni
    if (paymentRequest.sender.toString() !== alumniId.toString()) {
      return res.status(403).json({ message: 'Unauthorized. This is not your payment request.' });
    }

    // Check if the request is in approved status
    if (paymentRequest.status !== 'approved') {
      return res.status(400).json({ message: `Payment request is not approved. Current status: ${paymentRequest.status}` });
    }

    // Get student's UPI ID
    const student = await Student.findById(paymentRequest.recipient);
    if (!student || !student.upiId) {
      return res.status(400).json({ message: 'Student UPI ID not found' });
    }

    res.json({
      upiId: student.upiId,
      amount: paymentRequest.amount,
      recipientName: student.username
    });
  } catch (error) {
    console.error('Error fetching payment request details:', error);
    res.status(500).json({ message: 'Failed to fetch payment details', error: error.message });
  }
}; 