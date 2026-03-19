import { Request, Response } from 'express';
import { AutomationRule } from '../models/AutomationRule';
import { automationEngine } from '../services/automationEngine';

// Extend Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// @desc    Get all automation rules for current user
// @route   GET /api/rules
// @access  Private
export const getRules = async (req: AuthRequest, res: Response) => {
  try {
    const rules = await AutomationRule.find({ userId: req.user?.id })
      .populate('trigger.deviceId', 'name type')
      .populate('action.deviceId', 'name type');
    
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error fetching rules' } });
  }
};

// @desc    Create a new automation rule
// @route   POST /api/rules
// @access  Private
export const createRule = async (req: AuthRequest, res: Response) => {
  try {
    const { name, trigger, action, enabled } = req.body;
    
    const rule = await AutomationRule.create({
      userId: req.user?.id,
      name,
      trigger,
      action,
      enabled: enabled !== undefined ? enabled : true
    });

    // Notify the engine cache has changed
    automationEngine.refreshRules();

    res.status(201).json(rule);
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message || 'Invalid rule data' } });
  }
};

// @desc    Toggle rule enablement
// @route   PATCH /api/rules/:id/toggle
// @access  Private
export const toggleRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await AutomationRule.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!rule) {
      res.status(404).json({ error: { message: 'Rule not found' } });
      return;
    }

    rule.enabled = req.body.enabled;
    await rule.save();
    
    // Notify the engine
    automationEngine.refreshRules();

    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error updating rule' } });
  }
};

// @desc    Delete a rule
// @route   DELETE /api/rules/:id
// @access  Private
export const deleteRule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const rule = await AutomationRule.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
        if(!rule) {
             res.status(404).json({ error: { message: 'Rule not found' }});
             return;
        }

        automationEngine.refreshRules();
        res.json({ message: 'Rule removed' });
    } catch (error) {
        res.status(500).json({ error: { message: 'Server error deleting rule'} });
    }
}
