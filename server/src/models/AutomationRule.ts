import mongoose, { Document, Schema } from 'mongoose';

export interface IAutomationRule extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  trigger: {
    deviceId: mongoose.Types.ObjectId;
    metric: string; // e.g., 'temperature', 'humidity', 'state'
    operator: '>' | '<' | '==' | '!=';
    value: any;
  };
  action: {
    deviceId: mongoose.Types.ObjectId;
    command: string; // e.g., 'toggle'
    value: any;
  };
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationRuleSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    trigger: {
      deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
      metric: { type: String, required: true },
      operator: { type: String, enum: ['>', '<', '==', '!='], required: true },
      value: { type: Schema.Types.Mixed, required: true },
    },
    action: {
      deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
      command: { type: String, required: true },
      value: { type: Schema.Types.Mixed, required: true },
    },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AutomationRule = mongoose.model<IAutomationRule>('AutomationRule', AutomationRuleSchema);
