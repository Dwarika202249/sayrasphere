import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Device } from '../src/models/Device';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sayrasphere';

const mockDevices = [
  {
    _id: new mongoose.Types.ObjectId('65f0123abc456ef7890def12'),
    name: 'Living Room Temp',
    type: 'sensor',
    status: 'online',
    metadata: { location: 'Living Room', firmwareVersion: 'v1.0.4' },
    currentValue: { temperature: 22.5, humidity: 45 },
  },
  {
    name: 'Kitchen Lights',
    type: 'switch',
    status: 'offline',
    metadata: { location: 'Kitchen', ipAddress: '192.168.1.105' },
    currentValue: { state: false, brightness: 0 },
  },
  {
    name: 'Garage Door',
    type: 'actuator',
    status: 'online',
    metadata: { location: 'Garage' },
    currentValue: { state: 'closed' },
  },
  {
    name: 'Outdoor Camera',
    type: 'camera',
    status: 'online',
    metadata: { location: 'Front Porch', ipAddress: '192.168.1.110' },
    currentValue: { motionDetected: false },
  },
  {
    _id: new mongoose.Types.ObjectId('65f0123abc456ef7890def34'),
    name: 'Bedroom AC',
    type: 'switch',
    status: 'online',
    metadata: { location: 'Master Bedroom' },
    currentValue: { state: true, targetTemp: 21 },
  },
];

const seedDevices = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    console.log('Clearing existing devices...');
    await Device.deleteMany();

    console.log('Seeding mock devices...');
    await Device.insertMany(mockDevices);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDevices();
