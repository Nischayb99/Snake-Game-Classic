import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("highestScore");
  const { user, isAuthenticated } = useAuth();

  const leaderboardTypes = [
    { key: "highestScore", label: "Highest Score", icon: "ri-trophy-line" },
    { key: "totalGames", label: "Most Games", icon: "ri-gamepad-line" },
    { key: "totalScore", label: "Total Score", icon: "ri-star-line" },
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

  const getStatValue = (player, type) => {
    switch (type) {
      case "highestScore":
        return player.gameStats.highestScore;
      case "totalGames":
        return player.gameStats.totalGamesPlayed;
      case "totalScore":
        return player.gameStats.totalScore;
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <i className="ri-trophy-line text-yellow-400"></i>
            Leaderboard
          </h1>
          <p className="text-gray-300">
            See how you rank against other players
          </p>
        </div>

        {/* Type Selector */}
        <div className="bg-[#202c33] rounded-xl p-6 mb-6 border border-gray-700/50">
          <div className="flex flex-wrap gap-2 justify-center">
            {leaderboardTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedType === type.key
                    ? "bg-green-500 text-white"
                    : "bg-[#2a3942] text-gray-300 hover:bg-[#334155]"
                }`}
              >
                <i className={type.icon}></i>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-[#202c33] rounded-xl border border-gray-700/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <i className="ri-trophy-line text-6xl mb-4"></i>
              <p>No players found</p>
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
                    className={`p-4 flex items-center gap-4 transition-colors ${
                      isCurrentUser
                        ? "bg-green-500/10 border-l-4 border-green-500"
                        : "hover:bg-[#2a3942]"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 text-2xl">
                      {getRankIcon(rank)}
                    </div>

                    {/* Avatar */}
                    <img
                      src={player.avatar || "/df-avatar.png"}
                      alt={player.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-600 object-cover"
                      onError={(e) => {
                        e.target.src = "/df-avatar.png";
                      }}
                    />

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">
                          {player.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm">
                        @{player.username}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {getStatValue(player, selectedType).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {
                          leaderboardTypes.find((t) => t.key === selectedType)
                            ?.label
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
            <div className="mt-6 bg-[#202c33] rounded-xl p-4 border border-gray-700/50">
              <div className="text-center text-gray-400">
                <p className="mb-2">You're not in the top 20 yet!</p>
                <button
                  onClick={() => (window.location.href = "/game")}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Play More Games
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Leaderboard;
