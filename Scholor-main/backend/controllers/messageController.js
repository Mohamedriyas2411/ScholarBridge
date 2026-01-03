import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Student from '../models/Student.js';
import Alumni from '../models/Alumini.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType; // 'Student' or 'Alumni'
    
    const conversations = await Conversation.find({
      'participants.userId': userId
    }).sort({ 'lastMessage.timestamp': -1 });
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// Get or create a conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserType = req.user.userType;
    const { otherUserId, otherUserType } = req.body;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.userId': currentUserId },
        { 'participants.userId': otherUserId }
      ]
    });
    
    if (conversation) {
      return res.json(conversation);
    }
    
    // Get user details
    const currentUser = currentUserType === 'Student' 
      ? await Student.findById(currentUserId)
      : await Alumni.findById(currentUserId);
      
    const otherUser = otherUserType === 'Student'
      ? await Student.findById(otherUserId)
      : await Alumni.findById(otherUserId);
    
    if (!currentUser || !otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create new conversation
    conversation = new Conversation({
      participants: [
        {
          userId: currentUserId,
          userType: currentUserType,
          username: currentUser.username,
          profilePicture: currentUser.profilePicture
        },
        {
          userId: otherUserId,
          userType: otherUserType,
          username: otherUser.username,
          profilePicture: otherUser.profilePicture
        }
      ]
    });
    
    await conversation.save();
    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Error creating conversation', error: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === userId.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId,
        'sender.userId': { $ne: userId },
        read: false
      },
      { read: true }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user._id;
    const userType = req.user.userType;
    
    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const participant = conversation.participants.find(
      p => p.userId.toString() === userId.toString()
    );
    
    if (!participant) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }
    
    // Create message
    const message = new Message({
      conversationId,
      sender: {
        userId,
        userType,
        username: participant.username
      },
      content
    });
    
    await message.save();
    
    // Update conversation's last message
    conversation.lastMessage = {
      content,
      sender: userId,
      timestamp: message.createdAt
    };
    await conversation.save();
    
    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get list of users to start a conversation with
export const getUsersList = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserType = req.user.userType;
    
    // Import ConnectionRequest model
    const ConnectionRequest = (await import('../models/ConnectionRequest.js')).default;
    
    // Get all accepted connections
    const connections = await ConnectionRequest.find({
      $or: [
        { 'sender.userId': currentUserId },
        { 'receiver.userId': currentUserId }
      ],
      status: 'accepted'
    });
    
    // Extract connected user IDs
    const connectedUserIds = connections.map(conn => {
      if (conn.sender.userId.toString() === currentUserId.toString()) {
        return conn.receiver.userId.toString();
      } else {
        return conn.sender.userId.toString();
      }
    });
    
    let users = [];
    
    // If current user is a student, get connected alumni
    // If current user is alumni, get connected students
    if (currentUserType === 'Student') {
      const alumni = await Alumni.find({
        _id: { $in: connectedUserIds }
      }, 'username email profilePicture company designation');
      users = alumni.map(a => ({
        _id: a._id,
        username: a.username,
        email: a.email,
        profilePicture: a.profilePicture,
        userType: 'Alumni',
        company: a.company,
        designation: a.designation
      }));
    } else {
      const students = await Student.find({
        _id: { $in: connectedUserIds }
      }, 'username email profilePicture currentDegree branch');
      users = students.map(s => ({
        _id: s._id,
        username: s.username,
        email: s.email,
        profilePicture: s.profilePicture,
        userType: 'Student',
        currentDegree: s.currentDegree,
        branch: s.branch
      }));
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users list:', error);
    res.status(500).json({ message: 'Error fetching users list', error: error.message });
  }
};
