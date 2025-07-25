import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserProfileModal from "../components/UserProfileModal";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("highestScore");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const leaderboardTypes = [
    {
      key: "highestScore",
      label: "Highest Score",
      shortLabel: "High Score",
      icon: "ri-trophy-line",
    },
    {
      key: "totalGames",
      label: "Most Games",
      shortLabel: "Games",
      icon: "ri-gamepad-line",
    },
    {
      key: "totalScore",
      label: "Total Score",
      shortLabel: "Total",
      icon: "ri-star-line",
    },
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/auth/leaderboard?type=${selectedType}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const openUserProfile = (userId) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  const getStatValue = (player, type) => {
    switch (type) {
      case "highestScore":
        return player.gameStats?.highestScore || 0;
      case "totalGames":
        return player.gameStats?.totalGamesPlayed || 0;
      case "totalScore":
        return player.gameStats?.totalScore || 0;
      default:
        return 0;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-4 sm:pt-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
              <i className="ri-trophy-line text-yellow-400 text-2xl sm:text-3xl lg:text-4xl"></i>
              Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-gray-300 px-4">
              See how you rank against other players
            </p>
          </div>

          {/* Type Selector */}
          <div className="bg-[#202c33] rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 border border-gray-700/50">
            <div className="flex flex-wrap gap-2 justify-center">
              {leaderboardTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                    selectedType === type.key
                      ? "bg-green-500 text-white"
                      : "bg-[#2a3942] text-gray-300 hover:bg-[#334155]"
                  }`}
                >
                  <i className={`${type.icon} text-sm sm:text-base`}></i>
                  <span className="hidden sm:inline">{type.label}</span>
                  <span className="sm:hidden">{type.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-[#202c33] rounded-xl border border-gray-700/50 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-400 px-4">
                <i className="ri-trophy-line text-4xl sm:text-6xl mb-3 sm:mb-4"></i>
                <p className="text-sm sm:text-base">No players found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {leaderboard.map((player, index) => {
                  const rank = index + 1;
                  const isCurrentUser =
                    isAuthenticated && user?._id === player._id;

                  return (
                    <div
                      key={player._id}
                      className={`p-3 sm:p-4 flex items-center gap-2 sm:gap-4 transition-colors ${
                        isCurrentUser
                          ? "bg-green-500/10 border-l-4 border-green-500"
                          : "hover:bg-[#2a3942]"
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 text-lg sm:text-2xl flex-shrink-0">
                        {getRankIcon(rank)}
                      </div>

                      {/* Avatar */}
                      <button
                        onClick={() => openUserProfile(player._id)}
                        className="hover:scale-105 transition-transform flex-shrink-0"
                      >
                        <img
                          src={player.avatar || "/df-avatar.png"}
                          alt={player.name}
                          className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-gray-600 object-cover cursor-pointer hover:border-green-400"
                          onError={(e) => {
                            e.target.src = "/df-avatar.png";
                          }}
                        />
                      </button>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => openUserProfile(player._id)}
                            className="text-white font-semibold hover:text-green-400 transition-colors cursor-pointer text-left text-sm sm:text-base truncate"
                          >
                            {player.name}
                            {isCurrentUser && (
                              <span className="ml-1 sm:ml-2 text-xs bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                You
                              </span>
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => openUserProfile(player._id)}
                          className="text-gray-400 text-xs sm:text-sm hover:text-green-400 transition-colors cursor-pointer truncate block"
                        >
                          @{player.username}
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg sm:text-2xl font-bold text-green-400">
                          <span className="hidden sm:inline">
                            {getStatValue(
                              player,
                              selectedType
                            ).toLocaleString()}
                          </span>
                          <span className="sm:hidden">
                            {formatNumber(getStatValue(player, selectedType))}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 hidden sm:block">
                          {
                            leaderboardTypes.find((t) => t.key === selectedType)
                              ?.label
                          }
                        </div>
                        <div className="text-xs text-gray-400 sm:hidden">
                          {
                            leaderboardTypes.find((t) => t.key === selectedType)
                              ?.shortLabel
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Current User Position (if not in top 20) */}
          {isAuthenticated &&
            user &&
            !leaderboard.find((p) => p._id === user._id) && (
              <div className="mt-4 sm:mt-6 bg-[#202c33] rounded-xl p-3 sm:p-4 border border-gray-700/50">
                <div className="text-center text-gray-400">
                  <p className="mb-2 sm:mb-3 text-sm sm:text-base">
                    You're not in the top 20 yet!
                  </p>
                  <button
                    onClick={() => (window.location.href = "/game")}
                    className="px-4 sm:px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Play More Games
                  </button>
                </div>
              </div>
            )}

          {/* Mobile Optimized Footer Info */}
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
            <p>Showing top 20 players</p>
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
        }}
      />
    </>
  );
};

export default Leaderboard;
