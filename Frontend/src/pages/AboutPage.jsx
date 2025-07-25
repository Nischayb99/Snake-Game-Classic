import React from "react";
import { useNavigate } from "react-router-dom";

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
        className={`${icon} text-sm sm:text-base group-hover:scale-110 transition-transform duration-300`}
      ></i>
      <span className="relative z-10">{text}</span>
    </a>
  );
};

const FeatureCard = ({ icon, title, description, color = "green" }) => {
  const colorClasses = {
    green:
      "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400 hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/50",
    purple:
      "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50",
    yellow:
      "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400 hover:from-yellow-500/30 hover:to-orange-500/30 hover:border-yellow-400/50",
  };

  return (
    <div
      className={`group bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 sm:p-6 hover:scale-105 transition-all duration-500 backdrop-blur-sm relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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

const TechBadge = ({ name, icon }) => (
  <div className="group flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 py-2.5 px-3 sm:px-4 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 text-xs sm:text-sm backdrop-blur-sm hover:scale-105 cursor-pointer">
    <i
      className={`${icon} text-sm sm:text-base group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
    ></i>
    <span className="group-hover:text-white transition-colors duration-300">
      {name}
    </span>
  </div>
);

const StatCard = ({ icon, value, title, description, color }) => {
  const colorClasses = {
    green:
      "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
    purple:
      "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  };

  return (
    <div
      className={`group bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 sm:p-6 hover:scale-105 transition-all duration-500 backdrop-blur-sm relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="text-2xl sm:text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
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

const AboutPage = () => {
  const navigate = useNavigate();

  const gameFeatures = [
    {
      icon: "ri-gamepad-line",
      title: "Classic Gameplay",
      description:
        "Experience the timeless snake game with modern controls and smooth animations",
      color: "green",
    },
    {
      icon: "ri-user-line",
      title: "User Accounts",
      description:
        "Create an account to save your high scores and track your progress",
      color: "blue",
    },
    {
      icon: "ri-trophy-line",
      title: "Achievements",
      description: "Unlock achievements as you play and improve your skills",
      color: "yellow",
    },
    {
      icon: "ri-bar-chart-line",
      title: "Statistics",
      description: "Detailed game statistics and performance tracking",
      color: "purple",
    },
  ];

  const techStack = [
    { name: "React", icon: "ri-reactjs-line" },
    { name: "Node.js", icon: "ri-nodejs-line" },
    { name: "MongoDB", icon: "ri-database-line" },
    { name: "Express", icon: "ri-server-line" },
    { name: "Tailwind CSS", icon: "ri-css3-line" },
    { name: "HTML5 Canvas", icon: "ri-brush-line" },
    { name: "JWT Auth", icon: "ri-shield-check-line" },
    { name: "Vite", icon: "ri-lightning-line" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 animate-bounce">
            🐍
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent px-4 animate-fade-in">
            Snake Game Reimagined
          </h1>
          <p
            className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            A modern take on the classic snake game with user accounts,
            achievements, leaderboards, and smooth gameplay. Built with
            cutting-edge web technologies for the best gaming experience.
          </p>
        </div>

        {/* Game Features */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 px-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Game Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {gameFeatures.map((feature, index) => (
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
            Ready to Play?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => navigate("/game")}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-semibold flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-500 shadow-lg hover:shadow-green-500/25 hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <i className="ri-play-fill text-sm sm:text-base group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
              <span className="relative z-10">Start Playing</span>
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-semibold flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-500 shadow-lg hover:shadow-blue-500/25 hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <i className="ri-user-add-line text-sm sm:text-base group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
              <span className="relative z-10">Create Account</span>
            </button>
          </div>
        </section>

        {/* Developer Section */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <div className="bg-[#202c33]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 text-center relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 relative z-10 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              About the Developer
            </h2>
            <div className="max-w-3xl mx-auto relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                N
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-green-400 group-hover:text-green-300 transition-colors duration-300">
                Nischay Bandodiya
              </h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base px-2 group-hover:text-gray-200 transition-colors duration-300">
                Full Stack Developer passionate about creating engaging web
                experiences. Specialized in modern JavaScript frameworks and
                backend technologies. This Snake Game project showcases
                full-stack development skills with React, Node.js, MongoDB, and
                modern web APIs.
              </p>
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

        {/* Tech Stack */}
        <section className="mb-10 sm:mb-12 lg:mb-16">
          <div className="bg-[#202c33]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden group hover:bg-[#202c33]/90 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 relative z-10 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Built With Modern Technologies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative z-10">
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
            <div className="mt-6 sm:mt-8 text-center relative z-10">
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed px-2 group-hover:text-gray-300 transition-colors duration-300">
                This project demonstrates modern web development practices
                including responsive design, user authentication, real-time
                updates, and database integration.
              </p>
            </div>
          </div>
        </section>

        {/* Game Stats */}
        <section className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 px-4 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            Game Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              value="∞"
              title="Endless Fun"
              description="No limits on gameplay"
              color="green"
            />
            <StatCard
              value="8+"
              title="Achievements"
              description="Unlock as you play"
              color="blue"
            />
            <StatCard
              value="100%"
              title="Free to Play"
              description="No hidden costs"
              color="purple"
            />
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-6 sm:pt-8 border-t border-gray-700/50">
          <p className="text-gray-400 text-xs sm:text-sm px-4 flex items-center justify-center gap-2">
            Made with
            <span className="text-red-500 animate-pulse text-base">❤️</span>
            by Nischay Bandodiya • {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style jsx>{`
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

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
