import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

// Enhanced StatCard with trends and interactions
const StatCard = ({
  title,
  value,
  icon,
  gradient,
  iconColor,
  description,
  trend = null,
  onClick = null,
  loading = false,
  subtitle = null,
}) => (
  <div
    className={`group bg-gradient-to-br ${gradient} p-4 sm:p-6 rounded-xl border backdrop-blur-sm hover:scale-105 transition-all duration-500 relative overflow-hidden ${
      onClick ? "cursor-pointer" : ""
    }`}
    onClick={onClick}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    {loading ? (
      <div className="animate-pulse">
        <div className="w-8 h-8 bg-gray-600 rounded mb-2"></div>
        <div className="w-16 h-6 bg-gray-600 rounded mb-1"></div>
        <div className="w-12 h-4 bg-gray-600 rounded"></div>
      </div>
    ) : (
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-300 text-xs sm:text-sm font-medium group-hover:text-gray-200 transition-colors duration-300">
              {title}
            </p>
            {trend !== null && (
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  trend > 0
                    ? "bg-green-500/20 text-green-400"
                    : trend < 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {trend > 0 ? "↗" : trend < 0 ? "↘" : "→"} {Math.abs(trend)}%
              </div>
            )}
          </div>

          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>

          {description && (
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
              {description}
            </p>
          )}

          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <i
          className={`${icon} text-2xl sm:text-3xl lg:text-4xl ${iconColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex-shrink-0 ml-2`}
        ></i>
      </div>
    )}
  </div>
);

// Power-up Usage Component
const PowerUpUsage = ({ powerUpsByType, loading }) => {
  const powerUps = [
    {
      key: "speedBoost",
      name: "Speed Boost",
      icon: "⚡",
      color: "text-yellow-400",
    },
    {
      key: "doublePoints",
      name: "Double Points",
      icon: "💎",
      color: "text-blue-400",
    },
    {
      key: "invincible",
      name: "Invincible",
      icon: "🛡️",
      color: "text-green-400",
    },
    { key: "extraLife", name: "Extra Life", icon: "❤️", color: "text-red-400" },
  ];

  const totalUsed = Object.values(powerUpsByType || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {powerUps.map((powerUp) => (
          <div key={powerUp.key} className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-600 rounded mb-1"></div>
                <div className="w-full h-2 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {powerUps.map((powerUp) => {
        const count = powerUpsByType?.[powerUp.key] || 0;
        const percentage = totalUsed > 0 ? (count / totalUsed) * 100 : 0;

        return (
          <div key={powerUp.key} className="flex items-center gap-3">
            <div className="text-xl">{powerUp.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white text-sm">{powerUp.name}</span>
                <span className={`text-sm ${powerUp.color}`}>{count}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    powerUp.color.includes("yellow")
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : powerUp.color.includes("blue")
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                      : powerUp.color.includes("green")
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : "bg-gradient-to-r from-red-400 to-pink-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {percentage.toFixed(1)}% of total
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Device Performance Component
const DevicePerformance = ({ deviceStats, loading }) => {
  const devices = [
    {
      key: "desktop",
      name: "Desktop",
      icon: "ri-computer-line",
      color: "text-blue-400",
    },
    {
      key: "mobile",
      name: "Mobile",
      icon: "ri-smartphone-line",
      color: "text-green-400",
    },
    {
      key: "tablet",
      name: "Tablet",
      icon: "ri-tablet-line",
      color: "text-purple-400",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {devices.map((device) => (
          <div
            key={device.key}
            className="animate-pulse bg-gray-800/50 p-4 rounded-lg"
          >
            <div className="w-8 h-8 bg-gray-600 rounded mb-3"></div>
            <div className="w-16 h-4 bg-gray-600 rounded mb-2"></div>
            <div className="w-12 h-3 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {devices.map((device) => {
        const stats = deviceStats?.[device.key] || { games: 0, bestScore: 0 };
        const isActive = stats.games > 0;

        return (
          <div
            key={device.key}
            className={`group p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
              isActive
                ? "bg-gradient-to-br from-gray-800/80 to-gray-900/60 border-gray-600/50 hover:border-gray-500/70"
                : "bg-gray-900/30 border-gray-700/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <i
                className={`${device.icon} ${device.color} text-lg group-hover:scale-110 transition-transform duration-300`}
              ></i>
              <span className="text-white font-medium">{device.name}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Games</span>
                <span
                  className={`font-medium ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {stats.games}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Best Score</span>
                <span
                  className={`font-medium ${
                    isActive ? device.color : "text-gray-500"
                  }`}
                >
                  {stats.bestScore.toLocaleString()}
                </span>
              </div>

              {isActive && (
                <div className="mt-2 pt-2 border-t border-gray-600/30">
                  <div className="text-xs text-gray-400">
                    Avg:{" "}
                    {Math.round(
                      stats.bestScore / stats.games || 0
                    ).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Achievement Progress Component
const AchievementProgress = ({ achievements, loading, onClick }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="w-8 h-8 bg-gray-600 rounded"></div>
            <div className="flex-1">
              <div className="w-24 h-4 bg-gray-600 rounded mb-1"></div>
              <div className="w-32 h-3 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const recentAchievements = achievements?.slice(-3).reverse() || [];
  const achievementsByCategory =
    achievements?.reduce((acc, achievement) => {
      const category = achievement.category || "basic";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {}) || {};

  return (
    <div className="space-y-4">
      {/* Recent Achievements */}
      <div className="space-y-2">
        {recentAchievements.length > 0 ? (
          recentAchievements.map((achievement, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg hover:from-yellow-500/20 hover:to-orange-500/20 transition-all duration-300"
            >
              <div className="text-xl group-hover:scale-110 transition-transform duration-300">
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate group-hover:text-yellow-300 transition-colors duration-300">
                  {achievement.name}
                </div>
                <div className="text-gray-400 text-xs truncate">
                  {achievement.description}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                    {achievement.tier}
                  </span>
                  {achievement.points && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      {achievement.points}pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm">No achievements yet</p>
            <p className="text-xs text-gray-500">
              Start playing to unlock rewards!
            </p>
          </div>
        )}
      </div>

      {/* Achievement Categories Summary */}
      {Object.keys(achievementsByCategory).length > 0 && (
        <div className="pt-3 border-t border-gray-600/30">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(achievementsByCategory).map(([category, count]) => (
              <div
                key={category}
                className="flex justify-between text-gray-400"
              >
                <span className="capitalize">{category}:</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements?.length > 3 && (
        <button
          onClick={onClick}
          className="w-full mt-3 text-yellow-400 hover:text-yellow-300 text-sm font-medium hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 py-2"
        >
          View All {achievements.length} Achievements
          <i className="ri-arrow-right-line"></i>
        </button>
      )}
    </div>
  );
};

// Friends Activity Component
const FriendsActivity = ({ friends, loading, onClick }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="w-20 h-4 bg-gray-600 rounded mb-1"></div>
              <div className="w-16 h-3 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const activeFriends =
    friends
      ?.filter((friend) => {
        const lastPlayed = friend.gameStats?.lastPlayedAt;
        if (!lastPlayed) return false;
        const daysSinceLastPlayed =
          (Date.now() - new Date(lastPlayed)) / (1000 * 60 * 60 * 24);
        return daysSinceLastPlayed <= 7; // Active within last week
      })
      .slice(0, 5) || [];

  return (
    <div className="space-y-3">
      {activeFriends.length > 0 ? (
        activeFriends.map((friend, index) => {
          const isOnline =
            friend.gameStats?.lastPlayedAt &&
            Date.now() - new Date(friend.gameStats.lastPlayedAt) <
              30 * 60 * 1000; // 30 minutes
          const isActive =
            friend.gameStats?.lastPlayedAt &&
            Date.now() - new Date(friend.gameStats.lastPlayedAt) <
              24 * 60 * 60 * 1000; // 24 hours

          return (
            <div
              key={friend._id || index}
              className="group flex items-center gap-3 p-3 bg-[#2a3942] rounded-lg hover:bg-[#334155] transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={friend.avatar || "/df-avatar.png"}
                  alt={friend.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-600 group-hover:border-green-400 transition-colors duration-300"
                  onError={(e) => {
                    e.target.src = "/df-avatar.png";
                  }}
                />
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate group-hover:text-green-300 transition-colors duration-300">
                    {friend.name}
                  </span>
                  {isOnline && (
                    <span className="text-xs text-green-400">●</span>
                  )}
                  {!isOnline && isActive && (
                    <span className="text-xs text-yellow-400">●</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Best: {friend.gameStats?.highestScore?.toLocaleString() || 0}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">
                  {isOnline ? "Online" : isActive ? "Today" : "This week"}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-6 text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-sm">No active friends</p>
          <p className="text-xs text-gray-500">
            Add friends to see their activity!
          </p>
        </div>
      )}

      {friends && friends.length > 0 && (
        <button
          onClick={onClick}
          className="w-full mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 py-2"
        >
          View All Friends ({friends.length})
          <i className="ri-arrow-right-line"></i>
        </button>
      )}
    </div>
  );
};

// Session Analytics Component
const SessionAnalytics = ({ sessionStats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse text-center p-4 bg-gray-800/50 rounded-lg"
          >
            <div className="w-8 h-8 bg-gray-600 rounded mx-auto mb-2"></div>
            <div className="w-16 h-4 bg-gray-600 rounded mx-auto mb-1"></div>
            <div className="w-12 h-3 bg-gray-600 rounded mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatTime = (seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg hover:scale-105 transition-all duration-300">
        <i className="ri-timer-line text-2xl text-cyan-400 mb-2 block"></i>
        <div className="text-xl font-bold text-cyan-400 mb-1">
          {formatTime(sessionStats?.longestSession || 0)}
        </div>
        <div className="text-xs text-gray-400">Longest Session</div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:scale-105 transition-all duration-300">
        <i className="ri-gamepad-line text-2xl text-green-400 mb-2 block"></i>
        <div className="text-xl font-bold text-green-400 mb-1">
          {sessionStats?.gamesInLongestSession || 0}
        </div>
        <div className="text-xs text-gray-400">Games in Best Session</div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg hover:scale-105 transition-all duration-300">
        <i className="ri-trophy-line text-2xl text-yellow-400 mb-2 block"></i>
        <div className="text-xl font-bold text-yellow-400 mb-1">
          {(sessionStats?.bestSessionScore || 0).toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">Best Session Score</div>
      </div>
    </div>
  );
};

// Enhanced GameCard with more details
const GameCard = ({ game, index, formatPlayTime }) => (
  <div className="group flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-[#2a3942] rounded-lg border border-gray-600/30 hover:bg-[#334155] transition-all duration-300 gap-3 sm:gap-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="flex items-center gap-3 sm:gap-6 flex-wrap relative z-10">
      <div className="text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-2 min-w-[60px] group-hover:scale-105 transition-transform duration-300">
        <div className="text-sm sm:text-lg font-bold text-yellow-400">
          {game.score.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">Score</div>
      </div>

      <div className="text-center bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-2 min-w-[60px] group-hover:scale-105 transition-transform duration-300">
        <div className="text-sm sm:text-lg font-bold text-green-400">
          {game.snakeLength}
        </div>
        <div className="text-xs text-gray-400">Length</div>
      </div>

      <div className="text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-2 min-w-[60px] group-hover:scale-105 transition-transform duration-300">
        <div className="text-sm sm:text-lg font-bold text-purple-400">
          {formatPlayTime(game.playTime)}
        </div>
        <div className="text-xs text-gray-400">Time</div>
      </div>

      {game.efficiency && (
        <div className="text-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-2 min-w-[60px] group-hover:scale-105 transition-transform duration-300">
          <div className="text-sm sm:text-lg font-bold text-blue-400">
            {game.efficiency.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">Efficiency</div>
        </div>
      )}

      {game.powerUpsUsed > 0 && (
        <div className="text-center bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-2 min-w-[50px] group-hover:scale-105 transition-transform duration-300">
          <div className="text-sm sm:text-lg font-bold text-orange-400">
            {game.powerUpsUsed}
          </div>
          <div className="text-xs text-gray-400">Power-ups</div>
        </div>
      )}

      {game.deviceType && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <i
            className={`${
              game.deviceType === "mobile"
                ? "ri-smartphone-line"
                : game.deviceType === "tablet"
                ? "ri-tablet-line"
                : "ri-computer-line"
            }`}
          ></i>
          <span className="capitalize">{game.deviceType}</span>
        </div>
      )}
    </div>

    <div className="text-right flex-shrink-0 self-end sm:self-center relative z-10">
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

// Enhanced LeaderboardCard
const LeaderboardCard = ({ player, index, isCurrentUser }) => (
  <div className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-[#2a3942] hover:bg-[#334155] transition-all duration-300 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
      {index === 0
        ? "🥇"
        : index === 1
        ? "🥈"
        : index === 2
        ? "🥉"
        : `#${index + 1}`}
    </div>

    <div className="relative">
      <img
        src={player.avatar || "/df-avatar.png"}
        alt={player.name}
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-600 group-hover:border-green-400 transition-colors duration-300 flex-shrink-0"
        onError={(e) => {
          e.target.src = "/df-avatar.png";
        }}
      />
      {isCurrentUser && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-gray-800 rounded-full"></div>
      )}
    </div>

    <div className="flex-1 min-w-0 relative z-10">
      <div className="text-white text-xs sm:text-sm font-medium truncate group-hover:text-green-300 transition-colors duration-300">
        {player.name}
        {isCurrentUser && (
          <span className="ml-1 text-xs text-green-400 font-bold">(You)</span>
        )}
      </div>
      <div className="text-xs text-gray-500">
        {player.gameStats?.totalGamesPlayed || 0} games
      </div>
    </div>

    <div className="text-right relative z-10">
      <div className="text-yellow-400 font-bold text-xs sm:text-sm group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
        {player.gameStats?.highestScore?.toLocaleString() || 0}
      </div>
      {player.gameStats?.winRate && (
        <div className="text-xs text-gray-400">
          {player.gameStats.winRate}% win
        </div>
      )}
    </div>
  </div>
);

// Enhanced QuickActionButton
const QuickActionButton = ({
  onClick,
  icon,
  iconColor,
  title,
  description,
  gradient = false,
  badge = null,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg transition-all duration-300 text-left hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden ${
      gradient
        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50"
        : "bg-[#2a3942] hover:bg-[#334155] border border-gray-600/30 hover:border-gray-500/50"
    }`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="relative">
      <i
        className={`${icon} ${iconColor} text-lg sm:text-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0 relative z-10`}
      ></i>
      {badge && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {badge}
        </div>
      )}
    </div>

    <div className="flex-1 min-w-0 relative z-10">
      <div className="text-white font-medium text-sm sm:text-base group-hover:text-green-300 transition-colors duration-300">
        {title}
      </div>
      <div className="text-gray-400 text-xs sm:text-sm group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </div>
    </div>

    <i className="ri-arrow-right-line text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 relative z-10"></i>
  </button>
);

const Dashboard = () => {
  const { user, isAuthenticated, gameStats: authGameStats } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Enhanced state management
  const [gameStats, setGameStats] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch comprehensive game stats
      const statsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/game-stats`,
        { credentials: "include" }
      );
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setGameStats(statsData.gameStats);
        setRecentGames(statsData.recentGames);
        setAchievements(statsData.achievements || []);
      }

      // Fetch leaderboard with user rank
      const leaderboardResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/leaderboard?limit=10`
      );
      const leaderboardData = await leaderboardResponse.json();

      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.leaderboard);
      }

      // Fetch user rank
      const rankResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/my-rank`,
        { credentials: "include" }
      );
      const rankData = await rankResponse.json();

      if (rankData.success) {
        setUserRank(rankData);
      }

      // Fetch friends data
      try {
        const friendsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/friends?limit=10`,
          { credentials: "include" }
        );
        const friendsData = await friendsResponse.json();

        if (friendsData.success) {
          setFriends(friendsData.friends || []);
        }
      } catch (error) {
        console.log("Friends data not available:", error);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      showNotification("error", "Failed to load dashboard data");
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

  const getUserRankDisplay = () => {
    if (!userRank || !userRank.rank) return "Unranked";
    return `#${userRank.rank}`;
  };

  const getTrendData = (current, previous) => {
    if (!previous || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  const calculateStreakBonus = () => {
    const streak = gameStats?.currentStreak || 0;
    if (streak >= 10) return "🔥 On Fire!";
    if (streak >= 5) return "⚡ Hot Streak!";
    if (streak >= 3) return "📈 Good Run!";
    return null;
  };

  const getPlayConsistency = () => {
    const playDays = gameStats?.playDays?.length || 0;
    const totalDays = gameStats?.createdAt
      ? Math.floor(
          (Date.now() - new Date(gameStats.createdAt)) / (1000 * 60 * 60 * 24)
        )
      : 1;
    return Math.round((playDays / Math.max(totalDays, 1)) * 100);
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] px-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-green-500/30 mx-auto"></div>
          </div>
          <div className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Loading Dashboard
          </div>
          <p className="text-gray-300 text-sm">
            Preparing your gaming overview...
          </p>
        </div>
      </div>
    );
  }

  const streakBonus = calculateStreakBonus();
  const playConsistency = getPlayConsistency();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white relative overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Welcome back, {user?.name}!
                <span className="inline-block animate-bounce ml-2">👋</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span>Here's your gaming overview</span>
                {streakBonus && (
                  <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs animate-pulse">
                    {streakBonus}
                  </span>
                )}
                {playConsistency > 50 && (
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                    📅 {playConsistency}% consistency
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/game")}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 hover:scale-105 text-sm font-medium relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <i className="ri-gamepad-line group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="relative z-10">Quick Play</span>
              </button>

              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="group p-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                <i
                  className={`ri-refresh-line text-white group-hover:rotate-180 transition-transform duration-300 ${
                    loading ? "animate-spin" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Highest Score"
            value={gameStats?.highestScore || 0}
            icon="ri-trophy-line"
            iconColor="text-yellow-400"
            gradient="from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
            description="Personal best"
            trend={getTrendData(
              gameStats?.highestScore || 0,
              gameStats?.previousHighScore
            )}
            onClick={() => navigate("/profile")}
          />

          <StatCard
            title="Games Played"
            value={gameStats?.totalGamesPlayed || 0}
            icon="ri-gamepad-line"
            iconColor="text-blue-400"
            gradient="from-blue-500/20 to-cyan-500/20 border-blue-500/30"
            description="Total sessions"
            subtitle={`${gameStats?.gamesWon || 0} wins`}
          />

          <StatCard
            title="Win Rate"
            value={`${gameStats?.winRate || 0}%`}
            icon="ri-medal-line"
            iconColor="text-green-400"
            gradient="from-green-500/20 to-emerald-500/20 border-green-500/30"
            description="Success rate"
            subtitle={`${gameStats?.currentStreak || 0} current streak`}
          />

          <StatCard
            title="Total Playtime"
            value={formatPlayTime(gameStats?.totalPlayTime || 0)}
            icon="ri-time-line"
            iconColor="text-purple-400"
            gradient="from-purple-500/20 to-pink-500/20 border-purple-500/30"
            description="Time invested"
            subtitle={`${gameStats?.playDays?.length || 0} play days`}
          />

          <StatCard
            title="Global Rank"
            value={getUserRankDisplay()}
            icon="ri-award-line"
            iconColor="text-indigo-400"
            gradient="from-indigo-500/20 to-purple-500/20 border-indigo-500/30"
            description="Your position"
            subtitle={
              userRank?.percentile ? `Top ${100 - userRank.percentile}%` : ""
            }
            onClick={() => navigate("/leaderboard")}
          />

          <StatCard
            title="Achievements"
            value={achievements?.length || 0}
            icon="ri-star-line"
            iconColor="text-pink-400"
            gradient="from-pink-500/20 to-red-500/20 border-pink-500/30"
            description="Unlocked"
            subtitle={`${
              achievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0
            } points`}
            onClick={() => navigate("/profile")}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Recent Games & Analytics */}
          <div className="xl:col-span-2 space-y-6">
            {/* Recent Games */}
            <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 relative z-10">
                  <i className="ri-history-line text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                  Recent Games
                  {recentGames && recentGames.length > 0 && (
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                      {recentGames.length}
                    </span>
                  )}
                </h2>

                {recentGames && recentGames.length > 5 && (
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:scale-105 transition-all duration-300 flex items-center gap-1"
                  >
                    View All
                    <i className="ri-arrow-right-line"></i>
                  </button>
                )}
              </div>

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

            {/* Power-up Usage Analytics */}
            {gameStats?.powerUpsByType &&
              Object.keys(gameStats.powerUpsByType).length > 0 && (
                <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                    <i className="ri-flashlight-line text-orange-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Power-up Usage
                    <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full">
                      {gameStats.powerUpsUsed || 0} total
                    </span>
                  </h3>

                  <div className="relative z-10">
                    <PowerUpUsage
                      powerUpsByType={gameStats.powerUpsByType}
                      loading={loading}
                    />
                  </div>
                </div>
              )}

            {/* Device Performance */}
            {gameStats?.deviceStats && (
              <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                  <i className="ri-device-line text-cyan-400 group-hover:scale-110 transition-transform duration-300"></i>
                  Device Performance
                </h3>

                <div className="relative z-10">
                  <DevicePerformance
                    deviceStats={gameStats.deviceStats}
                    loading={loading}
                  />
                </div>
              </div>
            )}

            {/* Session Analytics */}
            {gameStats?.sessionStats && (
              <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                  <i className="ri-timer-line text-purple-400 group-hover:scale-110 transition-transform duration-300"></i>
                  Session Analytics
                </h3>

                <div className="relative z-10">
                  <SessionAnalytics
                    sessionStats={gameStats.sessionStats}
                    loading={loading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Top Players Leaderboard */}
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
                  {leaderboard.slice(0, 5).map((player, index) => (
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
                  <p className="text-xs sm:text-sm">Loading leaderboard...</p>
                </div>
              )}
            </div>

            {/* Achievement Progress */}
            <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <i className="ri-medal-line text-yellow-400 group-hover:scale-110 transition-transform duration-300"></i>
                Recent Achievements
                {achievements.length > 0 && (
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full">
                    {achievements.length}
                  </span>
                )}
              </h3>

              <div className="relative z-10">
                <AchievementProgress
                  achievements={achievements}
                  loading={loading}
                  onClick={() => navigate("/profile")}
                />
              </div>
            </div>

            {/* Friends Activity */}
            <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <i className="ri-group-line text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                Friends Activity
                {friends.length > 0 && (
                  <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                    {friends.length}
                  </span>
                )}
              </h3>

              <div className="relative z-10">
                <FriendsActivity
                  friends={friends}
                  loading={loading}
                  onClick={() => navigate("/friends")}
                />
              </div>
            </div>

            {/* Enhanced Quick Actions */}
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
                  title="New Game"
                  description="Start playing now"
                  gradient={true}
                />

                <QuickActionButton
                  onClick={() => navigate("/profile")}
                  icon="ri-user-line"
                  iconColor="text-blue-400"
                  title="Full Profile"
                  description="View detailed stats & achievements"
                />

                <QuickActionButton
                  onClick={() => navigate("/leaderboard")}
                  icon="ri-trophy-line"
                  iconColor="text-yellow-400"
                  title="Global Leaderboard"
                  description="Compare with top players"
                />

                <QuickActionButton
                  onClick={() => navigate("/friends")}
                  icon="ri-group-line"
                  iconColor="text-purple-400"
                  title="Friends & Social"
                  description="Connect with other players"
                  badge={
                    friends.filter((f) => {
                      const lastPlayed = f.gameStats?.lastPlayedAt;
                      return (
                        lastPlayed &&
                        Date.now() - new Date(lastPlayed) < 24 * 60 * 60 * 1000
                      );
                    }).length || null
                  }
                />

                <QuickActionButton
                  onClick={() => navigate("/settings")}
                  icon="ri-settings-line"
                  iconColor="text-gray-400"
                  title="Game Settings"
                  description="Customize your experience"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {gameStats?.totalFoodEaten || 0}
            </div>
            <div className="text-xs text-gray-400">Food Eaten</div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {gameStats?.goldenFoodEaten || 0}
            </div>
            <div className="text-xs text-gray-400">Golden Food</div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {gameStats?.bestEfficiency?.toFixed(1) || 0}
            </div>
            <div className="text-xs text-gray-400">Best Efficiency</div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {gameStats?.totalMoves || 0}
            </div>
            <div className="text-xs text-gray-400">Total Moves</div>
          </div>
        </div>

        {/* Player Insights */}
        {gameStats && (
          <div className="mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6">
            <h3 className="text-lg font-bold text-center mb-6 text-indigo-300 flex items-center justify-center gap-2">
              <i className="ri-lightbulb-line"></i>
              Player Insights
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              {/* Performance Insights */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <i className="ri-line-chart-line text-green-400"></i>
                  Performance
                </h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Avg Game Score:</span>
                    <span className="text-green-400">
                      {gameStats.averageScore?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Play Time:</span>
                    <span className="text-blue-400">
                      {formatPlayTime(gameStats.averagePlayTime || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Streak:</span>
                    <span className="text-yellow-400">
                      {gameStats.bestStreak || 0} games
                    </span>
                  </div>
                </div>
              </div>

              {/* Gameplay Patterns */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <i className="ri-bar-chart-line text-purple-400"></i>
                  Patterns
                </h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Play Consistency:</span>
                    <span className="text-purple-400">{playConsistency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Favorite Device:</span>
                    <span className="text-cyan-400 capitalize">
                      {Object.entries(gameStats.deviceStats || {}).sort(
                        ([, a], [, b]) => (b.games || 0) - (a.games || 0)
                      )[0]?.[0] || "Desktop"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power-up Usage:</span>
                    <span className="text-orange-400">
                      {gameStats.powerUpsUsed
                        ? `${(
                            (gameStats.powerUpsUsed /
                              gameStats.totalGamesPlayed) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Achievements & Progress */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <i className="ri-trophy-line text-yellow-400"></i>
                  Progress
                </h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Achievement Points:</span>
                    <span className="text-yellow-400">
                      {achievements?.reduce(
                        (sum, a) => sum + (a.points || 0),
                        0
                      ) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Player Level:</span>
                    <span className="text-indigo-400">
                      {Math.floor((gameStats.totalGamesPlayed || 0) / 10) + 1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Level:</span>
                    <span className="text-pink-400">
                      {10 - ((gameStats.totalGamesPlayed || 0) % 10)} games
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Recommendations */}
            <div className="mt-6 pt-6 border-t border-indigo-500/20">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <i className="ri-target-line text-green-400"></i>
                Recommendations
              </h4>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {gameStats.winRate < 30 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="text-blue-300 font-medium mb-1">
                      💡 Improve Consistency
                    </div>
                    <div className="text-gray-300 text-xs">
                      Practice movement patterns and avoid rushed decisions to
                      improve your win rate.
                    </div>
                  </div>
                )}

                {(gameStats.powerUpsUsed || 0) <
                  (gameStats.totalGamesPlayed || 1) * 0.2 && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <div className="text-orange-300 font-medium mb-1">
                      ⚡ Use More Power-ups
                    </div>
                    <div className="text-gray-300 text-xs">
                      Collect and use power-ups strategically to boost your
                      scores and survival time.
                    </div>
                  </div>
                )}

                {(gameStats.bestEfficiency || 0) < 1.5 && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div className="text-purple-300 font-medium mb-1">
                      🎯 Optimize Movement
                    </div>
                    <div className="text-gray-300 text-xs">
                      Plan your path efficiently to maximize points per move and
                      avoid unnecessary turns.
                    </div>
                  </div>
                )}

                {friends.length < 3 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="text-green-300 font-medium mb-1">
                      👥 Connect with Friends
                    </div>
                    <div className="text-gray-300 text-xs">
                      Add friends to compete on leaderboards and unlock social
                      achievements.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Daily Challenge Teaser (Future Feature) */}
        <div className="mt-8 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-yellow-300 mb-2 flex items-center justify-center gap-2">
              <i className="ri-calendar-line"></i>
              Daily Challenges
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Complete daily challenges to earn bonus points, exclusive
              achievements, and special rewards!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="text-red-300 font-medium mb-1">
                  🔥 Survival Challenge
                </div>
                <div className="text-gray-400 text-xs">
                  Survive for 5+ minutes
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-blue-300 font-medium mb-1">
                  ⚡ Speed Run
                </div>
                <div className="text-gray-400 text-xs">
                  Score 500+ in under 2 minutes
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-green-300 font-medium mb-1">
                  🎯 Precision Master
                </div>
                <div className="text-gray-400 text-xs">
                  Achieve 3.0+ efficiency rating
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 space-y-1">
          <p>
            Enhanced Snake Game Dashboard v2.0 • Real-time Analytics & Social
            Features
          </p>
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.6;
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Custom scrollbar */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 2px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 2px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
