import express from 'express';
import { sendCommand, getCommandHistory } from '../controllers/commandController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect as any, sendCommand);
router.get('/device/:deviceId', protect as any, getCommandHistory);

export default router;
