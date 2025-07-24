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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <i className="ri-group-line text-green-400"></i>
            Friends
          </h1>
          <p className="text-gray-300">Connect with other Snake Game players</p>
        </div>

        {/* Tabs */}
        <div className="bg-[#202c33] rounded-xl border border-gray-700/50 mb-6">
          <div className="flex border-b border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <i className={tab.icon}></i>
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px]">
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

          <div className="p-6">
            {/* Friends Tab */}
            {activeTab === "friends" && (
              <div>
                {friends.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <i className="ri-user-add-line text-6xl mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">
                      No friends yet
                    </h3>
                    <p className="mb-4">
                      Start by finding and adding some friends!
                    </p>
                    <button
                      onClick={() => setActiveTab("search")}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Find Friends
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friendship) => (
                      <div
                        key={friendship.user._id}
                        className="flex items-center justify-between p-4 bg-[#2a3942] rounded-lg border border-gray-600/30"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={friendship.user.avatar || "/df-avatar.png"}
                            alt={friendship.user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                            onError={(e) => {
                              e.target.src = "/df-avatar.png";
                            }}
                          />
                          <div>
                            <h3 className="text-white font-semibold">
                              {friendship.user.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              @{friendship.user.username}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>
                                Best:{" "}
                                {friendship.user.gameStats?.highestScore || 0}
                              </span>
                              <span>
                                Games:{" "}
                                {friendship.user.gameStats?.totalGamesPlayed ||
                                  0}
                              </span>
                              {friendship.user.gameStats?.lastPlayedAt && (
                                <span>
                                  Last played:{" "}
                                  {formatDate(
                                    friendship.user.gameStats.lastPlayedAt
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUserProfile(friendship.user._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("remove", friendship.user._id)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
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
                  <div className="text-center py-12 text-gray-400">
                    <i className="ri-mail-line text-6xl mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">
                      No friend requests
                    </h3>
                    <p>
                      When someone sends you a friend request, it will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friendRequests.received.map((request) => (
                      <div
                        key={request.from._id}
                        className="flex items-center justify-between p-4 bg-[#2a3942] rounded-lg border border-gray-600/30"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={request.from.avatar || "/df-avatar.png"}
                            alt={request.from.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                            onError={(e) => {
                              e.target.src = "/df-avatar.png";
                            }}
                          />
                          <div>
                            <h3 className="text-white font-semibold">
                              {request.from.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              @{request.from.username}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Best Score:{" "}
                              {request.from.gameStats?.highestScore || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUserProfile(request.from._id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("accept", request.from._id)
                            }
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("reject", request.from._id)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
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
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by username or name..."
                      className="w-full px-4 py-3 pl-12 bg-[#2a3942] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    />
                    <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    {searchLoading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>Type at least 2 characters to search</p>
                  </div>
                )}

                {searchResults.length === 0 &&
                  searchQuery.length >= 2 &&
                  !searchLoading && (
                    <div className="text-center py-8 text-gray-400">
                      <i className="ri-search-line text-6xl mb-4"></i>
                      <p>No users found matching "{searchQuery}"</p>
                    </div>
                  )}

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((searchUser) => (
                      <div
                        key={searchUser._id}
                        className="flex items-center justify-between p-4 bg-[#2a3942] rounded-lg border border-gray-600/30"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={searchUser.avatar || "/df-avatar.png"}
                            alt={searchUser.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                            onError={(e) => {
                              e.target.src = "/df-avatar.png";
                            }}
                          />
                          <div>
                            <h3 className="text-white font-semibold">
                              {searchUser.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              @{searchUser.username}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>
                                Best: {searchUser.gameStats?.highestScore || 0}
                              </span>
                              <span>
                                Games:{" "}
                                {searchUser.gameStats?.totalGamesPlayed || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUserProfile(searchUser._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() =>
                              handleFriendAction("send", searchUser._id)
                            }
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
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
