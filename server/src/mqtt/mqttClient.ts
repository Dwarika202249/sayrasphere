import mqtt from 'mqtt';
import { Device } from '../models/Device';
import { Command } from '../models/Command';
import { automationEngine } from '../services/automationEngine';
import { Server as SocketIOServer } from 'socket.io'; // We'll pass io instance here

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
let mqttClient: mqtt.MqttClient;

export const connectMQTT = (io: SocketIOServer) => {
  mqttClient = mqtt.connect(MQTT_BROKER);

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
            lastPing: new Date()
          },
          { returnDocument: 'after' }
        );
        
        // Push update to React clients via Socket.IO
        if (updatedDevice) {
           io.emit('device:update', { id: deviceId, currentValue: payload, lastPing: updatedDevice.lastPing });
        }
      } 
      else if (messageType === 'status') {
        updatedDevice = await Device.findByIdAndUpdate(
          deviceId,
          { 
            status: payload.status,
            lastPing: new Date()
          },
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
