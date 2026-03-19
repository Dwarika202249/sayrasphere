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
    console.log(`[MQTT] Successfully connected to broker: ${MQTT_BROKER}`);

    // Subscribe to all device telemetry and status changes
    mqttClient.subscribe('sayrasphere/devices/+/telemetry', (err) => {
        if (err) console.error('[MQTT] Subscription error (telemetry):', err);
    });
    mqttClient.subscribe('sayrasphere/devices/+/status', (err) => {
        if (err) console.error('[MQTT] Subscription error (status):', err);
    });
    mqttClient.subscribe('sayrasphere/devices/+/ack', (err) => {
        if (err) console.error('[MQTT] Subscription error (ack):', err);
    });
  });

  mqttClient.on('reconnect', () => {
    console.log('[MQTT] Attempting to reconnect...');
  });

  mqttClient.on('offline', () => {
    console.warn('[MQTT] Client is offline.');
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
        const cleanedDeviceId = deviceId.trim();
        
        // Construct atomic update object
        const setObj: any = {
            lastPing: new Date(),
            lastSeen: new Date()
        };
        
        // Map payload to dot notation for atomic partial update
        Object.keys(payload).forEach(key => {
            setObj[`currentValue.${key}`] = payload[key];
        });

        // Use findOneAndUpdate for atomic operation and to get the full updated document
        // This bypasses any instance-level tracking issues with Mixed types
        const updatedDoc = await Device.findOneAndUpdate(
            { _id: cleanedDeviceId },
            { $set: setObj },
            { new: true, runValidators: false }
        );
        
        if (updatedDoc) {
            // Send the FULL converged currentValue to frontend to avoid partial state issues
            io.emit('device:update', { 
                id: cleanedDeviceId, 
                currentValue: updatedDoc.currentValue, 
                lastPing: updatedDoc.lastPing 
            });

            // --- PHASE 4: Save Historical Telemetry to MongoDB ---
            if (Object.keys(payload).length > 0) {
               await Telemetry.create({
                 deviceId: updatedDoc._id,
                 metrics: payload
               });
            }

            // --- PHASE 3: Fire new reading into the Automation Engine ---
            automationEngine.evaluateTelemetry(cleanedDeviceId, payload);
        }
        return; // Exit telemetry block
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
