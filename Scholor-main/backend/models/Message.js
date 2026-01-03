import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'sender.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['Student', 'Alumni']
    },
    username: {
      type: String,
      required: true
    }
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
