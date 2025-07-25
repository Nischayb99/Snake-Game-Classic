import React, { useState, useEffect } from "react";

const SplashScreen = ({ onComplete }) => {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(0.8);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth entrance animation
    const entranceTimeout = setTimeout(() => {
      setScale(1);
    }, 100);

    // Progress animation - smooth and consistent
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3.33; // 100% in exactly 3 seconds
      });
    }, 100);

    // Smooth exit animation - no sudden changes
    const exitTimeout = setTimeout(() => {
      // Start fade out
      setOpacity(0);
      setScale(0.95); // Subtle scale down

      // Complete after smooth transition
      setTimeout(() => {
        onComplete();
      }, 800); // Match CSS transition duration
    }, 3200); // Start exit at 3.2 seconds

    return () => {
      clearTimeout(entranceTimeout);
      clearTimeout(exitTimeout);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] flex items-center justify-center"
      style={{
        opacity,
        transform: `scale(${scale})`,
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      {/* Minimal background effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-96 h-96 bg-green-500/5 rounded-full blur-3xl"
          style={{
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Simple logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-1">
            {/* Snake head */}
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-1 h-1 bg-black rounded-full mr-0.5"></div>
              <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>

            {/* Snake body - simple and clean */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md shadow-md"
                style={{
                  opacity: 0.9 - i * 0.1,
                  transition: "all 0.3s ease-out",
                  transitionDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Clean typography */}
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Snake Game
        </h1>

        <p className="text-gray-400 text-sm mb-8 font-light">
          Classic Reimagined
        </p>

        {/* Minimal progress bar */}
        <div className="w-48 mx-auto">
          <div className="bg-gray-800/50 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              style={{
                width: `${progress}%`,
                transition: "width 0.3s ease-out",
              }}
            />
          </div>
          <p className="text-green-400/80 text-xs mt-3 font-medium">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
