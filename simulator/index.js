import mqtt from 'mqtt';

// Uses Eclipse Mosquitto instance running on Local Docker
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const client = mqtt.connect(MQTT_BROKER);

const MOCK_DEVICES = [
  { id: '65f0123abc456ef7890def12', name: 'Living Room Temp', type: 'sensor' },
  { id: '65f0123abc456ef7890def34', name: 'Bedroom AC', type: 'switch' }
];

client.on('connect', () => {
  console.log(`Simulator connected to ${MQTT_BROKER}!`);

  // Subscribe to command topics for all devices
  client.subscribe('sayrasphere/devices/+/command');

  setInterval(() => {
    // 1. Simulate Temp Sensor
    const tempSensor = MOCK_DEVICES[0];
    const telemetryTopic = `sayrasphere/devices/${tempSensor.id}/telemetry`;
    const tempPayload = {
      temperature: +(Math.random() * (26 - 20) + 20).toFixed(1), // 20.0 to 26.0
      humidity: +(Math.random() * (60 - 40) + 40).toFixed(0),    // 40% to 60%
    };
    client.publish(telemetryTopic, JSON.stringify(tempPayload));
    console.log(`[PUB] ${tempSensor.name} -> ${JSON.stringify(tempPayload)}`);

    // 2. Simulate Random AC State
    const ac = MOCK_DEVICES[1];
    const statusTopic = `sayrasphere/devices/${ac.id}/status`;
    const isOnline = Math.random() > 0.5 ? 'online' : 'offline';
    client.publish(statusTopic, JSON.stringify({ status: isOnline }));
    
  }, 4000); // Push updates every 4 seconds
});

client.on('message', (topic, message) => {
  if (topic.endsWith('/command')) {
    const topicParts = topic.split('/');
    const deviceId = topicParts[2];
    const payload = JSON.parse(message.toString());

    console.log(`[RCVD CMD] Device ${deviceId}: ${payload.action} -> ${payload.value}`);

    // Pre-suppose the hardware needs 500ms to physically actuate
    setTimeout(() => {
      // 1. Send the ACK back to verify completion
      const ackTopic = `sayrasphere/devices/${deviceId}/ack`;
      client.publish(ackTopic, JSON.stringify({ commandId: payload.commandId, status: 'completed' }));
      console.log(`[PUB ACK]  Device ${deviceId} finished command ${payload.commandId}`);

      // 2. Publish new status to reflect state change immediately
      if (payload.action === 'toggle') {
        const statusTopic = `sayrasphere/devices/${deviceId}/status`;
        client.publish(statusTopic, JSON.stringify({ status: payload.value ? 'online' : 'offline' }));
      }
    }, 500);
  }
});

client.on('error', (err) => {
  console.error('Simulator MQTT Error:', err);
});
