import express from 'express';
import { getDevices, getDeviceById, toggleSimulation } from '../controllers/deviceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect as any, getDevices);
router.post('/simulate', protect as any, toggleSimulation);
router.get('/:id', protect as any, getDeviceById);

export default router;
