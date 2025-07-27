import axios from 'axios';

// Create an axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging (optional)
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for debugging (optional)
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

// Handle API errors
const handleApiError = (error) => {
  const message =
    error.response?.data?.message ||
    error.message ||
    'Something went wrong';

  return {
    message,
    status: error.response?.status || 500,
    data: error.response?.data
  };
};

// Enhanced Auth API services
export const authService = {
  // ===== Authentication Methods =====

  // Register a new user
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.get('/auth/logout');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/update-profile', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Email verification
  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Game Methods =====

  // Save game score
  saveGameScore: async (gameData) => {
    try {
      const response = await api.post('/auth/save-game', gameData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user game statistics
  getGameStats: async () => {
    try {
      const response = await api.get('/auth/game-stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user achievements
  getAchievements: async () => {
    try {
      const response = await api.get('/auth/achievements');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', preferences);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Start game session
  startGameSession: async (sessionData) => {
    try {
      const response = await api.post('/auth/start-session', sessionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // End game session
  endGameSession: async (sessionData) => {
    try {
      const response = await api.post('/auth/end-session', sessionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get leaderboard
  getLeaderboard: async (params = {}) => {
    try {
      const response = await api.get('/auth/leaderboard', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's rank
  getMyRank: async (type = 'highestScore') => {
    try {
      const response = await api.get('/auth/my-rank', { params: { type } });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Friends Methods =====

  // Search users
  searchUsers: async (query, filter = 'all', limit = 10) => {
    try {
      const response = await api.get('/friends/search', {
        params: { q: query, filter, limit }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/friends/user/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Send friend request
  sendFriendRequest: async (userId) => {
    try {
      const response = await api.post(`/friends/request/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Accept friend request
  acceptFriendRequest: async (userId) => {
    try {
      const response = await api.post(`/friends/accept/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Reject friend request
  rejectFriendRequest: async (userId) => {
    try {
      const response = await api.post(`/friends/reject/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Remove friend
  removeFriend: async (userId) => {
    try {
      const response = await api.delete(`/friends/remove/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get friends list
  getFriends: async (sortBy = 'recent', limit = 50) => {
    try {
      const response = await api.get('/friends', {
        params: { sortBy, limit }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get friend requests
  getFriendRequests: async () => {
    try {
      const response = await api.get('/friends/requests');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get friends leaderboard
  getFriendsLeaderboard: async (type = 'highestScore', limit = 20) => {
    try {
      const response = await api.get('/friends/leaderboard', {
        params: { type, limit }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get mutual friends
  getMutualFriends: async (userId) => {
    try {
      const response = await api.get(`/friends/mutual/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Utility Methods =====

  // Check server health
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Report error
  reportError: async (errorData) => {
    try {
      const response = await api.post('/error-report', errorData);
      return response.data;
    } catch (error) {
      // Don't throw on error reporting failure
      console.warn('Failed to report error:', error);
      return { success: false };
    }
  },

  // Report performance data
  reportPerformance: async (performanceData) => {
    try {
      const response = await api.post('/performance-report', performanceData);
      return response.data;
    } catch (error) {
      // Don't throw on performance reporting failure
      console.warn('Failed to report performance:', error);
      return { success: false };
    }
  },

  // Get analytics
  getAnalytics: async (type = 'user') => {
    try {
      const response = await api.get(`/analytics/${type}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Batch requests
  batchRequest: async (requests) => {
    try {
      const response = await api.post('/batch', { requests });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Export user data
  exportUserData: async () => {
    try {
      const response = await api.get('/export/user-data');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Import user data
  importUserData: async (data) => {
    try {
      const response = await api.post('/import/user-data', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Account Management =====

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/auth/delete-account');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Request account data
  requestAccountData: async () => {
    try {
      const response = await api.get('/auth/account-data');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Game Features =====

  // Get daily challenge
  getDailyChallenge: async () => {
    try {
      const response = await api.get('/game/daily-challenge');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Submit daily challenge score
  submitDailyChallengeScore: async (challengeId, score) => {
    try {
      const response = await api.post('/game/daily-challenge/submit', {
        challengeId,
        score
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get seasonal events
  getSeasonalEvents: async () => {
    try {
      const response = await api.get('/game/seasonal-events');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Participate in event
  participateInEvent: async (eventId, participationData) => {
    try {
      const response = await api.post(`/game/events/${eventId}/participate`, participationData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Tournament Features =====

  // Get tournaments
  getTournaments: async () => {
    try {
      const response = await api.get('/tournaments');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Join tournament
  joinTournament: async (tournamentId) => {
    try {
      const response = await api.post(`/tournaments/${tournamentId}/join`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get tournament leaderboard
  getTournamentLeaderboard: async (tournamentId) => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/leaderboard`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Notifications =====

  // Get notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Privacy Settings =====

  // Get privacy settings
  getPrivacySettings: async () => {
    try {
      const response = await api.get('/privacy/settings');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update privacy settings
  updatePrivacySettings: async (settings) => {
    try {
      const response = await api.put('/privacy/settings', settings);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== Support & Feedback =====

  // Submit feedback
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/support/feedback', feedbackData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Report bug
  reportBug: async (bugData) => {
    try {
      const response = await api.post('/support/bug-report', bugData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get support tickets
  getSupportTickets: async () => {
    try {
      const response = await api.get('/support/tickets');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create support ticket
  createSupportTicket: async (ticketData) => {
    try {
      const response = await api.post('/support/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Helper functions for common operations
export const AuthHelpers = {
  // Token management
  isLoggedIn: () => {
    return document.cookie.includes('auth_token');
  },

  // Local storage helpers
  saveLocalData: (key, data) => {
    try {
      localStorage.setItem(`snake_game_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save local data:', error);
    }
  },

  getLocalData: (key) => {
    try {
      const data = localStorage.getItem(`snake_game_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to get local data:', error);
      return null;
    }
  },

  removeLocalData: (key) => {
    try {
      localStorage.removeItem(`snake_game_${key}`);
    } catch (error) {
      console.warn('Failed to remove local data:', error);
    }
  },

  // Validation helpers
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    return password && password.length >= 6;
  },

  validateUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  // Format helpers
  formatScore: (score) => {
    return score.toLocaleString();
  },

  formatPlayTime: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString();
  },

  // Game state helpers
  calculateLevel: (totalGames) => {
    return Math.floor(totalGames / 10) + 1;
  },

  calculateProgress: (current, target) => {
    return Math.min((current / target) * 100, 100);
  },

  // Error handling helpers
  handleApiError: (error) => {
    console.error('API Error:', error);

    if (error.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      return 'Please log in to continue';
    } else if (error.status === 403) {
      // Forbidden
      return 'You do not have permission to perform this action';
    } else if (error.status === 404) {
      // Not found
      return 'The requested resource was not found';
    } else if (error.status === 500) {
      // Server error
      return 'Server error. Please try again later';
    } else {
      // Generic error
      return error.message || 'An unexpected error occurred';
    }
  },

  // Retry mechanism
  withRetry: async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
};

export default api;