import React, { useState } from "react";
import HowToPlayModal from "../components/HowToPlayModal";

const HomePage = ({ navigateTo }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-center md:text-left">
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold leading-tight hero-title mb-4">
              Classic Snake Game
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Control the snake, eat food, and grow longer. How long can you
              survive?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigateTo("game")}
                className="w-full sm:w-auto justify-center bg-gradient-to-r from-emerald-500 to-green-600 py-4 px-8 rounded-full text-lg font-semibold flex items-center gap-2 shadow-play-btn hover:shadow-play-btn-hover hover:-translate-y-1 transition-all"
              >
                <i className="ri-play-fill"></i> Start Playing
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto justify-center bg-transparent border-2 border-white/30 py-4 px-8 rounded-full text-lg font-semibold flex items-center gap-2 hover:bg-white/10 hover:-translate-y-1 transition-all"
              >
                <i className="ri-question-line"></i> How to Play
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center h-72 relative">
            <div className="flex items-center gap-1.5 animate-float">
              <div className="w-8 h-8 rounded-lg shadow-lg bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-lg shadow-lg bg-gradient-to-r from-emerald-500 to-green-600"></div>
              <div className="w-8 h-8 rounded-lg shadow-lg bg-gradient-to-r from-emerald-500 to-green-600"></div>
            </div>
            <div className="absolute right-5 top-1/2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
          </div>
        </div>
      </main>
      <HowToPlayModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default HomePage;
