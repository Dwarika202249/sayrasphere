import mqtt from 'mqtt';
import { Device } from '../models/Device';
import { Command } from '../models/Command';
import { Telemetry } from '../models/Telemetry';
import { automationEngine } from '../services/automationEngine';
import { Server as SocketIOServer } from 'socket.io'; // We'll pass io instance here

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASS = process.env.MQTT_PASS;

let mqttClient: mqtt.MqttClient;

export const connectMQTT = (io: SocketIOServer) => {
  mqttClient = mqtt.connect(MQTT_BROKER, {
    username: MQTT_USER,
    password: MQTT_PASS,
    rejectUnauthorized: false, // Often needed for some cloud MQTT TLS configs if not providing CA
  });

  mqttClient.on('connect', () => {
    console.log(`Connected to MQTT Broker at ${MQTT_BROKER}`);

    // Subscribe to all device telemetry and status changes
    mqttClient.subscribe('sayrasphere/devices/+/telemetry');
    mqttClient.subscribe('sayrasphere/devices/+/status');
    mqttClient.subscribe('sayrasphere/devices/+/ack');
  });

  mqttClient.on('message', async (topic: string, message: Buffer) => {
    try {
      const payload = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      const deviceId = topicParts[2]; // sayrasphere/devices/<id>/...
      const messageType = topicParts[3]; // telemetry OR status

      // Update Device in DB
      let updatedDevice;
      
      if (messageType === 'telemetry') {
        updatedDevice = await Device.findByIdAndUpdate(
          deviceId,
          { 
            currentValue: payload,
            lastPing: new Date(),
            lastSeen: new Date()
          },
          { returnDocument: 'after' }
        );
        
        // Push update to React clients via Socket.IO
        if (updatedDevice) {
           io.emit('device:update', { id: deviceId, currentValue: payload, lastPing: updatedDevice.lastPing });
        }

        // --- PHASE 4: Save Historical Telemetry to MongoDB ---
        if (Object.keys(payload).length > 0) {
           await Telemetry.create({
             deviceId: updatedDevice?._id,
             metrics: payload
           });
        }

        // --- PHASE 3: Fire new reading into the Automation Engine ---
        automationEngine.evaluateTelemetry(deviceId, payload);

      } 
      else if (messageType === 'status') {
        // First check if device is transitioning from offline -> online
        const existingDevice = await Device.findById(deviceId);
        const updateFields: any = { 
          status: payload.status,
          lastPing: new Date(),
          lastSeen: new Date()
        };
        // Track when device came online for uptime calculation
        if (existingDevice?.status === 'offline' && payload.status === 'online') {
          updateFields.uptimeSince = new Date();
        }

        updatedDevice = await Device.findByIdAndUpdate(
          deviceId,
          updateFields,
          { returnDocument: 'after' }
        );

        // Push update to React clients
        if (updatedDevice) {
           io.emit('device:status', { id: deviceId, status: payload.status, lastPing: updatedDevice.lastPing });
        }
      } else if (messageType === 'ack') {
        // Find the command and mark it as completed
        const updatedCommand = await Command.findByIdAndUpdate(
          payload.commandId,
          { status: 'completed' },
          { returnDocument: 'after' }
        );
        
        if (updatedCommand) {
          io.emit('command:ack', { commandId: updatedCommand._id, deviceId, status: 'completed' });
        }
      }

    } catch (error) {
      console.error('MQTT Message Error:', error);
    }
  });

  mqttClient.on('error', (err: any) => {
    console.error('MQTT Connection Error:', err);
  });

  return mqttClient;
};

export const getMQTTClient = (): mqtt.MqttClient => {
  if (!mqttClient) {
    throw new Error('MQTT Client not initialized');
  }
  return mqttClient;
};
