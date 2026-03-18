import mqtt from 'mqtt';
import http from 'http';
import 'dotenv/config';

// Minimal HTTP server for Render health checks
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Simulator Running');
}).listen(port, () => {
  console.log(`Health check server listening on port ${port}`);
});

// Uses HiveMQ Cloud or Local Mosquitto
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const client = mqtt.connect(MQTT_BROKER, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
});

let simulationInterval = null;
let activeDevices = [];

const startSimulation = (devices) => {
  if (simulationInterval) clearInterval(simulationInterval);
  activeDevices = devices;
  console.log(`[SIM] Starting simulation for ${devices.length} devices...`);

  simulationInterval = setInterval(() => {
    activeDevices.forEach(device => {
      if (device.type === 'sensor' || device.type === 'thermostat') {
        const topic = `sayrasphere/devices/${device.id}/telemetry`;
        const payload = {
          temperature: +(Math.random() * (26 - 20) + 20).toFixed(1),
          humidity: +(Math.random() * (60 - 40) + 40).toFixed(0),
          timestamp: new Date().toISOString()
        };
        client.publish(topic, JSON.stringify(payload));
      } else if (device.type === 'switch' || device.type === 'bulb') {
        // Randomly flip status occasionally to show activity
        if (Math.random() > 0.8) {
          const topic = `sayrasphere/devices/${device.id}/status`;
          client.publish(topic, JSON.stringify({ status: Math.random() > 0.5 ? 'online' : 'offline' }));
        }
      }
    });
  }, 5000);
};

const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    activeDevices = [];
    console.log('[SIM] Simulation stopped.');
  }
};

client.on('connect', () => {
  console.log(`Simulator connected to ${MQTT_BROKER}! Waiting for commands...`);
  
  // Listen for system control messages
  client.subscribe('sayrasphere/system/simulate');
  
  // Still listen for commands to handle ACKs
  client.subscribe('sayrasphere/devices/+/command');
});

client.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());

  // 1. Handle System Simulation Controls
  if (topic === 'sayrasphere/system/simulate') {
    if (payload.action === 'START') {
      startSimulation(payload.devices || []);
    } else if (payload.action === 'STOP') {
      stopSimulation();
    }
    return;
  }

  // 2. Handle Device Commands (ACK logic)
  if (topic.endsWith('/command')) {
    const deviceId = topic.split('/')[2];
    console.log(`[RCVD CMD] Device ${deviceId}: ${payload.action}`);

    setTimeout(() => {
      client.publish(`sayrasphere/devices/${deviceId}/ack`, JSON.stringify({ 
        commandId: payload.commandId, 
        status: 'completed' 
      }));
      
      if (payload.action === 'toggle') {
        client.publish(`sayrasphere/devices/${deviceId}/status`, JSON.stringify({ 
          status: payload.value ? 'online' : 'offline' 
        }));
      }
    }, 500);
  }
});

client.on('error', (err) => console.error('Simulator Error:', err));
