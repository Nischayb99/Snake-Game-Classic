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
}) => {
  const baseClasses = `
    transition-all duration-300 ease-in-out border-2 font-medium
    ${
      isMobile
        ? "w-full text-left py-4 px-6 rounded-2xl flex items-center gap-4 hover:pl-8"
        : "py-2 px-6 rounded-full"
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
        <i className={`${icon} text-xl`}></i>
        <span>{label}</span>
        {isActive && <i className="ri-check-line ml-auto text-green-400"></i>}
      </button>
    );
  }

  return (
    <Link to={to} className={baseClasses}>
      <span>{label}</span>
    </Link>
  );
};

const UserMenu = ({ user, onLogout, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: "ri-user-line", label: "Profile", path: "/profile" },
    { icon: "ri-settings-line", label: "Settings", path: "/edit-profile" },
    { icon: "ri-dashboard-line", label: "Dashboard", path: "/dashboard" },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="mb-4 px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="font-medium text-white">{user?.name || "User"}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleMenuClick(item.path)}
            className="w-full text-left py-3 px-6 flex items-center gap-4 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <i className={`${item.icon} text-lg`}></i>
            {item.label}
          </button>
        ))}

        <button
          onClick={onLogout}
          className="w-full text-left py-3 px-6 flex items-center gap-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 border-t border-white/10 mt-4"
        >
          <i className="ri-logout-box-line text-lg"></i>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-2 px-4 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
        <span className="text-white font-medium">{user?.name || "User"}</span>
        <i
          className={`ri-arrow-down-s-line transition-transform duration-200 ${
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
          <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl z-50">
            <div className="p-4 border-b border-gray-700/50">
              <p className="font-medium text-white">{user?.name || "User"}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>

            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item.path)}
                className="w-full text-left py-3 px-4 flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 first:rounded-t-none last:rounded-b-2xl"
              >
                <i className={`${item.icon} text-lg`}></i>
                {item.label}
              </button>
            ))}

            <div className="border-t border-gray-700/50">
              <button
                onClick={onLogout}
                className="w-full text-left py-3 px-4 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 rounded-b-2xl"
              >
                <i className="ri-logout-box-line text-lg"></i>
                Logout
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

  const navItems = [
    { path: "/", label: "Home", icon: "ri-home-line" },
    { path: "/game", label: "Play", icon: "ri-gamepad-line" },
    { path: "/leaderboard", label: "Leaderboard", icon: "ri-trophy-line" },
    { path: "/about", label: "About", icon: "ri-information-line" },
  ];

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-[#0b141a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="w-32 h-8 bg-gray-700 animate-pulse rounded"></div>
          <div className="flex gap-4">
            <div className="w-16 h-8 bg-gray-700 animate-pulse rounded-full"></div>
            <div className="w-16 h-8 bg-gray-700 animate-pulse rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0b141a]/95 backdrop-blur-md shadow-lg border-b border-green-500/20"
            : "bg-[#0b141a]/80 backdrop-blur-sm border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="text-3xl group-hover:animate-bounce">🐍</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Snake Game
              </h1>
              <div className="text-xs text-gray-400 -mt-1">
                Classic Reimagined
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex gap-2">
              {navItems.map((item) => (
                <NavButton
                  key={item.path}
                  to={item.path}
                  label={item.label}
                  icon={item.icon}
                  isActive={location.pathname === item.path}
                />
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
              {isAuthenticated ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="py-2 px-6 rounded-full border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="py-2 px-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center bg-transparent border-2 border-white/30 w-12 h-12 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all duration-300"
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[999] transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        ></div>

        <nav
          className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-[#0b141a]/95 backdrop-blur-md border-l border-white/10 transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🐍</div>
              <span className="text-lg font-semibold text-white">Menu</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center border-2 border-white/30 w-10 h-10 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="p-6 space-y-2">
            {navItems.map((item) => (
              <NavButton
                key={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.path}
                isMobile={true}
                onClick={() => handleMobileNavigate(item.path)}
              />
            ))}
          </div>

          {/* Mobile Auth Section */}
          <div className="px-6">
            {isAuthenticated ? (
              <UserMenu user={user} onLogout={handleLogout} isMobile={true} />
            ) : (
              <div className="space-y-3 border-t border-white/10 pt-6">
                <button
                  onClick={() => handleMobileNavigate("/login")}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => handleMobileNavigate("/signup")}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
