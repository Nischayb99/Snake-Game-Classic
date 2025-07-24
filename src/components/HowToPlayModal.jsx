import React from "react";

const Instruction = ({ icon, text }) => (
  <div className="flex items-center gap-4 p-4 mb-2 bg-black/5 rounded-xl transition-transform hover:translate-x-1">
    <i className={`${icon} text-2xl text-[#667eea] w-8 text-center`}></i>
    <span>{text}</span>
  </div>
);

const HowToPlayModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-11/12 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10">
          <h3 className="text-2xl font-semibold">How to Play</h3>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 w-10 h-10 rounded-full hover:bg-black/10"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div>
          <Instruction
            icon="ri-arrow-up-down-line"
            text="Use Arrow Keys (↑↓←→) or WASD to control the snake"
          />
          <Instruction
            icon="ri-smartphone-line"
            text="On mobile: Use the directional buttons"
          />
          <Instruction
            icon="ri-pause-line"
            text="Press SPACEBAR or the Pause button to pause/unpause"
          />
          <Instruction
            icon="ri-restaurant-line"
            text="Eat red food to grow and score points"
          />
          <Instruction
            icon="ri-skull-line"
            text="Avoid hitting walls or the snake's own body"
          />
          <Instruction
            icon="ri-trophy-line"
            text="Try to beat your high score!"
          />
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
