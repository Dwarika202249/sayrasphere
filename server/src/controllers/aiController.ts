import { Request, Response } from 'express';
import { generateDeviceSummary, detectAnomalies, chatWithAssistant } from '../services/aiService';
import { Device } from '../models/Device';
import { DeviceSummary } from '../models/DeviceSummary';

// Phase 5.5: Retrieve the latest Cron / Emergency backup instead of querying LLM live
export const getLatestSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const deviceId = req.params.deviceId as string;
    if (!deviceId) {
      res.status(400).json({ error: { message: 'Device ID is required' } });
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
export const forceRefreshSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const deviceId = req.params.deviceId as string;
    if (!deviceId) {
      res.status(400).json({ error: { message: 'Device ID is required' } });
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

export const processChatQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    
    // Fetch global state to feed "Sayra"
    // To protect tokens, we only send high-level context, not full telemetry
    const allDevices = await Device.find().select('name type status currentValue').lean();
    
    const reply = await chatWithAssistant(query, allDevices);
    res.json({ reply });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to process chat' } });
  }
};
