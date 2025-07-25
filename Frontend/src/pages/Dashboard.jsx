import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ title, value, icon, gradient, iconColor, description }) => (
  <div
    className={`group bg-gradient-to-br ${gradient} p-4 sm:p-6 rounded-xl border backdrop-blur-sm hover:scale-105 transition-all duration-500 relative overflow-hidden`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="flex items-center justify-between relative z-10">
      <div className="flex-1 min-w-0">
        <p className="text-gray-300 text-xs sm:text-sm font-medium mb-1 group-hover:text-gray-200 transition-colors duration-300">
          {title}
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300">
          {value}
        </p>
        {description && (
          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
            {description}
          </p>
        )}
      </div>
      <i
        className={`${icon} text-2xl sm:text-3xl lg:text-4xl ${iconColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex-shrink-0 ml-2`}
      ></i>
    </div>
  </div>
);

const GameCard = ({ game, index, formatPlayTime }) => (
  <div className="group flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-[#2a3942] rounded-lg border border-gray-600/30 hover:bg-[#334155] transition-all duration-300 gap-3 sm:gap-4">
    <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
      <div className="text-center bg-yellow-500/10 rounded-lg p-2 min-w-[60px]">
        <div className="text-sm sm:text-lg font-bold text-yellow-400 group-hover:scale-105 transition-transform duration-300">
          {game.score}
        </div>
        <div className="text-xs text-gray-400">Score</div>
      </div>
      <div className="text-center bg-green-500/10 rounded-lg p-2 min-w-[60px]">
        <div className="text-sm sm:text-lg font-bold text-green-400 group-hover:scale-105 transition-transform duration-300">
          {game.snakeLength}
        </div>
        <div className="text-xs text-gray-400">Length</div>
      </div>
      <div className="text-center bg-purple-500/10 rounded-lg p-2 min-w-[60px]">
        <div className="text-sm sm:text-lg font-bold text-purple-400 group-hover:scale-105 transition-transform duration-300">
          {formatPlayTime(game.playTime)}
        </div>
        <div className="text-xs text-gray-400">Time</div>
      </div>
    </div>
    <div className="text-right flex-shrink-0 self-end sm:self-center">
      <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {new Date(game.playedAt).toLocaleDateString()}
      </div>
      <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
        {new Date(game.playedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  </div>
);

const LeaderboardCard = ({ player, index, isCurrentUser }) => (
  <div className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-[#2a3942] hover:bg-[#334155] transition-all duration-300">
    <div className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">
      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
    </div>
    <img
      src={player.avatar || "/df-avatar.png"}
      alt={player.name}
      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-600 group-hover:border-green-400 transition-colors duration-300 flex-shrink-0"
      onError={(e) => {
        e.target.src = "/df-avatar.png";
      }}
    />
    <div className="flex-1 min-w-0">
      <div className="text-white text-xs sm:text-sm font-medium truncate group-hover:text-green-300 transition-colors duration-300">
        {player.name}
        {isCurrentUser && (
          <span className="ml-1 text-xs text-green-400 font-bold">(You)</span>
        )}
      </div>
    </div>
    <div className="text-yellow-400 font-bold text-xs sm:text-sm group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
      {player.gameStats.highestScore.toLocaleString()}
    </div>
  </div>
);

const QuickActionButton = ({
  onClick,
  icon,
  iconColor,
  title,
  description,
  gradient = false,
}) => (
  <button
    onClick={onClick}
    className={`group w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg transition-all duration-300 text-left hover:scale-105 ${
      gradient
        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50"
        : "bg-[#2a3942] hover:bg-[#334155] border border-gray-600/30 hover:border-gray-500/50"
    }`}
  >
    <i
      className={`${icon} ${iconColor} text-lg sm:text-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}
    ></i>
    <div className="flex-1 min-w-0">
      <div className="text-white font-medium text-sm sm:text-base group-hover:text-green-300 transition-colors duration-300">
        {title}
      </div>
      <div className="text-gray-400 text-xs sm:text-sm group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </div>
    </div>
    <i className="ri-arrow-right-line text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"></i>
  </button>
);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-4 sm:pt-8 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Welcome back, {user?.name}!
            <span className="inline-block animate-bounce ml-2">👋</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Here's your gaming overview
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Highest Score"
            value={(gameStats?.highestScore || 0).toLocaleString()}
            icon="ri-trophy-line"
            iconColor="text-yellow-400"
            gradient="from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
            description="Personal best"
          />
          <StatCard
            title="Games Played"
            value={(gameStats?.totalGamesPlayed || 0).toLocaleString()}
            icon="ri-gamepad-line"
            iconColor="text-blue-400"
            gradient="from-blue-500/20 to-cyan-500/20 border-blue-500/30"
            description="Total sessions"
          />
          <StatCard
            title="Total Playtime"
            value={formatPlayTime(gameStats?.totalPlayTime || 0)}
            icon="ri-time-line"
            iconColor="text-green-400"
            gradient="from-green-500/20 to-emerald-500/20 border-green-500/30"
            description="Time invested"
          />
          <StatCard
            title="Your Rank"
            value={getUserRank() ? `#${getUserRank()}` : "N/A"}
            icon="ri-medal-line"
            iconColor="text-purple-400"
            gradient="from-purple-500/20 to-pink-500/20 border-purple-500/30"
            description="Global position"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Games */}
          <div className="xl:col-span-2">
            <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <i className="ri-history-line text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                Recent Games
                {recentGames && recentGames.length > 0 && (
                  <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                    {recentGames.length}
                  </span>
                )}
              </h2>

              {recentGames && recentGames.length > 0 ? (
                <div className="space-y-3 relative z-10">
                  {recentGames
                    .slice(-5)
                    .reverse()
                    .map((game, index) => (
                      <GameCard
                        key={index}
                        game={game}
                        index={index}
                        formatPlayTime={formatPlayTime}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-400 relative z-10">
                  <i className="ri-gamepad-line text-4xl sm:text-6xl mb-4 animate-pulse"></i>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    No games played yet!
                  </h3>
                  <p className="mb-4 text-sm sm:text-base">
                    Start your gaming journey now
                  </p>
                  <button
                    onClick={() => navigate("/game")}
                    className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 text-sm sm:text-base font-medium hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      <i className="ri-play-fill"></i>
                      Play Your First Game
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Leaderboard Preview */}
            <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <i className="ri-trophy-line text-yellow-400 group-hover:scale-110 transition-transform duration-300"></i>
                  Top Players
                </h3>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="text-green-400 hover:text-green-300 text-xs sm:text-sm font-medium hover:scale-105 transition-all duration-300 flex items-center gap-1"
                >
                  View All
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 relative z-10">
                  {leaderboard.slice(0, 3).map((player, index) => (
                    <LeaderboardCard
                      key={player._id}
                      player={player}
                      index={index}
                      isCurrentUser={
                        isAuthenticated && user?._id === player._id
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 relative z-10">
                  <p className="text-xs sm:text-sm">No leaderboard data</p>
                </div>
              )}
            </div>

            {/* Achievements */}
            {gameStats?.achievements && gameStats.achievements.length > 0 && (
              <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                  <i className="ri-medal-line text-yellow-400 group-hover:scale-110 transition-transform duration-300"></i>
                  Recent Achievements
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full">
                    {gameStats.achievements.length}
                  </span>
                </h3>
                <div className="space-y-2 sm:space-y-3 relative z-10">
                  {gameStats.achievements
                    .slice(-3)
                    .reverse()
                    .map((achievement, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#2a3942] rounded-lg hover:bg-[#334155] transition-all duration-300"
                      >
                        <div className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">
                          🏆
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-xs sm:text-sm truncate group-hover:text-yellow-300 transition-colors duration-300">
                            {achievement.name}
                          </div>
                          <div className="text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors duration-300">
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {gameStats.achievements.length > 3 && (
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full mt-3 text-green-400 hover:text-green-300 text-xs sm:text-sm font-medium hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    View All Achievements
                    <i className="ri-arrow-right-line"></i>
                  </button>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <i className="ri-lightning-line text-green-400 group-hover:scale-110 transition-transform duration-300"></i>
                Quick Actions
              </h3>
              <div className="space-y-3 relative z-10">
                <QuickActionButton
                  onClick={() => navigate("/game")}
                  icon="ri-gamepad-line"
                  iconColor="text-green-400"
                  title="Play Game"
                  description="Start new game"
                  gradient={true}
                />
                <QuickActionButton
                  onClick={() => navigate("/profile")}
                  icon="ri-user-line"
                  iconColor="text-blue-400"
                  title="View Profile"
                  description="See full stats"
                />
                <QuickActionButton
                  onClick={() => navigate("/leaderboard")}
                  icon="ri-trophy-line"
                  iconColor="text-yellow-400"
                  title="Leaderboard"
                  description="Compare scores"
                />
                <QuickActionButton
                  onClick={() => navigate("/friends")}
                  icon="ri-group-line"
                  iconColor="text-purple-400"
                  title="Friends"
                  description="Connect with players"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
