import express from 'express';
import { getLatestSummary, forceRefreshSummary, processChatQuery } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/latest-summary/:deviceId', protect as any, getLatestSummary as any);
router.post('/force-summary/:deviceId', protect as any, forceRefreshSummary as any);
router.post('/chat', protect as any, processChatQuery as any);

export default router;
