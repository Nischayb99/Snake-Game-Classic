import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Lobby = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, gameStats } = useAuth();
  const { showNotification } = useNotification();

  const [selectedMode, setSelectedMode] = useState("classic");
  const [selectedDifficulty, setSelectedDifficulty] = useState("normal");
  const [isStarting, setIsStarting] = useState(false);
  const [recentStats, setRecentStats] = useState(null);

  // Load recent stats
  useEffect(() => {
    if (isAuthenticated && gameStats) {
      setRecentStats(gameStats);
    }
  }, [isAuthenticated, gameStats]);

  // Game modes configuration
  const gameModes = [
    {
      id: "classic",
      name: "Classic",
      icon: "🐍",
      description: "Traditional snake game with modern enhancements",
      features: ["Power-ups", "Achievements", "Score tracking"],
      color: "green",
      recommended: true,
    },
    {
      id: "survival",
      name: "Survival",
      icon: "⏱️",
      description: "Survive as long as possible with increasing speed",
      features: ["Time-based", "Progressive difficulty", "Endurance challenge"],
      color: "orange",
      comingSoon: true,
    },
    {
      id: "blitz",
      name: "Blitz",
      icon: "⚡",
      description: "Fast-paced action with time limits",
      features: ["Quick rounds", "Score multipliers", "Time pressure"],
      color: "blue",
      comingSoon: true,
    },
  ];

  // Difficulty levels
  const difficultyLevels = [
    {
      id: "easy",
      name: "Easy",
      icon: "🌱",
      description: "Perfect for beginners",
      speed: "Slow",
      powerUps: "More frequent",
      color: "green",
    },
    {
      id: "normal",
      name: "Normal",
      icon: "⚖️",
      description: "Balanced gameplay experience",
      speed: "Medium",
      powerUps: "Balanced",
      color: "blue",
    },
    {
      id: "hard",
      name: "Hard",
      icon: "🔥",
      description: "Challenge for experienced players",
      speed: "Fast",
      powerUps: "Less frequent",
      color: "red",
    },
  ];

  const handleStartGame = async () => {
    try {
      setIsStarting(true);

      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to game with selected options
      const gameConfig = {
        mode: selectedMode,
        difficulty: selectedDifficulty,
        timestamp: Date.now(),
      };

      navigate("/game", {
        state: gameConfig,
      });

      showNotification("success", `Starting ${selectedMode} mode!`);
    } catch (error) {
      showNotification("error", "Failed to start game. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleQuickPlay = () => {
    setSelectedMode("classic");
    setSelectedDifficulty("normal");
    handleStartGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Floating snake emojis */}
        {[...Array(6)].map((_, i) => (
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
            🐍
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Game Lobby
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Choose your game mode and start playing!
          </p>

          {/* Quick Play Button */}
          <button
            onClick={handleQuickPlay}
            disabled={isStarting}
            className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 px-8 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 relative overflow-hidden mb-8 disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center gap-2">
              {isStarting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <i className="ri-play-fill text-xl"></i>
              )}
              {isStarting ? "Starting..." : "Quick Play"}
            </span>
          </button>
        </div>

        {/* User Stats (if logged in) */}
        {isAuthenticated && recentStats && (
          <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="ri-user-line text-green-400"></i>
              Welcome back, {user?.name}!
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">
                  {recentStats.highestScore || 0}
                </div>
                <div className="text-sm text-gray-400">Best Score</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">
                  {recentStats.totalGamesPlayed || 0}
                </div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">
                  {recentStats.winRate || 0}%
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.floor((recentStats.totalGamesPlayed || 0) / 10) + 1}
                </div>
                <div className="text-sm text-gray-400">Level</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Game Modes */}
          <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <i className="ri-gamepad-line text-green-400"></i>
              Game Modes
            </h2>

            <div className="space-y-4">
              {gameModes.map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => !mode.comingSoon && setSelectedMode(mode.id)}
                  className={`group p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    selectedMode === mode.id
                      ? `border-${mode.color}-500 bg-${mode.color}-500/10`
                      : mode.comingSoon
                      ? "border-gray-600 bg-gray-800/50 opacity-60 cursor-not-allowed"
                      : "border-gray-600 hover:border-gray-500 bg-gray-800/30"
                  }`}
                >
                  {mode.comingSoon && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      Coming Soon
                    </div>
                  )}

                  {mode.recommended && selectedMode === mode.id && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      Recommended
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{mode.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {mode.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {mode.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {mode.features.map((feature, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedMode === mode.id
                              ? `bg-${mode.color}-500/20 text-${mode.color}-300`
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Settings */}
          <div className="bg-[#202c33]/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <i className="ri-settings-line text-blue-400"></i>
              Difficulty
            </h2>

            <div className="space-y-4">
              {difficultyLevels.map((level) => (
                <div
                  key={level.id}
                  onClick={() => setSelectedDifficulty(level.id)}
                  className={`group p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    selectedDifficulty === level.id
                      ? `border-${level.color}-500 bg-${level.color}-500/10`
                      : "border-gray-600 hover:border-gray-500 bg-gray-800/30"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{level.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {level.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {level.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Speed: </span>
                        <span className={`text-${level.color}-400 font-medium`}>
                          {level.speed}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Power-ups: </span>
                        <span className={`text-${level.color}-400 font-medium`}>
                          {level.powerUps}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Game Preview */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
              <h4 className="font-semibold mb-3 text-white">Game Preview</h4>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-400">Mode: </span>
                  <span className="text-green-400 font-medium capitalize">
                    {selectedMode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Difficulty: </span>
                  <span className="text-blue-400 font-medium capitalize">
                    {selectedDifficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleStartGame}
            disabled={
              isStarting ||
              gameModes.find((m) => m.id === selectedMode)?.comingSoon
            }
            className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 py-4 px-12 rounded-full text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-emerald-500/25 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center gap-3">
              {isStarting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <i className="ri-play-fill text-2xl"></i>
              )}
              {isStarting
                ? "Starting Game..."
                : `Start ${
                    selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)
                  } Game`}
            </span>
          </button>

          <p className="text-gray-400 text-sm mt-4">
            {gameModes.find((m) => m.id === selectedMode)?.comingSoon
              ? "This mode is coming soon! Try Classic mode instead."
              : "Ready to play? Let's go!"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          <button
            onClick={() => navigate("/leaderboard")}
            className="group p-4 bg-[#202c33]/80 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105"
          >
            <i className="ri-trophy-line text-2xl text-yellow-400 mb-2 block group-hover:scale-110 transition-transform"></i>
            <div className="text-sm font-medium">Leaderboard</div>
            <div className="text-xs text-gray-400">View rankings</div>
          </button>

          <button
            onClick={() => navigate("/achievements")}
            className="group p-4 bg-[#202c33]/80 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105"
          >
            <i className="ri-medal-line text-2xl text-purple-400 mb-2 block group-hover:scale-110 transition-transform"></i>
            <div className="text-sm font-medium">Achievements</div>
            <div className="text-xs text-gray-400">Unlock rewards</div>
          </button>

          <button
            onClick={() => navigate(isAuthenticated ? "/friends" : "/signup")}
            className="group p-4 bg-[#202c33]/80 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105"
          >
            <i className="ri-group-line text-2xl text-blue-400 mb-2 block group-hover:scale-110 transition-transform"></i>
            <div className="text-sm font-medium">Friends</div>
            <div className="text-xs text-gray-400">
              {isAuthenticated ? "Manage friends" : "Join community"}
            </div>
          </button>

          <button
            onClick={() => navigate("/about")}
            className="group p-4 bg-[#202c33]/80 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105"
          >
            <i className="ri-information-line text-2xl text-green-400 mb-2 block group-hover:scale-110 transition-transform"></i>
            <div className="text-sm font-medium">About</div>
            <div className="text-xs text-gray-400">Learn more</div>
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.4;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Lobby;
