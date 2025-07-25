import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import HowToPlayModal from "../components/HowToPlayModal";
import LoadingSpinner from "../components/LoadingSpinner";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPlayers: 15420,
    gamesPlayed: 84592,
    highestScore: 9874,
  });

  // Animation states
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Entrance animation
    setIsVisible(true);
  }, []);

  const handleStartGame = async () => {
    try {
      setIsLoading(true);

      // Add some loading simulation for better UX
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

  const handleHowToPlay = () => {
    setModalOpen(true);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-5 sm:opacity-10">
            <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-green-500 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-20 h-20 sm:w-40 sm:h-40 bg-emerald-500 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64 bg-green-400 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-16 lg:py-20">
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="mb-4 sm:mb-6">
                  <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm font-medium border border-green-500/30 backdrop-blur-sm">
                    🎮 Classic Arcade Experience
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent block">
                    Snake Game
                  </span>
                  <span className="text-white">Reimagined</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
                  Experience the classic snake game with modern graphics and
                  smooth gameplay. Control the snake, eat food, grow longer, and
                  challenge yourself to beat your high score!
                </p>

                {/* User Greeting */}
                {isAuthenticated && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm mx-2 sm:mx-0">
                    <p className="text-green-400 text-sm sm:text-base">
                      👋 Welcome back,{" "}
                      <span className="font-semibold">{user?.name}</span>!
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
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
                        <i className="ri-play-fill text-lg sm:text-xl"></i>
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

                {/* CTA for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="text-center lg:text-left px-2 sm:px-0">
                    <p className="text-gray-400 mb-2 sm:mb-3 text-sm sm:text-base">
                      Want to save your high scores?
                    </p>
                    <button
                      onClick={handleGetStarted}
                      className="text-green-400 hover:text-green-300 font-medium underline underline-offset-4 hover:underline-offset-8 transition-all duration-300 text-sm sm:text-base"
                    >
                      Create Free Account →
                    </button>
                  </div>
                )}
              </div>

              {/* Visual Demo */}
              <div className="flex items-center justify-center h-48 sm:h-64 lg:h-96 relative order-1 lg:order-2">
                {/* Snake Animation */}
                <div className="relative scale-75 sm:scale-90 lg:scale-100">
                  <div className="flex items-center gap-1 sm:gap-2 animate-snake-move">
                    {/* Snake Head */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg shadow-2xl bg-gradient-to-r from-amber-400 to-orange-500 border-2 sm:border-3 border-white flex items-center justify-center relative">
                      <div className="absolute top-1 sm:top-1.5 lg:top-2 left-2 sm:left-2.5 lg:left-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="absolute top-1 sm:top-1.5 lg:top-2 right-2 sm:right-2.5 lg:right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                    </div>
                    {/* Snake Body */}
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

                  {/* Food */}
                  <div className="absolute -right-12 sm:-right-16 lg:-right-20 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg relative">
                      <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30"></div>
                    </div>
                  </div>

                  {/* Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-green-400 rounded-full animate-float"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Mobile Game Preview */}
                <div className="absolute inset-0 flex items-center justify-center lg:hidden">
                  <div className="text-4xl sm:text-6xl animate-bounce opacity-20">
                    🎮
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="group text-center p-6 sm:p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.totalPlayers.toLocaleString()}+
                </div>
                <div className="text-gray-300 text-sm sm:text-base">
                  Active Players
                </div>
              </div>

              <div className="group text-center p-6 sm:p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.gamesPlayed.toLocaleString()}+
                </div>
                <div className="text-gray-300 text-sm sm:text-base">
                  Games Played
                </div>
              </div>

              <div className="group text-center p-6 sm:p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 sm:col-span-1 col-span-1">
                <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.highestScore.toLocaleString()}
                </div>
                <div className="text-gray-300 text-sm sm:text-base">
                  Highest Score
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Choose Our Snake Game?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300">
                Modern features meet classic gameplay
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: "ri-gamepad-line",
                  title: "Smooth Controls",
                  description:
                    "Responsive keyboard controls with smooth snake movement",
                  color: "green",
                },
                {
                  icon: "ri-trophy-line",
                  title: "Score Tracking",
                  description:
                    "Track your high scores and compete with other players",
                  color: "yellow",
                },
                {
                  icon: "ri-smartphone-line",
                  title: "Mobile Friendly",
                  description: "Play on any device with touch controls support",
                  color: "blue",
                },
                {
                  icon: "ri-palette-line",
                  title: "Modern Design",
                  description: "Beautiful graphics and smooth animations",
                  color: "purple",
                },
                {
                  icon: "ri-user-line",
                  title: "User Accounts",
                  description: "Save your progress and compete with friends",
                  color: "cyan",
                },
                {
                  icon: "ri-settings-line",
                  title: "Customizable",
                  description: "Adjust game settings to your preference",
                  color: "orange",
                },
              ].map((feature, index) => {
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
                    } rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all duration-500 relative overflow-hidden`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="mb-3 sm:mb-4">
                        <i
                          className={`${feature.icon} text-2xl sm:text-3xl ${
                            colorClasses[feature.color].split(" ")[2]
                          } group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                        ></i>
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

        {/* Call to Action Section */}
        <section className="py-16 sm:py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 backdrop-blur-3xl"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-3 sm:px-4 lg:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Ready to Start Your Journey?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8">
              Join thousands of players and experience the most modern snake
              game ever created.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <button
                onClick={handleStartGame}
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <i className="ri-gamepad-line"></i>
                  Play Now
                </span>
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/signup")}
                  className="group bg-transparent border-2 border-white/30 hover:bg-white/10 hover:border-white/50 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-user-add-line group-hover:scale-110 transition-transform duration-300"></i>
                    Join Free
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

      <style jsx>{`
        @keyframes snake-move {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.5;
          }
        }

        .animate-snake-move {
          animation: snake-move 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default HomePage;
