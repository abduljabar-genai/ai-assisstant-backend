import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
