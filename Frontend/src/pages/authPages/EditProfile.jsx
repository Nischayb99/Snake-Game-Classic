import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || "");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    bio: user?.bio || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update preview avatar in real-time
    if (name === "avatar") {
      setPreviewAvatar(value || "/df-avatar.png");
    }
  };

  const handleAvatarError = () => {
    setPreviewAvatar("/df-avatar.png");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      showNotification("error", "Name is required");
      return;
    }

    if (!formData.username.trim()) {
      showNotification("error", "Username is required");
      return;
    }

    if (formData.username.length < 3) {
      showNotification("error", "Username must be at least 3 characters");
      return;
    }

    if (!formData.email.trim()) {
      showNotification("error", "Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification("error", "Please enter a valid email address");
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      showNotification(
        "error",
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        showNotification("success", "Profile updated successfully! 🎉");
        navigate("/profile");
      } else {
        showNotification("error", result.error || "Failed to update profile");
      }
    } catch (error) {
      showNotification("error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-4 sm:pt-6 lg:pt-8 relative overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-green-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-60 sm:h-60 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-green-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative z-10">
        {/* Enhanced Profile Edit Card */}
        <div className="bg-[#202c33]/85 backdrop-blur-xl shadow-2xl rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 relative">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-blue-600 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 pointer-events-none"></div>
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                  backgroundSize: "30px 30px",
                }}
              ></div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6 relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 hover:scale-110 transition-transform duration-300">
                  <i className="ri-edit-line text-xl sm:text-2xl lg:text-3xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    Edit Profile
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base">
                    Update your profile information and preferences
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                <button
                  onClick={() => navigate("/profile")}
                  className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-white/50 hover:scale-105 text-sm sm:text-base relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <i className="ri-arrow-left-line group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                  <span className="relative z-10">Back to Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              {/* Enhanced Avatar Section */}
              <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                  <i className="ri-image-line text-green-400"></i>
                  Profile Picture
                </h3>

                <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 relative z-10">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <img
                      src={previewAvatar}
                      alt="Profile Preview"
                      className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full object-cover border-4 border-green-400 shadow-2xl hover:scale-110 transition-transform duration-500"
                      onError={handleAvatarError}
                    />
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-[#202c33] shadow-lg animate-pulse">
                      <i className="ri-camera-line text-white text-xs sm:text-sm"></i>
                    </div>
                  </div>

                  <div className="flex-1 w-full lg:max-w-md">
                    <label className=" text-sm sm:text-base font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i className="ri-link text-green-400"></i>
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/your-avatar.jpg"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#2a3942]/80 backdrop-blur-sm text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-gray-500 text-sm sm:text-base"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                        <i className="ri-information-line"></i>
                        Leave blank for default avatar
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, avatar: "" }));
                          setPreviewAvatar("/df-avatar.png");
                        }}
                        className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Personal Information Section */}
              <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                  <i className="ri-user-settings-line text-blue-400"></i>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 relative z-10">
                  {/* Full Name */}
                  <div className="lg:col-span-2">
                    <label className="flex text-sm sm:text-base font-medium text-gray-300 mb-2 items-center gap-2">
                      <i className="ri-user-line text-green-400"></i>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#334155]/60 backdrop-blur-sm text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-gray-500 text-sm sm:text-base"
                      required
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="flex text-sm sm:text-base font-medium text-gray-300 mb-2 items-center gap-2">
                      <i className="ri-at-line text-purple-400"></i>
                      Username *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a unique username"
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#334155]/60 backdrop-blur-sm text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-gray-500 text-sm sm:text-base"
                        required
                        minLength={3}
                        maxLength={20}
                        pattern="[a-zA-Z0-9_]+"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        {formData.username.length >= 3 &&
                        /^[a-zA-Z0-9_]+$/.test(formData.username) ? (
                          <i className="ri-check-line text-green-400"></i>
                        ) : formData.username.length > 0 ? (
                          <i className="ri-close-line text-red-400"></i>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400 mt-2 flex items-center gap-1">
                      <i className="ri-information-line"></i>
                      3-20 characters, letters, numbers, and underscores only
                    </span>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex text-sm sm:text-base font-medium text-gray-300 mb-2 items-center gap-2">
                      <i className="ri-mail-line text-yellow-400"></i>
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#334155]/60 backdrop-blur-sm text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-gray-500 text-sm sm:text-base"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
                          <i className="ri-check-line text-green-400"></i>
                        ) : formData.email.length > 0 ? (
                          <i className="ri-close-line text-red-400"></i>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Bio Section */}
              <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                  <i className="ri-file-text-line text-yellow-400"></i>
                  About You
                </h3>

                <div className="relative z-10">
                  <label className="flex text-sm sm:text-base font-medium text-gray-300 mb-2 items-center gap-2">
                    <i className="ri-chat-quote-line text-orange-400"></i>
                    Bio (Optional)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about yourself, your interests, or what makes you unique..."
                    maxLength={500}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#334155]/60 backdrop-blur-sm text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-gray-500 resize-none text-sm sm:text-base"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                      <i className="ri-information-line"></i>
                      Share a bit about yourself
                    </span>
                    <span
                      className={`text-xs sm:text-sm ${
                        formData.bio.length > 450
                          ? "text-orange-400"
                          : formData.bio.length > 400
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.bio.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="bg-gradient-to-br from-[#2a3942]/80 to-[#334155]/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10">
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="group flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl border-2 border-gray-600/50 text-white bg-[#334155]/60 hover:bg-[#3f4b5f]/70 hover:border-gray-500/50 transition-all duration-300 font-medium backdrop-blur-sm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base relative overflow-hidden"
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <i className="ri-arrow-left-line group-hover:scale-110 transition-transform duration-300"></i>
                      Cancel Changes
                    </span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 shadow-2xl text-sm sm:text-base relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {loading ? (
                      <span className="flex items-center justify-center relative z-10">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving Changes...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <i className="ri-save-line group-hover:scale-110 transition-transform duration-300"></i>
                        Save Changes
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Enhanced Form Tips */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6 backdrop-blur-sm hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

                <h4 className="text-sm sm:text-base font-semibold text-blue-400 mb-3 sm:mb-4 flex items-center gap-2 relative z-10">
                  <i className="ri-lightbulb-line"></i>
                  Profile Tips & Best Practices
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative z-10">
                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-green-400 mt-0.5 flex-shrink-0"></i>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-white">
                        Clear Profile Picture
                      </div>
                      <div className="text-xs text-gray-400">
                        Use a high-quality, recognizable photo
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-green-400 mt-0.5 flex-shrink-0"></i>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-white">
                        Unique Username
                      </div>
                      <div className="text-xs text-gray-400">
                        Choose something memorable and personal
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-green-400 mt-0.5 flex-shrink-0"></i>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-white">
                        Complete Bio
                      </div>
                      <div className="text-xs text-gray-400">
                        Share your interests and personality
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-green-400 mt-0.5 flex-shrink-0"></i>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-white">
                        Keep Info Updated
                      </div>
                      <div className="text-xs text-gray-400">
                        Regular updates improve experience
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Enhanced focus styles */
        input:focus,
        textarea:focus {
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          transform: translateY(-2px);
        }

        /* Smooth transitions for all form elements */
        input,
        textarea,
        button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced hover effects */
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        /* Input validation styles */
        input:valid {
          border-color: rgba(34, 197, 94, 0.3);
        }

        input:invalid:not(:placeholder-shown) {
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* Custom scrollbar for textarea */
        textarea::-webkit-scrollbar {
          width: 6px;
        }

        textarea::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }

        textarea::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.5);
          border-radius: 3px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.7);
        }

        /* Shimmer effect for loading states */
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .shimmer {
          position: relative;
          overflow: hidden;
        }

        .shimmer::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default EditProfile;
