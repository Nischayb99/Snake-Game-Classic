import React from "react";

const Instruction = ({ icon, title, text, color = "green" }) => {
  const colorClasses = {
    green:
      "text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500/15",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15",
    yellow:
      "text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15",
    red: "text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/15",
    purple:
      "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15",
  };

  return (
    <div
      className={`group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 mb-3 ${colorClasses[color]} border rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div
        className={`${
          colorClasses[color].split(" ")[0]
        } text-xl sm:text-2xl w-6 sm:w-8 text-center flex-shrink-0 mt-1 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}
      >
        <i className={icon}></i>
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
          {title}
        </h4>
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
};

const KeyBadge = ({ keys, description }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 p-2 sm:p-0">
    <div className="flex gap-1 justify-center sm:justify-start">
      {keys.map((key, index) => (
        <span
          key={index}
          className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs font-mono min-w-[24px] text-center transition-colors duration-200 border border-gray-600"
        >
          {key}
        </span>
      ))}
    </div>
    <span className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
      {description}
    </span>
  </div>
);

const AchievementPreview = ({ icon, name, description }) => (
  <div className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/15 transition-all duration-300 hover:scale-105 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="text-yellow-400 text-base sm:text-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
      {icon}
    </div>
    <div className="relative z-10 flex-1 min-w-0">
      <div className="text-white font-medium text-xs sm:text-sm truncate">
        {name}
      </div>
      <div className="text-gray-400 text-xs truncate">{description}</div>
    </div>
  </div>
);

const HowToPlayModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#202c33]/95 backdrop-blur-md border border-gray-700/50 rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#202c33]/95 backdrop-blur-md border-b border-gray-700/50 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-2xl sm:text-3xl animate-bounce">🐍</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                How to Play Snake Game
              </h3>
            </div>
            <button
              onClick={onClose}
              className="group text-gray-400 hover:text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
            >
              <i className="ri-close-line text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300"></i>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Basic Controls */}
          <section>
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <i className="ri-gamepad-line text-green-400 group-hover:scale-110 transition-transform duration-300"></i>
              Basic Controls
            </h4>
            <div className="bg-[#2a3942]/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
              <KeyBadge
                keys={["↑", "↓", "←", "→"]}
                description="Arrow keys to control snake direction"
              />
              <KeyBadge
                keys={["W", "A", "S", "D"]}
                description="Alternative movement keys"
              />
              <KeyBadge keys={["SPACE"]} description="Pause/Resume game" />
            </div>
          </section>

          {/* Game Rules */}
          <section>
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <i className="ri-book-line text-blue-400"></i>
              Game Rules
            </h4>
            <Instruction
              icon="ri-restaurant-line"
              title="Eat Food"
              text="Guide the snake to eat the red food. Each food increases your score by 10 points and makes the snake grow longer."
              color="green"
            />
            <Instruction
              icon="ri-skull-line"
              title="Avoid Collisions"
              text="Don't hit the walls or the snake's own body. The game ends immediately if you do!"
              color="red"
            />
            <Instruction
              icon="ri-speed-line"
              title="Increasing Speed"
              text="The snake gets faster every 50 points! Stay alert as the game becomes more challenging."
              color="yellow"
            />
            <Instruction
              icon="ri-trophy-line"
              title="Score & Length"
              text="Your score and snake length are tracked. Try to beat your personal best and climb the leaderboard!"
              color="purple"
            />
          </section>

          {/* Tips & Strategies */}
          <section>
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <i className="ri-lightbulb-line text-yellow-400"></i>
              Pro Tips
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                {
                  icon: "💡",
                  title: "Plan Ahead",
                  description:
                    "Think about your next few moves, especially as the snake gets longer.",
                  color: "green",
                },
                {
                  icon: "🎯",
                  title: "Use Walls",
                  description:
                    "Navigate along walls to create safe paths and avoid trapping yourself.",
                  color: "blue",
                },
                {
                  icon: "⚡",
                  title: "Stay Calm",
                  description:
                    "Don't panic when speed increases. Take your time to make calculated moves.",
                  color: "purple",
                },
                {
                  icon: "🔄",
                  title: "Practice",
                  description:
                    "The more you play, the better you'll get at predicting snake movement.",
                  color: "yellow",
                },
              ].map((tip, index) => (
                <div
                  key={index}
                  className="group bg-[#2a3942]/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h5 className="text-green-400 font-medium mb-2 text-sm sm:text-base flex items-center gap-2 relative z-10">
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      {tip.icon}
                    </span>
                    {tip.title}
                  </h5>
                  <p className="text-gray-300 text-xs sm:text-sm relative z-10">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Mobile Controls */}
          <section>
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <i className="ri-smartphone-line text-blue-400"></i>
              Mobile Controls
            </h4>
            <div className="bg-[#2a3942]/50 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-600/30">
              <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 text-center sm:text-left">
                On mobile devices, use the directional buttons that appear below
                the game area:
              </p>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-2 w-24 sm:w-32">
                  <div></div>
                  <div className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-center text-white text-xs transition-colors duration-200 border border-gray-600">
                    ↑
                  </div>
                  <div></div>
                  <div className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-center text-white text-xs transition-colors duration-200 border border-gray-600">
                    ←
                  </div>
                  <div className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-center text-white text-xs transition-colors duration-200 border border-gray-600">
                    ↓
                  </div>
                  <div className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-center text-white text-xs transition-colors duration-200 border border-gray-600">
                    →
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Achievements Preview */}
          <section>
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <i className="ri-medal-line text-yellow-400"></i>
              Achievement Examples
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AchievementPreview
                icon="🏆"
                name="First Game"
                description="Play your first game"
              />
              <AchievementPreview
                icon="🎯"
                name="Score Hunter"
                description="Score 100 points"
              />
              <AchievementPreview
                icon="🐍"
                name="Long Snake"
                description="Grow snake to 20 segments"
              />
              <AchievementPreview
                icon="🔥"
                name="Veteran"
                description="Play 50 games"
              />
            </div>
          </section>

          {/* Account Benefits */}
          <section className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 sm:p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 relative z-10">
              <i className="ri-user-star-line text-green-400"></i>
              Create Account for More Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm relative z-10">
              <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200">
                <i className="ri-save-line text-green-400"></i>
                Save your high scores
              </div>
              <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200">
                <i className="ri-trophy-line text-green-400"></i>
                Unlock achievements
              </div>
              <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200">
                <i className="ri-bar-chart-line text-green-400"></i>
                Track detailed statistics
              </div>
              <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200">
                <i className="ri-medal-line text-green-400"></i>
                Compete on leaderboards
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#202c33]/95 backdrop-blur-md border-t border-gray-700/50 p-4 sm:p-6 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onClose}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-105 relative overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <i className="ri-play-fill group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
              <span className="relative z-10">Start Playing Now</span>
            </button>
            <button
              onClick={onClose}
              className="group bg-gray-700/80 hover:bg-gray-600 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-white font-medium transition-all duration-300 border border-gray-600/50 hover:border-gray-500 backdrop-blur-sm hover:scale-105 relative overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
