import { Request, Response } from 'express';
import { Command } from '../models/Command';
import { Device } from '../models/Device';
import { getMQTTClient } from '../mqtt/mqttClient';

// @desc    Send a command to a device
// @route   POST /api/commands
// @access  Private
export const sendCommand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, action, value } = req.body;

    const device = await Device.findById(deviceId);
    if (!device) {
      res.status(404).json({ error: { message: 'Device not found', status: 404 } });
      return;
    }

    // 1. Log the command as 'pending'
    const command = await Command.create({
      deviceId,
      action,
      value,
      status: 'pending'
    });

    // 2. Dispatch via MQTT
    const mqttClient = getMQTTClient();
    const topic = `sayrasphere/devices/${deviceId}/command`;
    
    // Pass the command ID so the simulator can ACK it specifically
    const payload = JSON.stringify({
      commandId: command._id,
      action,
      value
    });

    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('MQTT Publish Error:', err);
        command.status = 'failed';
        command.save();
        res.status(500).json({ error: { message: 'Failed to dispatch command to broker', status: 500 } });
        return;
      }

      // Successly dispatched
      res.status(202).json({
        message: 'Command dispatched',
        command
      });
    });

  } catch (error) {
    res.status(500).json({ error: { message: 'Server error processing command', status: 500 } });
  }
};

// @desc    Get command history for a specific device
// @route   GET /api/commands/device/:deviceId
// @access  Private
export const getCommandHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const commands = await Command.find({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 })
      .limit(20); // Last 20 commands

    res.status(200).json(commands);
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error retrieving command history', status: 500 } });
  }
};
