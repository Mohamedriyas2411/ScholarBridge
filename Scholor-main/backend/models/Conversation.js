import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['Student', 'Alumni']
    },
    username: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String
    }
  }],
  lastMessage: {
    content: String,
    sender: mongoose.Schema.Types.ObjectId,
    timestamp: Date
  }
}, { 
  timestamps: true 
});

// Index for faster queries
conversationSchema.index({ 'participants.userId': 1 });

export default mongoose.model('Conversation', conversationSchema);
