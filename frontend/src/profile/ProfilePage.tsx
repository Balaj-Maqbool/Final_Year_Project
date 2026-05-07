import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { apiRequest } from "../services/apiClient";
import { aiHandler } from "../services/aiHandler";
import { Spinner, Button, Form, Alert } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { ratingHandler } from "../services/ratingHandler";
import "./profile.css";
import { BACKEND_URL } from "../config";

// Interface matching full user object from backend
interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  skills?: string[];
}

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuthStore();
  
  const isOwnProfile = !userId || userId === authUser?._id;

  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const { data: ratingsData, isLoading: ratingsLoading, isError: ratingsError } = useQuery({
      queryKey: ["freelancerRatings", user?._id],
      queryFn: () => ratingHandler.getFreelancerRatings(user!._id, 1, 50) as any,
      enabled: !!user?._id && showReviews && user.role === "Freelancer",
  });

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
      let targetId = userId;
      if (!targetId) {
        // 1. Get current user ID (lightweight)
        const meRes = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!meRes.ok) throw new Error("Failed to fetch me");
        const meData = await meRes.json();
        targetId = meData.data._id;
      }

      // 2. Get full profile by ID (includes images)
      const profileRes = await fetch(`${BACKEND_URL}/api/v1/users/profile/${targetId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileData = await profileRes.json();

      setUser(profileData.data);
      if (profileData.data.bio) setEditBio(profileData.data.bio);
      if (profileData.data.skills) setEditSkills(profileData.data.skills.join(", "));
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIPolish = async () => {
      setAiLoading(true);
      try {
          const res = await aiHandler.policeUserProfile(editBio || "I am a freelancer", editSkills || "");
          setEditBio(res.refined_bio);
          setEditSkills(res.suggested_skills.join(", "));
      } catch (err) {
          console.error("Failed to polish profile", err);
          alert("Failed to polish profile with AI.");
      } finally {
          setAiLoading(false);
      }
  };

  const handleSaveProfile = async () => {
      setSaveLoading(true);
      try {
          const res = await apiRequest<{ data: UserProfile }>("/users/profile", "PATCH", {
              bio: editBio,
              skills: editSkills.split(",").map(s => s.trim()).filter(s => s.length > 0)
          });
          setUser(prev => prev ? { ...prev, bio: res.data?.bio || editBio, skills: res.data?.skills || editSkills.split(",") } : null);
          setIsEditing(false);
          fetchProfile();
      } catch (err) {
          console.error("Failed to update profile", err);
          alert("Failed to update profile.");
      } finally {
          setSaveLoading(false);
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
      ? `${BACKEND_URL}/api/v1/users/profile/image`
      : `${BACKEND_URL}/api/v1/users/profile/cover`;

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
        
        {isOwnProfile && (
            <button
              className="edit-cover-btn"
              onClick={() => coverInputRef.current?.click()}
            >
              📷 Edit Cover
            </button>
        )}
        {isOwnProfile && (
            <input
              type="file"
              ref={coverInputRef}
              className="hidden-input"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "cover");
              }}
            />
        )}
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
          {isOwnProfile && (
              <button
                className="edit-profile-btn"
                onClick={() => profileInputRef.current?.click()}
                title="Update Profile Picture"
              >
                ✏️
              </button>
          )}
          {isOwnProfile && (
              <input
                type="file"
                ref={profileInputRef}
                className="hidden-input"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "profile");
                }}
              />
          )}
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

          {isOwnProfile && (
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
          )}
        </div>
      </div>

      {/* Additional sections (About, recent activity, etc.) can go here */}
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>About</h3>
            {!isEditing && isOwnProfile && (
                <Button variant="outline-primary" size="sm" onClick={() => setIsEditing(true)}>✏️ Edit Bio & Skills</Button>
            )}
        </div>
        
        {isEditing ? (
            <div style={{ backgroundColor: "var(--bg-card)", padding: "1.5rem", borderRadius: "10px", marginTop: "1rem" }}>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Bio:</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={4} 
                            value={editBio} 
                            onChange={(e) => setEditBio(e.target.value)}
                            style={{ backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Skills (comma separated):</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={editSkills} 
                            onChange={(e) => setEditSkills(e.target.value)}
                            style={{ backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }}
                        />
                    </Form.Group>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', alignItems: 'center' }}>
                        <Button variant="success" onClick={handleSaveProfile} disabled={saveLoading}>
                            {saveLoading ? <Spinner size="sm" animation="border" /> : "💾 Save Changes"}
                        </Button>
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                        
                        <Button 
                            variant="primary" 
                            onClick={handleAIPolish} 
                            disabled={aiLoading}
                            style={{ marginLeft: 'auto', backgroundColor: '#8e44ad', borderColor: '#8e44ad' }}
                        >
                            {aiLoading ? <Spinner size="sm" animation="border" /> : "✨ Polish with AI"}
                        </Button>
                    </div>
                </Form>
            </div>
        ) : (
            <div style={{ color: '#64748b', lineHeight: 1.6, marginTop: '1rem' }}>
                <p><strong>Email:</strong> {user.email}</p>
                <div style={{ marginTop: '1rem' }}>
                    <strong>Bio:</strong>
                    <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{user.bio || "No bio added yet."}</p>
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <strong>Skills:</strong>
                    {user.skills && user.skills.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {user.skills.map((skill, index) => (
                                <span key={index} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ marginTop: '0.5rem' }}>No skills added yet.</p>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Freelancer Ratings Section */}
      {user.role === "Freelancer" && (
        <div style={{ padding: '0 2rem', marginBottom: '2rem', marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Client Reviews</h3>
                <Button 
                    variant={showReviews ? "secondary" : "warning"} 
                    onClick={() => setShowReviews(!showReviews)}
                    className="fw-bold"
                >
                    {showReviews ? "Hide Reviews" : "⭐ View Ratings"}
                </Button>
            </div>
            
            {showReviews && (
                <div style={{ marginTop: '1.5rem' }}>
                    {ratingsLoading && <div className="text-center"><Spinner animation="border" /></div>}
                    {ratingsError && <Alert variant="danger">Failed to load reviews.</Alert>}
                    
                    {ratingsData?.docs && ratingsData.docs.length === 0 && (
                        <Alert variant="info">This freelancer has no reviews yet.</Alert>
                    )}
                    
                    {ratingsData?.docs && ratingsData.docs.map((review: any) => (
                        <div key={review._id} style={{ backgroundColor: "var(--bg-card)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {review.reviewer?.profileImage ? (
                                        <img src={review.reviewer.profileImage} alt="Client" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                            {review.reviewer?.fullName?.charAt(0) || "C"}
                                        </div>
                                    )}
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{review.reviewer?.fullName || "Anonymous Client"}</strong>
                                </div>
                                <span style={{ color: "#fbbf24", fontWeight: "bold", fontSize: "1.2rem", letterSpacing: "2px" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                            </div>
                            <p style={{ margin: "0.5rem 0", color: 'var(--text-secondary)', lineHeight: 1.6 }}>"{review.comment}"</p>
                            <small style={{ color: '#64748b' }}>Reviewed on {new Date(review.createdAt).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
