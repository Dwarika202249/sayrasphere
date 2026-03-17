import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  name: string;
  type: 'sensor' | 'actuator' | 'switch' | 'camera' | 'other';
  status: 'online' | 'offline';
  lastPing: Date;
  metadata: {
    firmwareVersion?: string;
    location?: string;
    macAddress?: string;
    ipAddress?: string;
  };
  currentValue?: any;
}

const DeviceSchema: Schema = new Schema(
  {
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
    metadata: {
      firmwareVersion: { type: String },
      location: { type: String },
      macAddress: { type: String },
      ipAddress: { type: String },
    },
    currentValue: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);
