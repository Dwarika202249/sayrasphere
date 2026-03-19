import express from 'express';
import { getDevices, getDeviceById, toggleSimulation } from '../controllers/deviceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect as any, getDevices as any);
router.post('/simulate', protect as any, toggleSimulation as any);
router.get('/:id', protect as any, getDeviceById as any);

export default router;
