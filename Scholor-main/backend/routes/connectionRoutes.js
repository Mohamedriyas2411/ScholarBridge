import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  sendConnectionRequest,
  getPendingRequests,
  getSentRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnections,
  checkConnectionStatus
} from '../controllers/connectionController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Send a connection request
router.post('/send', sendConnectionRequest);

// Get pending requests (received)
router.get('/pending', getPendingRequests);

// Get sent requests
router.get('/sent', getSentRequests);

// Get all connections
router.get('/connections', getConnections);

// Check connection status with a user
router.get('/status/:otherUserId', checkConnectionStatus);

// Accept a connection request
router.put('/accept/:requestId', acceptConnectionRequest);

// Reject a connection request
router.put('/reject/:requestId', rejectConnectionRequest);

export default router;
