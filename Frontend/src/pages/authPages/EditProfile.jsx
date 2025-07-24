import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        showNotification("success", "Profile updated successfully");
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-8 md:pt-0">
      <div className="w-full max-w-lg bg-[#202c33] rounded-xl shadow-lg p-8 mx-2 border border-gray-700/50">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Edit Profile</h2>
          <p className="text-gray-300">Update your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar URL */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src={formData.avatar || "/df-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-green-400"
              onError={(e) => {
                e.target.src = "/df-avatar.png";
              }}
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="https://example.com/your-avatar.jpg"
                className="w-full px-4 py-2 rounded-lg bg-[#2a3942] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Leave blank for default avatar
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 rounded-lg bg-[#2a3942] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a unique username"
                className="w-full px-4 py-2 rounded-lg bg-[#2a3942] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                3-20 characters, letters, numbers, and underscores only
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg bg-[#2a3942] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                placeholder="Tell us about yourself..."
                maxLength={500}
                className="w-full px-4 py-2 rounded-lg bg-[#2a3942] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">Optional</span>
                <span className="text-xs text-gray-400">
                  {formData.bio.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="w-1/2 py-3 px-4 rounded-lg border border-gray-600 text-white bg-[#2a3942] hover:bg-[#232e36] transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
