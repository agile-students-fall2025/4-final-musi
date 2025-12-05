import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import "./LikesModal.css";

function LikesModal({ reviewId, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/reviews/${reviewId}/likes`);
        setUsers(response.data.users || []);
      } catch (err) {
        console.error("Error fetching likes:", err);
        setError("Failed to load users who liked this review");
      } finally {
        setLoading(false);
      }
    };

    if (reviewId) {
      fetchLikes();
    }
  }, [reviewId]);

  const handleFollowToggle = async (userId, currentIsFollowing) => {
    try {
      if (currentIsFollowing) {
        await axios.post(`/api/users/${userId}/unfollow`);
      } else {
        await axios.post(`/api/users/${userId}/follow`);
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? {
                ...user,
                isFollowing: !currentIsFollowing,
                followButtonText: !currentIsFollowing ? "Following" : user.isFollower ? "Follow back" : "Follow",
              }
            : user
        )
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert("Failed to update follow status");
    }
  };

  const handleUserClick = (user) => {
    onClose();
    window.location.href = `/app/user/${encodeURIComponent(user.username)}`;
  };

  if (loading) {
    return (
      <div className="likes-modal-overlay" onClick={onClose}>
        <div className="likes-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="likes-modal-header">
            <h2>Likes</h2>
            <button className="likes-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="likes-modal-body">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="likes-modal-overlay" onClick={onClose}>
        <div className="likes-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="likes-modal-header">
            <h2>Likes</h2>
            <button className="likes-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="likes-modal-body">
            <p style={{ color: "#e5534b" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="likes-modal-overlay" onClick={onClose}>
      <div className="likes-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="likes-modal-header">
          <h2>Likes</h2>
          <button className="likes-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="likes-modal-body">
          {users.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>
              No likes yet
            </p>
          ) : (
            <ul className="likes-modal-list">
              {users.map((user) => {
                const displayName = user.name || user.username || "";
                const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "?";

                return (
                  <li key={user._id} className="likes-modal-item">
                    <div
                      className="likes-modal-user-info"
                      onClick={() => handleUserClick(user)}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="likes-modal-avatar"
                        style={
                          user.profilePictureUrl
                            ? {
                                backgroundImage: `url(${user.profilePictureUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : {
                                backgroundColor: user.avatarColor || "#666",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                              }
                        }
                      >
                        {!user.profilePictureUrl && initial}
                      </div>
                      <div className="likes-modal-user-details">
                        <p className="likes-modal-user-name">{user.name || user.username}</p>
                        <p className="likes-modal-user-username">@{user.username}</p>
                      </div>
                    </div>
                    {user.followButtonText && (
                      <button
                        className={`likes-modal-follow-btn ${
                          user.isFollowing ? "following" : "follow"
                        }`}
                        onClick={() => handleFollowToggle(user._id, user.isFollowing)}
                      >
                        {user.followButtonText}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default LikesModal;

