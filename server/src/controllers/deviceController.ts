import { Request, Response } from "express";
import { Device } from "../models/Device";
import { getMQTTClient } from "../mqtt/mqttClient";

// Extend Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// @desc    Get all devices for current user
// @route   GET /api/devices
// @access  Private
export const getDevices = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const devices = await Device.find({ userId: req.user?.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(devices);
  } catch (error) {
    res
      .status(500)
      .json({
        error: { message: "Server error retrieving devices", status: 500 },
      });
  }
};

// @desc    Get device by ID (with ownership check)
// @route   GET /api/devices/:id
// @access  Private
export const getDeviceById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!device) {
      res
        .status(404)
        .json({ error: { message: "Device not found", status: 404 } });
      return;
    }

    res.status(200).json(device);
  } catch (error) {
    res
      .status(500)
      .json({
        error: { message: "Server error retrieving device", status: 500 },
      });
  }
};

// @desc    Toggle Simulation for user devices (Dynamic Showcase Mode)
// @route   POST /api/devices/simulate
// @access  Private (Admin/Test User)
export const toggleSimulation = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { action } = req.body; // 'START' or 'STOP'
    const mqttClient = getMQTTClient();
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    // SHOWCASE MODE LOGIC for demo user
    const demoUser = process.env.DEMO_USER || "test@sayrasphere.com";
    if (userEmail === demoUser) {
      if (action === "START") {
        // 1. Clean up old devices for this user
        await Device.deleteMany({ userId });

        // 2. Seed fresh mock devices with location data and initial values
        const mockDevices = [
          {
            userId,
            name: "Bedroom AC",
            type: "switch",
            status: "online",
            location: { lat: 28.615, lng: 77.21 },
            currentValue: { state: false }, // Default to OFF
          },
          {
            userId,
            name: "Garage Door",
            type: "switch",
            status: "online",
            location: { lat: 28.6145, lng: 77.213 },
            currentValue: { state: false }, // Default to OFF
          },
          {
            userId,
            name: "Backyard Light",
            type: "switch",
            status: "online",
            location: { lat: 28.611, lng: 77.2085 },
            currentValue: { state: false }, // Default to OFF
          },
          {
            userId,
            name: "Kitchen Smoke",
            type: "sensor",
            status: "online",
            location: { lat: 28.612, lng: 77.2115 },
            currentValue: { co_level: 0, battery: 98 },
          },
          {
            userId,
            name: "Living Room Temp",
            type: "sensor",
            status: "online",
            location: { lat: 28.6139, lng: 77.209 },
            currentValue: { temperature: 24.5, humidity: 45 },
          },
        ];

        const createdDevices = await Device.insertMany(mockDevices);
        const deviceMetadata = createdDevices.map((d) => ({
          id: d._id,
          type: d.type,
        }));

        // 3. Trigger Simulator via MQTT
        mqttClient.publish(
          "sayrasphere/system/simulate",
          JSON.stringify({
            action: "START",
            devices: deviceMetadata,
          }),
        );

        res.status(200).json({ message: "Showcase Simulation started" });
        return;
      } else {
        // STOP: Clean up and tell simulator to stop
        await Device.deleteMany({ userId });
        mqttClient.publish(
          "sayrasphere/system/simulate",
          JSON.stringify({ action: "STOP" }),
        );
        res.status(200).json({ message: "Showcase Simulation stopped" });
        return;
      }
    }

    // REGULAR SIMULATION LOGIC (for other admins/users)
    if (action === "START") {
      const devices = await Device.find({ userId });
      const deviceMetadata = devices.map((d) => ({ id: d._id, type: d.type }));

      mqttClient.publish(
        "sayrasphere/system/simulate",
        JSON.stringify({
          action: "START",
          devices: deviceMetadata,
        }),
      );
      res.status(200).json({ message: "Simulation started" });
    } else {
      mqttClient.publish(
        "sayrasphere/system/simulate",
        JSON.stringify({ action: "STOP" }),
      );
      res.status(200).json({ message: "Simulation stopped" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: "Failed to toggle simulation", status: 500 } });
  }
};
