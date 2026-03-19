import express from 'express';
import { sendCommand, getCommandHistory } from '../controllers/commandController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect as any, sendCommand as any);
router.get('/device/:deviceId', protect as any, getCommandHistory as any);

export default router;
