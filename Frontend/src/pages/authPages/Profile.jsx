import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const StatCard = ({
  title,
  value,
  icon,
  color,
  gradient,
  isLoading = false,
}) => (
  <div
    className={`group relative p-3 sm:p-4 lg:p-5 ${gradient} border rounded-xl hover:scale-105 transition-all duration-500 backdrop-blur-sm overflow-hidden`}
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
        </div>
        <div
          className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold ${color} mb-1 group-hover:scale-110 transition-transform duration-300`}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
          {title}
        </div>
      </div>
    )}
  </div>
);

const GameCard = ({ game, formatPlayTime, formatDate }) => (
  <div className="group flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-[#334155]/60 backdrop-blur-sm rounded-xl border border-gray-600/30 hover:bg-[#3f4b5f]/70 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 gap-3 sm:gap-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="flex items-center gap-3 sm:gap-4 flex-wrap relative z-10">
      <div className="text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-2 min-w-[60px] group-hover:scale-105 transition-transform duration-300">
        <div className="text-sm sm:text-base font-bold text-yellow-400">
          {game.score.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">Score</div>
      </div>
      <div className="text-center bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-2 min-w-[60px] group-hover:scale-105 transition-transform duration-300">
        <div className="text-sm sm:text-base font-bold text-green-400">
          {game.snakeLength}
        </div>
        <div className="text-xs text-gray-400">Length</div>
      </div>
      <div className="text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-2 min-w-[60px] group-hover:scale-105 transition-transform duration-300">
        <div className="text-sm sm:text-base font-bold text-purple-400">
          {formatPlayTime(game.playTime)}
        </div>
        <div className="text-xs text-gray-400">Time</div>
      </div>
    </div>
    <div className="text-right flex-shrink-0 self-end sm:self-center relative z-10">
      <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {formatDate(game.playedAt)}
      </div>
    </div>
  </div>
);

const AchievementCard = ({ achievement }) => (
  <div className="group flex items-center gap-2 sm:gap-3 p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl hover:from-yellow-500/20 hover:to-orange-500/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="text-yellow-400 text-lg sm:text-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10">
      🏆
    </div>
    <div className="relative z-10 flex-1 min-w-0">
      <div className="text-white font-medium text-sm sm:text-base truncate group-hover:text-yellow-100 transition-colors duration-300">
        {achievement.name}
      </div>
      <div className="text-gray-400 text-xs sm:text-sm truncate group-hover:text-gray-300 transition-colors duration-300">
        {achievement.description}
      </div>
    </div>
  </div>
);

const QuickActionButton = ({
  onClick,
  icon,
  iconColor,
  title,
  description,
  gradientFrom,
  gradientTo,
}) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#334155]/60 hover:bg-[#3f4b5f]/70 rounded-xl transition-all duration-300 text-left hover:scale-105 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm relative overflow-hidden"
  >
    <div
      className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
    ></div>
    <i
      className={`${icon} ${iconColor} text-lg sm:text-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10`}
    ></i>
    <div className="relative z-10 flex-1">
      <div className="text-white font-medium text-sm sm:text-base group-hover:text-white transition-colors duration-300">
        {title}
      </div>
      <div className="text-gray-400 text-xs sm:text-sm group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </div>
    </div>
    <i className="ri-arrow-right-line text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 relative z-10"></i>
  </button>
);

function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [gameStats, setGameStats] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Handle Google OAuth welcome message
    const searchParams = new URLSearchParams(window.location.search);
    const welcome = searchParams.get("welcome");

    if (welcome === "google") {
      showNotification(
        "success",
        "Welcome to Snake Game! Google login successful."
      );
      // Clean up URL
      window.history.replaceState({}, document.title, "/profile");
    }

    // Fetch game stats if user is authenticated
    if (isAuthenticated && user) {
      fetchGameStats();
    }
  }, [isAuthenticated, user, showNotification]);

  const fetchGameStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/game-stats`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setGameStats(data.gameStats);
        setRecentGames(data.recentGames);
      }
    } catch (error) {
      console.error("Failed to fetch game stats:", error);
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

  const handleLeaderboardClick = () => {
    navigate("/leaderboard");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-4 sm:pt-6 lg:pt-8 relative overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-green-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-60 sm:h-60 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
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
        {/* Enhanced Profile Card */}
        <div className="bg-[#202c33]/85 backdrop-blur-xl shadow-2xl rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 relative">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-blue-600 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 pointer-events-none"></div>
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                  backgroundSize: "30px 30px",
                }}
              ></div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6 relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 hover:scale-110 transition-transform duration-300">
                  <i className="ri-user-line text-xl sm:text-2xl lg:text-3xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    Profile
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base">
                    Manage your account and view stats
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-white/50 hover:scale-105 text-sm sm:text-base relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <i className="ri-edit-line group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                  <span className="relative z-10">Edit Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="group px-4 sm:px-5 py-2.5 sm:py-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-400/30 hover:border-red-400/50 hover:scale-105 text-sm sm:text-base relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <i className="ri-logout-box-line group-hover:scale-110 transition-transform duration-300"></i>
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Enhanced Profile Info */}
              <div className="xl:col-span-1 space-y-6">
                {/* User Card */}
                <div className="text-center">
                  <div className="relative mb-6 inline-block group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <img
                      src={user?.avatar || "/df-avatar.png"}
                      alt={user?.name}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-gradient-to-r from-green-400 to-blue-500 object-cover shadow-2xl hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "/df-avatar.png";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-[#202c33] shadow-lg">
                      <i className="ri-check-line text-white text-xs sm:text-sm animate-pulse"></i>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    {user?.name || "User"}
                  </h2>
                  <p className="text-green-400 text-sm sm:text-base font-medium mb-1">
                    @{user?.username}
                  </p>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base break-all px-2">
                    {user?.email}
                  </p>

                  {user?.bio && (
                    <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                      <h3 className="text-sm font-semibold text-green-400 mb-2 relative z-10">
                        <i className="ri-chat-quote-line mr-2"></i>Bio
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                        {user.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced Account Details */}
                <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2 relative z-10">
                    <i className="ri-information-line text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Account Information
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-600/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm sm:text-base flex items-center gap-2">
                        <i className="ri-calendar-line text-blue-400"></i>
                        Member Since
                      </span>
                      <span className="text-white font-medium text-sm sm:text-base">
                        {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-600/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm sm:text-base flex items-center gap-2">
                        <i className="ri-shield-check-line text-green-400"></i>
                        Account Status
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-medium text-sm sm:text-base">
                          Active
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm sm:text-base flex items-center gap-2">
                        <i className="ri-mail-check-line text-blue-400"></i>
                        Email Verified
                      </span>
                      <span className="flex items-center gap-2">
                        <i className="ri-verified-badge-line text-green-400"></i>
                        <span className="text-green-400 font-medium text-sm sm:text-base">
                          Verified
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Game Statistics */}
              <div className="xl:col-span-2 space-y-6">
                {/* Stats Overview */}
                <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                    <i className="ri-trophy-line text-yellow-400"></i>
                    Game Statistics
                    {gameStats && (
                      <span className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
                        {gameStats.totalGamesPlayed || 0} games
                      </span>
                    )}
                  </h3>

                  {loadingStats ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {[...Array(4)].map((_, i) => (
                        <StatCard key={i} isLoading={true} />
                      ))}
                    </div>
                  ) : gameStats ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
                      <StatCard
                        title="Highest Score"
                        value={gameStats.highestScore || 0}
                        icon="ri-trophy-line"
                        color="text-yellow-400"
                        gradient="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
                      />
                      <StatCard
                        title="Games Played"
                        value={gameStats.totalGamesPlayed || 0}
                        icon="ri-gamepad-line"
                        color="text-blue-400"
                        gradient="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                      />
                      <StatCard
                        title="Average Score"
                        value={gameStats.averageScore || 0}
                        icon="ri-bar-chart-line"
                        color="text-purple-400"
                        gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
                      />
                      <StatCard
                        title="Longest Snake"
                        value={gameStats.longestSnake || 0}
                        icon="ri-focus-3-line"
                        color="text-green-400"
                        gradient="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 relative z-10">
                      <div className="text-5xl sm:text-6xl mb-4 animate-bounce opacity-50">
                        🎮
                      </div>
                      <h4 className="text-lg sm:text-xl font-semibold mb-2">
                        No games played yet!
                      </h4>
                      <p className="text-sm sm:text-base mb-6">
                        Start your gaming journey and track your progress
                      </p>
                      <button
                        onClick={() => navigate("/game")}
                        className="group mt-4 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base font-semibold shadow-2xl relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative z-10 flex items-center gap-2">
                          <i className="ri-play-fill group-hover:scale-110 transition-transform duration-300"></i>
                          Play Your First Game
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Enhanced Recent Games */}
                {recentGames && recentGames.length > 0 && (
                  <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                      <i className="ri-history-line text-blue-400"></i>
                      Recent Games
                      <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30">
                        {recentGames.length}
                      </span>
                    </h3>
                    <div className="space-y-3 sm:space-y-4 relative z-10">
                      {recentGames
                        .slice(-5)
                        .reverse()
                        .map((game, index) => (
                          <GameCard
                            key={index}
                            game={game}
                            formatPlayTime={formatPlayTime}
                            formatDate={formatDate}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Achievements */}
                {gameStats?.achievements &&
                  gameStats.achievements.length > 0 && (
                    <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                        <i className="ri-medal-line text-yellow-400"></i>
                        Achievements
                        <span className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
                          {gameStats.achievements.length}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 relative z-10">
                        {gameStats.achievements.map((achievement, index) => (
                          <AchievementCard
                            key={index}
                            achievement={achievement}
                          />
                        ))}
                      </div>
                      {gameStats.achievements.length > 6 && (
                        <div className="text-center mt-4 relative z-10">
                          <p className="text-gray-400 text-xs sm:text-sm">
                            +{gameStats.achievements.length - 6} more
                            achievements unlocked
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {/* Enhanced Quick Actions */}
                <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                    <i className="ri-rocket-line text-green-400"></i>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative z-10">
                    <QuickActionButton
                      onClick={() => navigate("/game")}
                      icon="ri-gamepad-line"
                      iconColor="text-green-400"
                      title="Play Game"
                      description="Start a new game session"
                      gradientFrom="from-green-500/5"
                      gradientTo="to-emerald-500/5"
                    />
                    <QuickActionButton
                      onClick={() => navigate("/dashboard")}
                      icon="ri-dashboard-line"
                      iconColor="text-blue-400"
                      title="Dashboard"
                      description="View detailed analytics"
                      gradientFrom="from-blue-500/5"
                      gradientTo="to-cyan-500/5"
                    />
                    <QuickActionButton
                      onClick={() => navigate("/edit-profile")}
                      icon="ri-settings-3-line"
                      iconColor="text-purple-400"
                      title="Edit Profile"
                      description="Update your information"
                      gradientFrom="from-purple-500/5"
                      gradientTo="to-pink-500/5"
                    />
                    <QuickActionButton
                      onClick={handleLeaderboardClick}
                      icon="ri-trophy-line"
                      iconColor="text-yellow-400"
                      title="Leaderboard"
                      description="Compete with top players"
                      gradientFrom="from-yellow-500/5"
                      gradientTo="to-orange-500/5"
                    />
                  </div>
                </div>

                {/* Additional Profile Stats */}
                {gameStats && (
                  <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                      <i className="ri-bar-chart-box-line text-cyan-400"></i>
                      Additional Stats
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 relative z-10">
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-lg hover:scale-105 transition-all duration-300">
                        <div className="text-lg sm:text-xl font-bold text-cyan-400 mb-1">
                          {gameStats.totalScore
                            ? gameStats.totalScore.toLocaleString()
                            : "0"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          Total Score
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-lg hover:scale-105 transition-all duration-300">
                        <div className="text-lg sm:text-xl font-bold text-indigo-400 mb-1">
                          {gameStats.totalPlayTime
                            ? formatPlayTime(gameStats.totalPlayTime)
                            : "0:00"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          Total Time
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-lg hover:scale-105 transition-all duration-300 col-span-2 lg:col-span-1">
                        <div className="text-lg sm:text-xl font-bold text-pink-400 mb-1">
                          {gameStats.rank || "N/A"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          Global Rank
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Footer */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-t border-gray-700/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <i className="ri-shield-check-line text-green-400"></i>
                <span>Account secured and verified</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/privacy")}
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate("/support")}
                  className="hover:text-white transition-colors duration-200"
                >
                  Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
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
      `}</style>
    </div>
  );
}

export default Profile;
