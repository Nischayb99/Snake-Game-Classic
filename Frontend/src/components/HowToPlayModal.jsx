import React from "react";

const Instruction = ({ icon, title, text, color = "green" }) => {
  const colorClasses = {
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div
      className={`flex items-start gap-4 p-4 mb-3 ${colorClasses[color]} border rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg`}
    >
      <div
        className={`${
          colorClasses[color].split(" ")[0]
        } text-2xl w-8 text-center flex-shrink-0 mt-1`}
      >
        <i className={icon}></i>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-1">{title}</h4>
        <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

const KeyBadge = ({ keys, description }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <span
          key={index}
          className="inline-block bg-gray-700 text-white px-2 py-1 rounded text-xs font-mono min-w-[24px] text-center"
        >
          {key}
        </span>
      ))}
    </div>
    <span className="text-gray-300 text-sm">{description}</span>
  </div>
);

const AchievementPreview = ({ icon, name, description }) => (
  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
    <div className="text-yellow-400 text-lg">{icon}</div>
    <div>
      <div className="text-white font-medium text-sm">{name}</div>
      <div className="text-gray-400 text-xs">{description}</div>
    </div>
  </div>
);

const HowToPlayModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#202c33] border border-gray-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#202c33] border-b border-gray-700/50 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🐍</div>
              <h3 className="text-2xl font-bold text-white">
                How to Play Snake Game
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white w-10 h-10 rounded-full hover:bg-gray-700/50 transition-colors flex items-center justify-center"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Controls */}
          <section>
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <i className="ri-gamepad-line text-green-400"></i>
              Basic Controls
            </h4>
            <div className="space-y-2 mb-4">
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
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
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
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <i className="ri-lightbulb-line text-yellow-400"></i>
              Pro Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#2a3942] p-4 rounded-lg border border-gray-600/30">
                <h5 className="text-green-400 font-medium mb-2">
                  💡 Plan Ahead
                </h5>
                <p className="text-gray-300 text-sm">
                  Think about your next few moves, especially as the snake gets
                  longer.
                </p>
              </div>
              <div className="bg-[#2a3942] p-4 rounded-lg border border-gray-600/30">
                <h5 className="text-blue-400 font-medium mb-2">🎯 Use Walls</h5>
                <p className="text-gray-300 text-sm">
                  Navigate along walls to create safe paths and avoid trapping
                  yourself.
                </p>
              </div>
              <div className="bg-[#2a3942] p-4 rounded-lg border border-gray-600/30">
                <h5 className="text-purple-400 font-medium mb-2">
                  ⚡ Stay Calm
                </h5>
                <p className="text-gray-300 text-sm">
                  Don't panic when speed increases. Take your time to make
                  calculated moves.
                </p>
              </div>
              <div className="bg-[#2a3942] p-4 rounded-lg border border-gray-600/30">
                <h5 className="text-yellow-400 font-medium mb-2">
                  🔄 Practice
                </h5>
                <p className="text-gray-300 text-sm">
                  The more you play, the better you'll get at predicting snake
                  movement.
                </p>
              </div>
            </div>
          </section>

          {/* Mobile Controls */}
          <section>
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <i className="ri-smartphone-line text-blue-400"></i>
              Mobile Controls
            </h4>
            <div className="bg-[#2a3942] p-4 rounded-lg border border-gray-600/30">
              <p className="text-gray-300 text-sm mb-3">
                On mobile devices, use the directional buttons that appear below
                the game area:
              </p>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-2 w-32">
                  <div></div>
                  <div className="bg-gray-700 p-2 rounded text-center text-white text-xs">
                    ↑
                  </div>
                  <div></div>
                  <div className="bg-gray-700 p-2 rounded text-center text-white text-xs">
                    ←
                  </div>
                  <div className="bg-gray-700 p-2 rounded text-center text-white text-xs">
                    ↓
                  </div>
                  <div className="bg-gray-700 p-2 rounded text-center text-white text-xs">
                    →
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Achievements Preview */}
          <section>
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <i className="ri-medal-line text-yellow-400"></i>
              Achievement Examples
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          <section className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <i className="ri-user-star-line text-green-400"></i>
              Create Account for More Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <i className="ri-save-line text-green-400"></i>
                Save your high scores
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <i className="ri-trophy-line text-green-400"></i>
                Unlock achievements
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <i className="ri-bar-chart-line text-green-400"></i>
                Track detailed statistics
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <i className="ri-medal-line text-green-400"></i>
                Compete on leaderboards
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#202c33] border-t border-gray-700/50 p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="ri-play-fill"></i>
              Start Playing Now
            </button>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 py-3 px-6 rounded-lg text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
