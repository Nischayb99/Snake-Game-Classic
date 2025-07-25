import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import UserProfileModal from "../components/UserProfileModal";

const Friends = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({
    sent: [],
    received: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFriendsData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const fetchFriendsData = async () => {
    setLoading(true);
    try {
      // Fetch friends
      const friendsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/friends`,
        {
          credentials: "include",
        }
      );
      const friendsData = await friendsResponse.json();

      if (friendsData.success) {
        setFriends(friendsData.friends);
      }

      // Fetch friend requests
      const requestsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/requests`,
        {
          credentials: "include",
        }
      );
      const requestsData = await requestsResponse.json();

      if (requestsData.success) {
        setFriendRequests(requestsData.friendRequests);
      }
    } catch (error) {
      showNotification("error", "Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setSearchLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/search?q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      showNotification("error", "Failed to search users");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFriendAction = async (action, targetUserId) => {
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
        fetchFriendsData(); // Refresh data
        if (searchQuery) {
          searchUsers(); // Refresh search results
        }
      } else {
        showNotification("error", data.message);
      }
    } catch (error) {
      showNotification("error", "Failed to perform action");
    }
  };

  const openUserProfile = (userId) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const tabs = [
    {
      key: "friends",
      label: "Friends",
      icon: "ri-user-line",
      count: friends.length,
    },
    {
      key: "received",
      label: "Requests",
      icon: "ri-mail-line",
      count: friendRequests.received.length,
    },
    {
      key: "search",
      label: "Find Friends",
      icon: "ri-search-line",
      count: null,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-4 sm:pt-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
            <i className="ri-group-line text-green-400 text-2xl sm:text-3xl lg:text-4xl"></i>
            Friends
          </h1>
          <p className="text-sm sm:text-base text-gray-300 px-4">
            Connect with other Snake Game players
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-[#202c33] rounded-xl border border-gray-700/50 mb-4 sm:mb-6 overflow-hidden">
          <div className="flex border-b border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <i className={`${tab.icon} text-sm sm:text-base`}></i>
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
                {friends.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-400 px-4">
                    <i className="ri-user-add-line text-4xl sm:text-6xl mb-3 sm:mb-4"></i>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      No friends yet
                    </h3>
                    <p className="mb-4 text-sm sm:text-base">
                      Start by finding and adding some friends!
                    </p>
                    <button
                      onClick={() => setActiveTab("search")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Find Friends
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friendship) => (
                      <div
                        key={friendship.user._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#2a3942] rounded-lg border border-gray-600/30 gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <img
                            src={friendship.user.avatar || "/df-avatar.png"}
                            alt={friendship.user.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = "/df-avatar.png";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                              {friendship.user.name}
                            </h3>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">
                              @{friendship.user.username}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 mt-1">
                              <span className="whitespace-nowrap">
                                Best:{" "}
                                {friendship.user.gameStats?.highestScore || 0}
                              </span>
                              <span className="whitespace-nowrap">
                                Games:{" "}
                                {friendship.user.gameStats?.totalGamesPlayed ||
                                  0}
                              </span>
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
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("remove", friendship.user._id)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Friend Requests Tab */}
            {activeTab === "received" && (
              <div>
                {friendRequests.received.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-400 px-4">
                    <i className="ri-mail-line text-4xl sm:text-6xl mb-3 sm:mb-4"></i>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      No friend requests
                    </h3>
                    <p className="text-sm sm:text-base">
                      When someone sends you a friend request, it will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                            <p className="text-gray-500 text-xs">
                              Best Score:{" "}
                              {request.from.gameStats?.highestScore || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => openUserProfile(request.from._id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("accept", request.from._id)
                            }
                            className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("reject", request.from._id)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === "search" && (
              <div>
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
                      <p className="text-sm sm:text-base">
                        No users found matching "{searchQuery}"
                      </p>
                    </div>
                  )}

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((searchUser) => (
                      <div
                        key={searchUser._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#2a3942] rounded-lg border border-gray-600/30 gap-3 sm:gap-4"
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
                            <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                              {searchUser.name}
                            </h3>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">
                              @{searchUser.username}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 mt-1">
                              <span className="whitespace-nowrap">
                                Best: {searchUser.gameStats?.highestScore || 0}
                              </span>
                              <span className="whitespace-nowrap">
                                Games:{" "}
                                {searchUser.gameStats?.totalGamesPlayed || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => openUserProfile(searchUser._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("send", searchUser._id)
                            }
                            className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                          >
                            Add Friend
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        userId={selectedUserId}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUserId(null);
          fetchFriendsData(); // Refresh data when modal closes
        }}
      />
    </div>
  );
};

export default Friends;
