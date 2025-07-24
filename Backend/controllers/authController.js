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
      // Generate a unique username from display name
      let username = profile.displayName.replace(/\s+/g, '').toLowerCase();

      // Check if username exists, if so, add random numbers
      let existingUser = await User.findOne({ username });
      if (existingUser) {
        username = username + Math.floor(Math.random() * 10000);
      }

      user = await User.create({
        name: profile.displayName,
        username: username,
        email: profile.emails[0].value,
        isVerified: true,
        password: Math.random().toString(36), // random password
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

    // Generate username from name if not provided
    let username = name.replace(/\s+/g, '').toLowerCase();

    // Check if username exists, if so, add random numbers
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      username = username + Math.floor(Math.random() * 10000);
    }

    // Check if user already exists (case-insensitive)
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

    // Generate verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    // Create new user with verification fields
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
};

export const resetPassword = async (req, res) => {
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
};

/**
 * @Description    Login user
 * @Route   POST /api/auth/login
 * @Access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email before logging in." });
    }

    // Generate JWT token and send as cookie
    const token = generateToken(user);
    sendTokenCookie(res, token);

    // Send user data (without password)
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
    // Clear the auth cookie with same options as set
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
    // User is already attached to req by the protect middleware
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

    // Check if username or email already exists for another user
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

    // Update user profile
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
 * @Description    Save game score and update stats
 * @Route   POST /api/auth/save-game
 * @Access  Private
 */
export const saveGameScore = async (req, res) => {
  try {
    const { score, snakeLength, playTime } = req.body;
    const userId = req.user._id;

    // Validate input
    if (typeof score !== 'number' || typeof snakeLength !== 'number' || typeof playTime !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid game data'
      });
    }

    // Find user and update game stats
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update game stats
    user.updateGameStats({ score, snakeLength, playTime });

    // Check for new achievements
    const newAchievements = user.checkAchievements();

    // Save user
    await user.save();

    res.json({
      success: true,
      message: 'Game score saved successfully',
      gameStats: user.gameStats,
      newAchievements
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
 * @Description    Get user game statistics
 * @Route   GET /api/auth/game-stats
 * @Access  Private
 */
export const getGameStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('gameStats recentGames');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      gameStats: user.gameStats,
      recentGames: user.recentGames
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
 * @Description    Get leaderboard
 * @Route   GET /api/auth/leaderboard
 * @Access  Public
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, type = 'highestScore' } = req.query;

    let sortField = 'gameStats.highestScore';
    if (type === 'totalGames') sortField = 'gameStats.totalGamesPlayed';
    if (type === 'totalScore') sortField = 'gameStats.totalScore';

    const leaderboard = await User.find({ 'gameStats.totalGamesPlayed': { $gt: 0 } })
      .select('name username avatar gameStats.highestScore gameStats.totalGamesPlayed gameStats.totalScore')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
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
  getLeaderboard
};