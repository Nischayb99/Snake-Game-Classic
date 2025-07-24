import React from "react";
import { useNavigate } from "react-router-dom";

const LinkButton = ({ href, icon, text, variant = "primary" }) => {
  const baseClasses =
    "w-full sm:w-52 justify-center py-3 px-6 rounded-full font-medium flex items-center gap-2 hover:-translate-y-1 transition-all duration-300 shadow-lg";
  const variants = {
    primary:
      "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-green-500/25",
    secondary:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-blue-500/25",
    github:
      "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white hover:shadow-gray-500/25",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${variants[variant]}`}
    >
      <i className={icon}></i> {text}
    </a>
  );
};

const FeatureCard = ({ icon, title, description, color = "green" }) => {
  const colorClasses = {
    green:
      "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
    purple:
      "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
    yellow:
      "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 hover:scale-105 transition-transform duration-300`}
    >
      <i className={`${icon} text-3xl mb-3 block`}></i>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
};

const TechBadge = ({ name, icon }) => (
  <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 py-2 px-4 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300">
    <i className={icon}></i>
    <span>{name}</span>
  </div>
);

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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">🐍</div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Snake Game Reimagined
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A modern take on the classic snake game with user accounts,
            achievements, leaderboards, and smooth gameplay. Built with
            cutting-edge web technologies for the best gaming experience.
          </p>
        </div>

        {/* Game Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Game Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/game")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 px-8 rounded-full text-lg font-semibold flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
            >
              <i className="ri-play-fill"></i>
              Start Playing
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-4 px-8 rounded-full text-lg font-semibold flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <i className="ri-user-add-line"></i>
              Create Account
            </button>
          </div>
        </section>

        {/* Developer Section */}
        <section className="mb-16">
          <div className="bg-[#202c33] border border-gray-700/50 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">About the Developer</h2>
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4 text-green-400">
                Nischay Bandodiya
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Full Stack Developer passionate about creating engaging web
                experiences. Specialized in modern JavaScript frameworks and
                backend technologies. This Snake Game project showcases
                full-stack development skills with React, Node.js, MongoDB, and
                modern web APIs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        <section className="mb-16">
          <div className="bg-[#202c33] border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">
              Built With Modern Technologies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {techStack.map((tech, index) => (
                <TechBadge key={index} {...tech} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                This project demonstrates modern web development practices
                including responsive design, user authentication, real-time
                updates, and database integration.
              </p>
            </div>
          </div>
        </section>

        {/* Game Stats */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8">Game Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
              <div className="text-white font-medium mb-1">Endless Fun</div>
              <div className="text-gray-400 text-sm">No limits on gameplay</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">8+</div>
              <div className="text-white font-medium mb-1">Achievements</div>
              <div className="text-gray-400 text-sm">Unlock as you play</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                100%
              </div>
              <div className="text-white font-medium mb-1">Free to Play</div>
              <div className="text-gray-400 text-sm">No hidden costs</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-700/50">
          <p className="text-gray-400">
            Made with ❤️ by Nischay Bandodiya • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
