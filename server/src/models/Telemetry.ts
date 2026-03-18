import mongoose, { Document, Schema } from 'mongoose';

export interface ITelemetry extends Document {
  deviceId: mongoose.Types.ObjectId;
  timestamp: Date;
  metrics: Record<string, any>;
}

const TelemetrySchema: Schema = new Schema(
  {
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    metrics: { type: Schema.Types.Mixed, required: true },
  },
  { 
    // Mongoose option to automatically create timeseries collections in MongoDB
    timeseries: {
      timeField: 'timestamp',
      metaField: 'deviceId',
      granularity: 'seconds'
    }
  }
);

// Create a TTL index to automatically delete records older than 90 days.
// MongoDB handles this in the background natively.
TelemetrySchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const Telemetry = mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);
