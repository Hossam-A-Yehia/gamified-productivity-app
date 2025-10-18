import express from 'express';
import { FocusController } from '../controllers/focusController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Focus session routes
router.post('/start', FocusController.startFocusSession);
router.get('/sessions', FocusController.getFocusSessions);
router.get('/sessions/active', FocusController.getActiveFocusSession);
router.get('/sessions/:id', FocusController.getFocusSessionById);
router.put('/sessions/:id', FocusController.updateFocusSession);
router.post('/sessions/:id/complete', FocusController.completeFocusSession);
router.delete('/sessions/:id', FocusController.deleteFocusSession);

// Focus statistics
router.get('/stats', FocusController.getFocusStats);

// Focus settings
router.get('/settings', FocusController.getFocusSettings);
router.put('/settings', FocusController.updateFocusSettings);

export default router;
