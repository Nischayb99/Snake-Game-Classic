import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';
import crypto from 'crypto';
import getFrontendUrl from '../utils/getFrontendUrl.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/sendEmail.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServerError
} from '../utils/customErrors.js';
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
    throw new ServerError('JWT_SECRET is not configured');
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
}, async (accessToken, refreshToken, profile, done) => {
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
}));

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
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    throw new ValidationError('Name, email, and password are required');
  }

  if (name.length < 2 || name.length > 50) {
    throw new ValidationError('Name must be between 2 and 50 characters');
  }

  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  // Generate unique username
  let username = name.replace(/\s+/g, '').toLowerCase();
  let existingUser = await User.findOne({ username });
  if (existingUser) {
    username = username + Math.floor(Math.random() * 10000);
  }

  // Check if user already exists
  const userExists = await User.findOne({
    $or: [{ email: new RegExp(`^${email}$`, 'i') }]
  });

  if (userExists) {
    throw new ConflictError('Email already exists');
  }

  // Create verification token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

  // Create user
  const user = await User.create({
    name,
    username,
    email,
    password,
    isVerified: false,
    emailVerificationToken,
    emailVerificationExpires,
  });

  // Send verification email
  const verifyLink = `${getFrontendUrl(req)}/verify-email?token=${emailVerificationToken}`;
  await sendVerificationEmail(email, verifyLink);

  res.status(201).json({
    success: true,
    message: "Signup successful! Please check your email to verify your account.",
  });
});

/**
 * @Description    Verify user email
 * @Route   GET /api/auth/verify-email
 * @Access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ValidationError('Verification token is required');
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ValidationError('Invalid or expired verification token');
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Email verified successfully!"
  });
});

/**
 * @Description    Forgot password
 * @Route   POST /api/auth/forgot-password
 * @Access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Email is required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent."
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  const resetLink = `${getFrontendUrl(req)}/reset-password?token=${token}`;
  await sendResetPasswordEmail(email, resetLink);

  res.json({
    success: true,
    message: "If that email exists, a reset link has been sent."
  });
});

/**
 * @Description    Reset password
 * @Route   POST /api/auth/reset-password
 * @Access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ValidationError('Token and new password are required');
  }

  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ValidationError('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful!"
  });
});

/**
 * @Description    Login user
 * @Route   POST /api/auth/login
 * @Access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.isVerified) {
    throw new ForbiddenError('Please verify your email before logging in');
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
});

/**
 * @Description    Logout user
 * @Route   GET /api/auth/logout
 * @Access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(config.jwt.cookieName, config.jwt.cookieOptions);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @Description    Get current logged in user profile
 * @Route   GET /api/auth/me
 * @Access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AuthenticationError('User not found in request');
  }

  const { password, ...safeUser } = req.user._doc || req.user;
  res.status(200).json({
    success: true,
    user: safeUser,
  });
});

/**
 * @Description    Update user profile
 * @Route   PUT /api/auth/update-profile
 * @Access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, email, avatar, bio } = req.body;
  const userId = req.user._id;

  // Input validation
  if (!name || !username || !email) {
    throw new ValidationError('Name, username, and email are required');
  }

  if (name.length < 2 || name.length > 50) {
    throw new ValidationError('Name must be between 2 and 50 characters');
  }

  if (username.length < 3 || username.length > 20) {
    throw new ValidationError('Username must be between 3 and 20 characters');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  // Bio validation
  if (bio && bio.length > 500) {
    throw new ValidationError('Bio must be less than 500 characters');
  }

  // Check for duplicates
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
    throw new ConflictError('Username or email already taken');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, username, email, avatar, bio },
    { new: true, select: '-password' }
  );

  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

/**
 * @Description    Enhanced save game score with comprehensive data
 * @Route   POST /api/auth/save-game
 * @Access  Private
 */
export const saveGameScore = asyncHandler(async (req, res) => {
  const gameData = req.body;
  const userId = req.user._id;

  // Enhanced validation for all game data fields
  const requiredFields = ['score', 'snakeLength', 'playTime'];
  const missingFields = requiredFields.filter(field => typeof gameData[field] !== 'number');

  if (missingFields.length > 0) {
    throw new ValidationError(`Missing or invalid required fields: ${missingFields.join(', ')}`);
  }

  // Validate ranges
  if (gameData.score < 0 || gameData.score > 100000) {
    throw new ValidationError('Score must be between 0 and 100,000');
  }

  if (gameData.snakeLength < 1 || gameData.snakeLength > 1000) {
    throw new ValidationError('Snake length must be between 1 and 1,000');
  }

  if (gameData.playTime < 1 || gameData.playTime > 7200) {
    throw new ValidationError('Play time must be between 1 second and 2 hours');
  }

  // Optional field validation
  if (gameData.foodEaten !== undefined && (gameData.foodEaten < 0 || gameData.foodEaten > 10000)) {
    throw new ValidationError('Food eaten must be between 0 and 10,000');
  }

  if (gameData.moveCount !== undefined && (gameData.moveCount < 1 || gameData.moveCount > 100000)) {
    throw new ValidationError('Move count must be between 1 and 100,000');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update comprehensive game stats
  user.updateGameStats(gameData);
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
});

/**
 * @Description    Get enhanced user game statistics
 * @Route   GET /api/auth/game-stats
 * @Access  Private
 */
export const getGameStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select('gameStats recentGames achievements preferences');

  if (!user) {
    throw new NotFoundError('User not found');
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
});

/**
 * @Description    Get user achievements
 * @Route   GET /api/auth/achievements
 * @Access  Private
 */
export const getAchievements = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select('achievements gameStats');

  if (!user) {
    throw new NotFoundError('User not found');
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
});

/**
 * @Description    Update user preferences
 * @Route   PUT /api/auth/preferences
 * @Access  Private
 */
export const updatePreferences = asyncHandler(async (req, res) => {
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

  if (Object.keys(validPreferences).length === 0) {
    throw new ValidationError('No valid preferences provided');
  }

  // Validate specific preference values
  if (preferences.difficultySetting && !['easy', 'normal', 'hard', 'expert'].includes(preferences.difficultySetting)) {
    throw new ValidationError('Difficulty setting must be: easy, normal, hard, or expert');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: validPreferences },
    { new: true, select: 'preferences' }
  );

  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: updatedUser.preferences
  });
});

/**
 * @Description    Start a game session
 * @Route   POST /api/auth/start-session
 * @Access  Private
 */
export const startGameSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId, deviceType, browserInfo } = req.body;

  if (!sessionId) {
    throw new ValidationError('Session ID is required');
  }

  if (deviceType && !['mobile', 'tablet', 'desktop'].includes(deviceType)) {
    throw new ValidationError('Device type must be: mobile, tablet, or desktop');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const session = user.startSession({
    sessionId,
    deviceType: deviceType || 'desktop',
    browserInfo: browserInfo || ''
  });

  await user.save();

  res.json({
    success: true,
    message: 'Game session started',
    session
  });
});

/**
 * @Description    End a game session
 * @Route   POST /api/auth/end-session
 * @Access  Private
 */
export const endGameSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.body;

  if (!sessionId) {
    throw new ValidationError('Session ID is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const session = user.endSession(sessionId);
  await user.save();

  res.json({
    success: true,
    message: 'Game session ended',
    session
  });
});

/**
 * @Description    Get enhanced leaderboard with multiple categories
 * @Route   GET /api/auth/leaderboard
 * @Access  Public
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10, type = 'highestScore', timeframe = 'all', page = 1 } = req.query;

  // Validate query parameters
  const validTypes = ['highestScore', 'totalGames', 'totalScore', 'winRate', 'efficiency', 'longestSnake', 'achievements'];
  if (!validTypes.includes(type)) {
    throw new ValidationError(`Type must be one of: ${validTypes.join(', ')}`);
  }

  const validTimeframes = ['all', 'daily', 'weekly', 'monthly'];
  if (!validTimeframes.includes(timeframe)) {
    throw new ValidationError(`Timeframe must be one of: ${validTimeframes.join(', ')}`);
  }

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);

  if (limitNum < 1 || limitNum > 100) {
    throw new ValidationError('Limit must be between 1 and 100');
  }

  if (pageNum < 1) {
    throw new ValidationError('Page must be at least 1');
  }

  const skip = (pageNum - 1) * limitNum;

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
      matchCondition['gameStats.totalGamesPlayed'] = { $gte: 5 };
      break;
    case 'efficiency':
      sortField = 'gameStats.bestEfficiency';
      break;
    case 'longestSnake':
      sortField = 'gameStats.longestSnake';
      break;
    case 'achievements':
      sortField = 'achievementCount';
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

  // Add pagination
  pipeline.push(
    { $skip: skip },
    { $limit: limitNum }
  );

  // Project fields (only inclusion)
  const projectStage = {
    $project: {
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
      createdAt: 1
    }
  };

  if (type === 'achievements') {
    projectStage.$project.achievementCount = 1;
  }

  pipeline.push(projectStage);

  // Get total count for pagination
  const totalCountPipeline = [
    { $match: matchCondition }
  ];

  if (type === 'achievements') {
    totalCountPipeline.push({ $addFields: { achievementCount: { $size: '$achievements' } } });
  }

  const [leaderboard, totalCountResult] = await Promise.all([
    User.aggregate(pipeline),
    User.aggregate([...totalCountPipeline, { $count: "total" }])
  ]);

  const totalCount = totalCountResult[0]?.total || 0;

  // Add rank to each user
  const rankedLeaderboard = leaderboard.map((user, index) => ({
    ...user,
    rank: skip + index + 1
  }));

  res.json({
    success: true,
    leaderboard: rankedLeaderboard,
    type,
    timeframe,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalCount
    }
  });
});

/**
 * @Description    Get user's rank in leaderboard
 * @Route   GET /api/auth/my-rank
 * @Access  Private
 */
export const getMyRank = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type = 'highestScore' } = req.query;

  // Validate type parameter
  const validTypes = ['highestScore', 'totalScore', 'totalGames', 'winRate'];
  if (!validTypes.includes(type)) {
    throw new ValidationError(`Type must be one of: ${validTypes.join(', ')}`);
  }

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
});

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