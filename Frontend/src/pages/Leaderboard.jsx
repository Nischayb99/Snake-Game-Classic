import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserProfileModal from "../components/UserProfileModal";
import { Helmet } from "react-helmet";
const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("highestScore");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all"); // NEW: Timeframe filter
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userRank, setUserRank] = useState(null); // NEW: User's rank
  const { user, isAuthenticated } = useAuth();

  // Enhanced leaderboard types with new categories
  const leaderboardTypes = [
    {
      key: "highestScore",
      label: "Highest Score",
      shortLabel: "High Score",
      icon: "ri-trophy-line",
      description: "Top individual game scores",
    },
    {
      key: "totalGames",
      label: "Most Games",
      shortLabel: "Games",
      icon: "ri-gamepad-line",
      description: "Most games played",
    },
    {
      key: "totalScore",
      label: "Total Score",
      shortLabel: "Total",
      icon: "ri-star-line",
      description: "Cumulative score across all games",
    },
    {
      key: "winRate", // NEW
      label: "Win Rate",
      shortLabel: "Win %",
      icon: "ri-percent-line",
      description: "Highest win percentage (min 5 games)",
    },
    {
      key: "efficiency", // NEW
      label: "Efficiency",
      shortLabel: "Efficiency",
      icon: "ri-speed-line",
      description: "Best score per move ratio",
    },
    {
      key: "longestSnake", // NEW
      label: "Longest Snake",
      shortLabel: "Length",
      icon: "ri-focus-3-line",
      description: "Longest snake achieved",
    },
    {
      key: "achievements", // NEW
      label: "Achievements",
      shortLabel: "Achievements",
      icon: "ri-medal-line",
      description: "Most achievements unlocked",
    },
  ];

  // NEW: Timeframe options
  const timeframeOptions = [
    { key: "all", label: "All Time", icon: "ri-infinity-line" },
    { key: "monthly", label: "This Month", icon: "ri-calendar-line" },
    { key: "weekly", label: "This Week", icon: "ri-calendar-week-line" },
    { key: "daily", label: "Today", icon: "ri-calendar-today-line" },
  ];

  useEffect(() => {
    fetchLeaderboard();
    if (isAuthenticated) {
      fetchUserRank();
    }
  }, [selectedType, selectedTimeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/auth/leaderboard?type=${selectedType}&timeframe=${selectedTimeframe}&limit=50`
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

  // NEW: Fetch user's rank
  const fetchUserRank = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/my-rank?type=${selectedType}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setUserRank(data);
      }
    } catch (error) {
      console.error("Failed to fetch user rank:", error);
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
      case "winRate":
        return `${player.gameStats?.winRate || 0}%`;
      case "efficiency":
        return (player.gameStats?.bestEfficiency || 0).toFixed(2);
      case "longestSnake":
        return player.gameStats?.longestSnake || 0;
      case "achievements":
        return player.achievementCount || 0;
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
    if (typeof num === "string") return num; // For percentages and formatted values
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  // Enhanced Player Card Component
  const PlayerCard = ({ player, index, isCurrentUser }) => {
    const rank = index + 1;

    return (
      <div
        className={`group p-3 sm:p-4 flex items-center gap-2 sm:gap-4 transition-all duration-300 relative overflow-hidden ${
          isCurrentUser
            ? "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-l-4 border-green-500"
            : "hover:bg-[#2a3942]"
        }`}
      >
        {/* Rank Badge */}
        <div
          className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-lg sm:text-xl font-bold flex-shrink-0 ${
            rank <= 3
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg"
              : "bg-gray-700 text-gray-300"
          }`}
        >
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
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-600 object-cover cursor-pointer hover:border-green-400 transition-colors duration-300"
            onError={(e) => {
              e.target.src = "/df-avatar.png";
            }}
          />
        </button>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <button
              onClick={() => openUserProfile(player._id)}
              className="text-white font-semibold hover:text-green-400 transition-colors cursor-pointer text-left text-sm sm:text-base truncate group-hover:text-green-300"
            >
              {player.name}
            </button>
            {isCurrentUser && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                You
              </span>
            )}
            {rank <= 3 && (
              <span className="text-yellow-400 animate-pulse">⭐</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <span>@{player.username}</span>
            {player.gameStats?.lastPlayedAt && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  {new Date(player.gameStats.lastPlayedAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>

          {/* Additional Stats for Current User */}
          {isCurrentUser && userRank && (
            <div className="mt-1 text-xs text-green-400">
              Percentile: {userRank.percentile}% • {userRank.totalUsers} total
              players
            </div>
          )}
        </div>

        {/* Score/Stat Display */}
        <div className="text-right flex-shrink-0">
          <div
            className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
              rank <= 3 ? "text-yellow-400" : "text-green-400"
            } group-hover:scale-105`}
          >
            <span className="hidden sm:inline">
              {typeof getStatValue(player, selectedType) === "string"
                ? getStatValue(player, selectedType)
                : getStatValue(player, selectedType).toLocaleString()}
            </span>
            <span className="sm:hidden">
              {formatNumber(getStatValue(player, selectedType))}
            </span>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">
            {leaderboardTypes.find((t) => t.key === selectedType)?.label}
          </div>
          <div className="text-xs text-gray-400 sm:hidden">
            {leaderboardTypes.find((t) => t.key === selectedType)?.shortLabel}
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-4 sm:pt-8">
        <Helmet>
          <title>Leaderboard | Snake Game Ultimate Edition</title>
          <meta
            name="description"
            content="See how you rank against other players in Snake Game Ultimate Edition. Check out the top scores, most games played, win rates, and more!"
          />
        </Helmet>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* Enhanced Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
              <i className="ri-trophy-line text-yellow-400 text-2xl sm:text-3xl lg:text-4xl animate-pulse"></i>
              Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-gray-300 px-4 mb-4">
              See how you rank against other players
            </p>

            {/* Current User Rank Display */}
            {isAuthenticated && userRank && userRank.rank && (
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm">
                <i className="ri-medal-line text-green-400"></i>
                <span className="text-white">Your Rank: </span>
                <span className="text-green-400 font-bold">
                  #{userRank.rank}
                </span>
                <span className="text-gray-400">of {userRank.totalUsers}</span>
              </div>
            )}
          </div>

          {/* Enhanced Filters */}
          <div className="bg-[#202c33] rounded-xl border border-gray-700/50 mb-4 sm:mb-6 overflow-hidden">
            {/* Category Selector */}
            <div className="border-b border-gray-700/50 p-3 sm:p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <i className="ri-filter-line"></i>
                Category
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {leaderboardTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium relative overflow-hidden ${
                      selectedType === type.key
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                        : "bg-[#2a3942] text-gray-300 hover:bg-[#334155] hover:text-white"
                    }`}
                    title={type.description}
                  >
                    <i
                      className={`${type.icon} text-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    ></i>
                    <span className="hidden sm:inline truncate">
                      {type.label}
                    </span>
                    <span className="sm:hidden truncate">
                      {type.shortLabel}
                    </span>
                    {selectedType === type.key && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* NEW: Timeframe Selector */}
            <div className="p-3 sm:p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <i className="ri-calendar-line"></i>
                Timeframe
              </h3>
              <div className="flex flex-wrap gap-2">
                {timeframeOptions.map((timeframe) => (
                  <button
                    key={timeframe.key}
                    onClick={() => setSelectedTimeframe(timeframe.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                      selectedTimeframe === timeframe.key
                        ? "bg-blue-500 text-white"
                        : "bg-[#2a3942] text-gray-300 hover:bg-[#334155]"
                    }`}
                  >
                    <i className={`${timeframe.icon} text-sm`}></i>
                    <span>{timeframe.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Leaderboard Display */}
          <div className="bg-[#202c33] rounded-xl border border-gray-700/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i
                    className={`${
                      leaderboardTypes.find((t) => t.key === selectedType)?.icon
                    } text-lg text-yellow-400`}
                  ></i>
                  <h2 className="text-lg font-bold text-white">
                    {
                      leaderboardTypes.find((t) => t.key === selectedType)
                        ?.label
                    }
                  </h2>
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full">
                    {
                      timeframeOptions.find((t) => t.key === selectedTimeframe)
                        ?.label
                    }
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {loading ? "Loading..." : `${leaderboard.length} players`}
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {
                  leaderboardTypes.find((t) => t.key === selectedType)
                    ?.description
                }
              </p>
            </div>

            {/* Leaderboard Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-300 text-sm">
                    Loading leaderboard...
                  </p>
                </div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 text-gray-400 px-4">
                <i className="ri-trophy-line text-6xl mb-4 opacity-50"></i>
                <h3 className="text-xl font-semibold mb-2">
                  No data available
                </h3>
                <p className="text-sm">
                  No players found for the selected category and timeframe.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {leaderboard.map((player, index) => {
                  const isCurrentUser =
                    isAuthenticated && user?._id === player._id;
                  return (
                    <PlayerCard
                      key={player._id}
                      player={player}
                      index={index}
                      isCurrentUser={isCurrentUser}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* User Not in Top Display */}
          {isAuthenticated &&
            user &&
            userRank?.rank &&
            userRank.rank > leaderboard.length &&
            !leaderboard.find((p) => p._id === user._id) && (
              <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <i className="ri-arrow-up-line text-blue-400"></i>
                  <span className="text-white font-medium">Your Position</span>
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  #{userRank.rank}
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  You're in the top {userRank.percentile}% of all players!
                </p>
                <button
                  onClick={() => (window.location.href = "/game")}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
                >
                  <i className="ri-gamepad-line mr-2"></i>
                  Play to Improve
                </button>
              </div>
            )}

          {/* Footer Info */}
          <div className="mt-8 text-center text-xs sm:text-sm text-gray-500 space-y-2">
            <p>
              Rankings update in real-time • Showing top{" "}
              {Math.min(50, leaderboard.length)} players
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active Players
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Top 3
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Your Position
              </span>
            </div>
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
