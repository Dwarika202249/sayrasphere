import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string | null;
  role: 'admin' | 'user' | 'guest';
  isActive: boolean;
  refreshTokens: string[];
  notificationPrefs: {
    email: boolean;
    push: boolean;
  };
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    select: false
  },
  googleId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guest'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [String],
  notificationPrefs: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
