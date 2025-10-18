import express from 'express';
import { ChallengeController } from '../controllers/challengeController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Challenge CRUD routes
router.post('/', ChallengeController.createChallenge);
router.get('/', ChallengeController.getChallenges);
router.get('/featured', ChallengeController.getFeaturedChallenges);
router.get('/participating', ChallengeController.getParticipatingChallenges);
router.get('/stats', ChallengeController.getChallengeStats);
router.get('/summary', ChallengeController.getUserChallengeSummary);
router.get('/:challengeId', ChallengeController.getChallengeById);
router.put('/:challengeId', ChallengeController.updateChallenge);
router.delete('/:challengeId', ChallengeController.deleteChallenge);

// Challenge participation routes
router.post('/:challengeId/join', ChallengeController.joinChallenge);
router.post('/:challengeId/leave', ChallengeController.leaveChallenge);
router.post('/:challengeId/progress', ChallengeController.updateProgress);

// Challenge leaderboard
router.get('/:challengeId/leaderboard', ChallengeController.getChallengeLeaderboard);

// Admin routes
router.post('/admin/update-statuses', ChallengeController.updateChallengeStatuses);

export default router;
