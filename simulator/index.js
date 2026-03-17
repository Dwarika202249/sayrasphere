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

client.on('error', (err) => {
  console.error('Simulator MQTT Error:', err);
});
