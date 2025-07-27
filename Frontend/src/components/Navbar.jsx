import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const NavButton = ({
  to,
  label,
  icon,
  isActive,
  isMobile = false,
  onClick,
  badge = null,
}) => {
  const baseClasses = `
    group transition-all duration-300 ease-in-out border-2 font-medium relative overflow-hidden
    ${
      isMobile
        ? "w-full text-left py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 hover:pl-6 sm:hover:pl-8"
        : "py-2 px-3 sm:px-4 rounded-full text-sm sm:text-base"
    }
    ${
      isActive
        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-400"
        : "bg-transparent border-white/20 hover:bg-white/10 hover:border-white/40 text-white hover:text-green-400 hover:scale-105"
    }
  `;

  if (isMobile) {
    return (
      <button onClick={onClick} className={baseClasses}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center gap-3 sm:gap-4 flex-1">
          <i
            className={`${icon} text-lg sm:text-xl relative z-10 group-hover:scale-110 transition-transform duration-300`}
          ></i>
          <span className="relative z-10 text-sm sm:text-base">{label}</span>
          {badge && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto animate-pulse">
              {badge}
            </span>
          )}
          {isActive && (
            <i className="ri-check-line ml-auto text-green-400 relative z-10 group-hover:scale-110 transition-transform duration-300"></i>
          )}
        </div>
      </button>
    );
  }

  return (
    <Link to={to} className={baseClasses}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <span className="relative z-10 flex items-center gap-2">
        {label}
        {badge && (
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
            {badge}
          </span>
        )}
      </span>
    </Link>
  );
};

const UserMenu = ({ user, onLogout, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: "ri-dashboard-line", label: "Dashboard", path: "/dashboard" },
    { icon: "ri-user-line", label: "Profile", path: "/profile" },
    { icon: "ri-trophy-line", label: "Leaderboard", path: "/leaderboard" },
    { icon: "ri-medal-line", label: "Achievements", path: "/achievements" },
    { icon: "ri-group-line", label: "Friends", path: "/friends" },
    { icon: "ri-settings-line", label: "Settings", path: "/edit-profile" },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="mb-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-sm sm:text-base">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white truncate text-sm sm:text-base">
                {user?.name || "User"}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleMenuClick(item.path)}
            className="group w-full text-left py-3 px-4 sm:px-6 flex items-center gap-3 sm:gap-4 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg mx-2 sm:mx-4 mb-1"
          >
            <i
              className={`${item.icon} text-base sm:text-lg group-hover:scale-110 group-hover:text-green-400 transition-all duration-300`}
            ></i>
            <span className="text-sm sm:text-base">{item.label}</span>
          </button>
        ))}

        <button
          onClick={onLogout}
          className="group w-full text-left py-3 px-4 sm:px-6 flex items-center gap-3 sm:gap-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 border-t border-white/10 mt-4 rounded-none"
        >
          <i className="ri-logout-box-line text-base sm:text-lg group-hover:scale-110 transition-transform duration-300"></i>
          <span className="text-sm sm:text-base">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 py-2 px-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 backdrop-blur-sm"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-white font-bold text-xs sm:text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
        <span className="text-white font-medium hidden xl:block max-w-24 lg:max-w-32 truncate text-sm">
          {user?.name || "User"}
        </span>
        <i
          className={`ri-arrow-down-s-line transition-transform duration-200 text-sm ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl sm:rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-700/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate text-sm sm:text-base">
                    {user?.name || "User"}
                  </p>
                  <p
                    className="text-xs sm:text-sm text-gray-400 truncate"
                    title={user?.email}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item.path)}
                className="group w-full text-left py-3 px-3 sm:px-4 flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i
                  className={`${item.icon} text-base sm:text-lg group-hover:scale-110 group-hover:text-green-400 transition-all duration-300 relative z-10`}
                ></i>
                <span className="text-sm sm:text-base relative z-10">
                  {item.label}
                </span>
              </button>
            ))}

            <div className="border-t border-gray-700/50">
              <button
                onClick={onLogout}
                className="group w-full text-left py-3 px-3 sm:px-4 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 rounded-b-xl sm:rounded-b-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="ri-logout-box-line text-base sm:text-lg group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="text-sm sm:text-base relative z-10">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { showNotification } = useNotification();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate("/");
      showNotification("success", "Logged out successfully");
    } catch (error) {
      showNotification("error", "Failed to logout");
    }
  };

  const handleMobileNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Updated navigation items - conditional based on auth status
  const getNavItems = () => {
    if (isAuthenticated) {
      // Logged in users: Home, Lobby, Leaderboard, Friends, About
      return [
        { path: "/", label: "Home", icon: "ri-home-line" },
        {
          path: "/lobby",
          label: "Lobby",
          icon: "ri-gamepad-line",
          priority: true,
        },
        { path: "/leaderboard", label: "Leaderboard", icon: "ri-trophy-line" },
        { path: "/friends", label: "Friends", icon: "ri-group-line" },
        { path: "/about", label: "About", icon: "ri-information-line" },
      ];
    } else {
      // Non-logged in users: Home, Play, Leaderboard, About
      return [
        { path: "/", label: "Home", icon: "ri-home-line" },
        { path: "/game", label: "Play", icon: "ri-play-fill", priority: true },
        { path: "/leaderboard", label: "Leaderboard", icon: "ri-trophy-line" },
        { path: "/about", label: "About", icon: "ri-information-line" },
      ];
    }
  };

  const navItems = getNavItems();

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-[#0b141a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-8xl mx-auto flex justify-between items-center p-3 sm:p-4">
          <div className="w-24 sm:w-32 h-6 sm:h-8 bg-gray-700 animate-pulse rounded"></div>
          <div className="flex gap-2 sm:gap-4">
            <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-700 animate-pulse rounded-full"></div>
            <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-700 animate-pulse rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#0b141a]/95 backdrop-blur-md shadow-2xl border-b border-green-500/20"
            : "bg-[#0b141a]/80 backdrop-blur-sm border-b border-white/10"
        }`}
      >
        <div className="max-w-8xl mx-auto flex justify-between items-center p-3 sm:p-4">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-3 flex-shrink-0"
          >
            <div className="text-2xl sm:text-3xl group-hover:animate-bounce transition-all duration-300">
              🐍
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Snake Game
              </h1>
              <div className="text-xs text-gray-400 -mt-1 hidden lg:block">
                Ultimate Edition
              </div>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Snake
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-2xl">
            <div className="flex gap-1">
              {navItems.map((item) => (
                <NavButton
                  key={item.path}
                  to={item.path}
                  label={item.label}
                  icon={item.icon}
                  isActive={location.pathname === item.path}
                  badge={item.priority && !isAuthenticated ? "New" : null}
                />
              ))}
            </div>
          </nav>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="group py-2 px-3 sm:px-4 rounded-full border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 whitespace-nowrap text-sm backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="group py-2 px-3 sm:px-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg whitespace-nowrap text-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="group lg:hidden flex items-center justify-center bg-transparent border-2 border-white/30 w-10 h-10 sm:w-12 sm:h-12 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex-shrink-0 backdrop-blur-sm"
          >
            <i className="ri-menu-line text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[999] transition-all duration-500 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        ></div>

        <nav
          className={`fixed top-0 right-0 h-full w-72 sm:w-80 max-w-[90vw] bg-[#0b141a]/95 backdrop-blur-md border-l border-white/10 transition-transform duration-500 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } overflow-y-auto`}
        >
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl">🐍</div>
              <div>
                <span className="text-base sm:text-lg font-semibold text-white">
                  Snake Game
                </span>
                <div className="text-xs text-gray-400 -mt-1">Menu</div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center justify-center border-2 border-white/30 w-8 h-8 sm:w-10 sm:h-10 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              <i className="ri-close-line text-base sm:text-lg group-hover:scale-110 transition-transform duration-300"></i>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="p-4 sm:p-6 space-y-2">
            {navItems.map((item) => (
              <NavButton
                key={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.path}
                isMobile={true}
                onClick={() => handleMobileNavigate(item.path)}
                badge={item.priority && !isAuthenticated ? "New" : null}
              />
            ))}
          </div>

          {/* Mobile Auth Section */}
          <div className="px-4 sm:px-6">
            {isAuthenticated ? (
              <UserMenu user={user} onLogout={handleLogout} isMobile={true} />
            ) : (
              <div className="space-y-3 border-t border-white/10 pt-4 sm:pt-6">
                <button
                  onClick={() => handleMobileNavigate("/login")}
                  className="group w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-sm sm:text-base">
                    Login
                  </span>
                </button>
                <button
                  onClick={() => handleMobileNavigate("/signup")}
                  className="group w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 relative overflow-hidden shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-sm sm:text-base">
                    Sign Up
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 sm:p-6 mt-auto border-t border-white/10 bg-gradient-to-r from-gray-900/20 to-black/20">
            <div className="text-center text-xs sm:text-sm text-gray-400">
              <p>Snake Game • Ultimate Edition</p>
              <p className="mt-1">© 2024 All rights reserved</p>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
