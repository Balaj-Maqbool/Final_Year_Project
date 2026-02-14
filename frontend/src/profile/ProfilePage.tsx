import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { apiRequest } from "../services/apiClient";
import "./profile.css";

// Interface matching full user object from backend
interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  profileImage?: string;
  coverImage?: string;
  // accessible if using getUserProfileById
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  // File inputs refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      await apiRequest("/users/logout", "POST");
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout on client side even if server fails
      logout();
      navigate("/login");
    }
  };

  const fetchProfile = async () => {
    try {
      // 1. Get current user ID (lightweight)
      const meRes = await fetch("http://localhost:8000/api/v1/users/me", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!meRes.ok) throw new Error("Failed to fetch me");
      const meData = await meRes.json();
      const myId = meData.data._id;

      // 2. Get full profile by ID (includes images)
      const profileRes = await fetch(`http://localhost:8000/api/v1/users/profile/${myId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileData = await profileRes.json();

      setUser(profileData.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (file: File, type: "profile" | "cover") => {
    const formData = new FormData();
    // Key matches multer config: "profileImage" or "coverImage"
    const key = type === "profile" ? "profileImage" : "coverImage";
    formData.append(key, file);

    const endpoint = type === "profile"
      ? "http://localhost:8000/api/v1/users/profile/image"
      : "http://localhost:8000/api/v1/users/profile/cover";

    try {
      const res = await fetch(endpoint, {
        method: "PATCH", // Backend uses PATCH
        credentials: "include",
        body: formData, // Auto-sets Content-Type to multipart/form-data
      });

      if (!res.ok) {
        throw new Error(`Failed to upload ${type} image`);
      }

      const data = await res.json();
      console.log("Upload success:", data);

      // Update local state to reflect new image immediately
      // Backend returns the updated user object usually, or we can just refetch
      // The controller returns the updated user in data.data
      if (data.data) {
        // If the return structure matches, we can merge
        setUser(prev => prev ? { ...prev, [type === "profile" ? "profileImage" : "coverImage"]: data.data[type === "profile" ? "profileImage" : "coverImage"] } : null);
      } else {
        fetchProfile(); // Fallback
      }

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    }
  };

  if (loading) return <div className="profile-loading">Loading Profile...</div>;
  if (!user) return <div className="profile-loading">User not found</div>;

  return (
    <div className="profile-page-container">
      {/* Cover Image Section */}
      <div className="cover-image-container">
        {user.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="cover-image" />
        ) : (
          <div className="cover-image" style={{ background: "linear-gradient(to right, #475569, #cbd5e1)" }} />
        )}

        <button
          className="edit-cover-btn"
          onClick={() => coverInputRef.current?.click()}
        >
          📷 Edit Cover
        </button>
        <input
          type="file"
          ref={coverInputRef}
          className="hidden-input"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "cover");
          }}
        />
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-image-wrapper">
          <div className="profile-image-container">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="profile-image" />
            ) : (
              // Placeholder avatar
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', color: '#94a3b8' }}>
                {user.fullName.charAt(0)}
              </div>
            )}
          </div>
          <button
            className="edit-profile-btn"
            onClick={() => profileInputRef.current?.click()}
            title="Update Profile Picture"
          >
            ✏️
          </button>
          <input
            type="file"
            ref={profileInputRef}
            className="hidden-input"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "profile");
            }}
          />
        </div>

        <div className="profile-info">
          <h1>{user.fullName}</h1>
          <p className="profile-username">@{user.username}</p>
          <span className="profile-role-badge">{user.role}</span>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Jobs Posted</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Reviews</span>
            </div>
            {/* You can add more stats here */}
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Additional sections (About, recent activity, etc.) can go here */}
      <div style={{ padding: '0 2rem' }}>
        <h3>About</h3>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>
          {user.email} <br />
          {/* Bio or other fields if available */}
          No bio added yet.
        </p>
      </div>

    </div>
  );
};

export default ProfilePage;
