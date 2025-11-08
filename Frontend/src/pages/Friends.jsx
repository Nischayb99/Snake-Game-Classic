import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import UserProfileModal from "../components/UserProfileModal";
import { Helmet } from "react-helmet";

const Friends = () => {
  // State management
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({
    sent: [],
    received: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilter, setSearchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [leaderboardType, setLeaderboardType] = useState("highestScore");
  const [friendsLeaderboard, setFriendsLeaderboard] = useState([]);
  const [mutualFriends, setMutualFriends] = useState({});
  const [onlineStatus, setOnlineStatus] = useState({});
  const [friendStats, setFriendStats] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Modal states
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  // Enhanced search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, searchFilter]);

  // Initial data load
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllFriendsData();
    }
  }, [isAuthenticated]);

  // Auto-refresh online status
  useEffect(() => {
    const interval = setInterval(() => {
      if (friends.length > 0) {
        updateOnlineStatus();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [friends]);

  // Comprehensive data fetching
  const fetchAllFriendsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFriends(),
        fetchFriendRequests(),
        fetchFriendsLeaderboard(),
      ]);
    } catch (error) {
      console.error("Failed to fetch friends data:", error);
      showNotification("error", "Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced friends fetching with sorting
  const fetchFriends = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends?sortBy=${sortBy}&limit=50`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        setFriends(data.friends);
        setFriendStats(data.friendStats);
        updateOnlineStatus(data.friends);
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  };

  // Enhanced friend requests
  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/requests`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        setFriendRequests(data.friendRequests);
      }
    } catch (error) {
      console.error("Failed to fetch friend requests:", error);
    }
  };

  // Friends leaderboard
  const fetchFriendsLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/friends/leaderboard?type=${leaderboardType}&limit=20`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        setFriendsLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch friends leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Enhanced user search with filters
  const searchUsers = async () => {
    setSearchLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/search?q=${encodeURIComponent(
          searchQuery
        )}&filter=${searchFilter}&limit=20`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
      showNotification("error", "Failed to search users");
    } finally {
      setSearchLoading(false);
    }
  };

  // Get mutual friends
  const fetchMutualFriends = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/mutual/${userId}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        setMutualFriends((prev) => ({
          ...prev,
          [userId]: data.mutualFriends,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch mutual friends:", error);
    }
  };

  // Update online status
  const updateOnlineStatus = (friendsList = friends) => {
    const status = {};
    friendsList.forEach((friendship) => {
      const friend = friendship.user;
      const lastPlayed = friend.gameStats?.lastPlayedAt;

      if (lastPlayed) {
        const timeDiff = Date.now() - new Date(lastPlayed).getTime();
        const minutes = timeDiff / (1000 * 60);

        if (minutes < 30) {
          status[friend._id] = "online";
        } else if (minutes < 1440) {
          // 24 hours
          status[friend._id] = "active";
        } else {
          status[friend._id] = "offline";
        }
      } else {
        status[friend._id] = "offline";
      }
    });

    setOnlineStatus(status);
  };

  // Enhanced friend actions with loading states
  const handleFriendAction = async (action, targetUserId, targetName = "") => {
    setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      const endpoint = action === "send" ? "request" : action;
      const method = action === "remove" ? "DELETE" : "POST";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/${endpoint}/${targetUserId}`,
        { method, credentials: "include" }
      );

      const data = await response.json();

      if (data.success) {
        showNotification("success", data.message);

        // Update local state immediately for better UX
        if (action === "accept") {
          // Move from requests to friends
          setFriendRequests((prev) => ({
            ...prev,
            received: prev.received.filter(
              (req) => req.from._id !== targetUserId
            ),
          }));
          // Refresh friends list
          fetchFriends();
        } else if (action === "reject") {
          setFriendRequests((prev) => ({
            ...prev,
            received: prev.received.filter(
              (req) => req.from._id !== targetUserId
            ),
          }));
        } else if (action === "remove") {
          setFriends((prev) =>
            prev.filter((friend) => friend.user._id !== targetUserId)
          );
        }

        // Refresh search results if searching
        if (searchQuery && action === "send") {
          searchUsers();
        }

        // Show achievement notification if any
        if (data.newAchievements && data.newAchievements.length > 0) {
          data.newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
              showNotification(
                "success",
                `🏆 Achievement: ${achievement.name}!`,
                5000
              );
            }, (index + 1) * 1000);
          });
        }
      } else {
        showNotification("error", data.message);
      }
    } catch (error) {
      console.error("Friend action failed:", error);
      showNotification("error", `Failed to ${action} friend`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Determine relationship status
  const getRelationshipStatus = (userId) => {
    // Check if friend
    if (friends.some((friend) => friend.user._id === userId)) {
      return "friend";
    }

    // Check if request sent
    if (friendRequests.sent.some((req) => req.to._id === userId)) {
      return "request_sent";
    }

    // Check if request received
    if (friendRequests.received.some((req) => req.from._id === userId)) {
      return "request_received";
    }

    return "none";
  };

  // Open user profile with mutual friends
  const openUserProfile = (userId) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
    fetchMutualFriends(userId);
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

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-400";
      case "active":
        return "text-yellow-400";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "online":
        return "Online";
      case "active":
        return "Active";
      default:
        return "Offline";
    }
  };

  const getBestCategory = (gameStats) => {
    if (!gameStats) return "New Player";

    if (gameStats.bestEfficiency >= 2) return "Efficient";
    if (gameStats.winRate >= 70) return "Winner";
    if (gameStats.longestSnake >= 50) return "Snake Master";
    if (gameStats.totalGamesPlayed >= 100) return "Veteran";
    if (gameStats.highestScore >= 1000) return "High Scorer";

    return "Player";
  };

  // Enhanced tabs with counts and indicators
  const tabs = [
    {
      key: "friends",
      label: "Friends",
      icon: "ri-user-line",
      count: friends.length,
      badge: friendStats?.online > 0 ? friendStats.online : null,
      badgeColor: "bg-green-500",
    },
    {
      key: "received",
      label: "Requests",
      icon: "ri-mail-line",
      count: friendRequests.received.length,
      badge: null,
    },
    {
      key: "leaderboard",
      label: "Leaderboard",
      icon: "ri-trophy-line",
      count: null,
      badge: null,
    },
    {
      key: "search",
      label: "Find Friends",
      icon: "ri-search-line",
      count: null,
      badge: null,
    },
  ];

  // Search filter options
  const searchFilters = [
    { value: "all", label: "All Players", icon: "ri-group-line" },
    { value: "active", label: "Active (7 days)", icon: "ri-time-line" },
    {
      value: "high_score",
      label: "High Scorers (500+)",
      icon: "ri-trophy-line",
    },
    {
      value: "beginners",
      label: "Beginners (<10 games)",
      icon: "ri-seedling-line",
    },
    {
      value: "experienced",
      label: "Experienced (50+ games)",
      icon: "ri-medal-line",
    },
  ];

  // Leaderboard types
  const leaderboardTypes = [
    { value: "highestScore", label: "High Score", icon: "ri-trophy-line" },
    { value: "totalScore", label: "Total Score", icon: "ri-bar-chart-line" },
    { value: "winRate", label: "Win Rate", icon: "ri-percent-line" },
    { value: "efficiency", label: "Efficiency", icon: "ri-speed-line" },
    { value: "longestSnake", label: "Longest Snake", icon: "ri-ruler-line" },
  ];

  // Sort options for friends
  const sortOptions = [
    { value: "recent", label: "Recent Activity", icon: "ri-time-line" },
    { value: "score", label: "High Score", icon: "ri-trophy-line" },
    { value: "name", label: "Name", icon: "ri-sort-asc" },
    { value: "friendship", label: "Friendship Date", icon: "ri-calendar-line" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading friends data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-4 sm:pt-8">
      <Helmet>
        <title>Friends | Snake Game Ultimate Edition</title>
        <meta
          name="description"
          content="Connect with friends and see their achievements in Snake Game Ultimate Edition."
        />
      </Helmet>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Enhanced Header with Stats */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
            <i className="ri-group-line text-green-400 text-2xl sm:text-3xl lg:text-4xl"></i>
            Friends & Community
          </h1>
          <p className="text-sm sm:text-base text-gray-300 px-4 mb-4">
            Connect, compete, and grow with the Snake Game community
          </p>

          {/* Friend Stats Summary */}
          {friendStats && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                <span className="text-green-400 font-bold">
                  {friendStats.total}
                </span>
                <span className="text-gray-300 ml-1">Friends</span>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1">
                <span className="text-blue-400 font-bold">
                  {friendStats.online}
                </span>
                <span className="text-gray-300 ml-1">Online</span>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1">
                <span className="text-yellow-400 font-bold">
                  {friendStats.active}
                </span>
                <span className="text-gray-300 ml-1">Active</span>
              </div>
              {friendStats.averageScore > 0 && (
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1">
                  <span className="text-purple-400 font-bold">
                    {friendStats.averageScore}
                  </span>
                  <span className="text-gray-300 ml-1">Avg Score</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-[#202c33] rounded-xl border border-gray-700/50 mb-4 sm:mb-6 overflow-hidden">
          <div className="flex border-b border-gray-700/50 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === "leaderboard") {
                    fetchFriendsLeaderboard();
                  }
                }}
                className={`flex-1 min-w-fit px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <div className="relative">
                    <i className={`${tab.icon} text-sm sm:text-base`}></i>
                    {tab.badge && (
                      <span
                        className={`absolute -top-1 -right-1 ${tab.badgeColor} text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] text-center font-bold animate-pulse`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">
                    {tab.label.split(" ")[0]}
                  </span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[16px] sm:min-w-[20px] text-center">
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

          <div className="p-3 sm:p-4 lg:p-6">
            {/* Friends Tab */}
            {activeTab === "friends" && (
              <div>
                {/* Sort Options */}
                {friends.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2 items-center">
                    <span className="text-gray-400 text-sm">Sort by:</span>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          fetchFriends();
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          sortBy === option.value
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-700/50 text-gray-400 hover:text-white"
                        }`}
                      >
                        <i className={option.icon}></i>
                        <span className="hidden sm:inline">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {friends.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-400 px-4">
                    <i className="ri-user-add-line text-4xl sm:text-6xl mb-3 sm:mb-4"></i>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      No friends yet
                    </h3>
                    <p className="mb-4 text-sm sm:text-base">
                      Start building your gaming network! Find and add friends
                      to compete together.
                    </p>
                    <button
                      onClick={() => setActiveTab("search")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base font-medium"
                    >
                      Find Friends
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friendship) => (
                      <div
                        key={friendship.user._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#2a3942] rounded-lg border border-gray-600/30 gap-3 sm:gap-4 hover:bg-[#2a3942]/80 transition-colors"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={friendship.user.avatar || "/df-avatar.png"}
                              alt={friendship.user.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-600"
                              onError={(e) => {
                                e.target.src = "/df-avatar.png";
                              }}
                            />
                            {/* Online Status Indicator */}
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#2a3942] ${
                                onlineStatus[friendship.user._id] === "online"
                                  ? "bg-green-500"
                                  : onlineStatus[friendship.user._id] ===
                                    "active"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                                {friendship.user.name}
                              </h3>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                  onlineStatus[friendship.user._id]
                                )}`}
                              >
                                {getStatusText(
                                  onlineStatus[friendship.user._id]
                                )}
                              </span>
                            </div>

                            <p className="text-gray-400 text-xs sm:text-sm truncate mb-1">
                              @{friendship.user.username} •{" "}
                              {getBestCategory(friendship.user.gameStats)}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                              <span className="whitespace-nowrap flex items-center gap-1">
                                <i className="ri-trophy-line text-yellow-500"></i>
                                {friendship.user.gameStats?.highestScore || 0}
                              </span>
                              <span className="whitespace-nowrap flex items-center gap-1">
                                <i className="ri-gamepad-line text-blue-400"></i>
                                {friendship.user.gameStats?.totalGamesPlayed ||
                                  0}
                              </span>
                              {friendship.user.gameStats?.winRate > 0 && (
                                <span className="whitespace-nowrap flex items-center gap-1">
                                  <i className="ri-percent-line text-green-400"></i>
                                  {friendship.user.gameStats.winRate}%
                                </span>
                              )}
                              {friendship.user.gameStats?.lastPlayedAt && (
                                <span className="whitespace-nowrap">
                                  Last:{" "}
                                  {formatDate(
                                    friendship.user.gameStats.lastPlayedAt
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => openUserProfile(friendship.user._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                          >
                            <i className="ri-eye-line mr-1"></i>
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("remove", friendship.user._id)
                            }
                            disabled={actionLoading[friendship.user._id]}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap disabled:opacity-50"
                          >
                            {actionLoading[friendship.user._id] ? (
                              <i className="ri-loader-4-line animate-spin"></i>
                            ) : (
                              <>
                                <i className="ri-user-unfollow-line mr-1"></i>
                                Remove
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Friend Requests Tab */}
            {activeTab === "received" && (
              <div>
                {friendRequests.received.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-400 px-4">
                    <i className="ri-mail-line text-4xl sm:text-6xl mb-3 sm:mb-4"></i>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      No friend requests
                    </h3>
                    <p className="text-sm sm:text-base mb-4">
                      When someone sends you a friend request, it will appear
                      here.
                    </p>
                    <p className="text-xs text-gray-500">
                      Share your username{" "}
                      <span className="text-blue-400 font-mono">
                        @{user?.username}
                      </span>{" "}
                      with friends!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        <i className="ri-information-line mr-2"></i>
                        {friendRequests.received.length} pending friend request
                        {friendRequests.received.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {friendRequests.received.map((request) => (
                      <div
                        key={request.from._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#2a3942] rounded-lg border border-gray-600/30 gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <img
                            src={request.from.avatar || "/df-avatar.png"}
                            alt={request.from.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = "/df-avatar.png";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                              {request.from.name}
                            </h3>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">
                              @{request.from.username}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>
                                Best:{" "}
                                {request.from.gameStats?.highestScore || 0}
                              </span>
                              <span>
                                Games:{" "}
                                {request.from.gameStats?.totalGamesPlayed || 0}
                              </span>
                              <span>
                                Level:{" "}
                                {Math.floor(
                                  (request.from.gameStats?.totalGamesPlayed ||
                                    0) / 10
                                ) + 1}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Requested {formatDate(request.receivedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => openUserProfile(request.from._id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                          >
                            <i className="ri-eye-line mr-1"></i>
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("accept", request.from._id)
                            }
                            disabled={actionLoading[request.from._id]}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap disabled:opacity-50"
                          >
                            {actionLoading[request.from._id] ? (
                              <i className="ri-loader-4-line animate-spin"></i>
                            ) : (
                              <>
                                <i className="ri-user-add-line mr-1"></i>
                                Accept
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("reject", request.from._id)
                            }
                            disabled={actionLoading[request.from._id]}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap disabled:opacity-50"
                          >
                            {actionLoading[request.from._id] ? (
                              <i className="ri-loader-4-line animate-spin"></i>
                            ) : (
                              <>
                                <i className="ri-close-line mr-1"></i>
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Friends Leaderboard Tab */}
            {activeTab === "leaderboard" && (
              <div>
                {/* Leaderboard Type Selector */}
                <div className="mb-4 flex flex-wrap gap-2 items-center">
                  <span className="text-gray-400 text-sm">Category:</span>
                  {leaderboardTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setLeaderboardType(type.value);
                        fetchFriendsLeaderboard();
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        leaderboardType === type.value
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-700/50 text-gray-400 hover:text-white"
                      }`}
                    >
                      <i className={type.icon}></i>
                      <span className="hidden sm:inline">{type.label}</span>
                    </button>
                  ))}
                </div>

                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">
                      Loading leaderboard...
                    </p>
                  </div>
                ) : friendsLeaderboard.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-400 px-4">
                    <i className="ri-trophy-line text-4xl sm:text-6xl mb-3 sm:mb-4"></i>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      No leaderboard data
                    </h3>
                    <p className="text-sm sm:text-base">
                      Add friends and play games to see the leaderboard!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friendsLeaderboard.map((player, index) => (
                      <div
                        key={player._id}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-colors ${
                          player.isSelf
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-[#2a3942] border-gray-600/30 hover:bg-[#2a3942]/80"
                        }`}
                      >
                        {/* Rank */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? "bg-yellow-500 text-black"
                              : index === 1
                              ? "bg-gray-400 text-black"
                              : index === 2
                              ? "bg-orange-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {index < 3 ? (
                            <i
                              className={`ri-trophy${
                                index === 0 ? "" : "-fill"
                              }-line`}
                            ></i>
                          ) : (
                            player.rank
                          )}
                        </div>

                        {/* Player Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <img
                              src={player.avatar || "/df-avatar.png"}
                              alt={player.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                              onError={(e) => {
                                e.target.src = "/df-avatar.png";
                              }}
                            />
                            {player.isSelf && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <i className="ri-user-line text-xs text-white"></i>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                                {player.name}
                              </h3>
                              {player.isSelf && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs truncate">
                              @{player.username}
                            </p>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className="text-white font-bold text-sm sm:text-base">
                            {leaderboardType === "winRate"
                              ? `${player.gameStats?.[leaderboardType] || 0}%`
                              : (
                                  player.gameStats?.[leaderboardType] || 0
                                ).toLocaleString()}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {leaderboardType === "highestScore" && "Best Score"}
                            {leaderboardType === "totalScore" && "Total"}
                            {leaderboardType === "winRate" && "Win Rate"}
                            {leaderboardType === "efficiency" && "Efficiency"}
                            {leaderboardType === "longestSnake" && "Length"}
                          </div>
                        </div>

                        {/* Actions */}
                        {!player.isSelf && (
                          <button
                            onClick={() => openUserProfile(player._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Search Tab */}
            {activeTab === "search" && (
              <div>
                {/* Search Input */}
                <div className="mb-4 sm:mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by username or name..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-[#2a3942] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm sm:text-base"
                    />
                    <i className="ri-search-line absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>
                    {searchLoading && (
                      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Filters */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-gray-400 text-sm">Filter:</span>
                    {searchFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setSearchFilter(filter.value)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          searchFilter === filter.value
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-700/50 text-gray-400 hover:text-white"
                        }`}
                      >
                        <i className={filter.icon}></i>
                        <span className="hidden sm:inline">{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Tips */}
                {searchQuery.length === 0 && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                      <i className="ri-lightbulb-line"></i>
                      Search Tips
                    </h4>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>• Search by username (with @) or display name</li>
                      <li>• Use filters to find specific types of players</li>
                      <li>
                        • Try searching for "active" or "high score" players
                      </li>
                      <li>
                        • Share your username:{" "}
                        <span className="font-mono bg-blue-500/20 px-1 rounded">
                          @{user?.username}
                        </span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Search Results */}
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <p className="text-sm sm:text-base">
                      Type at least 2 characters to search
                    </p>
                  </div>
                )}

                {searchResults.length === 0 &&
                  searchQuery.length >= 2 &&
                  !searchLoading && (
                    <div className="text-center py-6 sm:py-8 text-gray-400 px-4">
                      <i className="ri-search-line text-4xl sm:text-6xl mb-3 sm:mb-4"></i>
                      <p className="text-sm sm:text-base mb-2">
                        No users found matching "{searchQuery}"
                      </p>
                      <p className="text-xs text-gray-500">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  )}

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-300 text-sm">
                        <i className="ri-search-line mr-2"></i>
                        Found {searchResults.length} player
                        {searchResults.length !== 1 ? "s" : ""} matching "
                        {searchQuery}"
                      </p>
                    </div>

                    {searchResults.map((searchUser) => {
                      const relationshipStatus = getRelationshipStatus(
                        searchUser._id
                      );

                      return (
                        <div
                          key={searchUser._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#2a3942] rounded-lg border border-gray-600/30 gap-3 sm:gap-4 hover:bg-[#2a3942]/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <img
                              src={searchUser.avatar || "/df-avatar.png"}
                              alt={searchUser.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = "/df-avatar.png";
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                                  {searchUser.name}
                                </h3>
                                {relationshipStatus === "friend" && (
                                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    Friend
                                  </span>
                                )}
                                {relationshipStatus === "request_sent" && (
                                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                    Requested
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs sm:text-sm truncate mb-1">
                                @{searchUser.username} •{" "}
                                {getBestCategory(searchUser.gameStats)}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                <span className="whitespace-nowrap flex items-center gap-1">
                                  <i className="ri-trophy-line text-yellow-500"></i>
                                  {searchUser.gameStats?.highestScore || 0}
                                </span>
                                <span className="whitespace-nowrap flex items-center gap-1">
                                  <i className="ri-gamepad-line text-blue-400"></i>
                                  {searchUser.gameStats?.totalGamesPlayed || 0}
                                </span>
                                <span className="whitespace-nowrap flex items-center gap-1">
                                  <i className="ri-star-line text-purple-400"></i>
                                  Lv.{" "}
                                  {Math.floor(
                                    (searchUser.gameStats?.totalGamesPlayed ||
                                      0) / 10
                                  ) + 1}
                                </span>
                                {searchUser.gameStats?.lastPlayedAt && (
                                  <span className="whitespace-nowrap">
                                    {formatDate(
                                      searchUser.gameStats.lastPlayedAt
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => openUserProfile(searchUser._id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                            >
                              <i className="ri-eye-line mr-1"></i>
                              View
                            </button>

                            {relationshipStatus === "none" && (
                              <button
                                onClick={() =>
                                  handleFriendAction("send", searchUser._id)
                                }
                                disabled={actionLoading[searchUser._id]}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap disabled:opacity-50"
                              >
                                {actionLoading[searchUser._id] ? (
                                  <i className="ri-loader-4-line animate-spin"></i>
                                ) : (
                                  <>
                                    <i className="ri-user-add-line mr-1"></i>
                                    Add Friend
                                  </>
                                )}
                              </button>
                            )}

                            {relationshipStatus === "request_received" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleFriendAction("accept", searchUser._id)
                                  }
                                  disabled={actionLoading[searchUser._id]}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                                >
                                  {actionLoading[searchUser._id] ? (
                                    <i className="ri-loader-4-line animate-spin"></i>
                                  ) : (
                                    <i className="ri-check-line"></i>
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleFriendAction("reject", searchUser._id)
                                  }
                                  disabled={actionLoading[searchUser._id]}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                                >
                                  {actionLoading[searchUser._id] ? (
                                    <i className="ri-loader-4-line animate-spin"></i>
                                  ) : (
                                    <i className="ri-close-line"></i>
                                  )}
                                </button>
                              </>
                            )}

                            {relationshipStatus === "request_sent" && (
                              <span className="text-yellow-400 text-xs px-2 py-1 bg-yellow-500/20 rounded">
                                Pending
                              </span>
                            )}

                            {relationshipStatus === "friend" && (
                              <button
                                onClick={() =>
                                  handleFriendAction("remove", searchUser._id)
                                }
                                disabled={actionLoading[searchUser._id]}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                              >
                                {actionLoading[searchUser._id] ? (
                                  <i className="ri-loader-4-line animate-spin"></i>
                                ) : (
                                  <i className="ri-user-unfollow-line"></i>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced User Profile Modal */}
      <UserProfileModal
        userId={selectedUserId}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUserId(null);
          fetchAllFriendsData(); // Refresh all data when modal closes
        }}
        mutualFriends={mutualFriends[selectedUserId] || []}
        onFriendAction={handleFriendAction}
        relationshipStatus={
          selectedUserId ? getRelationshipStatus(selectedUserId) : "none"
        }
        isLoading={actionLoading[selectedUserId] || false}
      />
    </div>
  );
};

export default Friends;
