import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import friendController from '../controllers/friendController.js';

const router = express.Router();

// All friend routes require authentication
router.use(protect);

// Enhanced User Search and Discovery
router.get('/search', friendController.searchUsers);

// User Profile Management
router.get('/user/:id', friendController.getUserProfile);
router.get('/mutual/:id', friendController.getMutualFriends);

// Friend Request Management
router.post('/request/:id', friendController.sendFriendRequest);
router.post('/accept/:id', friendController.acceptFriendRequest);
router.post('/reject/:id', friendController.rejectFriendRequest);
router.get('/requests', friendController.getFriendRequests);

// Friends Management and Social Features
router.get('/', friendController.getFriends);
router.delete('/remove/:id', friendController.removeFriend);

// Enhanced Social Features
router.get('/leaderboard', friendController.getFriendsLeaderboard);

export default router;