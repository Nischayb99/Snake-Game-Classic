import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [gameStats, setGameStats] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user game stats
      const statsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/game-stats`,
        {
          credentials: "include",
        }
      );
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setGameStats(statsData.gameStats);
        setRecentGames(statsData.recentGames);
      }

      // Fetch top 5 leaderboard
      const leaderboardResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/leaderboard?limit=5`
      );
      const leaderboardData = await leaderboardResponse.json();

      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPlayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getUserRank = () => {
    if (!gameStats || !leaderboard.length) return null;
    const userRank = leaderboard.findIndex((player) => player._id === user._id);
    return userRank !== -1 ? userRank + 1 : null;
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-300">Here's your gaming overview</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">
                  Highest Score
                </p>
                <p className="text-3xl font-bold text-white">
                  {gameStats?.highestScore || 0}
                </p>
              </div>
              <i className="ri-trophy-line text-4xl text-yellow-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">
                  Games Played
                </p>
                <p className="text-3xl font-bold text-white">
                  {gameStats?.totalGamesPlayed || 0}
                </p>
              </div>
              <i className="ri-gamepad-line text-4xl text-blue-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">
                  Total Playtime
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatPlayTime(gameStats?.totalPlayTime || 0)}
                </p>
              </div>
              <i className="ri-time-line text-4xl text-green-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Your Rank</p>
                <p className="text-3xl font-bold text-white">
                  {getUserRank() || "N/A"}
                </p>
              </div>
              <i className="ri-medal-line text-4xl text-purple-400"></i>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Games */}
          <div className="lg:col-span-2">
            <div className="bg-[#202c33] rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <i className="ri-history-line text-blue-400"></i>
                Recent Games
              </h2>

              {recentGames && recentGames.length > 0 ? (
                <div className="space-y-3">
                  {recentGames
                    .slice(-5)
                    .reverse()
                    .map((game, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 bg-[#2a3942] rounded-lg border border-gray-600/30"
                      >
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">
                              {game.score}
                            </div>
                            <div className="text-xs text-gray-400">Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">
                              {game.snakeLength}
                            </div>
                            <div className="text-xs text-gray-400">Length</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-400">
                              {formatPlayTime(game.playTime)}
                            </div>
                            <div className="text-xs text-gray-400">Time</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">
                            {new Date(game.playedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <i className="ri-gamepad-line text-6xl mb-4"></i>
                  <p className="mb-4">No games played yet!</p>
                  <button
                    onClick={() => navigate("/game")}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Play Your First Game
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard Preview */}
            <div className="bg-[#202c33] rounded-xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="ri-trophy-line text-yellow-400"></i>
                  Top Players
                </h3>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="text-green-400 hover:text-green-300 text-sm font-medium"
                >
                  View All →
                </button>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 3).map((player, index) => (
                    <div
                      key={player._id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[#2a3942]"
                    >
                      <div className="text-lg">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </div>
                      <img
                        src={player.avatar || "/df-avatar.png"}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = "/df-avatar.png";
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          {player.name}
                          {isAuthenticated && user?._id === player._id && (
                            <span className="ml-1 text-xs text-green-400">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold">
                        {player.gameStats.highestScore}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">No leaderboard data</p>
                </div>
              )}
            </div>

            {/* Achievements */}
            {gameStats?.achievements && gameStats.achievements.length > 0 && (
              <div className="bg-[#202c33] rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="ri-medal-line text-yellow-400"></i>
                  Recent Achievements
                </h3>
                <div className="space-y-2">
                  {gameStats.achievements
                    .slice(-3)
                    .reverse()
                    .map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-[#2a3942] rounded-lg"
                      >
                        <div className="text-xl">🏆</div>
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
                {gameStats.achievements.length > 3 && (
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full mt-3 text-green-400 hover:text-green-300 text-sm font-medium"
                  >
                    View All Achievements →
                  </button>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-[#202c33] rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <i className="ri-lightning-line text-green-400"></i>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/game")}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-colors text-left"
                >
                  <i className="ri-gamepad-line text-green-400 text-xl"></i>
                  <div>
                    <div className="text-white font-medium">Play Game</div>
                    <div className="text-gray-400 text-sm">Start new game</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full flex items-center gap-3 p-3 bg-[#2a3942] hover:bg-[#334155] rounded-lg transition-colors text-left"
                >
                  <i className="ri-user-line text-blue-400 text-xl"></i>
                  <div>
                    <div className="text-white font-medium">View Profile</div>
                    <div className="text-gray-400 text-sm">See full stats</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/leaderboard")}
                  className="w-full flex items-center gap-3 p-3 bg-[#2a3942] hover:bg-[#334155] rounded-lg transition-colors text-left"
                >
                  <i className="ri-trophy-line text-yellow-400 text-xl"></i>
                  <div>
                    <div className="text-white font-medium">Leaderboard</div>
                    <div className="text-gray-400 text-sm">Compare scores</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
