import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_TIERS,
  ENHANCED_ACHIEVEMENTS,
} from "../utils/achievements";
import LoadingSpinner from "../components/LoadingSpinner";
import { Helmet } from "react-helmet";

const Achievements = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, achievements, gameStats } = useAuth();
  const { showNotification } = useNotification();

  // State management
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [sortBy, setSortBy] = useState("category");
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Achievement data
  const [achievementData, setAchievementData] = useState({
    unlocked: [],
    progress: {},
    stats: {},
    grouped: {},
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadAchievementData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, achievements]);

  const loadAchievementData = async () => {
    try {
      setLoading(true);

      // Process achievement data
      const unlockedIds = achievements?.map((a) => a.id) || [];
      const grouped = {};

      // Group achievements by category
      Object.values(ACHIEVEMENT_CATEGORIES).forEach((category) => {
        grouped[category] = Object.values(ENHANCED_ACHIEVEMENTS)
          .filter((a) => a.category === category)
          .map((achievement) => ({
            ...achievement,
            unlocked: unlockedIds.includes(achievement.id),
            unlockedAt: achievements?.find((a) => a.id === achievement.id)
              ?.unlockedAt,
            progress: calculateProgress(achievement, gameStats),
          }));
      });

      // Calculate overall stats
      const totalAchievements = Object.keys(ENHANCED_ACHIEVEMENTS).length;
      const unlockedCount = unlockedIds.length;
      const totalPoints =
        achievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;
      const secretsUnlocked =
        achievements?.filter((a) => ENHANCED_ACHIEVEMENTS[a.id]?.secret)
          .length || 0;

      setAchievementData({
        unlocked: achievements || [],
        grouped,
        stats: {
          total: totalAchievements,
          unlocked: unlockedCount,
          percentage: Math.round((unlockedCount / totalAchievements) * 100),
          totalPoints,
          secretsUnlocked,
          averagePoints:
            unlockedCount > 0 ? Math.round(totalPoints / unlockedCount) : 0,
        },
      });
    } catch (error) {
      console.error("Failed to load achievements:", error);
      showNotification("error", "Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (achievement, stats) => {
    if (!stats) return 0;

    try {
      // Simplified progress calculation based on achievement type
      if (
        achievement.id.includes("score") &&
        achievement.description.includes("points")
      ) {
        const target = parseInt(
          achievement.description.match(/\d+/)?.[0] || "0"
        );
        return Math.min((stats.highestScore / target) * 100, 100);
      }

      if (achievement.id.includes("games") || achievement.id.includes("play")) {
        const target = parseInt(
          achievement.description.match(/\d+/)?.[0] || "0"
        );
        return Math.min((stats.totalGamesPlayed / target) * 100, 100);
      }

      if (
        achievement.id.includes("snake") ||
        achievement.id.includes("length")
      ) {
        const target = parseInt(
          achievement.description.match(/\d+/)?.[0] || "0"
        );
        return Math.min((stats.longestSnake / target) * 100, 100);
      }

      if (achievement.id.includes("time")) {
        const target =
          parseInt(achievement.description.match(/\d+/)?.[0] || "0") * 60; // Convert to seconds
        return Math.min((stats.totalPlayTime / target) * 100, 100);
      }

      return achievement.unlocked ? 100 : 0;
    } catch (error) {
      return 0;
    }
  };

  const getFilteredAchievements = () => {
    let filtered = [];

    if (activeCategory === "all") {
      filtered = Object.values(achievementData.grouped).flat();
    } else {
      filtered = achievementData.grouped[activeCategory] || [];
    }

    // Filter by tier
    if (activeTier !== "all") {
      filtered = filtered.filter(
        (a) => a.tier?.name.toLowerCase() === activeTier
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter secrets
    if (!showSecrets) {
      filtered = filtered.filter((a) => !a.secret);
    }

    // Sort achievements
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "tier":
        filtered.sort((a, b) => (b.tier?.points || 0) - (a.tier?.points || 0));
        break;
      case "progress":
        filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      case "unlocked":
        filtered.sort((a, b) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0));
        break;
      default: // category
        // Already grouped by category
        break;
    }

    return filtered;
  };

  const getTierColor = (tierName) => {
    const colors = {
      bronze: "from-amber-600 to-orange-700",
      silver: "from-gray-400 to-gray-600",
      gold: "from-yellow-400 to-yellow-600",
      platinum: "from-gray-300 to-gray-500",
      diamond: "from-cyan-400 to-blue-500",
    };
    return colors[tierName?.toLowerCase()] || "from-gray-500 to-gray-700";
  };

  const getTierIcon = (tierName) => {
    const icons = {
      bronze: "🥉",
      silver: "🥈",
      gold: "🥇",
      platinum: "💎",
      diamond: "💠",
    };
    return icons[tierName?.toLowerCase()] || "🏆";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      basic: "🎯",
      skill: "⚔️",
      social: "👥",
      persistence: "⏰",
      special: "⭐",
      hidden: "🔒",
    };
    return icons[category] || "🏆";
  };

  const getCategoryColor = (category) => {
    const colors = {
      basic: "blue",
      skill: "red",
      social: "purple",
      persistence: "green",
      special: "orange",
      hidden: "gray",
    };
    return colors[category] || "gray";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Achievements Await!
          </h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Sign up to unlock achievements, track your progress, and compete
            with other players.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-gray-600 hover:bg-white/5 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading achievements..." />
      </div>
    );
  }

  const filteredAchievements = getFilteredAchievements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white">
      <Helmet>
        <title>Achievements | Snake Game Ultimate Edition</title>
        <meta
          name="description"
          content="See your unlocked achievements in Snake Game Classic."
        />
      </Helmet>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🏆 Achievements
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Track your gaming journey and unlock rewards
          </p>
        </div>

        {/* Achievement Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {achievementData.stats.unlocked}
            </div>
            <div className="text-xs text-gray-400">Unlocked</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {achievementData.stats.total}
            </div>
            <div className="text-xs text-gray-400">Total</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {achievementData.stats.percentage}%
            </div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {achievementData.stats.totalPoints}
            </div>
            <div className="text-xs text-gray-400">Points</div>
          </div>

          <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {achievementData.stats.secretsUnlocked}
            </div>
            <div className="text-xs text-gray-400">Secrets</div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {achievementData.stats.averagePoints}
            </div>
            <div className="text-xs text-gray-400">Avg Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">
              Overall Progress
            </h3>
            <span className="text-yellow-400 font-bold">
              {achievementData.stats.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${achievementData.stats.percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{achievementData.stats.unlocked} achievements unlocked</span>
            <span>
              {achievementData.stats.total - achievementData.stats.unlocked}{" "}
              remaining
            </span>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-[#202c33] rounded-xl border border-gray-700/50 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search achievements..."
                  className="w-full px-4 py-2 pl-10 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === "all"
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    activeCategory === category
                      ? `bg-${getCategoryColor(category)}-500 text-white`
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <span>{getCategoryIcon(category)}</span>
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>

            {/* Tier Filter */}
            <div className="flex flex-wrap gap-2">
              <select
                value={activeTier}
                onChange={(e) => setActiveTier(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Tiers</option>
                {Object.entries(ACHIEVEMENT_TIERS).map(([key, tier]) => (
                  <option key={key} value={tier.name.toLowerCase()}>
                    {tier.name} ({tier.points} pts)
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="category">Sort by Category</option>
                <option value="name">Sort by Name</option>
                <option value="tier">Sort by Tier</option>
                <option value="progress">Sort by Progress</option>
                <option value="unlocked">Sort by Status</option>
              </select>

              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  showSecrets
                    ? "bg-gray-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <i className="ri-eye-line"></i>
                <span className="hidden sm:inline">Secrets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={`group relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                achievement.unlocked
                  ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40"
                  : "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30"
              } border rounded-xl p-4 sm:p-6 backdrop-blur-sm overflow-hidden`}
            >
              {/* Background Effect */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  achievement.unlocked
                    ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                    : "bg-gradient-to-br from-white/5 to-white/0"
                }`}
              ></div>

              {/* Secret Badge */}
              {achievement.secret && (
                <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  🔒 Secret
                </div>
              )}

              {/* Tier Badge */}
              <div
                className={`absolute top-2 left-2 bg-gradient-to-r ${getTierColor(
                  achievement.tier?.name
                )} text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1`}
              >
                <span>{getTierIcon(achievement.tier?.name)}</span>
                <span>{achievement.tier?.name}</span>
              </div>

              <div className="relative z-10 text-center">
                {/* Icon */}
                <div
                  className={`text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 ${
                    achievement.unlocked ? "" : "grayscale opacity-50"
                  }`}
                >
                  {achievement.icon}
                </div>

                {/* Title */}
                <h3
                  className={`text-lg font-bold mb-2 group-hover:text-white transition-colors duration-300 ${
                    achievement.unlocked ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  {achievement.secret && !achievement.unlocked
                    ? "???"
                    : achievement.name}
                </h3>

                {/* Description */}
                <p
                  className={`text-sm mb-4 leading-relaxed ${
                    achievement.unlocked ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {achievement.secret && !achievement.unlocked
                    ? achievement.hint || "Hidden achievement"
                    : achievement.description}
                </p>

                {/* Progress Bar */}
                {!achievement.unlocked && achievement.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(achievement.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Points */}
                <div
                  className={`text-sm font-medium ${
                    achievement.unlocked ? "text-yellow-400" : "text-gray-500"
                  }`}
                >
                  {achievement.tier?.points || 0} points
                </div>

                {/* Unlock Date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-gray-400 mt-2">
                    Unlocked{" "}
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}

                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2">
                  {achievement.unlocked ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-white text-sm"></i>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <i className="ri-lock-line text-gray-400 text-sm"></i>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No achievements found
            </h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setActiveTier("all");
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Achievement Categories Overview */}
        <div className="mt-12 bg-[#202c33] rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Achievement Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => {
              const categoryAchievements =
                achievementData.grouped[category] || [];
              const unlockedInCategory = categoryAchievements.filter(
                (a) => a.unlocked
              ).length;
              const totalInCategory = categoryAchievements.length;
              const categoryProgress =
                totalInCategory > 0
                  ? (unlockedInCategory / totalInCategory) * 100
                  : 0;

              return (
                <div
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`group cursor-pointer bg-gradient-to-br from-${getCategoryColor(
                    category
                  )}-500/10 to-${getCategoryColor(
                    category
                  )}-600/10 border border-${getCategoryColor(
                    category
                  )}-500/20 rounded-lg p-4 hover:scale-105 transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{getCategoryIcon(category)}</div>
                    <div>
                      <h4 className="text-white font-semibold capitalize">
                        {category}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {unlockedInCategory}/{totalInCategory} unlocked
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-full bg-gradient-to-r from-${getCategoryColor(
                        category
                      )}-400 to-${getCategoryColor(
                        category
                      )}-500 rounded-full transition-all duration-500`}
                      style={{ width: `${categoryProgress}%` }}
                    ></div>
                  </div>
                  <div
                    className={`text-right text-sm text-${getCategoryColor(
                      category
                    )}-400 mt-1`}
                  >
                    {Math.round(categoryProgress)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Unlock More?
          </h3>
          <p className="text-gray-300 mb-6">
            Keep playing to unlock new achievements and climb the leaderboards!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/game")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <i className="ri-gamepad-line mr-2"></i>
              Play Now
            </button>
            <button
              onClick={() => navigate("/leaderboard")}
              className="border border-gray-600 hover:bg-white/5 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <i className="ri-trophy-line mr-2"></i>
              View Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#202c33] rounded-xl border border-gray-700/50 max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            <div className="text-center">
              <div
                className={`text-6xl mb-4 ${
                  selectedAchievement.unlocked ? "" : "grayscale opacity-50"
                }`}
              >
                {selectedAchievement.icon}
              </div>

              <div
                className={`inline-block bg-gradient-to-r ${getTierColor(
                  selectedAchievement.tier?.name
                )} text-white text-sm px-3 py-1 rounded-full font-bold mb-4`}
              >
                {getTierIcon(selectedAchievement.tier?.name)}{" "}
                {selectedAchievement.tier?.name}
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${
                  selectedAchievement.unlocked
                    ? "text-yellow-400"
                    : "text-gray-400"
                }`}
              >
                {selectedAchievement.secret && !selectedAchievement.unlocked
                  ? "???"
                  : selectedAchievement.name}
              </h3>

              <p className="text-gray-300 mb-4">
                {selectedAchievement.secret && !selectedAchievement.unlocked
                  ? selectedAchievement.hint || "Hidden achievement"
                  : selectedAchievement.description}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                <span>
                  Category:{" "}
                  <span className="capitalize text-white">
                    {selectedAchievement.category}
                  </span>
                </span>
                <span>
                  Points:{" "}
                  <span className="text-yellow-400">
                    {selectedAchievement.tier?.points || 0}
                  </span>
                </span>
              </div>

              {!selectedAchievement.unlocked &&
                selectedAchievement.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(selectedAchievement.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedAchievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

              {selectedAchievement.unlocked &&
                selectedAchievement.unlockedAt && (
                  <div className="text-sm text-green-400 mb-4">
                    ✅ Unlocked on{" "}
                    {new Date(
                      selectedAchievement.unlockedAt
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}

              {selectedAchievement.secret && (
                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                  <div className="text-gray-400 text-sm flex items-center gap-2">
                    <i className="ri-eye-off-line"></i>
                    <span>Secret Achievement</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedAchievement(null);
                    navigate("/game");
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Play Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
