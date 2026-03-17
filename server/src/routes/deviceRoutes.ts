import express from 'express';
import { getDevices, getDeviceById } from '../controllers/deviceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect as any, getDevices);
router.get('/:id', protect as any, getDeviceById);

export default router;
