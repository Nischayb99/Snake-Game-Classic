import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import HowToPlayModal from "../components/HowToPlayModal";
import LoadingSpinner from "../components/LoadingSpinner";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, gameStats } = useAuth();
  const { showNotification } = useNotification();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Enhanced live stats
  const [liveStats, setLiveStats] = useState({
    totalPlayers: 15420,
    gamesPlayed: 84592,
    highestScore: 9874,
    onlinePlayers: 432,
    totalAchievements: 8930,
    powerUpsUsed: 125847,
  });

  // Recent achievements ticker
  const [recentAchievements, setRecentAchievements] = useState([
    { user: "PlayerOne", achievement: "Snake Master", icon: "🏆" },
    { user: "GamerX", achievement: "High Scorer", icon: "⭐" },
    { user: "SnakeKing", achievement: "Speed Demon", icon: "⚡" },
    { user: "ProGamer", achievement: "Efficiency Expert", icon: "💎" },
    { user: "TopPlayer", achievement: "Social Butterfly", icon: "👥" },
  ]);

  const [currentAchievement, setCurrentAchievement] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Power-ups showcase data
  const powerUps = [
    {
      icon: "⚡",
      name: "Speed Boost",
      desc: "Move faster temporarily",
      color: "yellow",
    },
    {
      icon: "💎",
      name: "Double Points",
      desc: "2x score multiplier",
      color: "blue",
    },
    {
      icon: "🛡️",
      name: "Invincible",
      desc: "Pass through obstacles",
      color: "green",
    },
    {
      icon: "❤️",
      name: "Extra Life",
      desc: "Survive one collision",
      color: "red",
    },
  ];

  // Feature showcase data
  const advancedFeatures = [
    {
      icon: "ri-trophy-line",
      title: "25+ Achievements",
      description:
        "Unlock achievements across 6 categories from Bronze to Diamond tiers",
      color: "yellow",
      stats: "25 unlockable rewards",
    },
    {
      icon: "ri-group-line",
      title: "Social Gaming",
      description:
        "Add friends, compare scores, and climb leaderboards together",
      color: "purple",
      stats: `${liveStats.totalPlayers.toLocaleString()}+ players`,
    },
    {
      icon: "ri-flashlight-line",
      title: "Power-up System",
      description: "Strategic power-ups that change gameplay and add depth",
      color: "orange",
      stats: `${(liveStats.powerUpsUsed / 1000).toFixed(0)}K+ used`,
    },
    {
      icon: "ri-bar-chart-line",
      title: "Advanced Analytics",
      description: "Detailed statistics tracking performance and improvement",
      color: "blue",
      stats: "15+ metrics tracked",
    },
    {
      icon: "ri-device-line",
      title: "Cross-Platform",
      description: "Optimized experience across desktop, tablet, and mobile",
      color: "green",
      stats: "All devices supported",
    },
    {
      icon: "ri-star-line",
      title: "Progression System",
      description: "Level up, unlock content, and track your gaming journey",
      color: "cyan",
      stats: "Unlimited progression",
    },
  ];

  useEffect(() => {
    setIsVisible(true);

    // Simulate live stats updates
    const statsInterval = setInterval(() => {
      setLiveStats((prev) => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + Math.floor(Math.random() * 3),
        onlinePlayers: prev.onlinePlayers + Math.floor(Math.random() * 5) - 2,
        powerUpsUsed: prev.powerUpsUsed + Math.floor(Math.random() * 10),
      }));
    }, 10000);

    // Achievement ticker rotation
    const achievementInterval = setInterval(() => {
      setCurrentAchievement((prev) => (prev + 1) % recentAchievements.length);
    }, 3000);

    // Feature rotation
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % advancedFeatures.length);
    }, 4000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(achievementInterval);
      clearInterval(featureInterval);
    };
  }, []);

  const handleStartGame = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/game");

      if (isAuthenticated) {
        showNotification("success", `Welcome back, ${user?.name}! Let's play!`);
      } else {
        showNotification(
          "info",
          "Playing as guest. Sign up to save your scores!"
        );
      }
    } catch (error) {
      showNotification("error", "Failed to start game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHowToPlay = () => setModalOpen(true);
  const handleGetStarted = () =>
    navigate(isAuthenticated ? "/dashboard" : "/signup");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white overflow-x-hidden">
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden">
          {/* Dynamic Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-20 h-20 sm:w-40 sm:h-40 bg-emerald-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64 bg-green-400 rounded-full blur-3xl animate-pulse delay-500"></div>

            {/* Floating elements */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl opacity-20 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${4 + Math.random() * 2}s`,
                }}
              >
                {["🐍", "🍎", "⚡", "💎", "🏆"][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>

          <div className="relative z-10 max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-16 lg:py-20">
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Enhanced Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* Live Status Bar */}
                <div className="mb-4 sm:mb-6 flex flex-wrap justify-center lg:justify-start gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm font-medium border border-green-500/30 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {liveStats.onlinePlayers} online now
                  </div>
                  <div className="inline-block px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-xs sm:text-sm font-medium border border-blue-500/30 backdrop-blur-sm">
                    🎮 Latest: v2.0 Enhanced
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent block">
                    Snake Game
                  </span>
                  <span className="text-white">Ultimate Edition</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
                  The most advanced Snake game ever created. Experience classic
                  gameplay enhanced with
                  <span className="text-green-400 font-semibold">
                    {" "}
                    achievements
                  </span>
                  ,
                  <span className="text-blue-400 font-semibold">
                    {" "}
                    social features
                  </span>
                  ,
                  <span className="text-purple-400 font-semibold">
                    {" "}
                    power-ups
                  </span>
                  , and
                  <span className="text-yellow-400 font-semibold">
                    {" "}
                    advanced analytics
                  </span>
                  !
                </p>

                {/* User Greeting with Stats */}
                {isAuthenticated && gameStats && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm mx-2 sm:mx-0">
                    <p className="text-green-400 text-sm sm:text-base mb-2">
                      👋 Welcome back,{" "}
                      <span className="font-semibold">{user?.name}</span>!
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-300">
                      <span>🏆 Best: {gameStats.highestScore || 0}</span>
                      <span>🎮 Games: {gameStats.totalGamesPlayed || 0}</span>
                      <span>
                        ⭐ Level:{" "}
                        {Math.floor((gameStats.totalGamesPlayed || 0) / 10) + 1}
                      </span>
                    </div>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8 px-2 sm:px-0">
                  <button
                    onClick={handleStartGame}
                    disabled={isLoading}
                    className="group relative bg-gradient-to-r from-emerald-500 to-green-600 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:shadow-green-500/25 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-2 sm:gap-3">
                      {isLoading ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <i className="ri-play-fill text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300"></i>
                      )}
                      {isLoading ? "Loading..." : "Start Playing"}
                    </div>
                  </button>

                  <button
                    onClick={handleHowToPlay}
                    className="group bg-transparent border-2 border-white/30 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold flex items-center justify-center gap-2 sm:gap-3 hover:bg-white/10 hover:border-white/50 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                  >
                    <i className="ri-question-line group-hover:rotate-12 transition-transform duration-300"></i>
                    How to Play
                  </button>
                </div>

                {/* Quick Feature Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 px-2 sm:px-0">
                  {powerUps.map((powerUp, index) => (
                    <div
                      key={index}
                      className="group text-center p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="text-lg sm:text-xl mb-1 group-hover:scale-110 transition-transform duration-300">
                        {powerUp.icon}
                      </div>
                      <div className="text-xs text-gray-400">
                        {powerUp.name}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="text-center lg:text-left px-2 sm:px-0">
                    <p className="text-gray-400 mb-2 sm:mb-3 text-sm sm:text-base">
                      🚀 Join the ultimate Snake gaming experience
                    </p>
                    <button
                      onClick={handleGetStarted}
                      className="text-green-400 hover:text-green-300 font-medium underline underline-offset-4 hover:underline-offset-8 transition-all duration-300 text-sm sm:text-base"
                    >
                      Create Free Account → Unlock All Features
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced Visual Demo */}
              <div className="flex items-center justify-center h-48 sm:h-64 lg:h-96 relative order-1 lg:order-2">
                <div className="relative scale-75 sm:scale-90 lg:scale-100">
                  {/* Animated Game Board */}
                  <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-4 border-2 border-green-500/30 backdrop-blur-sm">
                    {/* Snake Animation */}
                    <div className="flex items-center gap-1 sm:gap-2 animate-snake-move mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg shadow-2xl bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white flex items-center justify-center relative">
                        <div className="absolute top-1 sm:top-1.5 lg:top-2 left-2 sm:left-2.5 lg:left-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                        <div className="absolute top-1 sm:top-1.5 lg:top-2 right-2 sm:right-2.5 lg:right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      </div>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg shadow-lg bg-gradient-to-r from-emerald-500 to-green-600 border-2 border-green-400"
                          style={{
                            animationDelay: `${i * 100}ms`,
                            transform: `scale(${1 - i * 0.05})`,
                          }}
                        ></div>
                      ))}
                    </div>

                    {/* Power-ups and Food */}
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg relative">
                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30"></div>
                      </div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg animate-bounce shadow-lg flex items-center justify-center text-xs">
                        ⚡
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="absolute top-2 right-2 bg-black/50 rounded-lg px-2 py-1 text-green-400 text-xs font-bold">
                      Score: 420
                    </div>
                  </div>

                  {/* Floating Achievement */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce shadow-lg">
                    🏆 New Achievement!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Section */}
        <section className="py-12 sm:py-16 bg-black/20 backdrop-blur-sm relative">
          {/* Recent Achievements Ticker */}
          <div className="absolute top-4 left-0 right-0 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-y border-yellow-500/20 py-2">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-sm text-yellow-400 mx-4">
                  🎉 Recent Achievement:{" "}
                  {recentAchievements[currentAchievement]?.user} unlocked "
                  {recentAchievements[currentAchievement]?.achievement}"{" "}
                  {recentAchievements[currentAchievement]?.icon}
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-8">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                Live Game Statistics
              </h2>
              <p className="text-gray-400 text-sm">
                Real-time data from our gaming community
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {[
                {
                  value: liveStats.totalPlayers,
                  label: "Players",
                  icon: "👥",
                  color: "green",
                },
                {
                  value: liveStats.gamesPlayed,
                  label: "Games",
                  icon: "🎮",
                  color: "blue",
                },
                {
                  value: liveStats.highestScore,
                  label: "High Score",
                  icon: "🏆",
                  color: "yellow",
                },
                {
                  value: liveStats.onlinePlayers,
                  label: "Online",
                  icon: "🟢",
                  color: "green",
                },
                {
                  value: liveStats.totalAchievements,
                  label: "Achievements",
                  icon: "⭐",
                  color: "purple",
                },
                {
                  value: Math.floor(liveStats.powerUpsUsed / 1000),
                  label: "Power-ups (K)",
                  icon: "⚡",
                  color: "orange",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`group text-center p-4 sm:p-6 bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 rounded-xl border border-${stat.color}-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300`}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div
                    className={`text-2xl sm:text-3xl font-bold text-${stat.color}-400 mb-1 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </div>
                  <div className="text-gray-300 text-xs sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features Showcase */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Advanced Gaming Features
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6">
                Experience the most feature-rich Snake game ever created
              </p>

              {/* Feature Highlight */}
              <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <i
                    className={`${advancedFeatures[activeFeature].icon} text-2xl text-${advancedFeatures[activeFeature].color}-400`}
                  ></i>
                  <h3 className="text-lg font-semibold text-white">
                    {advancedFeatures[activeFeature].title}
                  </h3>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  {advancedFeatures[activeFeature].description}
                </p>
                <span
                  className={`text-xs text-${advancedFeatures[activeFeature].color}-400 bg-${advancedFeatures[activeFeature].color}-500/10 px-2 py-1 rounded-full`}
                >
                  {advancedFeatures[activeFeature].stats}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {advancedFeatures.map((feature, index) => {
                const colorClasses = {
                  green:
                    "from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-400",
                  yellow:
                    "from-yellow-500/10 to-orange-500/10 border-yellow-500/20 text-yellow-400",
                  blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400",
                  purple:
                    "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400",
                  cyan: "from-cyan-500/10 to-teal-500/10 border-cyan-500/20 text-cyan-400",
                  orange:
                    "from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-400",
                };

                return (
                  <div
                    key={index}
                    className={`group p-4 sm:p-6 bg-gradient-to-br ${
                      colorClasses[feature.color]
                    } rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all duration-500 relative overflow-hidden ${
                      index === activeFeature ? "ring-2 ring-white/20" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="mb-4 flex items-center justify-between">
                        <i
                          className={`${feature.icon} text-2xl sm:text-3xl ${
                            colorClasses[feature.color].split(" ")[2]
                          } group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                        ></i>
                        <span
                          className={`text-xs px-2 py-1 rounded-full bg-${
                            feature.color
                          }-500/20 ${
                            colorClasses[feature.color].split(" ")[2]
                          }`}
                        >
                          {feature.stats}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white group-hover:text-white transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm sm:text-base group-hover:text-gray-200 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Power-ups Deep Dive */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-orange-500/5 to-red-500/5">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Strategic Power-up System
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Game-changing power-ups that add depth and strategy to classic
                Snake gameplay
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {powerUps.map((powerUp, index) => (
                <div
                  key={index}
                  className={`group text-center p-6 bg-gradient-to-br from-${powerUp.color}-500/10 to-${powerUp.color}-600/10 border border-${powerUp.color}-500/20 rounded-xl hover:scale-105 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      {powerUp.icon}
                    </div>
                    <h3
                      className={`text-lg font-semibold mb-2 text-${powerUp.color}-400`}
                    >
                      {powerUp.name}
                    </h3>
                    <p className="text-gray-300 text-sm">{powerUp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Call to Action */}
        <section className="py-16 sm:py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 backdrop-blur-3xl"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-3 sm:px-4 lg:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Ready to Experience the Ultimate Snake Game?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8">
              Join {liveStats.totalPlayers.toLocaleString()}+ players in the
              most advanced Snake gaming experience ever created.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
              {[
                { icon: "🏆", text: "25+ Achievements" },
                { icon: "👥", text: "Social Gaming" },
                { icon: "⚡", text: "Power-ups" },
                { icon: "📊", text: "Analytics" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs text-gray-300">{item.text}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <button
                onClick={handleStartGame}
                disabled={isLoading}
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl relative overflow-hidden disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <i className="ri-gamepad-line group-hover:scale-110 transition-transform duration-300"></i>
                  )}
                  {isLoading ? "Loading..." : "Play Now - Free"}
                </span>
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/signup")}
                  className="group bg-transparent border-2 border-white/30 hover:bg-white/10 hover:border-white/50 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-user-add-line group-hover:scale-110 transition-transform duration-300"></i>
                    Join Community
                  </span>
                </button>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <i className="ri-dashboard-line group-hover:scale-110 transition-transform duration-300"></i>
                    Go to Dashboard
                  </span>
                </button>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <i className="ri-shield-check-line text-green-400"></i>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-device-line text-blue-400"></i>
                <span>All Devices</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-user-line text-purple-400"></i>
                <span>No Download</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-time-line text-yellow-400"></i>
                <span>Instant Play</span>
              </div>
            </div>
          </div>
        </section>

        {/* Community Highlights */}
        <section className="py-16 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Join Our Growing Community
              </h2>
              <p className="text-gray-300 text-lg">
                Connect with players worldwide and climb the leaderboards
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Community Stats */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
                <i className="ri-group-line text-3xl text-purple-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Active Community
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Join thousands of players sharing strategies and competing for
                  high scores
                </p>
                <div className="text-purple-400 font-bold">
                  {liveStats.totalPlayers.toLocaleString()}+ Members
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                <i className="ri-trophy-line text-3xl text-yellow-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Achievements
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Unlock 25+ achievements across multiple categories and earn
                  points
                </p>
                <div className="text-yellow-400 font-bold">
                  {liveStats.totalAchievements.toLocaleString()}+ Unlocked
                </div>
              </div>

              {/* Competition */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <i className="ri-bar-chart-line text-3xl text-green-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Global Competition
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Compete on multiple leaderboards and track your global ranking
                </p>
                <div className="text-green-400 font-bold">
                  Real-time Rankings
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Players Activity */}
        <section className="py-12 bg-black/10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-white mb-2">
                Live Player Activity
              </h3>
              <p className="text-gray-400 text-sm">
                See what our community is achieving right now
              </p>
            </div>

            <div className="overflow-hidden bg-gradient-to-r from-gray-900/50 to-black/50 rounded-xl border border-gray-700/50 p-4">
              <div className="flex animate-scroll space-x-6">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex items-center space-x-3 bg-white/5 rounded-lg p-3 min-w-[200px]"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + (i % 26))}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        Player{i + 1}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Score: {(Math.random() * 1000 + 100).toFixed(0)}
                      </div>
                    </div>
                    <div className="text-green-400 text-xs">
                      {["🏆", "⚡", "💎", "🛡️"][Math.floor(Math.random() * 4)]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer Call to Action */}
        <section className="py-12 border-t border-gray-700/50">
          <div className="max-w-4xl mx-auto text-center px-3 sm:px-4 lg:px-6">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">
              Ready to Start Your Snake Gaming Journey?
            </h3>
            <p className="text-gray-300 mb-6">
              No downloads, no installations. Just pure gaming fun in your
              browser.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleStartGame}
                disabled={isLoading}
                className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <i className="ri-play-fill"></i>
                  )}
                  {isLoading ? "Loading..." : "Play Instantly"}
                </span>
              </button>

              <button
                onClick={() => navigate("/about")}
                className="group border border-gray-600 hover:bg-white/5 py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-gray-300 hover:text-white"
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-information-line group-hover:scale-110 transition-transform duration-300"></i>
                  Learn More
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

      <style>{`
        @keyframes snake-move {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.5; }
        }

        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-snake-move {
          animation: snake-move 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-marquee {
          animation: marquee 15s linear infinite;
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.6);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.8);
        }
      `}</style>
    </>
  );
};

export default HomePage;
