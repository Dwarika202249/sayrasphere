import express from 'express';
import { getTelemetryData } from '../controllers/telemetryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:deviceId', protect as any, getTelemetryData as any);

export default router;
