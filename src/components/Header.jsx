import React, { useState, useEffect } from "react";

const NavButton = ({
  page,
  label,
  currentPage,
  navigateTo,
  isMobile = false,
}) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => navigateTo(page)}
      className={`transition-all duration-300 ease-in-out border-2 ${
        isMobile
          ? "w-full text-left py-4 px-6 rounded-2xl flex items-center gap-4"
          : "py-2 px-6 rounded-full font-medium"
      } ${
        isActive
          ? "bg-white/20 border-white/40"
          : "bg-transparent border-white/20 hover:bg-white/20 hover:border-white/40 transform hover:-translate-y-0.5"
      }`}
    >
      {isMobile && (
        <i
          className={`ri-${
            page === "home" ? "home" : page === "game" ? "play" : "user"
          }-line`}
        ></i>
      )}
      {label}
    </button>
  );
};

const Header = ({ currentPage, navigateTo }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
  }, [isMobileMenuOpen]);

  const handleNavigate = (page) => {
    navigateTo(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 header">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold">🐍 Snake Game</h1>
          <nav className="hidden md:flex gap-4">
            <NavButton
              page="home"
              label="Home"
              currentPage={currentPage}
              navigateTo={handleNavigate}
            />
            <NavButton
              page="game"
              label="Play"
              currentPage={currentPage}
              navigateTo={handleNavigate}
            />
            <NavButton
              page="about"
              label="About"
              currentPage={currentPage}
              navigateTo={handleNavigate}
            />
          </nav>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center bg-transparent border-2 border-white/30 w-10 h-10 rounded-lg"
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
        </div>
      </header>
      <div
        className={`fixed inset-0 z-[999] transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/50"
        ></div>
        <nav
          className={`fixed top-0 right-0 h-full w-64 p-4 transition-transform duration-300 mobile-nav ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center border-2 border-white/30 w-9 h-9 rounded-lg"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <NavButton
              page="home"
              label="Home"
              currentPage={currentPage}
              navigateTo={handleNavigate}
              isMobile={true}
            />
            <NavButton
              page="game"
              label="Play Game"
              currentPage={currentPage}
              navigateTo={handleNavigate}
              isMobile={true}
            />
            <NavButton
              page="about"
              label="About Developer"
              currentPage={currentPage}
              navigateTo={handleNavigate}
              isMobile={true}
            />
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
