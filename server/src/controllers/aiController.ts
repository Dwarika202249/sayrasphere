import { Request, Response } from 'express';
import { generateDeviceSummary, detectAnomalies, chatWithAssistant } from '../services/aiService';
import { Device } from '../models/Device';
import { DeviceSummary } from '../models/DeviceSummary';

// Phase 5.5: Retrieve the latest Cron / Emergency backup instead of querying LLM live
export const getLatestSummary = async (req: any, res: Response): Promise<void> => {
  try {
    const deviceId = req.params.deviceId as string;
    if (!deviceId) {
      res.status(400).json({ error: { message: 'Device ID is required' } });
      return;
    }

    // Verify ownership
    const device = await Device.findOne({ _id: deviceId, userId: req.user?.id });
    if (!device) {
       res.status(404).json({ error: { message: 'Device not found or access denied' }});
       return;
    }

    // Find the newest summary
    const cached = await DeviceSummary.findOne({ deviceId }).sort({ createdAt: -1 }).lean();
    if (cached) {
      res.json({ message: cached.summary, anomaly: cached.anomaly, type: cached.type, timestamp: cached.createdAt });
    } else {
      res.json({ message: 'No analysis available. Please trigger a manual refresh.', anomaly: 'No data.', type: 'None', timestamp: null });
    }
  } catch (error: any) {
    console.error('AI Retrieve Error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to retrieve summary' } });
  }
};

// Original Live Generator (Now utilized explicitly as a "Force Refresh")
export const forceRefreshSummary = async (req: any, res: Response): Promise<void> => {
  try {
    const deviceId = req.params.deviceId as string;
    if (!deviceId) {
      res.status(400).json({ error: { message: 'Device ID is required' } });
      return;
    }

    // Verify ownership
    const device = await Device.findOne({ _id: deviceId, userId: req.user?.id });
    if (!device) {
       res.status(404).json({ error: { message: 'Device not found or access denied' }});
       return;
    }

    const [summary, anomaly] = await Promise.all([
      generateDeviceSummary(deviceId),
      detectAnomalies(deviceId)
    ]);
    
    // Save to Cache so future hits read this live generate
    await DeviceSummary.create({
      deviceId,
      summary,
      anomaly,
      type: 'Daily'
    });

    res.json({ message: summary, anomaly, type: 'Daily', timestamp: new Date() });
  } catch (error: any) {
    console.error('AI Force Refresh Error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to force generate summary' } });
  }
};

export const processChatQuery = async (req: any, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    
    // Fetch user-specific state to feed "Sayra"
    const allDevices = await Device.find({ userId: req.user?.id }).select('name type status currentValue').lean();
    
    const reply = await chatWithAssistant(query, allDevices);
    res.json({ reply });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to process chat' } });
  }
};
