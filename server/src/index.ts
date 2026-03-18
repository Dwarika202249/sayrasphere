import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import { protect } from './middleware/authMiddleware';
import deviceRoutes from './routes/deviceRoutes';
import commandRoutes from './routes/commandRoutes';
import ruleRoutes from './routes/ruleRoutes';
import telemetryRoutes from './routes/telemetryRoutes';
import aiRoutes from './routes/aiRoutes';
import { initSocket } from './socket/socketServer';
import { connectMQTT } from './mqtt/mqttClient';
import { initCronJobs } from './services/cronService';

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
const io = initSocket(server);

// Initialize AI Cron Jobs
initCronJobs();

// Initialize MQTT
connectMQTT(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

import passport from 'passport';
import './config/passport';

// Routes
app.use(passport.initialize());
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/ai', aiRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('SayraSphere API is running...');
});

// Protected Test Route
app.get('/api/test-protected', protect as any, (req: any, res: any) => {
  res.json({ message: 'You have accessed a protected route!', user: req.user });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
