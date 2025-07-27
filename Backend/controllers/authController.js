import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';
import crypto from 'crypto';
import getFrontendUrl from '../utils/getFrontendUrl.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/sendEmail.js';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generate a JWT token for the user
 * @param {Object} user - User object with id 
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Set JWT token in HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 */
const sendTokenCookie = (res, token) => {
  res.cookie(
    config.jwt.cookieName,
    token,
    config.jwt.cookieOptions
  );
};

// Google Strategy Setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
  async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      let username = profile.displayName.replace(/\s+/g, '').toLowerCase();

      let existingUser = await User.findOne({ username });
      if (existingUser) {
        username = username + Math.floor(Math.random() * 10000);
      }

      user = await User.create({
        name: profile.displayName,
        username: username,
        email: profile.emails[0].value,
        isVerified: true,
        password: Math.random().toString(36),
        avatar: profile.photos[0]?.value || '',
      });
    }
    return done(null, user);
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

/**
 * @Description    Register a new user
 * @Route   POST /api/auth/signup
 * @Access  Public
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let username = name.replace(/\s+/g, '').toLowerCase();

    let existingUser = await User.findOne({ username });
    if (existingUser) {
      username = username + Math.floor(Math.random() * 10000);
    }

    const userExists = await User.findOne({
      $or: [
        { email: new RegExp(`^${email}$`, 'i') }
      ]
    });

    if (userExists) {
      console.error('Signup error: Duplicate user');
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    const user = await User.create({
      name,
      username,
      email,
      password,
      isVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    });

    const verifyLink = `${getFrontendUrl(req)}/verify-email?token=${emailVerificationToken}`;
    await sendVerificationEmail(email, verifyLink);

    res.status(201).json({
      success: true,
      message: "Signup successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const resetLink = `${getFrontendUrl(req)}/reset-password?token=${token}`;
    await sendResetPasswordEmail(email, resetLink);

    res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token." });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @Description    Login user
 * @Route   POST /api/auth/login
 * @Access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email before logging in." });
    }

    const token = generateToken(user);
    sendTokenCookie(res, token);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        gameStats: user.gameStats,
        preferences: user.preferences,
        social: user.social,
        createdAt: user.createdAt
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * @Description    Logout user
 * @Route   GET /api/auth/logout
 * @Access  Private
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie(config.jwt.cookieName, config.jwt.cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * @Description    Get current logged in user profile
 * @Route   GET /api/auth/me
 * @Access  Private
 */
export const getMe = async (req, res) => {
  try {
    const { password, ...safeUser } = req.user._doc || req.user;
    res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
    });
  }
};

/**
 * @Description    Update user profile
 * @Route   PUT /api/auth/update-profile
 * @Access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, username, email, avatar, bio } = req.body;
    const userId = req.user._id;

    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [
            { username: new RegExp(`^${username}$`, 'i') },
            { email: new RegExp(`^${email}$`, 'i') }
          ]
        }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already taken'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        username,
        email,
        avatar,
        bio
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * @Description    Enhanced save game score with comprehensive data
 * @Route   POST /api/auth/save-game
 * @Access  Private
 */
export const saveGameScore = async (req, res) => {
  try {
    const gameData = req.body;
    const userId = req.user._id;

    // Enhanced validation for all game data fields
    const requiredFields = ['score', 'snakeLength', 'playTime'];
    const missingFields = requiredFields.filter(field => typeof gameData[field] !== 'number');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or invalid required fields: ${missingFields.join(', ')}`
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update comprehensive game stats
    user.updateGameStats(gameData);

    // Check for new achievements
    const newAchievements = user.checkAchievements();

    await user.save();

    res.json({
      success: true,
      message: 'Game score saved successfully',
      gameStats: user.gameStats,
      newAchievements,
      achievementPoints: newAchievements.reduce((sum, achievement) => sum + achievement.points, 0),
      userLevel: Math.floor(user.gameStats.totalGamesPlayed / 10) + 1,
      nextLevelProgress: (user.gameStats.totalGamesPlayed % 10) * 10
    });

  } catch (error) {
    console.error('Save game score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save game score'
    });
  }
};

/**
 * @Description    Get enhanced user game statistics
 * @Route   GET /api/auth/game-stats
 * @Access  Private
 */
export const getGameStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('gameStats recentGames achievements preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate additional derived statistics
    const derivedStats = {
      totalAchievementPoints: user.achievements.reduce((sum, a) => sum + (a.points || 0), 0),
      achievementCount: user.achievements.length,
      userLevel: Math.floor(user.gameStats.totalGamesPlayed / 10) + 1,
      experiencePoints: user.gameStats.totalGamesPlayed * 10,
      nextLevelProgress: (user.gameStats.totalGamesPlayed % 10) * 10,
      playStreaks: {
        current: user.gameStats.currentStreak,
        best: user.gameStats.bestStreak
      },
      playDaysCount: user.gameStats.playDays ? user.gameStats.playDays.length : 0,
      averageScorePerDay: user.gameStats.playDays && user.gameStats.playDays.length > 0
        ? Math.round(user.gameStats.totalScore / user.gameStats.playDays.length)
        : 0,
      recentPerformance: user.recentGames.slice(-5).map(game => ({
        score: game.score,
        efficiency: game.efficiency,
        playTime: game.playTime,
        playedAt: game.playedAt
      }))
    };

    res.json({
      success: true,
      gameStats: user.gameStats,
      recentGames: user.recentGames,
      achievements: user.achievements,
      derivedStats,
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get game stats'
    });
  }
};

/**
 * @Description    Get user achievements
 * @Route   GET /api/auth/achievements
 * @Access  Private
 */
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('achievements gameStats');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Group achievements by category
    const achievementsByCategory = user.achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {});

    // Calculate achievement progress
    const totalPossibleAchievements = 25; // Based on your achievement rules
    const totalPoints = user.achievements.reduce((sum, a) => sum + (a.points || 0), 0);

    res.json({
      success: true,
      achievements: user.achievements,
      achievementsByCategory,
      progress: {
        totalUnlocked: user.achievements.length,
        totalPossible: totalPossibleAchievements,
        percentage: Math.round((user.achievements.length / totalPossibleAchievements) * 100),
        totalPoints,
        recentlyUnlocked: user.achievements
          .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
          .slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements'
    });
  }
};

/**
 * @Description    Update user preferences
 * @Route   PUT /api/auth/preferences
 * @Access  Private
 */
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    // Validate preference fields
    const allowedPreferences = [
      'soundEnabled', 'notificationsEnabled', 'difficultySetting',
      'preferredDeviceType', 'gameTheme', 'showHints', 'autoSave'
    ];

    const validPreferences = {};
    Object.keys(preferences).forEach(key => {
      if (allowedPreferences.includes(key)) {
        validPreferences[`preferences.${key}`] = preferences[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: validPreferences },
      { new: true, select: 'preferences' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

/**
 * @Description    Start a game session
 * @Route   POST /api/auth/start-session
 * @Access  Private
 */
export const startGameSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId, deviceType, browserInfo } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const session = user.startSession({
      sessionId,
      deviceType,
      browserInfo
    });

    await user.save();

    res.json({
      success: true,
      message: 'Game session started',
      session
    });

  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session'
    });
  }
};

/**
 * @Description    End a game session
 * @Route   POST /api/auth/end-session
 * @Access  Private
 */
export const endGameSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const session = user.endSession(sessionId);
    await user.save();

    res.json({
      success: true,
      message: 'Game session ended',
      session
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session'
    });
  }
};

/**
 * @Description    Get enhanced leaderboard with multiple categories
 * @Route   GET /api/auth/leaderboard
 * @Access  Public
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, type = 'highestScore', timeframe = 'all' } = req.query;

    let sortField = 'gameStats.highestScore';
    let matchCondition = { 'gameStats.totalGamesPlayed': { $gt: 0 } };

    // Handle different leaderboard types
    switch (type) {
      case 'totalGames':
        sortField = 'gameStats.totalGamesPlayed';
        break;
      case 'totalScore':
        sortField = 'gameStats.totalScore';
        break;
      case 'winRate':
        sortField = 'gameStats.winRate';
        matchCondition['gameStats.totalGamesPlayed'] = { $gte: 5 }; // Minimum games for win rate
        break;
      case 'efficiency':
        sortField = 'gameStats.bestEfficiency';
        break;
      case 'longestSnake':
        sortField = 'gameStats.longestSnake';
        break;
      case 'achievements':
        sortField = 'achievements';
        break;
      default:
        sortField = 'gameStats.highestScore';
    }

    // Handle timeframe filtering
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      if (startDate) {
        matchCondition['gameStats.lastPlayedAt'] = { $gte: startDate };
      }
    }

    let pipeline = [
      { $match: matchCondition }
    ];

    // Special handling for achievements leaderboard
    if (type === 'achievements') {
      pipeline.push(
        { $addFields: { achievementCount: { $size: '$achievements' } } },
        { $sort: { achievementCount: -1, 'gameStats.highestScore': -1 } }
      );
    } else {
      pipeline.push({ $sort: { [sortField]: -1 } });
    }

    pipeline.push(
      { $limit: parseInt(limit) },
      {
        $project: {
          // FIXED: Use only inclusion (1) OR only exclusion (0), not both
          name: 1,
          username: 1,
          avatar: 1,
          'gameStats.highestScore': 1,
          'gameStats.totalGamesPlayed': 1,
          'gameStats.totalScore': 1,
          'gameStats.winRate': 1,
          'gameStats.bestEfficiency': 1,
          'gameStats.longestSnake': 1,
          'gameStats.lastPlayedAt': 1,
          createdAt: 1,
          // FIXED: Include achievementCount instead of excluding it
          ...(type === 'achievements' && { achievementCount: 1 })
        }
      }
    );

    const leaderboard = await User.aggregate(pipeline);

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json({
      success: true,
      leaderboard: rankedLeaderboard,
      type,
      timeframe,
      total: rankedLeaderboard.length
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    });
  }
};

/**
 * @Description    Get user's rank in leaderboard
 * @Route   GET /api/auth/my-rank
 * @Access  Private
 */
export const getMyRank = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'highestScore' } = req.query;

    let sortField = 'gameStats.highestScore';
    switch (type) {
      case 'totalScore':
        sortField = 'gameStats.totalScore';
        break;
      case 'totalGames':
        sortField = 'gameStats.totalGamesPlayed';
        break;
      case 'winRate':
        sortField = 'gameStats.winRate';
        break;
    }

    const userRank = await User.aggregate([
      { $match: { 'gameStats.totalGamesPlayed': { $gt: 0 } } },
      { $sort: { [sortField]: -1 } },
      { $group: { _id: null, users: { $push: '$_id' } } },
      { $unwind: { path: '$users', includeArrayIndex: 'rank' } },
      { $match: { users: userId } },
      { $project: { rank: { $add: ['$rank', 1] } } }
    ]);

    const totalUsers = await User.countDocuments({ 'gameStats.totalGamesPlayed': { $gt: 0 } });

    const rank = userRank.length > 0 ? userRank[0].rank : null;
    const percentile = rank ? Math.round(((totalUsers - rank) / totalUsers) * 100) : 0;

    res.json({
      success: true,
      rank,
      totalUsers,
      percentile,
      type
    });

  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user rank'
    });
  }
};

export default {
  login,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
  updateProfile,
  saveGameScore,
  getGameStats,
  getAchievements,
  updatePreferences,
  startGameSession,
  endGameSession,
  getLeaderboard,
  getMyRank
};