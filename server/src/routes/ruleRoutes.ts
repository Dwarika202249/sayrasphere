import express from 'express';
import { getRules, createRule, toggleRule, deleteRule } from '../controllers/ruleController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect as any, getRules as any)
  .post(protect as any, createRule as any);

router.patch('/:id/toggle', protect as any, toggleRule as any);
router.delete('/:id', protect as any, deleteRule as any);

export default router;
