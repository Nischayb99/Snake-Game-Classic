// Enhanced Achievements System with Categories and Tiers
export const ACHIEVEMENT_CATEGORIES = {
    BASIC: 'basic',
    SKILL: 'skill',
    SOCIAL: 'social',
    PERSISTENCE: 'persistence',
    SPECIAL: 'special',
    HIDDEN: 'hidden'
};

export const ACHIEVEMENT_TIERS = {
    BRONZE: { name: 'Bronze', color: '#cd7f32', points: 10 },
    SILVER: { name: 'Silver', color: '#c0c0c0', points: 25 },
    GOLD: { name: 'Gold', color: '#ffd700', points: 50 },
    PLATINUM: { name: 'Platinum', color: '#e5e4e2', points: 100 },
    DIAMOND: { name: 'Diamond', color: '#b9f2ff', points: 200 }
};

export const ENHANCED_ACHIEVEMENTS = {
    // Basic Achievements
    first_game: {
        id: 'first_game',
        name: 'First Steps',
        description: 'Play your first game',
        category: ACHIEVEMENT_CATEGORIES.BASIC,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '🎮',
        condition: (stats) => stats.totalGamesPlayed >= 1,
        secret: false,
        hint: 'Start playing the game'
    },

    first_score: {
        id: 'first_score',
        name: 'Breaking the Ice',
        description: 'Score your first 10 points',
        category: ACHIEVEMENT_CATEGORIES.BASIC,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '🎯',
        condition: (stats) => stats.highestScore >= 10,
        secret: false,
        hint: 'Eat some food to score points'
    },

    // Skill-based Achievements
    score_hunter: {
        id: 'score_hunter',
        name: 'Score Hunter',
        description: 'Score 100 points in a single game',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '🏹',
        condition: (stats) => stats.highestScore >= 100,
        secret: false,
        hint: 'Keep eating food and growing your snake'
    },

    snake_master: {
        id: 'snake_master',
        name: 'Snake Master',
        description: 'Score 500 points in a single game',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '🐍',
        condition: (stats) => stats.highestScore >= 500,
        secret: false,
        hint: 'Master the controls and plan your moves'
    },

    legend: {
        id: 'legend',
        name: 'Legend',
        description: 'Score 1000 points in a single game',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '👑',
        condition: (stats) => stats.highestScore >= 1000,
        secret: false,
        hint: 'Achieve legendary status with exceptional skill'
    },

    perfect_game: {
        id: 'perfect_game',
        name: 'Perfectionist',
        description: 'Score exactly 100 points in a game',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '💯',
        condition: (stats, gameData) => gameData?.lastGameScore === 100,
        secret: false,
        hint: 'Stop at exactly 100 points - precision matters!'
    },

    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Score 200 points in under 60 seconds',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '⚡',
        condition: (stats, gameData) => {
            return gameData?.lastGameScore >= 200 && gameData?.lastGameTime <= 60;
        },
        secret: false,
        hint: 'Play fast and efficiently to score quickly'
    },

    efficiency_expert: {
        id: 'efficiency_expert',
        name: 'Efficiency Expert',
        description: 'Achieve 3+ points per move in a game',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.PLATINUM,
        icon: '📊',
        condition: (stats, gameData) => {
            const efficiency = gameData?.lastGameScore / (gameData?.lastGameMoves || 1);
            return efficiency >= 3;
        },
        secret: false,
        hint: 'Plan optimal paths to maximize efficiency'
    },

    // Snake Length Achievements
    long_snake: {
        id: 'long_snake',
        name: 'Long Snake',
        description: 'Grow your snake to 20 segments',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '🐍',
        condition: (stats) => stats.longestSnake >= 20,
        secret: false,
        hint: 'Keep eating food to grow longer'
    },

    giant_snake: {
        id: 'giant_snake',
        name: 'Giant Snake',
        description: 'Grow your snake to 50 segments',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '🏗️',
        condition: (stats) => stats.longestSnake >= 50,
        secret: false,
        hint: 'Patience and skill will help you grow massive'
    },

    serpent_king: {
        id: 'serpent_king',
        name: 'Serpent King',
        description: 'Grow your snake to 100 segments',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '👑',
        condition: (stats) => stats.longestSnake >= 100,
        secret: false,
        hint: 'Become the ultimate serpent ruler'
    },

    // Persistence Achievements
    dedication: {
        id: 'dedication',
        name: 'Dedication',
        description: 'Play 10 games',
        category: ACHIEVEMENT_CATEGORIES.PERSISTENCE,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '🎯',
        condition: (stats) => stats.totalGamesPlayed >= 10,
        secret: false,
        hint: 'Keep playing to show your dedication'
    },

    veteran: {
        id: 'veteran',
        name: 'Veteran',
        description: 'Play 50 games',
        category: ACHIEVEMENT_CATEGORIES.PERSISTENCE,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '🏆',
        condition: (stats) => stats.totalGamesPlayed >= 50,
        secret: false,
        hint: 'Become a veteran player'
    },

    centurion: {
        id: 'centurion',
        name: 'Centurion',
        description: 'Play 100 games',
        category: ACHIEVEMENT_CATEGORIES.PERSISTENCE,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '💪',
        condition: (stats) => stats.totalGamesPlayed >= 100,
        secret: false,
        hint: 'Join the elite 100-game club'
    },

    marathon_player: {
        id: 'marathon_player',
        name: 'Marathon Player',
        description: 'Play for a total of 1 hour',
        category: ACHIEVEMENT_CATEGORIES.PERSISTENCE,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '⏰',
        condition: (stats) => stats.totalPlayTime >= 3600,
        secret: false,
        hint: 'Accumulate 1 hour of total playtime'
    },

    daily_player: {
        id: 'daily_player',
        name: 'Daily Player',
        description: 'Play games on 7 different days',
        category: ACHIEVEMENT_CATEGORIES.PERSISTENCE,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '📅',
        condition: (stats, gameData) => (gameData?.uniquePlayDays || 0) >= 7,
        secret: false,
        hint: 'Make playing a daily habit'
    },

    // Social Achievements
    social_butterfly: {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Add your first friend',
        category: ACHIEVEMENT_CATEGORIES.SOCIAL,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '🦋',
        condition: (stats, gameData, user) => (user?.friends?.length || 0) >= 1,
        secret: false,
        hint: 'Connect with other players'
    },

    popular: {
        id: 'popular',
        name: 'Popular',
        description: 'Have 5 friends',
        category: ACHIEVEMENT_CATEGORIES.SOCIAL,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '🌟',
        condition: (stats, gameData, user) => (user?.friends?.length || 0) >= 5,
        secret: false,
        hint: 'Build a network of gaming friends'
    },

    influencer: {
        id: 'influencer',
        name: 'Influencer',
        description: 'Have 10 friends',
        category: ACHIEVEMENT_CATEGORIES.SOCIAL,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '📢',
        condition: (stats, gameData, user) => (user?.friends?.length || 0) >= 10,
        secret: false,
        hint: 'Become an influential player in the community'
    },

    leaderboard_top10: {
        id: 'leaderboard_top10',
        name: 'Top 10',
        description: 'Reach top 10 on the leaderboard',
        category: ACHIEVEMENT_CATEGORIES.SOCIAL,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '🏅',
        condition: (stats, gameData) => (gameData?.leaderboardRank || 999) <= 10,
        secret: false,
        hint: 'Compete with others to reach the top 10'
    },

    leaderboard_top3: {
        id: 'leaderboard_top3',
        name: 'Podium Finisher',
        description: 'Reach top 3 on the leaderboard',
        category: ACHIEVEMENT_CATEGORIES.SOCIAL,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '🥉',
        condition: (stats, gameData) => (gameData?.leaderboardRank || 999) <= 3,
        secret: false,
        hint: 'Aim for the podium positions'
    },

    leaderboard_champion: {
        id: 'leaderboard_champion',
        name: 'Champion',
        description: 'Reach #1 on the leaderboard',
        category: ACHIEVEMENT_CATEGORIES.SOCIAL,
        tier: ACHIEVEMENT_TIERS.PLATINUM,
        icon: '👑',
        condition: (stats, gameData) => (gameData?.leaderboardRank || 999) === 1,
        secret: false,
        hint: 'Become the ultimate champion'
    },

    // Special Achievements
    power_user: {
        id: 'power_user',
        name: 'Power User',
        description: 'Use 10 power-ups in total',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '⚡',
        condition: (stats, gameData) => (gameData?.totalPowerUpsUsed || 0) >= 10,
        secret: false,
        hint: 'Collect and use various power-ups'
    },

    power_master: {
        id: 'power_master',
        name: 'Power Master',
        description: 'Use all 3 types of power-ups in a single game',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '🌟',
        condition: (stats, gameData) => (gameData?.powerUpTypesInLastGame || 0) >= 3,
        secret: false,
        hint: 'Collect speed boost, double points, and invincibility in one game'
    },

    survivor: {
        id: 'survivor',
        name: 'Survivor',
        description: 'Play for 5 minutes without dying',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '🛡️',
        condition: (stats, gameData) => (gameData?.lastGameTime || 0) >= 300,
        secret: false,
        hint: 'Survive for 5 continuous minutes'
    },

    close_call: {
        id: 'close_call',
        name: 'Close Call',
        description: 'Survive with invincibility power-up',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '😅',
        condition: (stats, gameData) => gameData?.usedInvincibility === true,
        secret: false,
        hint: 'Use the invincibility power-up to survive danger'
    },

    // Hidden/Secret Achievements
    konami_code: {
        id: 'konami_code',
        name: 'Classic Gamer',
        description: 'Enter the Konami code',
        category: ACHIEVEMENT_CATEGORIES.HIDDEN,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '🎮',
        condition: (stats, gameData) => gameData?.konamiCodeEntered === true,
        secret: true,
        hint: 'Remember the classic cheat code: ↑↑↓↓←→←→BA'
    },

    midnight_gamer: {
        id: 'midnight_gamer',
        name: 'Midnight Gamer',
        description: 'Play a game between 12 AM and 1 AM',
        category: ACHIEVEMENT_CATEGORIES.HIDDEN,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '🌙',
        condition: (stats, gameData) => {
            const hour = new Date().getHours();
            return hour === 0 && gameData?.gamePlayedRecently === true;
        },
        secret: true,
        hint: 'Some players prefer the quiet hours...'
    },

    speed_runner: {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Complete a game in under 10 seconds',
        category: ACHIEVEMENT_CATEGORIES.HIDDEN,
        tier: ACHIEVEMENT_TIERS.PLATINUM,
        icon: '💨',
        condition: (stats, gameData) => (gameData?.lastGameTime || 999) < 10,
        secret: true,
        hint: 'Sometimes the fastest way is the shortest way'
    },

    unlucky: {
        id: 'unlucky',
        name: 'Unlucky',
        description: 'Die within 3 seconds of starting',
        category: ACHIEVEMENT_CATEGORIES.HIDDEN,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '💀',
        condition: (stats, gameData) => (gameData?.lastGameTime || 999) <= 3,
        secret: true,
        hint: 'Sometimes things go wrong very quickly...'
    },

    persistent: {
        id: 'persistent',
        name: 'Persistent',
        description: 'Play 10 games in a row without closing the page',
        category: ACHIEVEMENT_CATEGORIES.HIDDEN,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '🔄',
        condition: (stats, gameData) => (gameData?.consecutiveGamesInSession || 0) >= 10,
        secret: true,
        hint: 'Dedication and focus lead to great things'
    },

    explorer: {
        id: 'explorer',
        name: 'Explorer',
        description: 'Visit all pages of the application',
        category: ACHIEVEMENT_CATEGORIES.HIDDEN,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '🗺️',
        condition: (stats, gameData) => (gameData?.pagesVisited || 0) >= 6,
        secret: true,
        hint: 'Curiosity leads to discovery'
    },

    // Milestone Achievements
    milestone_1k: {
        id: 'milestone_1k',
        name: '1K Club',
        description: 'Accumulate 1,000 total points across all games',
        category: ACHIEVEMENT_CATEGORIES.PERSISTENCE,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '1️⃣',
        condition: (stats) => stats.totalScore >= 1000,
        secret: false,
        hint: 'Keep playing to accumulate points'
    },

    milestone_10k: {
        id: 'milestone_10k',
        name: '10K Club',
        description: 'Accumulate 10,000 total points across all games',
        category: ACHIEVEMENT_CATEGORIES.PERSISTENCE,
        tier: ACHIEVEMENT_TIERS.GOLD,
        icon: '🔟',
        condition: (stats) => stats.totalScore >= 10000,
        secret: false,
        hint: 'A significant milestone awaits'
    },

    milestone_100k: {
        id: 'milestone_100k',
        name: '100K Club',
        description: 'Accumulate 100,000 total points across all games',
        category: ACHIEVEMENT_CATEGORIES.PERSISTENCE,
        tier: ACHIEVEMENT_TIERS.PLATINUM,
        icon: '💯',
        condition: (stats) => stats.totalScore >= 100000,
        secret: false,
        hint: 'Only the most dedicated reach this level'
    },

    // Device-specific Achievements
    mobile_master: {
        id: 'mobile_master',
        name: 'Mobile Master',
        description: 'Score 200+ points on a mobile device',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        tier: ACHIEVEMENT_TIERS.SILVER,
        icon: '📱',
        condition: (stats, gameData) => {
            return gameData?.deviceType === 'mobile' && gameData?.lastGameScore >= 200;
        },
        secret: false,
        hint: 'Master the touch controls'
    },

    multi_platform: {
        id: 'multi_platform',
        name: 'Multi-Platform',
        description: 'Play on both desktop and mobile',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        tier: ACHIEVEMENT_TIERS.BRONZE,
        icon: '🌐',
        condition: (stats, gameData) => (gameData?.platformsUsed || 0) >= 2,
        secret: false,
        hint: 'Try playing on different devices'
    }
};

// Achievement management class
export class AchievementManager {
    constructor() {
        this.achievements = ENHANCED_ACHIEVEMENTS;
        this.unlockedAchievements = this.loadUnlockedAchievements();
    }

    // Load unlocked achievements from storage
    loadUnlockedAchievements() {
        try {
            const stored = localStorage.getItem('snake_game_achievements');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load achievements:', error);
            return [];
        }
    }

    // Save unlocked achievements to storage
    saveUnlockedAchievements() {
        try {
            localStorage.setItem('snake_game_achievements', JSON.stringify(this.unlockedAchievements));
        } catch (error) {
            console.warn('Failed to save achievements:', error);
        }
    }

    // Check for new achievements
    checkAchievements(gameStats, gameData = {}, user = null) {
        const newAchievements = [];

        Object.values(this.achievements).forEach(achievement => {
            // Skip if already unlocked
            if (this.isUnlocked(achievement.id)) {
                return;
            }

            // Check if achievement condition is met
            try {
                if (achievement.condition(gameStats, gameData, user)) {
                    this.unlockAchievement(achievement.id);
                    newAchievements.push(achievement);
                }
            } catch (error) {
                console.warn(`Error checking achievement ${achievement.id}:`, error);
            }
        });

        if (newAchievements.length > 0) {
            this.saveUnlockedAchievements();
        }

        return newAchievements;
    }

    // Unlock an achievement
    unlockAchievement(achievementId) {
        if (!this.isUnlocked(achievementId)) {
            this.unlockedAchievements.push({
                id: achievementId,
                unlockedAt: Date.now()
            });
        }
    }

    // Check if achievement is unlocked
    isUnlocked(achievementId) {
        return this.unlockedAchievements.some(a => a.id === achievementId);
    }

    // Get all achievements for a category
    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }

    // Get all achievements for a tier
    getAchievementsByTier(tier) {
        return Object.values(this.achievements).filter(a => a.tier.name === tier);
    }

    // Get unlocked achievements
    getUnlockedAchievements() {
        return this.unlockedAchievements.map(unlocked => {
            const achievement = this.achievements[unlocked.id];
            return {
                ...achievement,
                unlockedAt: unlocked.unlockedAt
            };
        });
    }

    // Get achievement progress
    getAchievementProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.unlockedAchievements.length;
        const visible = Object.values(this.achievements).filter(a => !a.secret).length;
        const secretsUnlocked = this.unlockedAchievements.filter(a =>
            this.achievements[a.id]?.secret
        ).length;

        const totalPoints = this.unlockedAchievements.reduce((sum, unlocked) => {
            const achievement = this.achievements[unlocked.id];
            return sum + (achievement?.tier?.points || 0);
        }, 0);

        return {
            total,
            unlocked,
            visible,
            secretsUnlocked,
            percentage: Math.round((unlocked / total) * 100),
            totalPoints,
            averagePointsPerAchievement: unlocked > 0 ? Math.round(totalPoints / unlocked) : 0
        };
    }

    // Get achievements grouped by category
    getAchievementsGrouped() {
        const grouped = {};

        Object.values(ACHIEVEMENT_CATEGORIES).forEach(category => {
            grouped[category] = this.getAchievementsByCategory(category).map(achievement => ({
                ...achievement,
                unlocked: this.isUnlocked(achievement.id),
                unlockedAt: this.unlockedAchievements.find(a => a.id === achievement.id)?.unlockedAt
            }));
        });

        return grouped;
    }

    // Get next achievements to unlock (suggestions)
    getNextAchievements(gameStats, gameData = {}, user = null, limit = 3) {
        const lockedAchievements = Object.values(this.achievements)
            .filter(a => !this.isUnlocked(a.id) && !a.secret)
            .map(achievement => {
                // Calculate progress towards achievement
                let progress = 0;
                try {
                    // This is a simplified progress calculation
                    // You might want to implement more sophisticated progress tracking
                    if (achievement.id.includes('score')) {
                        const target = achievement.description.match(/\d+/)?.[0];
                        if (target) {
                            progress = Math.min((gameStats.highestScore / parseInt(target)) * 100, 100);
                        }
                    } else if (achievement.id.includes('games')) {
                        const target = achievement.description.match(/\d+/)?.[0];
                        if (target) {
                            progress = Math.min((gameStats.totalGamesPlayed / parseInt(target)) * 100, 100);
                        }
                    }
                } catch (error) {
                    // If progress calculation fails, default to 0
                }

                return {
                    ...achievement,
                    progress
                };
            })
            .sort((a, b) => b.progress - a.progress)
            .slice(0, limit);

        return lockedAchievements;
    }

    // Reset all achievements (for testing or user request)
    resetAchievements() {
        this.unlockedAchievements = [];
        this.saveUnlockedAchievements();
    }

    // Export achievements data
    exportAchievements() {
        return {
            achievements: this.achievements,
            unlocked: this.unlockedAchievements,
            progress: this.getAchievementProgress(),
            exportedAt: Date.now()
        };
    }

    // Import achievements data
    importAchievements(data) {
        if (data.unlocked && Array.isArray(data.unlocked)) {
            this.unlockedAchievements = data.unlocked;
            this.saveUnlockedAchievements();
            return true;
        }
        return false;
    }
}

// Create singleton instance
export const achievementManager = new AchievementManager();

export default achievementManager;