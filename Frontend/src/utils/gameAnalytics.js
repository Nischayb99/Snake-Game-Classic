// Enhanced Game Analytics System with Real-time Tracking and ML-ready Data
class GameAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.sessionStart = Date.now();
        this.events = [];
        this.gameEvents = [];
        this.performanceEvents = [];
        this.maxEvents = 2000; // Increased for more data
        this.maxGameEvents = 500; // Separate limit for game events
        this.storageKey = 'snake_game_analytics';
        this.gameStorageKey = 'snake_game_events';
        this.performanceStorageKey = 'snake_performance_metrics';
        this.realtimeBuffer = [];
        this.isTracking = true;

        // Initialize game metrics BEFORE calling init()
        this.initializeGameMetrics();
        this.init();
    }

    generateSessionId() {
        return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Initialize game-specific metrics (moved to constructor)
    initializeGameMetrics() {
        this.gameMetrics = {
            currentGame: null,
            sessionStats: {
                gamesPlayed: 0,
                totalScore: 0,
                totalPlayTime: 0,
                highestScore: 0,
                averageScore: 0,
                powerUpsUsed: 0,
                achievementsUnlocked: 0
            },
            deviceMetrics: {
                deviceType: this.getDeviceType(),
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                pixelRatio: window.devicePixelRatio || 1,
                touchSupported: 'ontouchstart' in window
            },
            performanceMetrics: {
                frameRates: [],
                loadTimes: [],
                memoryUsage: [],
                errorCount: 0
            }
        };
    }

    getDeviceType() {
        try {
            const width = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);

            if (isMobile || width < 768) return 'mobile';
            if (width < 1024) return 'tablet';
            return 'desktop';
        } catch (error) {
            console.warn('Device type detection failed:', error);
            return 'unknown';
        }
    }

    init() {
        this.loadStoredData();
        this.setupAutoSave();
        this.setupSessionTracking();
        this.setupPerformanceMonitoring();
        this.cleanupOldData();
    }

    // Enhanced event tracking with categorization
    trackEvent(eventName, properties = {}, category = 'general') {
        if (!this.isTracking) return null;

        // Ensure gameMetrics is initialized
        if (!this.gameMetrics) {
            this.initializeGameMetrics();
        }

        const event = {
            id: this.generateEventId(),
            name: eventName,
            category,
            properties: {
                ...properties,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                sessionDuration: Date.now() - this.sessionStart,
                url: window.location.pathname,
                userAgent: navigator.userAgent.substr(0, 100), // Truncate for storage
                deviceMetrics: this.gameMetrics.deviceMetrics,
                performanceSnapshot: this.getPerformanceSnapshot()
            },
            metadata: {
                version: '2.0',
                clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                cookiesEnabled: navigator.cookieEnabled,
                onlineStatus: navigator.onLine
            }
        };

        this.events.push(event);
        this.realtimeBuffer.push(event);

        // Separate game events for specialized analysis
        if (category === 'game') {
            this.gameEvents.push(event);
            this.updateGameMetrics(event);
        }

        // Keep only recent events
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        if (this.gameEvents.length > this.maxGameEvents) {
            this.gameEvents = this.gameEvents.slice(-this.maxGameEvents);
        }

        // Real-time processing for critical events
        this.processRealtimeEvent(event);

        return event.id;
    }

    generateEventId() {
        return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    }

    // Game-specific tracking methods with enhanced data
    trackGameStart(gameConfig = {}) {
        if (!this.gameMetrics) {
            this.initializeGameMetrics();
        }

        const gameId = this.generateEventId();

        this.gameMetrics.currentGame = {
            id: gameId,
            startTime: Date.now(),
            config: gameConfig,
            events: [],
            powerUpsCollected: [],
            achievementsUnlocked: [],
            performance: {
                frameRates: [],
                inputLatency: [],
                renderTime: []
            }
        };

        return this.trackEvent('game_start', {
            gameId,
            gameMode: gameConfig.mode || 'classic',
            difficulty: gameConfig.difficulty || 'normal',
            deviceType: this.getDeviceType(),
            canvasSize: `${gameConfig.canvasWidth || 800}x${gameConfig.canvasHeight || 500}`,
            gridSize: gameConfig.gridSize || 20,
            initialSpeed: gameConfig.initialSpeed || 150,
            powerUpsEnabled: gameConfig.powerUpsEnabled !== false,
            livesEnabled: gameConfig.livesEnabled || false,
            sessionGamesCount: this.gameMetrics.sessionStats.gamesPlayed + 1
        }, 'game');
    }

    trackGameEnd(gameData = {}) {
        if (!this.gameMetrics || !this.gameMetrics.currentGame) return null;

        const currentGame = this.gameMetrics.currentGame;
        const duration = gameData.playTime || (Date.now() - currentGame.startTime) / 1000;
        const score = gameData.score || 0;
        const moves = gameData.moveCount || 0;

        // Calculate advanced metrics
        const efficiency = moves > 0 ? score / moves : 0;
        const scorePerSecond = duration > 0 ? score / duration : 0;
        const averageFrameRate = currentGame.performance.frameRates.length > 0 ?
            currentGame.performance.frameRates.reduce((a, b) => a + b, 0) / currentGame.performance.frameRates.length : 0;

        // Update session stats
        this.gameMetrics.sessionStats.gamesPlayed++;
        this.gameMetrics.sessionStats.totalScore += score;
        this.gameMetrics.sessionStats.totalPlayTime += duration;

        if (score > this.gameMetrics.sessionStats.highestScore) {
            this.gameMetrics.sessionStats.highestScore = score;
        }

        this.gameMetrics.sessionStats.averageScore =
            this.gameMetrics.sessionStats.totalScore / this.gameMetrics.sessionStats.gamesPlayed;

        const enhancedGameData = {
            gameId: currentGame.id,
            ...gameData,
            duration,
            efficiency,
            scorePerSecond,
            averageFrameRate,
            completionStatus: this.getCompletionStatus(gameData),
            performance: this.calculatePerformanceRating(gameData),
            skillLevel: this.calculateSkillLevel(gameData),
            gameEvents: currentGame.events.length,
            powerUpsCollected: currentGame.powerUpsCollected.length,
            achievementsUnlocked: currentGame.achievementsUnlocked.length,
            inputMetrics: this.calculateInputMetrics(currentGame),
            visualMetrics: this.calculateVisualMetrics(currentGame),
            endReason: gameData.endReason || this.determineEndReason(gameData),
            sessionContext: {
                gameNumber: this.gameMetrics.sessionStats.gamesPlayed,
                sessionDuration: Date.now() - this.sessionStart,
                previousBestInSession: this.gameMetrics.sessionStats.highestScore - score
            }
        };

        this.gameMetrics.currentGame = null;

        return this.trackEvent('game_end', enhancedGameData, 'game');
    }

    trackGameAction(action, data = {}) {
        if (!this.gameMetrics || !this.gameMetrics.currentGame) return null;

        const actionEvent = {
            action,
            timestamp: Date.now(),
            gameTime: Date.now() - this.gameMetrics.currentGame.startTime,
            ...data
        };

        this.gameMetrics.currentGame.events.push(actionEvent);

        return this.trackEvent('game_action', {
            gameId: this.gameMetrics.currentGame.id,
            action,
            gameTime: actionEvent.gameTime,
            ...data
        }, 'game');
    }

    trackPowerUpCollected(powerUpType, gameState = {}) {
        if (!this.gameMetrics || !this.gameMetrics.currentGame) return null;

        const powerUpEvent = {
            type: powerUpType,
            timestamp: Date.now(),
            gameTime: Date.now() - this.gameMetrics.currentGame.startTime,
            gameState: { ...gameState }
        };

        this.gameMetrics.currentGame.powerUpsCollected.push(powerUpEvent);
        this.gameMetrics.sessionStats.powerUpsUsed++;

        return this.trackEvent('powerup_collected', {
            gameId: this.gameMetrics.currentGame.id,
            powerUpType,
            gameTime: powerUpEvent.gameTime,
            gameScore: gameState.score || 0,
            snakeLength: gameState.snakeLength || 0,
            gameLevel: gameState.gameLevel || 1,
            activePowerUps: gameState.activePowerUps || [],
            effectiveness: this.calculatePowerUpEffectiveness(powerUpType, gameState)
        }, 'game');
    }

    trackPowerUpUsed(powerUpType, gameState = {}, result = {}) {
        return this.trackEvent('powerup_used', {
            gameId: this.gameMetrics.currentGame?.id,
            powerUpType,
            gameScore: gameState.score || 0,
            gameTime: this.gameMetrics.currentGame ?
                Date.now() - this.gameMetrics.currentGame.startTime : 0,
            snakeLength: gameState.snakeLength || 0,
            result: result,
            timingAnalysis: this.analyzePowerUpTiming(powerUpType, gameState)
        }, 'game');
    }

    trackAchievementUnlocked(achievement = {}) {
        if (this.gameMetrics && this.gameMetrics.currentGame) {
            this.gameMetrics.currentGame.achievementsUnlocked.push({
                ...achievement,
                timestamp: Date.now(),
                gameTime: Date.now() - this.gameMetrics.currentGame.startTime
            });
        }

        if (this.gameMetrics) {
            this.gameMetrics.sessionStats.achievementsUnlocked++;
        }

        return this.trackEvent('achievement_unlocked', {
            gameId: this.gameMetrics.currentGame?.id,
            achievementId: achievement.id,
            achievementName: achievement.name,
            achievementCategory: achievement.category,
            achievementPoints: achievement.points || 0,
            isFirstTime: achievement.isFirstTime !== false,
            gameContext: this.getGameContext(),
            rarity: this.calculateAchievementRarity(achievement.id),
            ...achievement
        }, 'achievement');
    }

    trackPerformanceMetric(metric, value, context = {}) {
        const performanceEvent = {
            id: this.generateEventId(),
            metric,
            value,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            gameId: this.gameMetrics?.currentGame?.id,
            context,
            systemInfo: this.getSystemInfo()
        };

        this.performanceEvents.push(performanceEvent);
        this.updatePerformanceMetrics(metric, value);

        // Keep only recent performance events
        if (this.performanceEvents.length > 1000) {
            this.performanceEvents = this.performanceEvents.slice(-1000);
        }

        return performanceEvent.id;
    }

    trackFrameRate(fps) {
        if (this.gameMetrics && this.gameMetrics.currentGame) {
            this.gameMetrics.currentGame.performance.frameRates.push(fps);
        }
        if (this.gameMetrics) {
            this.gameMetrics.performanceMetrics.frameRates.push({
                fps,
                timestamp: Date.now()
            });
        }

        // Track significant FPS drops
        if (fps < 30) {
            this.trackEvent('performance_issue', {
                type: 'low_fps',
                fps,
                expected: 60,
                gameActive: !!(this.gameMetrics && this.gameMetrics.currentGame)
            }, 'performance');
        }
    }

    trackInputLatency(latency) {
        if (this.gameMetrics && this.gameMetrics.currentGame) {
            this.gameMetrics.currentGame.performance.inputLatency.push(latency);
        }

        if (latency > 100) { // High latency threshold
            this.trackEvent('performance_issue', {
                type: 'high_input_latency',
                latency,
                expected: 50
            }, 'performance');
        }
    }

    trackMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const usage = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };

            if (this.gameMetrics) {
                this.gameMetrics.performanceMetrics.memoryUsage.push(usage);
            }

            // Track memory leaks
            const usagePercentage = (usage.used / usage.limit) * 100;
            if (usagePercentage > 90) {
                this.trackEvent('performance_issue', {
                    type: 'high_memory_usage',
                    usagePercentage,
                    memoryInfo: usage
                }, 'performance');
            }

            return usage;
        }
        return null;
    }

    // Enhanced analytics processing
    updateGameMetrics(event) {
        if (!this.gameMetrics) return;

        // Real-time metric updates based on events
        switch (event.name) {
            case 'game_start':
                this.gameMetrics.sessionStats.gamesPlayed++;
                break;
            case 'powerup_collected':
                this.gameMetrics.sessionStats.powerUpsUsed++;
                break;
            case 'achievement_unlocked':
                this.gameMetrics.sessionStats.achievementsUnlocked++;
                break;
        }
    }

    processRealtimeEvent(event) {
        // Process events for real-time insights
        if (event.category === 'game') {
            this.updateGameInsights(event);
        }

        // Trigger alerts for critical issues
        if (event.category === 'performance' && event.properties.type === 'low_fps') {
            this.triggerPerformanceAlert(event);
        }

        // Machine learning feature extraction
        this.extractMLFeatures(event);
    }

    updateGameInsights(event) {
        // Real-time game insights
        const insights = this.getGameInsights();

        // Update running averages and patterns
        switch (event.name) {
            case 'game_end':
                this.updateSkillProgression(event.properties);
                this.updatePlayPattern(event.properties);
                break;
            case 'powerup_collected':
                this.updatePowerUpStrategy(event.properties);
                break;
        }
    }

    // Advanced analytics calculations
    calculatePerformanceRating(gameData) {
        const score = gameData.score || 0;
        const moves = gameData.moveCount || 1;
        const duration = gameData.playTime || 1;
        const powerUpsUsed = gameData.powerUpsUsed || 0;

        const efficiency = score / moves;
        const speed = score / duration;
        const powerUpEffectiveness = powerUpsUsed > 0 ? score / powerUpsUsed : 0;

        let rating = 'poor';
        const overallScore = (efficiency * 0.4) + (speed * 0.3) + (powerUpEffectiveness * 0.3);

        if (overallScore > 10) rating = 'excellent';
        else if (overallScore > 5) rating = 'good';
        else if (overallScore > 2) rating = 'average';

        return {
            rating,
            overallScore,
            breakdown: {
                efficiency: { score: efficiency, weight: 0.4 },
                speed: { score: speed, weight: 0.3 },
                powerUpEffectiveness: { score: powerUpEffectiveness, weight: 0.3 }
            }
        };
    }

    calculateSkillLevel(gameData) {
        const score = gameData.score || 0;
        const efficiency = gameData.efficiency || 0;
        const gameLevel = gameData.gameLevel || 1;
        const survival = gameData.playTime || 0;

        // Multi-factor skill assessment
        const factors = {
            scoring: Math.min(score / 1000, 10), // Max 10 points for 1000+ score
            efficiency: Math.min(efficiency * 2, 10), // Max 10 points for 5+ efficiency
            progression: Math.min(gameLevel, 10), // Max 10 points for level 10+
            survival: Math.min(survival / 300, 10) // Max 10 points for 5+ minutes
        };

        const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
        const skillLevel = Math.floor(totalScore / 4);

        const levels = [
            'Beginner', 'Novice', 'Learner', 'Intermediate', 'Skilled',
            'Advanced', 'Expert', 'Master', 'Grandmaster', 'Legend'
        ];

        return {
            level: Math.min(skillLevel, levels.length - 1),
            name: levels[Math.min(skillLevel, levels.length - 1)],
            totalScore,
            factors,
            progress: (totalScore % 4) / 4 * 100,
            nextLevel: levels[Math.min(skillLevel + 1, levels.length - 1)]
        };
    }

    calculateInputMetrics(game) {
        const events = game.events.filter(e => e.action === 'direction_change');

        if (events.length === 0) return null;

        const intervals = [];
        for (let i = 1; i < events.length; i++) {
            intervals.push(events[i].timestamp - events[i - 1].timestamp);
        }

        return {
            totalInputs: events.length,
            averageInterval: intervals.reduce((a, b) => a + b, 0) / intervals.length,
            inputsPerSecond: events.length / (game.duration || 1),
            rapidInputs: intervals.filter(i => i < 200).length, // Inputs within 200ms
            inputPattern: this.analyzeInputPattern(events)
        };
    }

    calculateVisualMetrics(game) {
        return {
            averageFrameRate: game.performance.frameRates.length > 0 ?
                game.performance.frameRates.reduce((a, b) => a + b, 0) / game.performance.frameRates.length : 0,
            frameDrops: game.performance.frameRates.filter(fps => fps < 30).length,
            renderStability: this.calculateRenderStability(game.performance.frameRates)
        };
    }

    // Machine Learning feature extraction
    extractMLFeatures(event) {
        // Extract features for ML models
        const features = {
            timestamp: event.properties.timestamp,
            sessionDuration: event.properties.sessionDuration,
            eventType: event.name,
            category: event.category,
            deviceType: event.properties.deviceMetrics?.deviceType,
            performanceScore: this.calculatePerformanceScore(event)
        };

        // Game-specific features
        if (event.category === 'game') {
            features.gameFeatures = this.extractGameFeatures(event);
        }

        // Store for ML processing
        this.storeMLFeatures(features);
    }

    extractGameFeatures(event) {
        return {
            score: event.properties.score || 0,
            duration: event.properties.duration || 0,
            efficiency: event.properties.efficiency || 0,
            powerUpsUsed: event.properties.powerUpsUsed || 0,
            gameLevel: event.properties.gameLevel || 1,
            snakeLength: event.properties.snakeLength || 3,
            endReason: event.properties.endReason || 'unknown'
        };
    }

    storeMLFeatures(features) {
        // Store features for ML model training
        const mlData = this.getMLData() || [];
        mlData.push(features);

        // Keep only recent features (last 1000)
        if (mlData.length > 1000) {
            mlData.splice(0, mlData.length - 1000);
        }

        try {
            localStorage.setItem('snake_ml_features', JSON.stringify(mlData));
        } catch (error) {
            console.warn('Failed to store ML features:', error);
        }
    }

    getMLData() {
        try {
            return JSON.parse(localStorage.getItem('snake_ml_features') || '[]');
        } catch (error) {
            return [];
        }
    }

    // Enhanced data export for analysis
    exportAnalyticsData(format = 'json', options = {}) {
        const data = {
            metadata: {
                version: '2.0',
                exportedAt: Date.now(),
                sessionId: this.sessionId,
                sessionDuration: Date.now() - this.sessionStart,
                gameVersion: '2.0',
                analyticsVersion: '2.0'
            },
            summary: this.getAnalyticsSummary(),
            events: options.includeAllEvents ? this.events : this.events.slice(-100),
            gameEvents: this.gameEvents,
            performanceEvents: this.performanceEvents,
            sessionMetrics: this.gameMetrics ? this.gameMetrics.sessionStats : {},
            deviceMetrics: this.gameMetrics ? this.gameMetrics.deviceMetrics : {},
            performanceMetrics: this.getPerformanceAnalytics(),
            insights: this.getGameInsights(),
            mlFeatures: options.includeMLFeatures ? this.getMLData() : null
        };

        if (format === 'csv') {
            return this.convertToCSV(data.gameEvents);
        }

        if (format === 'compressed') {
            return this.compressData(data);
        }

        return JSON.stringify(data, null, 2);
    }

    // Real-time analytics dashboard data
    getDashboardData() {
        return {
            realtime: {
                activeSession: this.sessionId,
                sessionDuration: Date.now() - this.sessionStart,
                eventsInBuffer: this.realtimeBuffer.length,
                currentGame: this.gameMetrics && this.gameMetrics.currentGame ? {
                    id: this.gameMetrics.currentGame.id,
                    duration: Date.now() - this.gameMetrics.currentGame.startTime,
                    events: this.gameMetrics.currentGame.events.length
                } : null
            },
            session: this.gameMetrics ? this.gameMetrics.sessionStats : {},
            performance: this.getRealtimePerformance(),
            trends: this.calculateTrends(),
            alerts: this.getActiveAlerts()
        };
    }

    getPerformanceSnapshot() {
        try {
            return {
                memory: this.trackMemoryUsage(),
                timing: performance.now(),
                connectionType: navigator.connection?.effectiveType || 'unknown'
            };
        } catch (error) {
            return {
                memory: null,
                timing: Date.now(),
                connectionType: 'unknown'
            };
        }
    }

    getSystemInfo() {
        try {
            return {
                platform: navigator.platform,
                language: navigator.language,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                connectionType: navigator.connection?.effectiveType
            };
        } catch (error) {
            return {
                platform: 'unknown',
                language: 'unknown',
                hardwareConcurrency: 1,
                maxTouchPoints: 0,
                connectionType: 'unknown'
            };
        }
    }

    // Data persistence with enhanced storage
    saveToStorage() {
        try {
            const data = {
                events: this.events.slice(-this.maxEvents),
                gameEvents: this.gameEvents.slice(-this.maxGameEvents),
                performanceEvents: this.performanceEvents.slice(-1000),
                sessionMetrics: this.gameMetrics ? this.gameMetrics.sessionStats : {},
                sessionId: this.sessionId,
                lastSaved: Date.now(),
                version: '2.0'
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));

            // Save game events separately for faster access
            localStorage.setItem(this.gameStorageKey, JSON.stringify(this.gameEvents));

            // Save performance data
            localStorage.setItem(this.performanceStorageKey, JSON.stringify(this.performanceEvents));

            // Clear realtime buffer
            this.realtimeBuffer = [];

        } catch (error) {
            console.warn('Failed to save analytics data:', error);
        }
    }

    loadStoredData() {
        try {
            // Load main analytics data
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.events = data.events || [];
                if (this.gameMetrics && data.sessionMetrics) {
                    this.gameMetrics.sessionStats = data.sessionMetrics;
                }
            }

            // Load game events
            const gameStored = localStorage.getItem(this.gameStorageKey);
            if (gameStored) {
                this.gameEvents = JSON.parse(gameStored);
            }

            // Load performance events
            const perfStored = localStorage.getItem(this.performanceStorageKey);
            if (perfStored) {
                this.performanceEvents = JSON.parse(perfStored);
            }
        } catch (error) {
            console.warn('Failed to load analytics data:', error);
            this.events = [];
            this.gameEvents = [];
            this.performanceEvents = [];
        }
    }

    setupAutoSave() {
        // Save every 30 seconds
        setInterval(() => {
            this.saveToStorage();
        }, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }

    setupSessionTracking() {
        this.trackSessionStart();

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.trackEvent('session_hidden', { timestamp: Date.now() });
                this.saveToStorage();
            } else {
                this.trackEvent('session_visible', { timestamp: Date.now() });
            }
        });
    }

    trackSessionStart() {
        return this.trackEvent('session_start', {
            sessionId: this.sessionId,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine,
            systemInfo: this.getSystemInfo()
        });
    }

    setupPerformanceMonitoring() {
        // Monitor performance periodically
        setInterval(() => {
            this.trackMemoryUsage();

            // Track FPS
            let fps = 0;
            let lastTime = performance.now();

            const countFPS = () => {
                const currentTime = performance.now();
                fps = 1000 / (currentTime - lastTime);
                lastTime = currentTime;
                this.trackFrameRate(Math.round(fps));
            };

            requestAnimationFrame(countFPS);
        }, 5000);
    }

    cleanupOldData() {
        const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
        this.events = this.events.filter(event => event.properties.timestamp > cutoffDate);
        this.gameEvents = this.gameEvents.filter(event => event.properties.timestamp > cutoffDate);
        this.performanceEvents = this.performanceEvents.filter(event => event.timestamp > cutoffDate);
    }

    getAnalyticsSummary() {
        return {
            totalEvents: this.events.length,
            gameEvents: this.gameEvents.length,
            performanceEvents: this.performanceEvents.length,
            sessionDuration: Date.now() - this.sessionStart,
            sessionStats: this.gameMetrics ? this.gameMetrics.sessionStats : {}
        };
    }

    // Placeholder methods for additional functionality
    getGameInsights() { return {}; }
    calculateTrends() { return {}; }
    getActiveAlerts() { return []; }
    getRealtimePerformance() { return {}; }
    getPerformanceAnalytics() { return {}; }
    calculatePerformanceScore() { return 0; }
    updateSkillProgression() { }
    updatePlayPattern() { }
    updatePowerUpStrategy() { }
    triggerPerformanceAlert() { }
    analyzeInputPattern() { return {}; }
    calculateRenderStability() { return 0; }
    calculatePowerUpEffectiveness() { return 0; }
    analyzePowerUpTiming() { return {}; }
    getGameContext() { return {}; }
    calculateAchievementRarity() { return 'common'; }
    determineEndReason() { return 'unknown'; }
    getCompletionStatus() { return 'completed'; }
    convertToCSV() { return ''; }
    compressData(data) { return JSON.stringify(data); }
    updatePerformanceMetrics() { }
}

// Create singleton instance
export const gameAnalytics = new GameAnalytics();

// Auto-track page events
window.addEventListener('beforeunload', () => {
    gameAnalytics.trackEvent('session_end', {
        sessionId: gameAnalytics.sessionId,
        duration: Date.now() - gameAnalytics.sessionStart,
        eventsCount: gameAnalytics.events.length
    });
    gameAnalytics.saveToStorage();
});

// Auto-track errors
window.addEventListener('error', (event) => {
    gameAnalytics.trackEvent('error', {
        message: event.error?.message || event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
    }, 'error');
});

// Auto-track unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    gameAnalytics.trackEvent('unhandled_rejection', {
        reason: event.reason,
        type: 'promise_rejection'
    }, 'error');
});

export default gameAnalytics;