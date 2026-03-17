import { Request, Response } from 'express';
import { Device } from '../models/Device';

// @desc    Get all devices
// @route   GET /api/devices
// @access  Private
export const getDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error retrieving devices', status: 500 } });
  }
};

// @desc    Get device by ID
// @route   GET /api/devices/:id
// @access  Private
export const getDeviceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      res.status(404).json({ error: { message: 'Device not found', status: 404 } });
      return;
    }

    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error retrieving device', status: 500 } });
  }
};
