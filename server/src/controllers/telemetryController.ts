import { Request, Response } from 'express';
import { Telemetry } from '../models/Telemetry';
import { Device } from '../models/Device';

// @desc    Get historical telemetry for a device
// @route   GET /api/telemetry/:deviceId
// @access  Private
export const getTelemetryData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const { startDate, endDate, limit } = req.query;

    if (!deviceId) {
      res.status(400).json({ error: { message: 'Device ID is required' } });
      return;
    }

    // Ensure the device exists and belongs to the user
    const device = await Device.findOne({ _id: deviceId, userId: (req as any).user?.id });
    if (!device) {
       res.status(404).json({ error: { message: 'Device not found or access denied' }});
       return;
    }

    // Build the query
    const query: any = { deviceId };

    // Apply date range filters if provided
    if (startDate || endDate) {
       query.timestamp = {};
       if (startDate) query.timestamp.$gte = new Date(startDate as string);
       if (endDate) query.timestamp.$lte = new Date(endDate as string);
    } else {
        // Default to last 24 hours if no range provided
        const defaultStart = new Date();
        defaultStart.setHours(defaultStart.getHours() - 24);
        query.timestamp = { $gte: defaultStart };
    }

    // Convert query limit parameter
    const queryLimit = limit ? parseInt(limit as string, 10) : 1000;

    const data = await Telemetry.find(query)
      .sort({ timestamp: 1 }) // Chronological order
      .limit(queryLimit)
      .lean(); // Lean for faster query processing

    res.json(data);
  } catch (error) {
    console.error('Fetch Telemetry Error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch telemetry data' } });
  }
};
