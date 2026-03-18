import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceSummary extends Document {
  deviceId: mongoose.Types.ObjectId;
  summary: string;
  anomaly: string;
  type: 'Daily' | 'Emergency';
  createdAt: Date;
}

const DeviceSummarySchema: Schema = new Schema({
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  anomaly: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Daily', 'Emergency'],
    default: 'Daily'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Automatically delete documents after 30 days (30 * 24 * 60 * 60 seconds)
  }
});

export const DeviceSummary = mongoose.model<IDeviceSummary>('DeviceSummary', DeviceSummarySchema);
