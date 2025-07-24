import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import friendController from '../controllers/friendontroller.js';

const router = express.Router();

// All friend routes require authentication
router.use(protect);

// Search users
router.get('/search', friendController.searchUsers);

// Get user profile
router.get('/user/:id', friendController.getUserProfile);

// Friend requests
router.post('/request/:id', friendController.sendFriendRequest);
router.post('/accept/:id', friendController.acceptFriendRequest);
router.post('/reject/:id', friendController.rejectFriendRequest);
router.get('/requests', friendController.getFriendRequests);

// Friends management
router.get('/', friendController.getFriends);
router.delete('/remove/:id', friendController.removeFriend);

export default router;