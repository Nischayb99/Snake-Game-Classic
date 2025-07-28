export const PORT = process.env.PORT || 5000;

export const API_ENDPOINTS = {
    health: 'GET /api/health',
    auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'GET /api/auth/logout',
        profile: 'GET /api/auth/me',
        gameStats: 'GET /api/auth/game-stats',
        achievements: 'GET /api/auth/achievements',
        saveGame: 'POST /api/auth/save-game',
        preferences: 'PUT /api/auth/preferences',
        leaderboard: 'GET /api/auth/leaderboard',
        myRank: 'GET /api/auth/my-rank'
    },
    friends: {
        search: 'GET /api/friends/search',
        profile: 'GET /api/friends/user/:id',
        sendRequest: 'POST /api/friends/request/:id',
        acceptRequest: 'POST /api/friends/accept/:id',
        getFriends: 'GET /api/friends',
        leaderboard: 'GET /api/friends/leaderboard'
    }
};

// Updated ALLOWED_ORIGINS with Render URL
export const ALLOWED_ORIGINS = [
    process.env.PRODUCTION_FRONTEND_URL,
    process.env.LOCALHOST_FRONTEND_URL,
    'https://snake-game-classic.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:4173',
    // Add your actual Render URLs here
    'https://your-app-name.onrender.com',
    'https://snake-game-api.onrender.com'
].filter(origin => origin && origin.trim() !== '');