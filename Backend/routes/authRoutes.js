import express from 'express';
import passport  from 'passport';
const router = express.Router();
import authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import getFrontendUrl from '../utils/getFrontendUrl.js';

// Auth routes
router.post('/signup', authController.signup);
router.get("/verify-email", authController.verifyEmail);
router.post('/login', authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Google login start
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: config.jwt.expiresIn }
    );
    res.cookie(
      config.jwt.cookieName,
      token,
      config.jwt.cookieOptions
    );
    res.redirect(`${getFrontendUrl(req)}/profile`);
  }
);

// Protected routes
router.get('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);

// Game-related routes
router.post('/save-game', protect, authController.saveGameScore);
router.get('/game-stats', protect, authController.getGameStats);

// Public game routes
router.get('/leaderboard', authController.getLeaderboard);

export default router;