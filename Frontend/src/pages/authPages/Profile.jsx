import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { Helmet } from "react-helmet";

// Enhanced StatCard with animations and better data display
const StatCard = ({
  title,
  value,
  icon,
  color,
  gradient,
  isLoading = false,
  trend = null,
  subtitle = null,
  onClick = null,
}) => (
  <div
    className={`group relative p-3 sm:p-4 lg:p-5 ${gradient} border rounded-xl hover:scale-105 transition-all duration-500 backdrop-blur-sm overflow-hidden ${
      onClick ? "cursor-pointer" : ""
    }`}
    onClick={onClick}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded mb-2"></div>
        <div className="w-12 h-6 bg-gray-600 rounded mb-1"></div>
        <div className="w-16 h-3 bg-gray-600 rounded"></div>
      </div>
    ) : (
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <i
            className={`${icon} text-xl sm:text-2xl lg:text-3xl ${color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
          ></i>
          {trend && (
            <div
              className={`text-xs px-2 py-1 rounded-full ${
                trend > 0
                  ? "bg-green-500/20 text-green-400"
                  : trend < 0
                  ? "bg-red-500/20 text-red-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {trend > 0 ? "↗" : trend < 0 ? "↘" : "→"} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div
          className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold ${color} mb-1 group-hover:scale-110 transition-transform duration-300`}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    )}
  </div>
);

// Enhanced Achievement Card with progress and categories
const AchievementCard = ({ achievement, showProgress = false }) => {
  const tierColors = {
    bronze: "from-amber-600/20 to-orange-600/20 border-amber-500/30",
    silver: "from-gray-400/20 to-gray-500/20 border-gray-400/30",
    gold: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    platinum: "from-blue-400/20 to-purple-500/20 border-blue-400/30",
    diamond: "from-cyan-400/20 to-blue-500/20 border-cyan-400/30",
  };

  const tierColor = tierColors[achievement.tier] || tierColors.bronze;

  return (
    <div
      className={`group flex items-center gap-2 sm:gap-3 p-3 bg-gradient-to-br ${tierColor} rounded-xl hover:scale-105 transition-all duration-300 relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="text-yellow-400 text-lg sm:text-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10">
        {achievement.icon || "🏆"}
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-white font-medium text-sm sm:text-base truncate group-hover:text-yellow-100 transition-colors duration-300">
            {achievement.name}
          </div>
          <div
            className={`text-xs px-2 py-0.5 rounded-full ${
              achievement.tier === "gold"
                ? "bg-yellow-500/20 text-yellow-400"
                : achievement.tier === "silver"
                ? "bg-gray-400/20 text-gray-300"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {achievement.tier}
          </div>
          {achievement.points && (
            <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
              {achievement.points}pts
            </div>
          )}
        </div>
        <div className="text-gray-400 text-xs sm:text-sm truncate group-hover:text-gray-300 transition-colors duration-300">
          {achievement.description}
        </div>
        {showProgress && achievement.progress < 100 && (
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${achievement.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {achievement.progress}% complete
            </div>
          </div>
        )}
        {achievement.unlockedAt && (
          <div className="text-xs text-gray-500 mt-1">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

// Device Statistics Component
const DeviceStats = ({ deviceStats }) => {
  const devices = [
    {
      key: "desktop",
      name: "Desktop",
      icon: "ri-computer-line",
      color: "text-blue-400",
    },
    {
      key: "mobile",
      name: "Mobile",
      icon: "ri-smartphone-line",
      color: "text-green-400",
    },
    {
      key: "tablet",
      name: "Tablet",
      icon: "ri-tablet-line",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {devices.map((device) => (
        <div
          key={device.key}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-600/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <i className={`${device.icon} ${device.color} text-lg`}></i>
            <span className="text-white font-medium">{device.name}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Games</span>
              <span className="text-white">
                {deviceStats[device.key]?.games || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Best Score</span>
              <span className={device.color}>
                {(deviceStats[device.key]?.bestScore || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Power-up Statistics Component
const PowerUpStats = ({ powerUpsByType }) => {
  const powerUps = [
    {
      key: "speedBoost",
      name: "Speed Boost",
      icon: "⚡",
      color: "text-yellow-400",
    },
    {
      key: "doublePoints",
      name: "Double Points",
      icon: "💎",
      color: "text-blue-400",
    },
    {
      key: "invincible",
      name: "Invincible",
      icon: "🛡️",
      color: "text-green-400",
    },
    { key: "extraLife", name: "Extra Life", icon: "❤️", color: "text-red-400" },
  ];

  const totalUsed = Object.values(powerUpsByType || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-3">
      {powerUps.map((powerUp) => {
        const count = powerUpsByType?.[powerUp.key] || 0;
        const percentage = totalUsed > 0 ? (count / totalUsed) * 100 : 0;

        return (
          <div key={powerUp.key} className="flex items-center gap-3">
            <div className="text-xl">{powerUp.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white text-sm">{powerUp.name}</span>
                <span className={`text-sm ${powerUp.color}`}>{count}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${
                    powerUp.color.includes("yellow")
                      ? "from-yellow-400 to-orange-500"
                      : powerUp.color.includes("blue")
                      ? "from-blue-400 to-cyan-500"
                      : powerUp.color.includes("green")
                      ? "from-green-400 to-emerald-500"
                      : "from-red-400 to-pink-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Social Statistics Component
const SocialStats = ({ friends, user }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg">
        <i className="ri-group-line text-2xl text-blue-400 mb-2"></i>
        <div className="text-xl font-bold text-blue-400">
          {friends?.length || 0}
        </div>
        <div className="text-xs text-gray-400">Friends</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
        <i className="ri-user-star-line text-2xl text-purple-400 mb-2"></i>
        <div className="text-xl font-bold text-purple-400">
          {Math.floor((user?.gameStats?.totalGamesPlayed || 0) / 10) + 1}
        </div>
        <div className="text-xs text-gray-400">User Level</div>
      </div>
    </div>
  );
};

// Analytics Chart Component (simplified for this example)
const AnalyticsChart = ({ recentGames }) => {
  const last10Games = recentGames?.slice(-10) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Score Progression</h4>
        <span className="text-xs text-gray-400">
          {last10Games.length} games
        </span>
      </div>
      <div className="flex items-end gap-2 h-32">
        {last10Games.map((game, index) => {
          const maxScore = Math.max(...last10Games.map((g) => g.score), 1);
          const height = (game.score / maxScore) * 100;

          return (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t min-h-[4px] relative group"
              style={{ height: `${Math.max(height, 4)}%` }}
              title={`Game ${index + 1}: ${game.score} points`}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {game.score} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function Profile() {
  const {
    user,
    isAuthenticated,
    loading,
    logout,
    gameStats,
    achievements,
    refreshGameStats,
  } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [recentGames, setRecentGames] = useState([]);
  const [friendStats, setFriendStats] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const welcome = searchParams.get("welcome");

    if (welcome === "google") {
      showNotification(
        "success",
        "Welcome to Snake Game! Google login successful."
      );
      window.history.replaceState({}, document.title, "/profile");
    }

    if (isAuthenticated && user) {
      fetchEnhancedGameStats();
    }
  }, [isAuthenticated, user, showNotification]);

  const fetchEnhancedGameStats = async () => {
    try {
      setLoadingStats(true);

      // Fetch comprehensive game data
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/game-stats`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setRecentGames(data.recentGames || []);
      }

      // Fetch friends data for social stats
      const friendsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/friends`,
        {
          credentials: "include",
        }
      );
      const friendsData = await friendsResponse.json();

      if (friendsData.success) {
        setFriendStats(friendsData.friendStats);
      }
    } catch (error) {
      console.error("Failed to fetch enhanced game stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showNotification("success", "Logged out successfully");
      navigate("/");
    } catch (error) {
      showNotification("error", "Failed to logout");
    }
  };

  const formatPlayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] px-3 sm:px-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 sm:h-16 sm:w-16 border border-green-500/30 mx-auto"></div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Loading Profile
          </div>
          <p className="text-gray-300 text-sm sm:text-base">
            Please wait while we load your data...
          </p>
        </div>
      </div>
    );
  }

  // Achievement categories for organized display
  const achievementsByCategory =
    achievements?.reduce((acc, achievement) => {
      const category = achievement.category || "basic";
      if (!acc[category]) acc[category] = [];
      acc[category].push(achievement);
      return acc;
    }, {}) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-4 sm:pt-6 lg:pt-8 relative overflow-x-hidden">
      <Helmet>
        <title>Profile | Snake Game Ultimate Edition</title>
        <meta
          name="description"
          content="View and edit your profile in Snake Game Ultimate Edition."
        />
      </Helmet>
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-green-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-60 sm:h-60 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-green-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative z-10">
        {/* Enhanced Profile Header */}
        <div className="bg-[#202c33]/85 backdrop-blur-xl shadow-2xl rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 relative mb-6">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-blue-600 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6 relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <img
                    src={user?.avatar || "/df-avatar.png"}
                    alt={user?.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white/30 object-cover shadow-2xl hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "/df-avatar.png";
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <i className="ri-check-line text-white text-xs sm:text-sm animate-pulse"></i>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    {user?.name || "User"}
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base">
                    @{user?.username}
                  </p>
                  {user?.bio && (
                    <p className="text-white/70 text-sm mt-1 max-w-md">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-white/50 hover:scale-105 text-sm sm:text-base relative overflow-hidden"
                >
                  <i className="ri-edit-line group-hover:scale-110 transition-transform duration-300"></i>
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="group px-4 sm:px-5 py-2.5 sm:py-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-400/30 hover:border-red-400/50 hover:scale-105 text-sm sm:text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-logout-box-line"></i>
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-700/50">
            <div className="flex overflow-x-auto">
              {[
                { id: "overview", name: "Overview", icon: "ri-dashboard-line" },
                {
                  id: "achievements",
                  name: "Achievements",
                  icon: "ri-trophy-line",
                },
                {
                  id: "analytics",
                  name: "Analytics",
                  icon: "ri-bar-chart-line",
                },
                { id: "social", name: "Social", icon: "ri-group-line" },
                { id: "settings", name: "Settings", icon: "ri-settings-line" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-400 border-blue-400 bg-blue-500/10"
                      : "text-gray-400 border-transparent hover:text-white hover:border-gray-500"
                  }`}
                >
                  <i className={tab.icon}></i>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Stats */}
              <div className="xl:col-span-2 space-y-6">
                {/* Primary Statistics */}
                <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="ri-trophy-line text-yellow-400"></i>
                    Game Statistics
                  </h3>
                  {loadingStats ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <StatCard key={i} isLoading={true} />
                      ))}
                    </div>
                  ) : gameStats ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard
                        title="Highest Score"
                        value={gameStats.highestScore || 0}
                        icon="ri-trophy-line"
                        color="text-yellow-400"
                        gradient="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
                        subtitle="Personal best"
                      />
                      <StatCard
                        title="Games Played"
                        value={gameStats.totalGamesPlayed || 0}
                        icon="ri-gamepad-line"
                        color="text-blue-400"
                        gradient="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                      />
                      <StatCard
                        title="Win Rate"
                        value={`${gameStats.winRate || 0}%`}
                        icon="ri-medal-line"
                        color="text-green-400"
                        gradient="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
                      />
                      <StatCard
                        title="Longest Snake"
                        value={gameStats.longestSnake || 0}
                        icon="ri-focus-3-line"
                        color="text-purple-400"
                        gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
                        subtitle="segments"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-6xl mb-4 animate-bounce opacity-50">
                        🎮
                      </div>
                      <h4 className="text-xl font-semibold mb-2">
                        No games played yet!
                      </h4>
                      <p className="text-base mb-6">
                        Start your gaming journey and track your progress
                      </p>
                      <button
                        onClick={() => navigate("/game")}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:scale-105 font-semibold"
                      >
                        Play Your First Game
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Performance */}
                {recentGames && recentGames.length > 0 && (
                  <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <i className="ri-line-chart-line text-blue-400"></i>
                      Recent Performance
                    </h3>
                    <AnalyticsChart recentGames={recentGames} />
                  </div>
                )}
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Score</span>
                      <span className="text-white font-medium">
                        {(gameStats?.totalScore || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Score</span>
                      <span className="text-white font-medium">
                        {(gameStats?.averageScore || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Play Time</span>
                      <span className="text-white font-medium">
                        {formatPlayTime(gameStats?.totalPlayTime || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Best Efficiency</span>
                      <span className="text-white font-medium">
                        {(gameStats?.bestEfficiency || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current Streak</span>
                      <span className="text-green-400 font-medium">
                        {gameStats?.currentStreak || 0} games
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Stats */}
                <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">Social</h3>
                  <SocialStats friends={user?.friends} user={user} />
                </div>

                {/* Achievement Summary */}
                {achievements && achievements.length > 0 && (
                  <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Achievement Progress
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-1">
                          {achievements.length}
                        </div>
                        <div className="text-sm text-gray-400">
                          Achievements Unlocked
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(achievementsByCategory)
                          .slice(0, 3)
                          .map(([category, categoryAchievements]) => (
                            <div
                              key={category}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-400 capitalize">
                                {category}
                              </span>
                              <span className="text-white">
                                {categoryAchievements.length}
                              </span>
                            </div>
                          ))}
                      </div>
                      <button
                        onClick={() => setActiveTab("achievements")}
                        className="w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors duration-200"
                      >
                        View All Achievements
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="space-y-6">
              <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <i className="ri-trophy-line text-yellow-400"></i>
                    Achievement Gallery
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">
                        {achievements?.length || 0}
                      </div>
                      <div className="text-xs text-gray-400">Unlocked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {achievements?.reduce(
                          (sum, a) => sum + (a.points || 0),
                          0
                        ) || 0}
                      </div>
                      <div className="text-xs text-gray-400">Points</div>
                    </div>
                  </div>
                </div>

                {achievements && achievements.length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(achievementsByCategory).map(
                      ([category, categoryAchievements]) => (
                        <div key={category}>
                          <h4 className="text-lg font-semibold text-white mb-4 capitalize flex items-center gap-2">
                            <i
                              className={`ri-${
                                category === "skill"
                                  ? "sword"
                                  : category === "social"
                                  ? "group"
                                  : category === "persistence"
                                  ? "time"
                                  : "star"
                              }-line text-blue-400`}
                            ></i>
                            {category} Achievements
                            <span className="text-sm text-gray-400">
                              ({categoryAchievements.length})
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoryAchievements.map((achievement, index) => (
                              <AchievementCard
                                key={index}
                                achievement={achievement}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">🏆</div>
                    <h4 className="text-xl font-semibold mb-2">
                      No achievements yet!
                    </h4>
                    <p className="text-base mb-6">
                      Start playing to unlock your first achievements
                    </p>
                    <button
                      onClick={() => navigate("/game")}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl transition-all duration-300 hover:scale-105 font-semibold"
                    >
                      Start Playing
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Performance Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="ri-device-line text-cyan-400"></i>
                    Device Performance
                  </h3>
                  <DeviceStats deviceStats={gameStats?.deviceStats || {}} />
                </div>

                <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="ri-flashlight-line text-yellow-400"></i>
                    Power-up Usage
                  </h3>
                  <PowerUpStats
                    powerUpsByType={gameStats?.powerUpsByType || {}}
                  />
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <i className="ri-bar-chart-box-line text-purple-400"></i>
                  Detailed Analytics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Food Eaten"
                    value={gameStats?.totalFoodEaten || 0}
                    icon="ri-restaurant-line"
                    color="text-green-400"
                    gradient="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
                  />
                  <StatCard
                    title="Golden Food"
                    value={gameStats?.goldenFoodEaten || 0}
                    icon="ri-coin-line"
                    color="text-yellow-400"
                    gradient="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
                  />
                  <StatCard
                    title="Total Moves"
                    value={gameStats?.totalMoves || 0}
                    icon="ri-cursor-line"
                    color="text-blue-400"
                    gradient="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                  />
                  <StatCard
                    title="Play Days"
                    value={gameStats?.playDays?.length || 0}
                    icon="ri-calendar-line"
                    color="text-purple-400"
                    gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
                  />
                </div>
              </div>

              {/* Session Analytics */}
              {gameStats?.sessionStats && (
                <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="ri-time-line text-cyan-400"></i>
                    Session Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg">
                      <i className="ri-timer-line text-2xl text-cyan-400 mb-2"></i>
                      <div className="text-xl font-bold text-cyan-400">
                        {formatPlayTime(
                          gameStats.sessionStats.longestSession || 0
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Longest Session
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                      <i className="ri-gamepad-line text-2xl text-green-400 mb-2"></i>
                      <div className="text-xl font-bold text-green-400">
                        {gameStats.sessionStats.gamesInLongestSession || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Games in Best Session
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
                      <i className="ri-trophy-line text-2xl text-yellow-400 mb-2"></i>
                      <div className="text-xl font-bold text-yellow-400">
                        {(
                          gameStats.sessionStats.bestSessionScore || 0
                        ).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Best Session Score
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <i className="ri-group-line text-blue-400"></i>
                  Social Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="Friends"
                    value={user?.friends?.length || 0}
                    icon="ri-user-heart-line"
                    color="text-blue-400"
                    gradient="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                    onClick={() => navigate("/friends")}
                  />
                  <StatCard
                    title="User Level"
                    value={
                      Math.floor(
                        (user?.gameStats?.totalGamesPlayed || 0) / 10
                      ) + 1
                    }
                    icon="ri-star-line"
                    color="text-purple-400"
                    gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
                  />
                  <StatCard
                    title="Global Rank"
                    value="Loading..."
                    icon="ri-trophy-line"
                    color="text-yellow-400"
                    gradient="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
                  />
                  <StatCard
                    title="Achievement Points"
                    value={
                      achievements?.reduce(
                        (sum, a) => sum + (a.points || 0),
                        0
                      ) || 0
                    }
                    icon="ri-medal-line"
                    color="text-green-400"
                    gradient="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/friends")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors duration-200"
                  >
                    <i className="ri-user-add-line"></i>
                    Find Friends
                  </button>
                  <button
                    onClick={() => navigate("/leaderboard")}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors duration-200"
                  >
                    <i className="ri-trophy-line"></i>
                    Leaderboard
                  </button>
                  <button
                    onClick={() => navigate("/communities")}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors duration-200"
                  >
                    <i className="ri-group-line"></i>
                    Communities
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              {recentGames && recentGames.length > 0 && (
                <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="ri-activity-line text-green-400"></i>
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentGames.slice(0, 5).map((game, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                            <i className="ri-gamepad-line text-green-400"></i>
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              Scored {game.score.toLocaleString()} points
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatPlayTime(game.playTime)} •{" "}
                              {formatDate(game.playedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-medium">
                            {game.snakeLength} segments
                          </div>
                          <div className="text-xs text-gray-400">
                            {game.deviceType}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-[#202c33]/85 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <i className="ri-settings-line text-gray-400"></i>
                  Account Settings
                </h3>

                <div className="space-y-6">
                  {/* Account Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Account Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 border-b border-gray-600/30">
                        <span className="text-gray-400">Name</span>
                        <span className="text-white">{user?.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-600/30">
                        <span className="text-gray-400">Username</span>
                        <span className="text-white">@{user?.username}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-600/30">
                        <span className="text-gray-400">Email</span>
                        <span className="text-white">{user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-400">Member Since</span>
                        <span className="text-white">
                          {formatDate(user?.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Game Preferences */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Game Preferences
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Sound Effects</span>
                        <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-green-500 rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Notifications</span>
                        <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-green-500 rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Show Hints</span>
                        <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-green-500 rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Privacy
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Public Profile</span>
                        <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-green-500 rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Share Statistics</span>
                        <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-green-500 rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">
                          Allow Friend Requests
                        </span>
                        <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-green-500 rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-600/30">
                    <button
                      onClick={() => navigate("/edit-profile")}
                      className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors duration-200"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => navigate("/change-password")}
                      className="px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors duration-200"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={refreshGameStats}
                      className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors duration-200"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .shimmer {
          position: relative;
          overflow: hidden;
        }

        .shimmer::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        /* Custom scrollbar */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 2px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 2px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

export default Profile;
