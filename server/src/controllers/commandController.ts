import { Request, Response } from 'express';
import { Command } from '../models/Command';
import { Device } from '../models/Device';
import { getMQTTClient } from '../mqtt/mqttClient';

// Extend Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// @desc    Send a command to a device
// @route   POST /api/commands
// @access  Private
export const sendCommand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId, action, value } = req.body;
    const userId = req.user?.id;

    // Verify ownership
    const device = await Device.findOne({ _id: deviceId, userId });
    if (!device) {
      res.status(404).json({ error: { message: 'Device not found or access denied', status: 404 } });
      return;
    }

    // 1. Log the command as 'pending'
    const command = await Command.create({
      userId,
      deviceId,
      action,
      value,
      status: 'pending'
    });

    // 2. Dispatch via MQTT
    const mqttClient = getMQTTClient();
    
    // Safety Check: If MQTT is not connected, fail early instead of hanging
    if (!mqttClient.connected) {
        console.error('MQTT Client not connected. Command buffered or failed.');
        res.status(503).json({ error: { message: 'MQTT Broker unreachable. Please try again later.', status: 503 } });
        return;
    }

    const topic = `sayrasphere/devices/${deviceId}/command`;
    
    // Pass the command ID so the simulator can ACK it specifically
    const payload = JSON.stringify({
      commandId: command._id,
      action,
      value
    });

    // Publish with QoS 1, but don't block the HTTP response on the PUBACK
    // The simulator will send an ACK message later that we handle via WebSockets
    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('MQTT Publish Error:', err);
        command.status = 'failed';
        command.save();
      }
    });

    // Successly dispatched (Accepted)
    res.status(202).json({
        message: 'Command dispatched to broker',
        command
    });

  } catch (error) {
    res.status(500).json({ error: { message: 'Server error processing command', status: 500 } });
  }
};

// @desc    Get command history for a specific device
// @route   GET /api/commands/device/:deviceId
// @access  Private
export const getCommandHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const userId = req.user?.id;

    // Verify ownership of the device first
    const device = await Device.findOne({ _id: deviceId, userId });
    if (!device) {
        res.status(404).json({ error: { message: 'Device not found or access denied', status: 404 }});
        return;
    }

    const commands = await Command.find({ deviceId, userId })
      .sort({ timestamp: -1 })
      .limit(20); // Last 20 commands

    res.status(200).json(commands);
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error retrieving command history', status: 500 } });
  }
};
