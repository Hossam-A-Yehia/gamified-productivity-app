import express from 'express';
import { authenticate } from '../middlewares/auth';
import { LeaderboardController } from '../controllers/leaderboardController';

const router = express.Router();

router.get('/global', authenticate, LeaderboardController.getGlobalLeaderboard);
router.get('/friends', authenticate, LeaderboardController.getFriendsLeaderboard);
router.get('/weekly', authenticate, LeaderboardController.getWeeklyLeaderboard);
router.get('/monthly', authenticate, LeaderboardController.getMonthlyLeaderboard);
router.get('/category/:category', authenticate, LeaderboardController.getCategoryLeaderboard);
router.get('/streak', authenticate, LeaderboardController.getStreakLeaderboard);
router.get('/rank', authenticate, LeaderboardController.getUserRank);

export default router;
