import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { useNotification } from "./NotificationContext";
import { cacheManager, CacheHelpers } from "../utils/cacheManager";
import { gameAnalytics } from "../utils/gameAnalytics";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Enhanced state for game features
  const [gameStats, setGameStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isGameDataLoaded, setIsGameDataLoaded] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const refreshIntervalRef = useRef(null);

  // Cache keys - fallback if cacheManager.KEYS is not available
  const CACHE_KEYS = {
    USER_PROFILE: cacheManager?.KEYS?.USER_PROFILE || "user_profile",
    USER_STATS: cacheManager?.KEYS?.USER_STATS || "user_game_stats",
    ACHIEVEMENTS: cacheManager?.KEYS?.ACHIEVEMENTS || "achievements_list",
    FRIENDS: cacheManager?.KEYS?.FRIENDS || "friends_list",
  };

  // Initialize authentication and load user data
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // Quick check for cached user first (for faster loading)
        const cachedUser = cacheManager?.get
          ? cacheManager.get(CACHE_KEYS.USER_PROFILE)
          : null;
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Then verify with backend
        const { user } = await authService.getCurrentUser();
        setUser(user);

        // Cache user data
        if (user && cacheManager?.set) {
          cacheManager.set(CACHE_KEYS.USER_PROFILE, user, 900000); // 15 minutes

          // Load additional game data
          await loadGameData(user._id);

          // Track analytics
          if (gameAnalytics?.trackEvent) {
            gameAnalytics.trackEvent("user_login", {
              userId: user._id,
              username: user.username,
              loginMethod: "cookie",
            });
          }

          // Set up periodic data refresh
          setupDataRefresh();
        } else {
          clearUserData();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        clearUserData();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    checkUserLoggedIn();

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Load comprehensive game data
  const loadGameData = async (userId) => {
    try {
      setLoading(true);

      // Load game stats
      const cachedStats = cacheManager?.get
        ? cacheManager.get(CACHE_KEYS.USER_STATS)
        : null;
      if (cachedStats) {
        setGameStats(cachedStats);
      }

      // Load achievements
      const cachedAchievements = cacheManager?.get
        ? cacheManager.get(CACHE_KEYS.ACHIEVEMENTS)
        : null;
      if (cachedAchievements) {
        setAchievements(cachedAchievements);
      }

      // Load friends
      const cachedFriends = cacheManager?.get
        ? cacheManager.get(CACHE_KEYS.FRIENDS)
        : null;
      if (cachedFriends) {
        setFriends(cachedFriends);
      }

      // Fetch fresh data if cache is missing or old
      const promises = [];

      if (!cachedStats) {
        promises.push(
          authService
            .getGameStats()
            .then((response) => {
              setGameStats(response.gameStats);
              if (cacheManager?.set) {
                cacheManager.set(
                  CACHE_KEYS.USER_STATS,
                  response.gameStats,
                  300000
                );
              }
              return response;
            })
            .catch(console.error)
        );
      }

      if (!cachedAchievements) {
        promises.push(
          authService
            .getAchievements()
            .then((response) => {
              setAchievements(response.achievements);
              if (cacheManager?.set) {
                cacheManager.set(
                  CACHE_KEYS.ACHIEVEMENTS,
                  response.achievements,
                  600000
                );
              }
              return response;
            })
            .catch(console.error)
        );
      }

      if (!cachedFriends) {
        promises.push(
          authService
            .getFriends()
            .then((response) => {
              setFriends(response.friends);
              if (cacheManager?.set) {
                cacheManager.set(CACHE_KEYS.FRIENDS, response.friends, 300000);
              }
              return response;
            })
            .catch(console.error)
        );
      }

      await Promise.allSettled(promises);
      setIsGameDataLoaded(true);
    } catch (error) {
      console.error("Failed to load game data:", error);
      showNotification("error", "Failed to load game data");
    } finally {
      setLoading(false);
    }
  };

  // Set up periodic data refresh for active users
  const setupDataRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(async () => {
      try {
        // Refresh user stats every 5 minutes if user is active
        if (document.visibilityState === "visible") {
          const response = await authService.getGameStats();
          setGameStats(response.gameStats);
          if (cacheManager?.set) {
            cacheManager.set(CACHE_KEYS.USER_STATS, response.gameStats, 300000);
          }
        }
      } catch (error) {
        console.error("Periodic refresh failed:", error);
      }
    }, 300000); // 5 minutes
  };

  // Clear all user-related data
  const clearUserData = () => {
    try {
      if (cacheManager?.remove) {
        cacheManager.remove(CACHE_KEYS.USER_PROFILE);
        cacheManager.remove(CACHE_KEYS.USER_STATS);
        cacheManager.remove(CACHE_KEYS.ACHIEVEMENTS);
        cacheManager.remove(CACHE_KEYS.FRIENDS);
      }
      setGameStats(null);
      setAchievements([]);
      setFriends([]);
      setIsGameDataLoaded(false);
    } catch (error) {
      console.warn("Failed to clear user data:", error);
      // Continue anyway - don't let cache issues block the app
      setGameStats(null);
      setAchievements([]);
      setFriends([]);
      setIsGameDataLoaded(false);
    }
  };

  // Enhanced signup with analytics tracking
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Track signup attempt
      if (gameAnalytics?.trackEvent) {
        gameAnalytics.trackEvent("signup_attempt", {
          registrationSource: userData.source || "direct",
          deviceType: gameAnalytics.getDeviceType?.() || "unknown",
        });
      }

      const result = await authService.signup(userData);

      if (result.success) {
        setSignupSuccess(true);

        // Track successful signup
        if (gameAnalytics?.trackEvent) {
          gameAnalytics.trackEvent("signup_success", {
            userId: result.user?.id,
            registrationSource: userData.source || "direct",
          });
        }

        showNotification(
          "success",
          "Signup successful! Please check your email to verify your account.",
          8000
        );
        return { success: true };
      } else {
        setError(result.message);

        // Track signup failure
        if (gameAnalytics?.trackEvent) {
          gameAnalytics.trackEvent("signup_failed", {
            error: result.message,
            registrationSource: userData.source || "direct",
          });
        }

        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMessage = error.message || "Signup failed";
      setError(errorMessage);

      if (gameAnalytics?.trackError) {
        gameAnalytics.trackError(error, { action: "signup" });
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced login with comprehensive data loading
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // Track login attempt
      if (gameAnalytics?.trackEvent) {
        gameAnalytics.trackEvent("login_attempt", {
          loginMethod: "email",
          deviceType: gameAnalytics.getDeviceType?.() || "unknown",
        });
      }

      const result = await authService.login(credentials);

      if (result.user) {
        setUser(result.user);

        // Cache user data immediately
        if (cacheManager?.set) {
          cacheManager.set(CACHE_KEYS.USER_PROFILE, result.user, 900000);
        }

        // Load game data in parallel
        await loadGameData(result.user._id);

        // Track successful login
        if (gameAnalytics?.trackEvent) {
          gameAnalytics.trackEvent("login_success", {
            userId: result.user._id,
            username: result.user.username,
            loginMethod: "email",
          });
        }

        // Set up data refresh
        setupDataRefresh();

        showNotification("success", `Welcome back, ${result.user.name}!`);
        navigate("/");

        return { success: true };
      } else {
        const errorMessage = result.message || "Login failed";
        setError(errorMessage);

        if (gameAnalytics?.trackEvent) {
          gameAnalytics.trackEvent("login_failed", {
            error: errorMessage,
            loginMethod: "email",
          });
        }

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || "Login failed";
      setError(errorMessage);

      if (gameAnalytics?.trackError) {
        gameAnalytics.trackError(error, { action: "login" });
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout with cleanup
  const logout = async () => {
    try {
      setLoading(true);

      // Track logout
      if (gameAnalytics?.trackEvent) {
        gameAnalytics.trackEvent("user_logout", {
          userId: user?._id,
          sessionDuration:
            Date.now() - (gameAnalytics.sessionStart || Date.now()),
        });
      }

      await authService.logout();

      // Clear all data
      setUser(null);
      clearUserData();

      // Clear refresh interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }

      // Clear localStorage as well
      localStorage.removeItem("snakeHighScore");

      showNotification("success", "Logged out successfully");
      navigate("/");

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || "Logout failed";
      setError(errorMessage);

      if (gameAnalytics?.trackError) {
        gameAnalytics.trackError(error, { action: "logout" });
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced profile update with cache management
  const updateProfile = async (userData) => {
    try {
      setLoading(true);

      const { user: updatedUser } = await authService.updateProfile(userData);
      setUser(updatedUser);

      // Update cache
      if (cacheManager?.set) {
        cacheManager.set(CACHE_KEYS.USER_PROFILE, updatedUser, 900000);
      }

      // Track profile update
      if (gameAnalytics?.trackEvent) {
        gameAnalytics.trackEvent("profile_updated", {
          userId: updatedUser._id,
          updatedFields: Object.keys(userData),
        });
      }

      showNotification("success", "Profile updated successfully!");

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || "Update failed";

      if (gameAnalytics?.trackError) {
        gameAnalytics.trackError(error, { action: "update_profile" });
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Save game score with enhanced data handling
  const saveGameScore = async (gameData) => {
    try {
      const response = await authService.saveGameScore(gameData);

      if (response.success) {
        // Update local game stats
        setGameStats(response.gameStats);
        if (cacheManager?.set) {
          cacheManager.set(CACHE_KEYS.USER_STATS, response.gameStats, 300000);
        }

        // Handle new achievements
        if (response.newAchievements && response.newAchievements.length > 0) {
          const updatedAchievements = [
            ...achievements,
            ...response.newAchievements,
          ];
          setAchievements(updatedAchievements);
          if (cacheManager?.set) {
            cacheManager.set(
              CACHE_KEYS.ACHIEVEMENTS,
              updatedAchievements,
              600000
            );
          }

          // Show achievement notifications
          response.newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
              showNotification(
                "success",
                `🏆 Achievement Unlocked: ${achievement.name}!`,
                6000
              );
            }, index * 2000);
          });
        }

        // Track game completion
        if (gameAnalytics?.trackGameEnd) {
          gameAnalytics.trackGameEnd({
            ...gameData,
            userId: user._id,
            newAchievements: response.newAchievements?.length || 0,
          });
        }

        return response;
      }

      return response;
    } catch (error) {
      console.error("Failed to save game score:", error);
      if (gameAnalytics?.trackError) {
        gameAnalytics.trackError(error, { action: "save_game_score" });
      }
      throw error;
    }
  };

  // Refresh game stats manually
  const refreshGameStats = async () => {
    if (!user) return;

    try {
      await loadGameData(user._id);
      showNotification("success", "Game data refreshed!");
    } catch (error) {
      console.error("Failed to refresh game stats:", error);
      showNotification("error", "Failed to refresh game data");
    }
  };

  // Check for new achievements manually
  const checkAchievements = async () => {
    if (!user) return [];

    try {
      const response = await authService.getAchievements();
      const newAchievements = response.achievements.filter(
        (achievement) => !achievements.find((a) => a.id === achievement.id)
      );

      if (newAchievements.length > 0) {
        setAchievements(response.achievements);
        if (cacheManager?.set) {
          cacheManager.set(
            CACHE_KEYS.ACHIEVEMENTS,
            response.achievements,
            600000
          );
        }
      }

      return newAchievements;
    } catch (error) {
      console.error("Failed to check achievements:", error);
      return [];
    }
  };

  // Get user's rank and leaderboard position
  const getUserRank = async () => {
    if (!user) return null;

    try {
      const cached = cacheManager?.get ? cacheManager.get("user_rank") : null;
      if (cached) return cached;

      const response = await authService.getLeaderboard({
        limit: 1000,
        type: "highestScore",
      });

      const userRank =
        response.leaderboard.findIndex((player) => player._id === user._id) + 1;

      const rankData = {
        rank: userRank || null,
        total: response.leaderboard.length,
        percentile: userRank
          ? Math.round(
              ((response.leaderboard.length - userRank) /
                response.leaderboard.length) *
                100
            )
          : 0,
      };

      if (cacheManager?.set) {
        cacheManager.set("user_rank", rankData, 300000); // 5 minutes
      }
      return rankData;
    } catch (error) {
      console.error("Failed to get user rank:", error);
      return null;
    }
  };

  const clearError = () => setError(null);

  // Enhanced value object with all new features
  const value = {
    // Core auth state
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isInitialized,
    signupSuccess,
    setSignupSuccess,

    // Game data state
    gameStats,
    achievements,
    friends,
    isGameDataLoaded,

    // Auth methods
    signup,
    login,
    logout,
    updateProfile,
    clearError,

    // Game-specific methods
    saveGameScore,
    refreshGameStats,
    checkAchievements,
    getUserRank,
    loadGameData,

    // Helper methods
    clearUserData,

    // Computed values
    hasUnlockedAchievements: achievements.length > 0,
    totalAchievementPoints: achievements.reduce(
      (sum, a) => sum + (a.points || 0),
      0
    ),
    isNewPlayer: gameStats?.totalGamesPlayed < 5,
    experienceLevel: gameStats
      ? Math.floor(gameStats.totalGamesPlayed / 10) + 1
      : 1,

    // Quick stats for UI
    quickStats: gameStats
      ? {
          highScore: gameStats.highestScore,
          totalGames: gameStats.totalGamesPlayed,
          winRate:
            gameStats.totalGamesPlayed > 0
              ? Math.round(
                  (gameStats.gamesWon / gameStats.totalGamesPlayed) * 100
                )
              : 0,
          averageScore: gameStats.averageScore,
          rank: null, // Will be populated by getUserRank
        }
      : null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
