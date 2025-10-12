import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getAllAchievements,
  getUserAchievements,
  checkAchievements,
  getAchievementDetails,
  getAchievementProgress,
  initializeAchievements
} from '../controllers/achievementController';

const router = express.Router();

router.get('/', getAllAchievements);
router.get('/user', authenticate, getUserAchievements);
router.post('/check', authenticate, checkAchievements);
router.get('/:id', getAchievementDetails);
router.get('/:id/progress', authenticate, getAchievementProgress);
router.post('/initialize', initializeAchievements);

export default router;
