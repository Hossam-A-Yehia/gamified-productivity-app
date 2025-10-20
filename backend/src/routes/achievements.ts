import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getAllAchievements,
  getUserAchievements,
  checkAchievements,
  getAchievementDetails,
  getAchievementProgress,
  initializeAchievements,
  getUserAchievementProgress,
  getAchievementsByCategory,
  getAchievementStats
} from '../controllers/achievementController';

const router = express.Router();

router.get('/', getAllAchievements);
router.get('/user', authenticate, getUserAchievements);
router.get('/user/progress', authenticate, getUserAchievementProgress);
router.get('/user/stats', authenticate, getAchievementStats);
router.get('/category/:category', authenticate, getAchievementsByCategory);
router.post('/check', authenticate, checkAchievements);
router.get('/:id', getAchievementDetails);
router.get('/:id/progress', authenticate, getAchievementProgress);
router.post('/initialize', initializeAchievements);

export default router;
