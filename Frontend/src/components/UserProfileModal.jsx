import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const UserProfileModal = ({
  userId,
  isOpen,
  onClose,
  mutualFriends = [],
  onFriendAction,
  relationshipStatus = "none",
  isLoading = false,
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [actionLoading, setActionLoading] = useState(false);
  const [profileStats, setProfileStats] = useState(null);

  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    } else {
      // Reset state when modal closes
      setUser(null);
      setActiveTab("overview");
      setProfileStats(null);
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/user/${userId}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setProfileStats(data.user.profileStats);
      } else {
        showNotification(
          "error",
          data.message || "Failed to load user profile"
        );
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      showNotification("error", "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async (action) => {
    if (onFriendAction) {
      setActionLoading(true);
      try {
        await onFriendAction(action, userId);
        // Refresh user data to get updated relationship status
        await fetchUserProfile();
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPlayTime = (seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (isActive) => {
    return isActive ? "text-green-400" : "text-gray-400";
  };

  const getStatusText = (isActive) => {
    return isActive ? "Active" : "Offline";
  };

  const getBestCategory = (gameStats) => {
    if (!gameStats) return "New Player";

    if (gameStats.bestEfficiency >= 2) return "Efficient Player";
    if (gameStats.winRate >= 70) return "Winner";
    if (gameStats.longestSnake >= 50) return "Snake Master";
    if (gameStats.totalGamesPlayed >= 100) return "Veteran";
    if (gameStats.highestScore >= 1000) return "High Scorer";

    return "Player";
  };

  const renderActionButton = () => {
    if (!user || user.relationshipStatus === "self") return null;

    const baseButtonClass =
      "group px-4 py-2.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm relative overflow-hidden";
    const shimmerEffect = (
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    );

    const currentStatus = relationshipStatus || user.relationshipStatus;

    switch (currentStatus) {
      case "none":
        return (
          <button
            onClick={() => handleFriendAction("send")}
            disabled={actionLoading || isLoading}
            className={`${baseButtonClass} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:scale-105`}
          >
            {shimmerEffect}
            <span className="relative z-10 flex items-center gap-2">
              {actionLoading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-user-add-line group-hover:scale-110 transition-transform duration-300"></i>
              )}
              {actionLoading ? "Sending..." : "Add Friend"}
            </span>
          </button>
        );
      case "friend":
        return (
          <button
            onClick={() => handleFriendAction("remove")}
            disabled={actionLoading || isLoading}
            className={`${baseButtonClass} bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:scale-105`}
          >
            {shimmerEffect}
            <span className="relative z-10 flex items-center gap-2">
              {actionLoading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-user-unfollow-line group-hover:scale-110 transition-transform duration-300"></i>
              )}
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleFriendAction("accept")}
              disabled={actionLoading || isLoading}
              className={`${baseButtonClass} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:scale-105 flex-1 sm:flex-none`}
            >
              {shimmerEffect}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {actionLoading ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : (
                  <i className="ri-check-line group-hover:scale-110 transition-transform duration-300"></i>
                )}
                {actionLoading ? "Accepting..." : "Accept"}
              </span>
            </button>
            <button
              onClick={() => handleFriendAction("reject")}
              disabled={actionLoading || isLoading}
              className={`${baseButtonClass} bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:scale-105 flex-1 sm:flex-none`}
            >
              {shimmerEffect}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {actionLoading ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : (
                  <i className="ri-close-line group-hover:scale-110 transition-transform duration-300"></i>
                )}
                {actionLoading ? "Rejecting..." : "Reject"}
              </span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Enhanced tabs
  const tabs = [
    { key: "overview", label: "Overview", icon: "ri-dashboard-line" },
    { key: "stats", label: "Statistics", icon: "ri-bar-chart-line" },
    {
      key: "achievements",
      label: "Achievements",
      icon: "ri-trophy-line",
      count: user?.achievements?.length,
    },
    {
      key: "games",
      label: "Recent Games",
      icon: "ri-gamepad-line",
      count: user?.recentGames?.length,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-[#202c33]/95 backdrop-blur-md border border-gray-700/50 rounded-xl sm:rounded-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#202c33]/95 backdrop-blur-md border-b border-gray-700/50 p-4 sm:p-6 flex-shrink-0">
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
          <div className="flex items-center justify-center py-12 sm:py-16 flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-300 text-sm sm:text-base">
                Loading profile...
              </p>
            </div>
          </div>
        ) : user ? (
          <div className="flex-1 overflow-y-auto">
            {/* User Header */}
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-b border-gray-700/30 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <img
                    src={user.avatar || "/df-avatar.png"}
                    alt={user.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-green-400 object-cover shadow-2xl hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "/df-avatar.png";
                    }}
                  />
                  {/* Status indicator */}
                  <div
                    className={`absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#202c33] ${
                      profileStats?.isActive
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-500"
                    }`}
                  ></div>

                  {/* Level badge */}
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold border-2 border-[#202c33]">
                    Lv. {profileStats?.userLevel || 1}
                  </div>
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                    {user.name}
                  </h2>
                  <p className="text-green-400 text-sm sm:text-base font-medium mb-2">
                    @{user.username}
                  </p>

                  {/* Status and category */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        profileStats?.isActive
                      )}`}
                    >
                      {getStatusText(profileStats?.isActive)}
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                      {profileStats?.bestCategory ||
                        getBestCategory(user.gameStats)}
                    </span>
                    {profileStats?.playStreak > 0 && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                        🔥 {profileStats.playStreak} streak
                      </span>
                    )}
                  </div>

                  {user.bio && (
                    <p className="text-gray-300 text-sm sm:text-base mb-4 max-w-md leading-relaxed">
                      {user.bio}
                    </p>
                  )}

                  {/* Quick stats */}
                  <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-400 mb-4">
                    {profileStats?.joinedDaysAgo && (
                      <span>
                        <i className="ri-calendar-line mr-1"></i>
                        {profileStats.joinedDaysAgo} days ago
                      </span>
                    )}
                    {profileStats?.friendCount > 0 && (
                      <span>
                        <i className="ri-group-line mr-1"></i>
                        {profileStats.friendCount} friends
                      </span>
                    )}
                    {profileStats?.totalAchievements > 0 && (
                      <span>
                        <i className="ri-trophy-line mr-1"></i>
                        {profileStats.totalAchievements} achievements
                      </span>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="flex justify-center sm:justify-start">
                    {renderActionButton()}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="border-b border-gray-700/50">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? "text-green-400 bg-green-500/10"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className={tab.icon}></i>
                      <span>{tab.label}</span>
                      {tab.count && (
                        <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {tab.count}
                        </span>
                      )}
                    </div>
                    {activeTab === tab.key && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="group bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                        {(user.gameStats?.highestScore || 0).toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Highest Score
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                        {(
                          user.gameStats?.totalGamesPlayed || 0
                        ).toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Games Played
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                        {user.gameStats?.longestSnake || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Longest Snake
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                        {user.gameStats?.winRate || 0}%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Win Rate
                      </div>
                    </div>
                  </div>

                  {/* Mutual Friends */}
                  {mutualFriends.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 sm:p-6">
                      <h4 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i className="ri-group-line text-blue-400"></i>
                        Mutual Friends
                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                          {mutualFriends.length}
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {mutualFriends.slice(0, 8).map((friend) => (
                          <div
                            key={friend.user._id}
                            className="text-center group hover:scale-105 transition-transform duration-300"
                          >
                            <img
                              src={friend.user.avatar || "/df-avatar.png"}
                              alt={friend.user.name}
                              className="w-12 h-12 rounded-full border-2 border-blue-500/50 mx-auto mb-2 object-cover"
                              onError={(e) => {
                                e.target.src = "/df-avatar.png";
                              }}
                            />
                            <p className="text-xs text-blue-300 truncate font-medium">
                              {friend.user.name}
                            </p>
                          </div>
                        ))}
                      </div>
                      {mutualFriends.length > 8 && (
                        <p className="text-center text-blue-400 text-sm mt-3">
                          +{mutualFriends.length - 8} more mutual friends
                        </p>
                      )}
                    </div>
                  )}

                  {/* Play Activity */}
                  {user.gameStats?.playDays?.length > 0 && (
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 sm:p-6">
                      <h4 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i className="ri-calendar-check-line text-green-400"></i>
                        Play Activity
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-green-400">
                            {user.gameStats.playDays.length}
                          </div>
                          <div className="text-xs text-gray-400">
                            Days Played
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-blue-400">
                            {formatPlayTime(user.gameStats.totalPlayTime)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Total Time
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-purple-400">
                            {user.gameStats.currentStreak}
                          </div>
                          <div className="text-xs text-gray-400">
                            Current Streak
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-orange-400">
                            {user.gameStats.bestStreak}
                          </div>
                          <div className="text-xs text-gray-400">
                            Best Streak
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === "stats" && (
                <div className="space-y-6">
                  {/* Performance Stats */}
                  <div>
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <i className="ri-line-chart-line text-blue-400"></i>
                      Performance Statistics
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-[#2a3942] rounded-lg p-4 border border-gray-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">
                            Average Score
                          </span>
                          <i className="ri-trophy-line text-yellow-500"></i>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {user.gameStats?.averageScore || 0}
                        </div>
                      </div>

                      <div className="bg-[#2a3942] rounded-lg p-4 border border-gray-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">
                            Total Score
                          </span>
                          <i className="ri-bar-chart-line text-blue-500"></i>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {(user.gameStats?.totalScore || 0).toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-[#2a3942] rounded-lg p-4 border border-gray-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">
                            Best Efficiency
                          </span>
                          <i className="ri-speed-line text-green-500"></i>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {(user.gameStats?.bestEfficiency || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Device Stats */}
                  {user.gameStats?.deviceStats && (
                    <div>
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i className="ri-device-line text-purple-400"></i>
                        Device Performance
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(user.gameStats.deviceStats).map(
                          ([device, stats]) => (
                            <div
                              key={device}
                              className="bg-[#2a3942] rounded-lg p-4 border border-gray-600/30"
                            >
                              <div className="text-center">
                                <div className="capitalize text-white font-semibold mb-2 flex items-center justify-center gap-2">
                                  <i
                                    className={`ri-${
                                      device === "mobile"
                                        ? "smartphone"
                                        : device === "tablet"
                                        ? "tablet"
                                        : "computer"
                                    }-line text-purple-400`}
                                  ></i>
                                  {device}
                                </div>
                                <div className="text-sm text-gray-400 mb-1">
                                  Games: {stats.games}
                                </div>
                                <div className="text-lg font-bold text-purple-400">
                                  {stats.bestScore}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Best Score
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Power-up Stats */}
                  {user.gameStats?.powerUpsByType && (
                    <div>
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i className="ri-flashlight-line text-orange-400"></i>
                        Power-up Usage
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(user.gameStats.powerUpsByType).map(
                          ([type, count]) => (
                            <div
                              key={type}
                              className="bg-[#2a3942] rounded-lg p-3 border border-gray-600/30 text-center"
                            >
                              <div className="text-lg mb-1">
                                {type === "speedBoost" && "⚡"}
                                {type === "doublePoints" && "💎"}
                                {type === "invincible" && "🛡️"}
                                {type === "extraLife" && "❤️"}
                              </div>
                              <div className="text-sm font-bold text-orange-400">
                                {count}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {type.replace(/([A-Z])/g, " $1")}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === "achievements" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <i className="ri-trophy-line text-yellow-400"></i>
                      Achievements
                    </h4>
                    {profileStats?.totalAchievements > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-yellow-400 font-bold">
                          {profileStats.totalAchievements}/25
                        </span>
                      </div>
                    )}
                  </div>

                  {user.achievements && user.achievements.length > 0 ? (
                    <div className="space-y-4">
                      {/* Achievement Categories */}
                      {[
                        "basic",
                        "skill",
                        "persistence",
                        "social",
                        "special",
                      ].map((category) => {
                        const categoryAchievements = user.achievements.filter(
                          (a) => a.category === category
                        );
                        if (categoryAchievements.length === 0) return null;

                        return (
                          <div
                            key={category}
                            className="bg-[#2a3942] rounded-lg p-4 border border-gray-600/30"
                          >
                            <h5 className="text-white font-semibold mb-3 capitalize flex items-center gap-2">
                              <i
                                className={`${
                                  category === "basic"
                                    ? "ri-star-line text-blue-400"
                                    : category === "skill"
                                    ? "ri-sword-line text-red-400"
                                    : category === "persistence"
                                    ? "ri-timer-line text-green-400"
                                    : category === "social"
                                    ? "ri-group-line text-purple-400"
                                    : "ri-flashlight-line text-orange-400"
                                }`}
                              ></i>
                              {category} Achievements
                              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                                {categoryAchievements.length}
                              </span>
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {categoryAchievements.map(
                                (achievement, index) => (
                                  <div
                                    key={index}
                                    className="group flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/15 transition-all duration-300 hover:scale-105"
                                  >
                                    <div className="text-yellow-400 text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                      {achievement.tier === "bronze" && "🥉"}
                                      {achievement.tier === "silver" && "🥈"}
                                      {achievement.tier === "gold" && "🥇"}
                                      {achievement.tier === "platinum" && "💎"}
                                      {achievement.tier === "diamond" && "💠"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="text-white font-medium text-sm truncate">
                                          {achievement.name}
                                        </div>
                                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                          {achievement.points}pts
                                        </span>
                                      </div>
                                      <div className="text-gray-400 text-xs mb-1">
                                        {achievement.description}
                                      </div>
                                      <div className="text-gray-500 text-xs">
                                        Unlocked{" "}
                                        {formatDate(achievement.unlockedAt)}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="ri-trophy-line text-4xl mb-4 opacity-50"></i>
                      <h4 className="text-lg font-semibold mb-2">
                        No achievements yet
                      </h4>
                      <p className="text-sm">
                        Start playing to unlock achievements!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Games Tab */}
              {activeTab === "games" && (
                <div>
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <i className="ri-gamepad-line text-green-400"></i>
                    Recent Games
                    {user.recentGames && (
                      <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
                        {user.recentGames.length}
                      </span>
                    )}
                  </h4>

                  {user.recentGames && user.recentGames.length > 0 ? (
                    <div className="space-y-3">
                      {user.recentGames
                        .slice()
                        .reverse()
                        .map((game, index) => (
                          <div
                            key={index}
                            className="group bg-[#2a3942] rounded-lg p-4 border border-gray-600/30 hover:bg-[#334155] transition-all duration-300"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {/* Game Stats */}
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="text-center bg-yellow-500/10 rounded-lg p-3 min-w-[70px]">
                                  <div className="text-lg font-bold text-yellow-400 group-hover:scale-105 transition-transform duration-300">
                                    {game.score.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Score
                                  </div>
                                </div>

                                <div className="text-center bg-green-500/10 rounded-lg p-3 min-w-[70px]">
                                  <div className="text-lg font-bold text-green-400 group-hover:scale-105 transition-transform duration-300">
                                    {game.snakeLength}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Length
                                  </div>
                                </div>

                                <div className="text-center bg-blue-500/10 rounded-lg p-3 min-w-[70px]">
                                  <div className="text-lg font-bold text-blue-400 group-hover:scale-105 transition-transform duration-300">
                                    {formatPlayTime(game.playTime)}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Time
                                  </div>
                                </div>

                                {game.efficiency && (
                                  <div className="text-center bg-purple-500/10 rounded-lg p-3 min-w-[70px]">
                                    <div className="text-lg font-bold text-purple-400 group-hover:scale-105 transition-transform duration-300">
                                      {game.efficiency.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Efficiency
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Game Details */}
                              <div className="text-right">
                                <div className="text-sm text-gray-300 mb-1">
                                  {formatDate(game.playedAt)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 justify-end">
                                  {game.deviceType && (
                                    <span className="flex items-center gap-1">
                                      <i
                                        className={`ri-${
                                          game.deviceType === "mobile"
                                            ? "smartphone"
                                            : "computer"
                                        }-line`}
                                      ></i>
                                      {game.deviceType}
                                    </span>
                                  )}
                                  {game.foodEaten && (
                                    <span>🍎 {game.foodEaten}</span>
                                  )}
                                  {game.powerUpsUsed > 0 && (
                                    <span>⚡ {game.powerUpsUsed}</span>
                                  )}
                                </div>

                                {/* Game outcome */}
                                <div className="mt-1">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      game.endReason === "completed"
                                        ? "bg-green-500/20 text-green-400"
                                        : game.endReason === "quit"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {game.endReason === "completed"
                                      ? "Completed"
                                      : game.endReason === "quit"
                                      ? "Quit"
                                      : "Collision"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Power-ups used in this game */}
                            {game.powerUpsCollected &&
                              game.powerUpsCollected.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-600/30">
                                  <div className="text-xs text-gray-400 mb-2">
                                    Power-ups collected:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {game.powerUpsCollected.map(
                                      (powerUp, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full"
                                        >
                                          {powerUp.type === "speedBoost" &&
                                            "⚡ Speed"}
                                          {powerUp.type === "doublePoints" &&
                                            "💎 Double"}
                                          {powerUp.type === "invincible" &&
                                            "🛡️ Shield"}
                                          {powerUp.type === "extraLife" &&
                                            "❤️ Life"}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="ri-gamepad-line text-4xl mb-4 opacity-50"></i>
                      <h4 className="text-lg font-semibold mb-2">
                        No recent games
                      </h4>
                      <p className="text-sm">No game history available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 text-gray-400 flex-1 flex items-center justify-center">
            <div>
              <div className="text-4xl sm:text-6xl mb-4 opacity-50">👤</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                User not found
              </h3>
              <p className="text-sm sm:text-base">
                This user may not exist or has been removed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
