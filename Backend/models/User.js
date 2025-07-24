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

  // Game Statistics
  gameStats: {
    highestScore: { type: Number, default: 0 },
    totalGamesPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    longestSnake: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 }, // in seconds
    lastPlayedAt: { type: Date },
    achievements: [{
      name: String,
      description: String,
      unlockedAt: { type: Date, default: Date.now }
    }]
  },

  // Game History (last 10 games)
  recentGames: [{
    score: Number,
    snakeLength: Number,
    playTime: Number, // in seconds
    playedAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Email verification fields
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

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

// Method to update game stats
userSchema.methods.updateGameStats = function (gameData) {
  const { score, snakeLength, playTime } = gameData;

  // Update highest score
  if (score > this.gameStats.highestScore) {
    this.gameStats.highestScore = score;
  }

  // Update longest snake
  if (snakeLength > this.gameStats.longestSnake) {
    this.gameStats.longestSnake = snakeLength;
  }

  // Update totals
  this.gameStats.totalGamesPlayed += 1;
  this.gameStats.totalScore += score;
  this.gameStats.totalPlayTime += playTime;
  this.gameStats.lastPlayedAt = new Date();

  // Calculate average score
  this.gameStats.averageScore = Math.round(this.gameStats.totalScore / this.gameStats.totalGamesPlayed);

  // Add to recent games (keep only last 10)
  this.recentGames.push({
    score,
    snakeLength,
    playTime,
    playedAt: new Date()
  });

  // Keep only last 10 games
  if (this.recentGames.length > 10) {
    this.recentGames = this.recentGames.slice(-10);
  }

  return this;
};

// Method to check and unlock achievements
userSchema.methods.checkAchievements = function () {
  const achievements = [];
  const stats = this.gameStats;

  // Define achievements
  const achievementRules = [
    { name: "First Game", description: "Play your first game", condition: stats.totalGamesPlayed >= 1 },
    { name: "Score Hunter", description: "Score 100 points", condition: stats.highestScore >= 100 },
    { name: "Snake Master", description: "Score 500 points", condition: stats.highestScore >= 500 },
    { name: "Legend", description: "Score 1000 points", condition: stats.highestScore >= 1000 },
    { name: "Dedication", description: "Play 10 games", condition: stats.totalGamesPlayed >= 10 },
    { name: "Veteran", description: "Play 50 games", condition: stats.totalGamesPlayed >= 50 },
    { name: "Long Snake", description: "Grow snake to 20 segments", condition: stats.longestSnake >= 20 },
    { name: "Giant Snake", description: "Grow snake to 50 segments", condition: stats.longestSnake >= 50 },
    { name: "Social Butterfly", description: "Add your first friend", condition: this.friends.length >= 1 },
    { name: "Popular", description: "Have 5 friends", condition: this.friends.length >= 5 },
  ];

  // Check which achievements to unlock
  const existingAchievements = this.gameStats.achievements.map(a => a.name);

  achievementRules.forEach(rule => {
    if (rule.condition && !existingAchievements.includes(rule.name)) {
      achievements.push({
        name: rule.name,
        description: rule.description
      });
      this.gameStats.achievements.push({
        name: rule.name,
        description: rule.description,
        unlockedAt: new Date()
      });
    }
  });

  return achievements;
};

// Friend system methods
userSchema.methods.sendFriendRequest = async function (targetUserId) {
  // Check if already friends
  const isAlreadyFriend = this.friends.some(friend => friend.user.toString() === targetUserId);
  if (isAlreadyFriend) {
    throw new Error('Already friends with this user');
  }

  // Check if request already sent
  const requestAlreadySent = this.friendRequests.sent.some(req => req.to.toString() === targetUserId);
  if (requestAlreadySent) {
    throw new Error('Friend request already sent');
  }

  // Check if request already received from this user
  const requestAlreadyReceived = this.friendRequests.received.some(req => req.from.toString() === targetUserId);
  if (requestAlreadyReceived) {
    throw new Error('This user has already sent you a friend request');
  }

  // Add to sent requests
  this.friendRequests.sent.push({ to: targetUserId });

  // Add to target user's received requests
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
  // Check if request exists
  const requestIndex = this.friendRequests.received.findIndex(req => req.from.toString() === fromUserId);
  if (requestIndex === -1) {
    throw new Error('Friend request not found');
  }

  // Remove from received requests
  this.friendRequests.received.splice(requestIndex, 1);

  // Add to friends list
  this.friends.push({ user: fromUserId });

  // Add to sender's friends list and remove from sent requests
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

  // Check for achievements
  this.checkAchievements();
  if (senderUser) {
    senderUser.checkAchievements();
    await senderUser.save();
  }

  return true;
};

userSchema.methods.rejectFriendRequest = async function (fromUserId) {
  // Remove from received requests
  const requestIndex = this.friendRequests.received.findIndex(req => req.from.toString() === fromUserId);
  if (requestIndex === -1) {
    throw new Error('Friend request not found');
  }

  this.friendRequests.received.splice(requestIndex, 1);

  // Remove from sender's sent requests
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
  // Remove from this user's friends
  const friendIndex = this.friends.findIndex(friend => friend.user.toString() === friendUserId);
  if (friendIndex === -1) {
    throw new Error('User is not in your friends list');
  }

  this.friends.splice(friendIndex, 1);

  // Remove from friend's friends list
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