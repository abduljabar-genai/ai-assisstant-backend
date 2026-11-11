import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // Mongo TTL index: doc removed when expiresAt passes
    },
  },
  { timestamps: true }
);

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
