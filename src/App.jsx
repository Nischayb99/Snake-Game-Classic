import React, { useState, useCallback } from "react";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import AboutPage from "./pages/AboutPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const navigateTo = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "game":
        return <GamePage navigateTo={navigateTo} />;
      case "about":
        return <AboutPage />;
      case "home":
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div id="root" className="min-h-screen flex flex-col">
      <Header currentPage={currentPage} navigateTo={navigateTo} />
      {renderPage()}
    </div>
  );
}

export default App;
