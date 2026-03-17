import mqtt from 'mqtt';
import { Device } from '../models/Device';
import { Server as SocketIOServer } from 'socket.io'; // We'll pass io instance here

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';

export const connectMQTT = (io: SocketIOServer) => {
  const client = mqtt.connect(MQTT_BROKER);

  client.on('connect', () => {
    console.log(`Connected to MQTT Broker at ${MQTT_BROKER}`);

    // Subscribe to all device telemetry and status changes
    client.subscribe('sayrasphere/devices/+/telemetry');
    client.subscribe('sayrasphere/devices/+/status');
  });

  client.on('message', async (topic, message) => {
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
      }

    } catch (error) {
      console.error('MQTT Message Error:', error);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
  });

  return client;
};
