import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const LinkButton = ({ href, icon, text, variant = "primary" }) => {
  const baseClasses =
    "group w-full sm:w-auto justify-center py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-medium flex items-center gap-2 hover:-translate-y-1 transition-all duration-500 shadow-lg text-sm sm:text-base relative overflow-hidden";
  const variants = {
    primary:
      "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-green-500/25 hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-blue-500/25 hover:shadow-xl",
    github:
      "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white hover:shadow-gray-500/25 hover:shadow-xl",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${variants[variant]}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <i
        className={`${icon} text-sm sm:text-base group-hover:scale-110 transition-transform duration-300 relative z-10`}
      ></i>
      <span className="relative z-10">{text}</span>
    </a>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  color = "green",
  badge = null,
  isNew = false,
}) => {
  const colorClasses = {
    green:
      "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400 hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/50",
    purple:
      "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50",
    yellow:
      "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400 hover:from-yellow-500/30 hover:to-orange-500/30 hover:border-yellow-400/50",
    orange:
      "from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-400/50",
    cyan: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/50",
  };

  return (
    <div
      className={`group bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 sm:p-6 hover:scale-105 transition-all duration-500 backdrop-blur-sm relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {isNew && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
          NEW
        </div>
      )}

      {badge && (
        <div className="absolute top-2 right-2 bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/30">
          {badge}
        </div>
      )}

      <i
        className={`${icon} text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}
      ></i>

      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 relative z-10 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>

      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed relative z-10 group-hover:text-gray-200 transition-colors duration-300">
        {description}
      </p>
    </div>
  );
};

const PowerUpCard = ({ icon, name, description, color }) => (
  <div
    className={`group bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 border border-${color}-500/30 rounded-lg p-4 hover:scale-105 transition-all duration-300 relative overflow-hidden`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="text-center relative z-10">
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className={`text-${color}-400 font-semibold text-sm mb-1`}>{name}</h4>
      <p className="text-gray-400 text-xs">{description}</p>
    </div>
  </div>
);

const TechBadge = ({ name, icon, level = "Expert" }) => (
  <div className="group flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 py-2.5 px-3 sm:px-4 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 text-xs sm:text-sm backdrop-blur-sm hover:scale-105 cursor-pointer relative">
    <i
      className={`${icon} text-sm sm:text-base group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
    ></i>
    <span className="group-hover:text-white transition-colors duration-300">
      {name}
    </span>
    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-1">
      {level}
    </span>
  </div>
);

const StatCard = ({
  icon,
  value,
  title,
  description,
  color,
  animate = false,
}) => {
  const colorClasses = {
    green:
      "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
    purple:
      "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
    yellow:
      "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400",
    orange:
      "from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400",
  };

  return (
    <div
      className={`group bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 sm:p-6 hover:scale-105 transition-all duration-500 backdrop-blur-sm relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div
          className={`text-2xl sm:text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 inline-block ${
            animate ? "animate-pulse" : ""
          }`}
        >
          {icon || value}
        </div>
        <div className="text-white font-medium mb-1 text-sm sm:text-base group-hover:text-white transition-colors duration-300">
          {title}
        </div>
        <div className="text-gray-400 text-xs sm:text-sm group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </div>
      </div>
    </div>
  );
};

const AchievementShowcase = () => {
  const achievements = [
    { tier: "Bronze", icon: "🥉", count: 8, color: "orange" },
    { tier: "Silver", icon: "🥈", count: 6, color: "gray" },
    { tier: "Gold", icon: "🥇", count: 4, color: "yellow" },
    { tier: "Platinum", icon: "💎", count: 2, color: "blue" },
    { tier: "Diamond", icon: "💠", count: 1, color: "cyan" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {achievements.map((achievement, index) => (
        <div key={index} className="text-center group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
            {achievement.icon}
          </div>
          <div
            className={`text-${achievement.color}-400 font-bold text-lg mb-1`}
          >
            {achievement.count}
          </div>
          <div className="text-gray-400 text-xs">{achievement.tier}</div>
        </div>
      ))}
    </div>
  );
};

const AboutPage = () => {
  const navigate = useNavigate();
  const [gameStats, setGameStats] = useState({
    totalPlayers: 1250,
    gamesPlayed: 15420,
    achievementsUnlocked: 8930,
    loading: true,
  });

  useEffect(() => {
    // Simulate loading real stats (would come from API)
    const timer = setTimeout(() => {
      setGameStats((prev) => ({ ...prev, loading: false }));
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const coreFeatures = [
    {
      icon: "ri-gamepad-line",
      title: "Enhanced Gameplay",
      description:
        "Classic snake mechanics with modern power-ups, multiple lives, and dynamic difficulty scaling",
      color: "green",
    },
    {
      icon: "ri-user-line",
      title: "User Accounts & Profiles",
      description:
        "Secure authentication, detailed profiles, and persistent game progress tracking",
      color: "blue",
    },
    {
      icon: "ri-trophy-line",
      title: "Achievement System",
      description:
        "25+ achievements across 6 categories with Bronze to Diamond tiers and point rewards",
      color: "yellow",
      badge: "25+ Unlockable",
    },
    {
      icon: "ri-bar-chart-line",
      title: "Advanced Analytics",
      description:
        "Comprehensive statistics tracking with device performance, efficiency metrics, and play patterns",
      color: "purple",
    },
    {
      icon: "ri-group-line",
      title: "Social Features",
      description:
        "Friend system, activity feeds, mutual friends, and social achievements",
      color: "cyan",
      isNew: true,
    },
    {
      icon: "ri-award-line",
      title: "Global Leaderboards",
      description:
        "Multiple leaderboard categories with real-time ranking and percentile positioning",
      color: "orange",
    },
  ];

  const powerUps = [
    {
      icon: "⚡",
      name: "Speed Boost",
      description: "Temporary speed increase",
      color: "yellow",
    },
    {
      icon: "💎",
      name: "Double Points",
      description: "2x score multiplier",
      color: "blue",
    },
    {
      icon: "🛡️",
      name: "Invincible",
      description: "Pass through obstacles",
      color: "green",
    },
    {
      icon: "❤️",
      name: "Extra Life",
      description: "Survive one collision",
      color: "red",
    },
  ];

  const advancedFeatures = [
    {
      icon: "ri-device-line",
      title: "Cross-Platform",
      description:
        "Optimized for desktop, tablet, and mobile with device-specific analytics",
      color: "blue",
    },
    {
      icon: "ri-flashlight-line",
      title: "Power-Up System",
      description:
        "4 unique power-ups with strategic gameplay elements and usage tracking",
      color: "orange",
    },
    {
      icon: "ri-timer-line",
      title: "Session Analytics",
      description:
        "Track longest sessions, games per session, and play consistency metrics",
      color: "purple",
    },
    {
      icon: "ri-star-line",
      title: "Skill Progression",
      description:
        "Level system, efficiency ratings, and personalized improvement recommendations",
      color: "green",
    },
  ];

  const techStack = [
    { name: "React 18", icon: "ri-reactjs-line", level: "Expert" },
    { name: "Node.js", icon: "ri-nodejs-line", level: "Expert" },
    { name: "MongoDB", icon: "ri-database-line", level: "Advanced" },
    { name: "Express.js", icon: "ri-server-line", level: "Expert" },
    { name: "Tailwind CSS", icon: "ri-css3-line", level: "Expert" },
    { name: "HTML5 Canvas", icon: "ri-brush-line", level: "Advanced" },
    { name: "JWT Auth", icon: "ri-shield-check-line", level: "Advanced" },
    { name: "Vite", icon: "ri-lightning-line", level: "Intermediate" },
    { name: "Mongoose", icon: "ri-database-2-line", level: "Advanced" },
    { name: "Passport.js", icon: "ri-passport-line", level: "Intermediate" },
    { name: "Google OAuth", icon: "ri-google-line", level: "Intermediate" },
    { name: "Real-time APIs", icon: "ri-wifi-line", level: "Advanced" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white relative overflow-x-hidden">
      <Helmet>
        <title>About | Snake Game Ultimate Edition</title>
        <meta
          name="description"
          content="Learn more about Snake Game Ultimate Edition."
        />
      </Helmet>
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating snake emojis */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          >
            🐍
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 animate-bounce">
            🐍✨
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent px-4 animate-fade-in">
            Snake Game: Ultimate Edition
          </h1>
          <p
            className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4 opacity-0 animate-fade-in-up mb-6"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            The most advanced Snake game ever built. Featuring comprehensive
            user accounts, 25+ achievements, social features, advanced
            analytics, power-ups, and cross-platform optimization. Built with
            cutting-edge web technologies for the ultimate gaming experience.
          </p>

          {/* Live Stats Ticker */}
          <div
            className="flex flex-wrap justify-center gap-4 mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <div className="bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 text-sm">
              <span className="text-green-400 font-bold">
                {gameStats.loading
                  ? "..."
                  : gameStats.totalPlayers.toLocaleString()}
              </span>
              <span className="text-gray-300 ml-1">Players</span>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 text-sm">
              <span className="text-blue-400 font-bold">
                {gameStats.loading
                  ? "..."
                  : gameStats.gamesPlayed.toLocaleString()}
              </span>
              <span className="text-gray-300 ml-1">Games Played</span>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-2 text-sm">
              <span className="text-yellow-400 font-bold">
                {gameStats.loading
                  ? "..."
                  : gameStats.achievementsUnlocked.toLocaleString()}
              </span>
              <span className="text-gray-300 ml-1">Achievements Unlocked</span>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 px-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Core Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${0.1 * (index + 1)}s`,
                  animationFillMode: "forwards",
                }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </section>

        {/* Power-ups Showcase */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <div className="bg-[#202c33]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent relative z-10">
              Strategic Power-up System
            </h2>

            <p className="text-gray-300 text-center mb-8 max-w-3xl mx-auto relative z-10">
              Collect and strategically use power-ups to enhance your gameplay.
              Each power-up offers unique advantages and can be combined for
              maximum effectiveness.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {powerUps.map((powerUp, index) => (
                <PowerUpCard key={index} {...powerUp} />
              ))}
            </div>
          </div>
        </section>

        {/* Achievement System Showcase */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <div className="bg-[#202c33]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent relative z-10">
              Comprehensive Achievement System
            </h2>

            <p className="text-gray-300 text-center mb-8 max-w-3xl mx-auto relative z-10">
              Unlock 25+ achievements across 6 categories. From Bronze to
              Diamond tiers, each achievement awards points and tracks your
              gaming journey.
            </p>

            <div className="relative z-10">
              <AchievementShowcase />
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 text-center text-sm relative z-10">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-400 font-bold text-lg mb-1">6</div>
                <div className="text-gray-300">Categories</div>
                <div className="text-xs text-gray-400 mt-1">
                  Skill, Social, Persistence
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-purple-400 font-bold text-lg mb-1">5</div>
                <div className="text-gray-300">Tiers</div>
                <div className="text-xs text-gray-400 mt-1">
                  Bronze to Diamond
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 col-span-2 md:col-span-1">
                <div className="text-green-400 font-bold text-lg mb-1">
                  1,000+
                </div>
                <div className="text-gray-300">Total Points</div>
                <div className="text-xs text-gray-400 mt-1">
                  Achievement rewards
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Advanced Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {advancedFeatures.map((feature, index) => (
              <div
                key={index}
                className="opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${0.1 * (index + 1)}s`,
                  animationFillMode: "forwards",
                }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-10 sm:mb-12 lg:mb-16 text-center px-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Ready to Experience the Ultimate Snake Game?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of players worldwide and discover why this is the
            most advanced Snake game ever created.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => navigate("/game")}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-semibold flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-500 shadow-lg hover:shadow-green-500/25 hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <i className="ri-play-fill text-sm sm:text-base group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
              <span className="relative z-10">Play Now - Free</span>
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-semibold flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-500 shadow-lg hover:shadow-blue-500/25 hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <i className="ri-user-add-line text-sm sm:text-base group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
              <span className="relative z-10">Join Community</span>
            </button>
          </div>
        </section>

        {/* Developer Section */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <div className="bg-[#202c33]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 text-center relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 relative z-10 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Meet the Developer
            </h2>

            <div className="max-w-4xl mx-auto relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                N
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-green-400 group-hover:text-green-300 transition-colors duration-300">
                Nischay Bandodiya
              </h3>

              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base px-2 group-hover:text-gray-200 transition-colors duration-300">
                Full Stack Developer passionate about creating engaging,
                high-performance web experiences. Specialized in modern
                JavaScript frameworks, backend architecture, and game
                development. This Snake Game project represents 6+ months of
                development, showcasing advanced full-stack capabilities
                including real-time systems, database optimization, and modern
                UI/UX design.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-400 font-bold text-lg mb-1">3+</div>
                  <div className="text-white text-sm mb-1">
                    Years Experience
                  </div>
                  <div className="text-gray-400 text-xs">
                    Full Stack Development
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-400 font-bold text-lg mb-1">
                    15+
                  </div>
                  <div className="text-white text-sm mb-1">Technologies</div>
                  <div className="text-gray-400 text-xs">Modern Web Stack</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-purple-400 font-bold text-lg mb-1">
                    100%
                  </div>
                  <div className="text-white text-sm mb-1">Passion Driven</div>
                  <div className="text-gray-400 text-xs">Quality Focused</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto">
                <LinkButton
                  href="https://nischay-bandodiya-portfolio.vercel.app"
                  icon="ri-global-line"
                  text="Portfolio"
                  variant="primary"
                />
                <LinkButton
                  href="https://github.com/Nischayb99"
                  icon="ri-github-line"
                  text="GitHub"
                  variant="github"
                />
                <LinkButton
                  href="https://www.linkedin.com/in/nischaybandodiya"
                  icon="ri-linkedin-line"
                  text="LinkedIn"
                  variant="secondary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Tech Stack */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <div className="bg-[#202c33]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 relative z-10 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Built With Modern Technologies
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-8 relative z-10">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className="opacity-0 animate-fade-in-up"
                  style={{
                    animationDelay: `${0.05 * (index + 1)}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <TechBadge {...tech} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <i className="ri-code-line text-green-400"></i>
                  Frontend Excellence
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-green-400"></i>
                    React 18 with modern hooks and context API
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-green-400"></i>
                    HTML5 Canvas for smooth 60fps gameplay
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-green-400"></i>
                    Tailwind CSS for responsive design
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-green-400"></i>
                    Advanced animations and transitions
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-green-400"></i>
                    Cross-platform optimization
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <i className="ri-server-line text-blue-400"></i>
                  Backend Power
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    Node.js with Express.js framework
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    MongoDB with Mongoose ODM
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    JWT authentication & Google OAuth
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    RESTful API design
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    Advanced caching & optimization
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700/50 text-center relative z-10">
              <p className="text-gray-400 text-sm leading-relaxed px-2 group-hover:text-gray-300 transition-colors duration-300">
                This project demonstrates modern web development practices
                including microservice architecture, real-time data processing,
                advanced state management, performance optimization, and
                scalable database design.
              </p>
            </div>
          </div>
        </section>

        {/* Game Statistics */}
        <section className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 px-4 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            Live Game Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <StatCard
              value={
                gameStats.loading
                  ? "..."
                  : gameStats.totalPlayers.toLocaleString()
              }
              title="Active Players"
              description="Registered users"
              color="green"
              animate={gameStats.loading}
            />
            <StatCard
              value={
                gameStats.loading
                  ? "..."
                  : gameStats.gamesPlayed.toLocaleString()
              }
              title="Games Played"
              description="Total sessions"
              color="blue"
              animate={gameStats.loading}
            />
            <StatCard
              value="25+"
              title="Achievements"
              description="Unlockable rewards"
              color="yellow"
            />
            <StatCard
              value="4"
              title="Power-ups"
              description="Strategic elements"
              color="orange"
            />
            <StatCard
              value="100%"
              title="Free to Play"
              description="No hidden costs"
              color="purple"
            />
          </div>
        </section>

        {/* Game Modes & Features Preview */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 text-indigo-300">
              Coming Soon: Enhanced Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg">
                <i className="ri-calendar-line text-3xl text-blue-400 mb-3 block"></i>
                <h3 className="text-blue-300 font-semibold mb-2">
                  Daily Challenges
                </h3>
                <p className="text-gray-400 text-sm">
                  Complete daily objectives for bonus rewards and exclusive
                  achievements
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                <i className="ri-sword-line text-3xl text-purple-400 mb-3 block"></i>
                <h3 className="text-purple-300 font-semibold mb-2">
                  Tournament Mode
                </h3>
                <p className="text-gray-400 text-sm">
                  Compete in scheduled tournaments with leaderboard prizes
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                <i className="ri-team-line text-3xl text-green-400 mb-3 block"></i>
                <h3 className="text-green-300 font-semibold mb-2">
                  Multiplayer
                </h3>
                <p className="text-gray-400 text-sm">
                  Real-time multiplayer battles with friends and global players
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-indigo-300 font-medium mb-4">
                Stay tuned for these exciting updates!
              </p>
              <button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                Get Notified When Released
              </button>
            </div>
          </div>
        </section>

        {/* Community & Social */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Join the Community
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#202c33]/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:scale-105 transition-all duration-500">
              <i className="ri-group-line text-4xl text-blue-400 mb-4 block"></i>
              <h3 className="text-lg font-semibold text-white mb-3">
                Connect with Players
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Add friends, compare scores, and see who's playing. Build your
                gaming network and compete together.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                  Friend System
                </span>
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                  Activity Feed
                </span>
              </div>
            </div>

            <div className="bg-[#202c33]/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:scale-105 transition-all duration-500">
              <i className="ri-trophy-line text-4xl text-yellow-400 mb-4 block"></i>
              <h3 className="text-lg font-semibold text-white mb-3">
                Global Competition
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Climb the global leaderboards, track your rank, and compete with
                the best players worldwide.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                  Leaderboards
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                  Rankings
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Performance & Optimization */}
        <section className="mb-10 sm:mb-12">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 text-emerald-300">
              Performance & Optimization
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  60 FPS
                </div>
                <div className="text-white font-medium mb-1">
                  Smooth Gameplay
                </div>
                <div className="text-gray-400 text-sm">
                  Optimized for all devices
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  &lt;2s
                </div>
                <div className="text-white font-medium mb-1">Load Time</div>
                <div className="text-gray-400 text-sm">
                  Fast initial loading
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  100%
                </div>
                <div className="text-white font-medium mb-1">Responsive</div>
                <div className="text-gray-400 text-sm">All screen sizes</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="text-emerald-300 font-semibold mb-3">
                  Optimization Features:
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400"></i>
                    Advanced caching strategies
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400"></i>
                    Efficient memory management
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400"></i>
                    Device-specific optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400"></i>
                    Progressive loading
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-300 font-semibold mb-3">
                  Technical Excellence:
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    Real-time performance monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    Optimized API calls
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    Efficient state management
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-blue-400"></i>
                    Scalable architecture
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-6 sm:pt-8 border-t border-gray-700/50">
          <div className="mb-4">
            <p className="text-gray-400 text-xs sm:text-sm px-4 flex items-center justify-center gap-2 mb-2">
              Made with
              <span className="text-red-500 animate-pulse text-base">❤️</span>
              by Nischay Bandodiya • {new Date().getFullYear()}
            </p>
            <p className="text-gray-500 text-xs">
              Snake Game Ultimate Edition v2.0 • Built for the future of web
              gaming
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <button
              onClick={() => navigate("/privacy")}
              className="hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="hover:text-gray-300 transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => navigate("/changelog")}
              className="hover:text-gray-300 transition-colors"
            >
              Changelog
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.4;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
