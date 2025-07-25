import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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
    // Navigate to leaderboard page instead of opening API endpoint
    navigate("/leaderboard");
  };

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-8 md:pt-0">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="bg-[#202c33] shadow-2xl rounded-xl overflow-hidden border border-gray-700/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-2xl"></i>
                </div>
                Profile
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/30"
                >
                  <i className="ri-edit-line"></i>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors backdrop-blur-sm border border-red-400/30"
                >
                  <i className="ri-logout-box-line mr-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="xl:col-span-1">
                <div className="text-center mb-6">
                  <div className="relative mb-6 inline-block">
                    <img
                      src={user?.avatar || "/df-avatar.png"}
                      alt={user?.name}
                      className="w-32 h-32 rounded-full border-4 border-green-400 object-cover shadow-xl"
                      onError={(e) => {
                        e.target.src = "/df-avatar.png";
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#202c33]">
                      <i className="ri-check-line text-white text-sm"></i>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2">
                    {user?.name || "User"}
                  </h2>
                  <p className="text-green-400 text-sm font-medium mb-1">
                    @{user?.username}
                  </p>
                  <p className="text-gray-400 mb-4">{user?.email}</p>

                  {user?.bio && (
                    <div className="bg-[#2a3942] p-4 rounded-lg border border-gray-600/50">
                      <h3 className="text-sm font-semibold text-green-400 mb-2">
                        Bio
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Account Details */}
                <div className="bg-[#2a3942] p-6 rounded-lg border border-gray-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-information-line text-green-400"></i>
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-600/30">
                      <span className="text-gray-400">Member Since</span>
                      <span className="text-white font-medium">
                        {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600/30">
                      <span className="text-gray-400">Account Status</span>
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 font-medium">
                          Active
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Email Verified</span>
                      <span className="flex items-center gap-2">
                        <i className="ri-shield-check-line text-green-400"></i>
                        <span className="text-green-400 font-medium">
                          Verified
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Statistics */}
              <div className="xl:col-span-2 space-y-6">
                {/* Stats Overview */}
                <div className="bg-[#2a3942] p-6 rounded-lg border border-gray-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-trophy-line text-yellow-400"></i>
                    Game Statistics
                  </h3>

                  {loadingStats ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : gameStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-[#334155] rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">
                          {gameStats.highestScore || 0}
                        </div>
                        <div className="text-sm text-gray-400">
                          Highest Score
                        </div>
                      </div>
                      <div className="text-center p-4 bg-[#334155] rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">
                          {gameStats.totalGamesPlayed || 0}
                        </div>
                        <div className="text-sm text-gray-400">
                          Games Played
                        </div>
                      </div>
                      <div className="text-center p-4 bg-[#334155] rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">
                          {gameStats.averageScore || 0}
                        </div>
                        <div className="text-sm text-gray-400">
                          Average Score
                        </div>
                      </div>
                      <div className="text-center p-4 bg-[#334155] rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          {gameStats.longestSnake || 0}
                        </div>
                        <div className="text-sm text-gray-400">
                          Longest Snake
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="ri-gamepad-line text-4xl mb-2"></i>
                      <p>No games played yet!</p>
                      <button
                        onClick={() => navigate("/game")}
                        className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        Play Your First Game
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Games */}
                {recentGames && recentGames.length > 0 && (
                  <div className="bg-[#2a3942] p-6 rounded-lg border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <i className="ri-history-line text-blue-400"></i>
                      Recent Games
                    </h3>
                    <div className="space-y-3">
                      {recentGames
                        .slice(-5)
                        .reverse()
                        .map((game, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-[#334155] rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-yellow-400">
                                  {game.score}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Score
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-400">
                                  {game.snakeLength}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Length
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-400">
                                  {formatPlayTime(game.playTime)}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Time
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">
                                {formatDate(game.playedAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {gameStats?.achievements &&
                  gameStats.achievements.length > 0 && (
                    <div className="bg-[#2a3942] p-6 rounded-lg border border-gray-600/50">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <i className="ri-medal-line text-yellow-400"></i>
                        Achievements ({gameStats.achievements.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {gameStats.achievements.map((achievement, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-[#334155] rounded-lg"
                          >
                            <div className="text-yellow-400 text-xl">🏆</div>
                            <div>
                              <div className="text-white font-medium">
                                {achievement.name}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {achievement.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Quick Actions */}
                <div className="bg-[#2a3942] p-6 rounded-lg border border-gray-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-settings-3-line text-green-400"></i>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate("/game")}
                      className="flex items-center gap-3 p-4 bg-[#334155] hover:bg-[#3f4b5f] rounded-lg transition-colors text-left"
                    >
                      <i className="ri-gamepad-line text-green-400 text-xl"></i>
                      <div>
                        <div className="text-white font-medium">Play Game</div>
                        <div className="text-gray-400 text-sm">
                          Start a new game
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="flex items-center gap-3 p-4 bg-[#334155] hover:bg-[#3f4b5f] rounded-lg transition-colors text-left"
                    >
                      <i className="ri-dashboard-line text-blue-400 text-xl"></i>
                      <div>
                        <div className="text-white font-medium">Dashboard</div>
                        <div className="text-gray-400 text-sm">
                          View detailed stats
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate("/edit-profile")}
                      className="flex items-center gap-3 p-4 bg-[#334155] hover:bg-[#3f4b5f] rounded-lg transition-colors text-left"
                    >
                      <i className="ri-edit-line text-purple-400 text-xl"></i>
                      <div>
                        <div className="text-white font-medium">
                          Edit Profile
                        </div>
                        <div className="text-gray-400 text-sm">
                          Update your information
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={handleLeaderboardClick}
                      className="flex items-center gap-3 p-4 bg-[#334155] hover:bg-[#3f4b5f] rounded-lg transition-colors text-left"
                    >
                      <i className="ri-trophy-line text-yellow-400 text-xl"></i>
                      <div>
                        <div className="text-white font-medium">
                          Leaderboard
                        </div>
                        <div className="text-gray-400 text-sm">
                          See top players
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
