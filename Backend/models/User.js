import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 50 },
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'] },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "", maxlength: 500 },

  // Friends System
  friends: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],

  friendRequests: {
    sent: [{
      to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date, default: Date.now }
    }],
    received: [{
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      receivedAt: { type: Date, default: Date.now }
    }]
  },

  // Enhanced Game Statistics
  gameStats: {
    highestScore: { type: Number, default: 0 },
    totalGamesPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    longestSnake: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 }, // in seconds
    lastPlayedAt: { type: Date },

    // Enhanced game metrics
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    bestEfficiency: { type: Number, default: 0 }, // best score per move ratio
    averagePlayTime: { type: Number, default: 0 },
    fastestCompletion: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },

    // Power-up statistics
    powerUpsUsed: { type: Number, default: 0 },
    powerUpsByType: {
      speedBoost: { type: Number, default: 0 },
      doublePoints: { type: Number, default: 0 },
      invincible: { type: Number, default: 0 },
      extraLife: { type: Number, default: 0 }
    },

    // Device and gameplay statistics
    deviceStats: {
      mobile: { games: { type: Number, default: 0 }, bestScore: { type: Number, default: 0 } },
      tablet: { games: { type: Number, default: 0 }, bestScore: { type: Number, default: 0 } },
      desktop: { games: { type: Number, default: 0 }, bestScore: { type: Number, default: 0 } }
    },

    // Food and level statistics
    totalFoodEaten: { type: Number, default: 0 },
    goldenFoodEaten: { type: Number, default: 0 },
    highestLevel: { type: Number, default: 1 },
    totalMoves: { type: Number, default: 0 },

    // Time-based statistics
    playDays: [{ type: Date }], // Unique days played
    sessionStats: {
      longestSession: { type: Number, default: 0 }, // in seconds
      gamesInLongestSession: { type: Number, default: 0 },
      bestSessionScore: { type: Number, default: 0 }
    }
  },

  // Achievement System
  achievements: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tier: { type: String, required: true },
    points: { type: Number, default: 0 },
    unlockedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 100 }, // Achievement progress percentage
    isSecret: { type: Boolean, default: false }
  }],

  // Game History (enhanced to store more detailed data)
  recentGames: [{
    score: Number,
    snakeLength: Number,
    playTime: Number, // in seconds
    playedAt: { type: Date, default: Date.now },

    // Enhanced game data
    foodEaten: { type: Number, default: 0 },
    goldenFoodEaten: { type: Number, default: 0 },
    powerUpsUsed: { type: Number, default: 0 },
    powerUpsCollected: [{
      type: String,
      collectedAt: Number, // game time in ms
      effectiveness: Number // how much it helped
    }],
    moveCount: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 }, // score per move
    gameLevel: { type: Number, default: 1 },
    endReason: { type: String, default: 'collision' }, // collision, quit, completed
    deviceType: { type: String, default: 'desktop' },
    lives: { type: Number, default: 1 },
    usedInvincibility: { type: Boolean, default: false },

    // Performance metrics
    averageFPS: { type: Number, default: 60 },
    inputLatency: { type: Number, default: 0 },
    gameEvents: { type: Number, default: 0 }
  }],

  // User Preferences and Settings
  preferences: {
    soundEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    difficultySetting: { type: String, default: 'normal', enum: ['easy', 'normal', 'hard', 'expert'] },
    preferredDeviceType: { type: String, default: 'auto' },
    gameTheme: { type: String, default: 'classic' },
    showHints: { type: Boolean, default: true },
    autoSave: { type: Boolean, default: true }
  },

  // Social and Community Features
  social: {
    isPublic: { type: Boolean, default: true },
    shareStats: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },
    joinedCommunityAt: { type: Date, default: Date.now }
  },

  // Session and Analytics Data
  sessions: [{
    sessionId: String,
    startTime: Date,
    endTime: Date,
    gamesPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    deviceType: String,
    browserInfo: String
  }],

  // Seasonal and Event Data
  seasonalData: {
    currentSeason: String,
    seasonPoints: { type: Number, default: 0 },
    seasonRank: { type: Number, default: 0 },
    eventsParticipated: [String],
    specialAchievements: [String]
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Email verification fields
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// Indexes for performance
userSchema.index({ 'gameStats.highestScore': -1 });
userSchema.index({ 'gameStats.totalGamesPlayed': -1 });
userSchema.index({ 'gameStats.totalScore': -1 });
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'gameStats.lastPlayedAt': -1 });

// Update the updatedAt field before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Enhanced method to update game stats with all new features
userSchema.methods.updateGameStats = function (gameData) {
  const {
    score,
    snakeLength,
    playTime,
    foodEaten = 0,
    goldenFoodEaten = 0,
    powerUpsUsed = 0,
    powerUpsCollected = [],
    moveCount = 0,
    gameLevel = 1,
    endReason = 'collision',
    deviceType = 'desktop',
    lives = 1,
    usedInvincibility = false,
    averageFPS = 60,
    inputLatency = 0,
    gameEvents = 0
  } = gameData;

  // Validate input data
  if (typeof score !== 'number' || score < 0) {
    throw new Error('Invalid score data');
  }
  if (typeof snakeLength !== 'number' || snakeLength < 1) {
    throw new Error('Invalid snake length data');
  }
  if (typeof playTime !== 'number' || playTime < 1) {
    throw new Error('Invalid play time data');
  }

  // Update basic stats
  if (score > this.gameStats.highestScore) {
    this.gameStats.highestScore = score;
  }

  if (snakeLength > this.gameStats.longestSnake) {
    this.gameStats.longestSnake = snakeLength;
  }

  if (gameLevel > this.gameStats.highestLevel) {
    this.gameStats.highestLevel = gameLevel;
  }

  // Update totals
  this.gameStats.totalGamesPlayed += 1;
  this.gameStats.totalScore += score;
  this.gameStats.totalPlayTime += playTime;
  this.gameStats.totalFoodEaten += foodEaten;
  this.gameStats.goldenFoodEaten += goldenFoodEaten;
  this.gameStats.powerUpsUsed += powerUpsUsed;
  this.gameStats.totalMoves += moveCount;
  this.gameStats.lastPlayedAt = new Date();

  // Calculate averages
  this.gameStats.averageScore = Math.round(this.gameStats.totalScore / this.gameStats.totalGamesPlayed);
  this.gameStats.averagePlayTime = Math.round(this.gameStats.totalPlayTime / this.gameStats.totalGamesPlayed);

  // Update efficiency
  const currentEfficiency = moveCount > 0 ? Number((score / moveCount).toFixed(2)) : 0;
  if (currentEfficiency > this.gameStats.bestEfficiency) {
    this.gameStats.bestEfficiency = currentEfficiency;
  }

  // Update device stats safely
  const deviceKey = ['mobile', 'tablet', 'desktop'].includes(deviceType) ? deviceType : 'desktop';
  if (!this.gameStats.deviceStats[deviceKey]) {
    this.gameStats.deviceStats[deviceKey] = { games: 0, bestScore: 0 };
  }

  this.gameStats.deviceStats[deviceKey].games += 1;
  if (score > this.gameStats.deviceStats[deviceKey].bestScore) {
    this.gameStats.deviceStats[deviceKey].bestScore = score;
  }

  // Update power-up statistics
  powerUpsCollected.forEach(powerUp => {
    if (powerUp.type && this.gameStats.powerUpsByType[powerUp.type] !== undefined) {
      this.gameStats.powerUpsByType[powerUp.type] += 1;
    }
  });

  // Update win/loss stats
  const isWin = endReason === 'completed' || score >= 1000;
  if (isWin) {
    this.gameStats.gamesWon += 1;
    this.gameStats.currentStreak += 1;
    if (this.gameStats.currentStreak > this.gameStats.bestStreak) {
      this.gameStats.bestStreak = this.gameStats.currentStreak;
    }
  } else {
    this.gameStats.gamesLost += 1;
    this.gameStats.currentStreak = 0;
  }

  // Calculate win rate
  this.gameStats.winRate = Math.round((this.gameStats.gamesWon / this.gameStats.totalGamesPlayed) * 100);

  // Track unique play days
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day

  const playDayExists = this.gameStats.playDays.some(date => {
    const playDay = new Date(date);
    playDay.setHours(0, 0, 0, 0);
    return playDay.getTime() === today.getTime();
  });

  if (!playDayExists) {
    this.gameStats.playDays.push(today);
  }

  // Add to recent games with size limit
  const gameRecord = {
    score,
    snakeLength,
    playTime,
    playedAt: new Date(),
    foodEaten,
    goldenFoodEaten,
    powerUpsUsed,
    powerUpsCollected,
    moveCount,
    efficiency: currentEfficiency,
    gameLevel,
    endReason,
    deviceType: deviceKey,
    lives,
    usedInvincibility,
    averageFPS,
    inputLatency,
    gameEvents
  };

  this.recentGames.push(gameRecord);

  // ✅ FIXED: Properly maintain array size
  if (this.recentGames.length > 20) {
    this.recentGames = this.recentGames.slice(-20);
  }

  return this;
};

// Enhanced achievement checking with categories and tiers
userSchema.methods.checkAchievements = function () {
  const achievements = [];
  const stats = this.gameStats;

  // Enhanced achievement rules based on your achievements.js
  const achievementRules = [
    // Basic Achievements
    { id: "first_game", name: "First Steps", description: "Play your first game", category: "basic", tier: "bronze", points: 10, condition: stats.totalGamesPlayed >= 1 },
    { id: "first_score", name: "Breaking the Ice", description: "Score your first 10 points", category: "basic", tier: "bronze", points: 10, condition: stats.highestScore >= 10 },

    // Skill Achievements
    { id: "score_hunter", name: "Score Hunter", description: "Score 100 points in a single game", category: "skill", tier: "bronze", points: 10, condition: stats.highestScore >= 100 },
    { id: "snake_master", name: "Snake Master", description: "Score 500 points in a single game", category: "skill", tier: "silver", points: 25, condition: stats.highestScore >= 500 },
    { id: "legend", name: "Legend", description: "Score 1000 points in a single game", category: "skill", tier: "gold", points: 50, condition: stats.highestScore >= 1000 },

    // Snake Length Achievements
    { id: "long_snake", name: "Long Snake", description: "Grow your snake to 20 segments", category: "skill", tier: "bronze", points: 10, condition: stats.longestSnake >= 20 },
    { id: "giant_snake", name: "Giant Snake", description: "Grow your snake to 50 segments", category: "skill", tier: "silver", points: 25, condition: stats.longestSnake >= 50 },
    { id: "serpent_king", name: "Serpent King", description: "Grow your snake to 100 segments", category: "skill", tier: "gold", points: 50, condition: stats.longestSnake >= 100 },

    // Persistence Achievements
    { id: "dedication", name: "Dedication", description: "Play 10 games", category: "persistence", tier: "bronze", points: 10, condition: stats.totalGamesPlayed >= 10 },
    { id: "veteran", name: "Veteran", description: "Play 50 games", category: "persistence", tier: "silver", points: 25, condition: stats.totalGamesPlayed >= 50 },
    { id: "centurion", name: "Centurion", description: "Play 100 games", category: "persistence", tier: "gold", points: 50, condition: stats.totalGamesPlayed >= 100 },
    { id: "marathon_player", name: "Marathon Player", description: "Play for a total of 1 hour", category: "persistence", tier: "silver", points: 25, condition: stats.totalPlayTime >= 3600 },
    { id: "daily_player", name: "Daily Player", description: "Play games on 7 different days", category: "persistence", tier: "gold", points: 50, condition: stats.playDays.length >= 7 },

    // Social Achievements
    { id: "social_butterfly", name: "Social Butterfly", description: "Add your first friend", category: "social", tier: "bronze", points: 10, condition: this.friends.length >= 1 },
    { id: "popular", name: "Popular", description: "Have 5 friends", category: "social", tier: "silver", points: 25, condition: this.friends.length >= 5 },
    { id: "influencer", name: "Influencer", description: "Have 10 friends", category: "social", tier: "gold", points: 50, condition: this.friends.length >= 10 },

    // Special Achievements
    { id: "power_user", name: "Power User", description: "Use 10 power-ups in total", category: "special", tier: "bronze", points: 10, condition: stats.powerUpsUsed >= 10 },
    { id: "survivor", name: "Survivor", description: "Play for 5 minutes without dying", category: "special", tier: "silver", points: 25, condition: this.recentGames.some(game => game.playTime >= 300) },
    { id: "efficiency_expert", name: "Efficiency Expert", description: "Achieve 3+ points per move in a game", category: "special", tier: "platinum", points: 100, condition: stats.bestEfficiency >= 3 },

    // Milestone Achievements
    { id: "milestone_1k", name: "1K Club", description: "Accumulate 1,000 total points", category: "persistence", tier: "silver", points: 25, condition: stats.totalScore >= 1000 },
    { id: "milestone_10k", name: "10K Club", description: "Accumulate 10,000 total points", category: "persistence", tier: "gold", points: 50, condition: stats.totalScore >= 10000 },
    { id: "milestone_100k", name: "100K Club", description: "Accumulate 100,000 total points", category: "persistence", tier: "platinum", points: 100, condition: stats.totalScore >= 100000 },

    // Device-specific Achievements
    { id: "mobile_master", name: "Mobile Master", description: "Score 200+ points on mobile", category: "special", tier: "silver", points: 25, condition: stats.deviceStats.mobile.bestScore >= 200 },
    { id: "multi_platform", name: "Multi-Platform", description: "Play on both desktop and mobile", category: "special", tier: "bronze", points: 10, condition: stats.deviceStats.mobile.games > 0 && stats.deviceStats.desktop.games > 0 }
  ];

  // Check which achievements to unlock
  const existingAchievements = this.achievements.map(a => a.id);

  achievementRules.forEach(rule => {
    if (rule.condition && !existingAchievements.includes(rule.id)) {
      achievements.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        tier: rule.tier,
        points: rule.points
      });

      this.achievements.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        tier: rule.tier,
        points: rule.points,
        unlockedAt: new Date(),
        progress: 100,
        isSecret: false
      });
    }
  });

  return achievements;
};

// Session management methods
userSchema.methods.startSession = function (sessionData) {
  const session = {
    sessionId: sessionData.sessionId,
    startTime: new Date(),
    gamesPlayed: 0,
    totalScore: 0,
    deviceType: sessionData.deviceType || 'unknown',
    browserInfo: sessionData.browserInfo || ''
  };

  this.sessions.push(session);

  // Keep only last 10 sessions
  if (this.sessions.length > 10) {
    this.sessions = this.sessions.slice(-10);
  }

  return session;
};

userSchema.methods.endSession = function (sessionId) {
  const session = this.sessions.find(s => s.sessionId === sessionId);
  if (session && !session.endTime) {
    session.endTime = new Date();

    // Update session stats if this was longer than previous longest
    const sessionDuration = (session.endTime - session.startTime) / 1000; // in seconds
    if (sessionDuration > this.gameStats.sessionStats.longestSession) {
      this.gameStats.sessionStats.longestSession = sessionDuration;
      this.gameStats.sessionStats.gamesInLongestSession = session.gamesPlayed;
      this.gameStats.sessionStats.bestSessionScore = session.totalScore;
    }
  }
  return session;
};

// Friend system methods (keeping existing ones)
userSchema.methods.sendFriendRequest = async function (targetUserId) {
  const isAlreadyFriend = this.friends.some(friend => friend.user.toString() === targetUserId);
  if (isAlreadyFriend) {
    throw new Error('Already friends with this user');
  }

  const requestAlreadySent = this.friendRequests.sent.some(req => req.to.toString() === targetUserId);
  if (requestAlreadySent) {
    throw new Error('Friend request already sent');
  }

  const requestAlreadyReceived = this.friendRequests.received.some(req => req.from.toString() === targetUserId);
  if (requestAlreadyReceived) {
    throw new Error('This user has already sent you a friend request');
  }

  this.friendRequests.sent.push({ to: targetUserId });

  const targetUser = await mongoose.model('User').findById(targetUserId);
  if (!targetUser) {
    throw new Error('User not found');
  }

  targetUser.friendRequests.received.push({ from: this._id });

  await this.save();
  await targetUser.save();

  return true;
};

userSchema.methods.acceptFriendRequest = async function (fromUserId) {
  const requestIndex = this.friendRequests.received.findIndex(req => req.from.toString() === fromUserId);
  if (requestIndex === -1) {
    throw new Error('Friend request not found');
  }

  this.friendRequests.received.splice(requestIndex, 1);
  this.friends.push({ user: fromUserId });

  const senderUser = await mongoose.model('User').findById(fromUserId);
  if (senderUser) {
    const sentRequestIndex = senderUser.friendRequests.sent.findIndex(req => req.to.toString() === this._id.toString());
    if (sentRequestIndex !== -1) {
      senderUser.friendRequests.sent.splice(sentRequestIndex, 1);
    }
    senderUser.friends.push({ user: this._id });
    await senderUser.save();
  }

  await this.save();

  this.checkAchievements();
  if (senderUser) {
    senderUser.checkAchievements();
    await senderUser.save();
  }

  return true;
};

userSchema.methods.rejectFriendRequest = async function (fromUserId) {
  const requestIndex = this.friendRequests.received.findIndex(req => req.from.toString() === fromUserId);
  if (requestIndex === -1) {
    throw new Error('Friend request not found');
  }

  this.friendRequests.received.splice(requestIndex, 1);

  const senderUser = await mongoose.model('User').findById(fromUserId);
  if (senderUser) {
    const sentRequestIndex = senderUser.friendRequests.sent.findIndex(req => req.to.toString() === this._id.toString());
    if (sentRequestIndex !== -1) {
      senderUser.friendRequests.sent.splice(sentRequestIndex, 1);
    }
    await senderUser.save();
  }

  await this.save();
  return true;
};

userSchema.methods.removeFriend = async function (friendUserId) {
  const friendIndex = this.friends.findIndex(friend => friend.user.toString() === friendUserId);
  if (friendIndex === -1) {
    throw new Error('User is not in your friends list');
  }

  this.friends.splice(friendIndex, 1);

  const friendUser = await mongoose.model('User').findById(friendUserId);
  if (friendUser) {
    const thisFriendIndex = friendUser.friends.findIndex(friend => friend.user.toString() === this._id.toString());
    if (thisFriendIndex !== -1) {
      friendUser.friends.splice(thisFriendIndex, 1);
    }
    await friendUser.save();
  }

  await this.save();
  return true;
};

const User = mongoose.model('User', userSchema);
export default User;