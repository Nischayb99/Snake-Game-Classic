import express from 'express';
import passport from 'passport';
const router = express.Router();
import authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import getFrontendUrl from '../utils/getFrontendUrl.js';

// Public Auth routes
router.post('/signup', authController.signup);
router.get("/verify-email", authController.verifyEmail);
router.post('/login', authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Google login start
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Enhanced Google callback with better error handling and production settings
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.PRODUCTION_FRONTEND_URL || process.env.LOCALHOST_FRONTEND_URL}/login?error=oauth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      if (!req.user) {
        console.error('No user found in Google OAuth callback');
        return res.redirect(`${getFrontendUrl(req)}/login?error=auth_failed`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: config.jwt.expiresIn }
      );

      // Enhanced cookie settings for production
      const cookieOptions = {
        ...config.jwt.cookieOptions,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site for production
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost' // Let browser handle domain in production
      };

      // Set cookie
      res.cookie(
        config.jwt.cookieName,
        token,
        cookieOptions
      );

      // Redirect to profile with success indication
      const frontendUrl = getFrontendUrl(req);
      console.log('OAuth Success - Redirecting to:', `${frontendUrl}/profile?welcome=google`);
      res.redirect(`${frontendUrl}/profile?welcome=google`);

    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = getFrontendUrl(req);
      res.redirect(`${frontendUrl}/login?error=server_error`);
    }
  }
);

// Protected routes - User Management
router.get('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);

// Enhanced Game-related routes
router.post('/save-game', protect, authController.saveGameScore);
router.get('/game-stats', protect, authController.getGameStats);
router.get('/achievements', protect, authController.getAchievements);
router.put('/preferences', protect, authController.updatePreferences);

// Session Management routes
router.post('/start-session', protect, authController.startGameSession);
router.post('/end-session', protect, authController.endGameSession);

// Leaderboard and Ranking routes (Enhanced)
router.get('/leaderboard', authController.getLeaderboard);
router.get('/my-rank', protect, authController.getMyRank);

export default router;