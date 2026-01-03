import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUsersList
} from '../controllers/messageController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get or create a conversation
router.post('/conversations', getOrCreateConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message
router.post('/messages', sendMessage);

// Get list of users to message
router.get('/users', getUsersList);

export default router;
