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

    const buttonClass =
      "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    switch (user.relationshipStatus) {
      case "none":
        return (
          <button
            onClick={() => handleFriendAction("send", user._id)}
            disabled={actionLoading}
            className={`${buttonClass} bg-green-500 hover:bg-green-600 text-white`}
          >
            {actionLoading ? "Sending..." : "Add Friend"}
          </button>
        );
      case "friend":
        return (
          <button
            onClick={() => handleFriendAction("remove", user._id)}
            disabled={actionLoading}
            className={`${buttonClass} bg-red-500 hover:bg-red-600 text-white`}
          >
            {actionLoading ? "Removing..." : "Remove Friend"}
          </button>
        );
      case "request_sent":
        return (
          <button
            disabled
            className={`${buttonClass} bg-gray-500 text-white cursor-not-allowed`}
          >
            Request Sent
          </button>
        );
      case "request_received":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleFriendAction("accept", user._id)}
              disabled={actionLoading}
              className={`${buttonClass} bg-green-500 hover:bg-green-600 text-white`}
            >
              {actionLoading ? "Accepting..." : "Accept"}
            </button>
            <button
              onClick={() => handleFriendAction("reject", user._id)}
              disabled={actionLoading}
              className={`${buttonClass} bg-red-500 hover:bg-red-600 text-white`}
            >
              {actionLoading ? "Rejecting..." : "Reject"}
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#202c33] border border-gray-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#202c33] border-b border-gray-700/50 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">User Profile</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white w-10 h-10 rounded-full hover:bg-gray-700/50 transition-colors flex items-center justify-center"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : user ? (
          <div className="p-6">
            {/* User Info */}
            <div className="text-center mb-8">
              <img
                src={user.avatar || "/df-avatar.png"}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-green-400 object-cover mx-auto mb-4"
                onError={(e) => {
                  e.target.src = "/df-avatar.png";
                }}
              />
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name}
              </h2>
              <p className="text-green-400 text-sm font-medium mb-2">
                @{user.username}
              </p>
              {user.bio && (
                <p className="text-gray-300 text-sm mb-4 max-w-md mx-auto">
                  {user.bio}
                </p>
              )}

              {/* Action Button */}
              <div className="mb-6">{renderActionButton()}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {user.gameStats?.highestScore || 0}
                </div>
                <div className="text-xs text-gray-400">Highest Score</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {user.gameStats?.totalGamesPlayed || 0}
                </div>
                <div className="text-xs text-gray-400">Games Played</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {user.gameStats?.longestSnake || 0}
                </div>
                <div className="text-xs text-gray-400">Longest Snake</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatPlayTime(user.gameStats?.totalPlayTime || 0)}
                </div>
                <div className="text-xs text-gray-400">Play Time</div>
              </div>
            </div>

            {/* Recent Games */}
            {user.recentGames && user.recentGames.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="ri-history-line text-blue-400"></i>
                  Recent Games
                </h4>
                <div className="space-y-2">
                  {user.recentGames
                    .slice(-3)
                    .reverse()
                    .map((game, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-[#2a3942] rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-bold text-yellow-400">
                              {game.score}
                            </div>
                            <div className="text-xs text-gray-400">Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-400">
                              {game.snakeLength}
                            </div>
                            <div className="text-xs text-gray-400">Length</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
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
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <i className="ri-medal-line text-yellow-400"></i>
                    Achievements ({user.gameStats.achievements.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {user.gameStats.achievements
                      .slice(-4)
                      .map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                        >
                          <div className="text-yellow-400 text-xl">🏆</div>
                          <div>
                            <div className="text-white font-medium text-sm">
                              {achievement.name}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Member Since */}
            <div className="text-center text-gray-400 text-sm">
              Member since {formatDate(user.createdAt)}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>User not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
