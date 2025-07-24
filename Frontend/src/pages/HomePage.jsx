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
      <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Content */}
              <div className="text-center lg:text-left">
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                    🎮 Classic Arcade Experience
                  </span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                    Snake Game
                  </span>
                  <br />
                  <span className="text-white">Reimagined</span>
                </h1>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Experience the classic snake game with modern graphics and
                  smooth gameplay. Control the snake, eat food, grow longer, and
                  challenge yourself to beat your high score!
                </p>

                {/* User Greeting */}
                {isAuthenticated && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400">
                      👋 Welcome back,{" "}
                      <span className="font-semibold">{user?.name}</span>!
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <button
                    onClick={handleStartGame}
                    disabled={isLoading}
                    className="group relative bg-gradient-to-r from-emerald-500 to-green-600 py-4 px-8 rounded-full text-lg font-semibold flex items-center justify-center gap-3 shadow-2xl hover:shadow-green-500/25 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      {isLoading ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <i className="ri-play-fill text-xl"></i>
                      )}
                      {isLoading ? "Loading..." : "Start Playing"}
                    </div>
                  </button>

                  <button
                    onClick={handleHowToPlay}
                    className="group bg-transparent border-2 border-white/30 py-4 px-8 rounded-full text-lg font-semibold flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/50 hover:-translate-y-1 transition-all duration-300"
                  >
                    <i className="ri-question-line group-hover:rotate-12 transition-transform duration-300"></i>
                    How to Play
                  </button>
                </div>

                {/* CTA for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="text-center lg:text-left">
                    <p className="text-gray-400 mb-3">
                      Want to save your high scores?
                    </p>
                    <button
                      onClick={handleGetStarted}
                      className="text-green-400 hover:text-green-300 font-medium underline underline-offset-4 hover:underline-offset-8 transition-all duration-300"
                    >
                      Create Free Account →
                    </button>
                  </div>
                )}
              </div>

              {/* Visual Demo */}
              <div className="hidden lg:flex items-center justify-center h-96 relative">
                {/* Snake Animation */}
                <div className="relative">
                  <div className="flex items-center gap-2 animate-snake-move">
                    {/* Snake Head */}
                    <div className="w-12 h-12 rounded-lg shadow-2xl bg-gradient-to-r from-amber-400 to-orange-500 border-3 border-white flex items-center justify-center relative">
                      <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                      <div className="absolute top-2 right-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                    </div>
                    {/* Snake Body */}
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-lg shadow-lg bg-gradient-to-r from-emerald-500 to-green-600 border-2 border-green-400"
                        style={{
                          animationDelay: `${i * 100}ms`,
                          transform: `scale(${1 - i * 0.05})`,
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Food */}
                  <div className="absolute -right-20 top-1/2 transform -translate-y-1/2">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg relative">
                      <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30"></div>
                    </div>
                  </div>

                  {/* Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-green-400 rounded-full animate-float"
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
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {stats.totalPlayers.toLocaleString()}+
                </div>
                <div className="text-gray-300">Active Players</div>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {stats.gamesPlayed.toLocaleString()}+
                </div>
                <div className="text-gray-300">Games Played</div>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {stats.highestScore.toLocaleString()}
                </div>
                <div className="text-gray-300">Highest Score</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Why Choose Our Snake Game?
              </h2>
              <p className="text-xl text-gray-300">
                Modern features meet classic gameplay
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "ri-gamepad-line",
                  title: "Smooth Controls",
                  description:
                    "Responsive keyboard controls with smooth snake movement",
                },
                {
                  icon: "ri-trophy-line",
                  title: "Score Tracking",
                  description:
                    "Track your high scores and compete with other players",
                },
                {
                  icon: "ri-smartphone-line",
                  title: "Mobile Friendly",
                  description: "Play on any device with touch controls support",
                },
                {
                  icon: "ri-palette-line",
                  title: "Modern Design",
                  description: "Beautiful graphics and smooth animations",
                },
                {
                  icon: "ri-user-line",
                  title: "User Accounts",
                  description: "Save your progress and compete with friends",
                },
                {
                  icon: "ri-settings-line",
                  title: "Customizable",
                  description: "Adjust game settings to your preference",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
                >
                  <div className="mb-4">
                    <i
                      className={`${feature.icon} text-3xl text-green-400 group-hover:scale-110 transition-transform duration-300`}
                    ></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default HomePage;
