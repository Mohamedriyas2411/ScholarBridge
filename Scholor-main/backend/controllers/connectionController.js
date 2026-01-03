import ConnectionRequest from '../models/ConnectionRequest.js';
import Student from '../models/Student.js';
import Alumni from '../models/Alumini.js';

// Send a connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const senderType = req.user.userType;
    const { receiverId, receiverType, message } = req.body;

    // Check if users are the same
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send connection request to yourself' });
    }

    // Check if connection request already exists
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        {
          'sender.userId': senderId,
          'receiver.userId': receiverId
        },
        {
          'sender.userId': receiverId,
          'receiver.userId': senderId
        }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ message: 'Connection request already sent' });
      } else if (existingRequest.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected' });
      }
    }

    // Get user details
    const sender = senderType === 'Student' 
      ? await Student.findById(senderId)
      : await Alumni.findById(senderId);
      
    const receiver = receiverType === 'Student'
      ? await Student.findById(receiverId)
      : await Alumni.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create connection request
    const connectionRequest = new ConnectionRequest({
      sender: {
        userId: senderId,
        userType: senderType,
        username: sender.username,
        profilePicture: sender.profilePicture
      },
      receiver: {
        userId: receiverId,
        userType: receiverType,
        username: receiver.username,
        profilePicture: receiver.profilePicture
      },
      message: message || `Hi, I'd like to connect with you.`,
      status: 'pending'
    });

    await connectionRequest.save();
    res.json({ message: 'Connection request sent successfully', connectionRequest });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ message: 'Error sending connection request', error: error.message });
  }
};

// Get pending connection requests for current user
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      'receiver.userId': userId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
};

// Get sent connection requests
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      'sender.userId': userId
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ message: 'Error fetching sent requests', error: error.message });
  }
};

// Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (request.receiver.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'accepted';
    await request.save();

    res.json({ message: 'Connection request accepted', request });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ message: 'Error accepting connection request', error: error.message });
  }
};

// Reject connection request
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (request.receiver.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Connection request rejected', request });
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    res.status(500).json({ message: 'Error rejecting connection request', error: error.message });
  }
};

// Get all connections (accepted requests)
export const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await ConnectionRequest.find({
      $or: [
        { 'sender.userId': userId },
        { 'receiver.userId': userId }
      ],
      status: 'accepted'
    });

    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Error fetching connections', error: error.message });
  }
};

// Check connection status with a user
export const checkConnectionStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const connection = await ConnectionRequest.findOne({
      $or: [
        {
          'sender.userId': userId,
          'receiver.userId': otherUserId
        },
        {
          'sender.userId': otherUserId,
          'receiver.userId': userId
        }
      ]
    });

    if (!connection) {
      return res.json({ status: 'none', canConnect: true });
    }

    res.json({ 
      status: connection.status,
      canConnect: connection.status !== 'accepted',
      isPending: connection.status === 'pending',
      isSender: connection.sender.userId.toString() === userId.toString()
    });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ message: 'Error checking connection status', error: error.message });
  }
};
