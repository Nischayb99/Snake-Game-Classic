import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const UserProfileModal = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/user/${userId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        showNotification("error", "Failed to load user profile");
      }
    } catch (error) {
      showNotification("error", "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async (action, targetUserId) => {
    setActionLoading(true);
    try {
      const endpoint = action === "send" ? "request" : action;
      const method = action === "remove" ? "DELETE" : "POST";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/${endpoint}/${targetUserId}`,
        {
          method,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        showNotification("success", data.message);
        fetchUserProfile(); // Refresh user data
      } else {
        showNotification("error", data.message);
      }
    } catch (error) {
      showNotification("error", "Failed to perform action");
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButton = () => {
    if (!user || user.relationshipStatus === "self") return null;

    const baseButtonClass =
      "group px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base relative overflow-hidden";

    const shimmerEffect = (
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    );

    switch (user.relationshipStatus) {
      case "none":
        return (
          <button
            onClick={() => handleFriendAction("send", user._id)}
            disabled={actionLoading}
            className={`${baseButtonClass} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:scale-105`}
          >
            {shimmerEffect}
            <span className="relative z-10 flex items-center gap-2">
              <i className="ri-user-add-line group-hover:scale-110 transition-transform duration-300"></i>
              {actionLoading ? "Sending..." : "Add Friend"}
            </span>
          </button>
        );
      case "friend":
        return (
          <button
            onClick={() => handleFriendAction("remove", user._id)}
            disabled={actionLoading}
            className={`${baseButtonClass} bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:scale-105`}
          >
            {shimmerEffect}
            <span className="relative z-10 flex items-center gap-2">
              <i className="ri-user-unfollow-line group-hover:scale-110 transition-transform duration-300"></i>
              {actionLoading ? "Removing..." : "Remove Friend"}
            </span>
          </button>
        );
      case "request_sent":
        return (
          <button
            disabled
            className={`${baseButtonClass} bg-gray-500/80 text-white cursor-not-allowed backdrop-blur-sm border border-gray-400/30`}
          >
            <span className="flex items-center gap-2">
              <i className="ri-time-line animate-pulse"></i>
              Request Sent
            </span>
          </button>
        );
      case "request_received":
        return (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleFriendAction("accept", user._id)}
              disabled={actionLoading}
              className={`${baseButtonClass} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:scale-105 flex-1 sm:flex-none`}
            >
              {shimmerEffect}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <i className="ri-check-line group-hover:scale-110 transition-transform duration-300"></i>
                {actionLoading ? "Accepting..." : "Accept"}
              </span>
            </button>
            <button
              onClick={() => handleFriendAction("reject", user._id)}
              disabled={actionLoading}
              className={`${baseButtonClass} bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:scale-105 flex-1 sm:flex-none`}
            >
              {shimmerEffect}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <i className="ri-close-line group-hover:scale-110 transition-transform duration-300"></i>
                {actionLoading ? "Rejecting..." : "Reject"}
              </span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPlayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-[#202c33]/95 backdrop-blur-md border border-gray-700/50 rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#202c33]/95 backdrop-blur-md border-b border-gray-700/50 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              User Profile
            </h3>
            <button
              onClick={onClose}
              className="group text-gray-400 hover:text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
            >
              <i className="ri-close-line text-lg sm:text-xl group-hover:scale-110 group-hover:rotate-90 transition-all duration-300"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-300 text-sm sm:text-base">
                Loading profile...
              </p>
            </div>
          </div>
        ) : user ? (
          <div className="p-4 sm:p-6">
            {/* User Info */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="relative inline-block mb-4 sm:mb-6">
                <img
                  src={user.avatar || "/df-avatar.png"}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-green-400 object-cover shadow-2xl hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "/df-avatar.png";
                  }}
                />
                {/* Online status indicator */}
                <div className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 border-[#202c33] rounded-full animate-pulse"></div>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                {user.name}
              </h2>
              <p className="text-green-400 text-sm sm:text-base font-medium mb-2 sm:mb-3">
                @{user.username}
              </p>
              {user.bio && (
                <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Action Button */}
              <div className="mb-6 sm:mb-8 flex justify-center">
                {renderActionButton()}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="group bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {(user.gameStats?.highestScore || 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    Highest Score
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {(user.gameStats?.totalGamesPlayed || 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    Games Played
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {user.gameStats?.longestSnake || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    Longest Snake
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {formatPlayTime(user.gameStats?.totalPlayTime || 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    Play Time
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Games */}
            {user.recentGames && user.recentGames.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <i className="ri-history-line text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                  Recent Games
                  <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                    {user.recentGames.length}
                  </span>
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {user.recentGames
                    .slice(-3)
                    .reverse()
                    .map((game, index) => (
                      <div
                        key={index}
                        className="group flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-[#2a3942]/80 backdrop-blur-sm rounded-lg border border-gray-600/30 hover:bg-[#334155] transition-all duration-300 gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                          <div className="text-center bg-yellow-500/10 rounded-lg p-2 min-w-[60px]">
                            <div className="text-sm sm:text-base font-bold text-yellow-400 group-hover:scale-105 transition-transform duration-300">
                              {game.score.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">Score</div>
                          </div>
                          <div className="text-center bg-green-500/10 rounded-lg p-2 min-w-[60px]">
                            <div className="text-sm sm:text-base font-bold text-green-400 group-hover:scale-105 transition-transform duration-300">
                              {game.snakeLength}
                            </div>
                            <div className="text-xs text-gray-400">Length</div>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-right sm:text-left">
                          {formatDate(game.playedAt)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {user.gameStats?.achievements &&
              user.gameStats.achievements.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <i className="ri-medal-line text-yellow-400"></i>
                    Achievements
                    <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full">
                      {user.gameStats.achievements.length}
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.gameStats.achievements
                      .slice(-4)
                      .map((achievement, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 sm:gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/15 transition-all duration-300 hover:scale-105 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="text-yellow-400 text-lg sm:text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10">
                            🏆
                          </div>
                          <div className="relative z-10 flex-1 min-w-0">
                            <div className="text-white font-medium text-sm sm:text-base truncate">
                              {achievement.name}
                            </div>
                            <div className="text-gray-400 text-xs sm:text-sm truncate">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {user.gameStats.achievements.length > 4 && (
                    <div className="text-center mt-3 sm:mt-4">
                      <p className="text-gray-400 text-xs sm:text-sm">
                        +{user.gameStats.achievements.length - 4} more
                        achievements
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* Member Since */}
            <div className="text-center p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30 backdrop-blur-sm">
              <p className="text-gray-400 text-sm sm:text-base flex items-center justify-center gap-2">
                <i className="ri-calendar-line text-blue-400"></i>
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 text-gray-400">
            <div className="text-4xl sm:text-6xl mb-4 opacity-50">👤</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              User not found
            </h3>
            <p className="text-sm sm:text-base">
              This user may not exist or has been removed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
