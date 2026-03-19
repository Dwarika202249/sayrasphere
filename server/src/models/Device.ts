import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'sensor' | 'actuator' | 'switch' | 'camera' | 'other';
  status: 'online' | 'offline';
  lastPing: Date;
  lastSeen: Date;
  uptimeSince: Date;
  metadata: {
    firmwareVersion?: string;
    location?: string;
    macAddress?: string;
    ipAddress?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  currentValue?: any;
}

const DeviceSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['sensor', 'actuator', 'switch', 'camera', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    lastPing: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    uptimeSince: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      firmwareVersion: { type: String },
      location: { type: String },
      macAddress: { type: String },
      ipAddress: { type: String },
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    currentValue: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);
