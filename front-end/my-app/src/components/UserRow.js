import "./UserRow.css";

function UserRow({ user, activeTab, onUnfollow, onFollowBack }) {
  let button;
  if (activeTab === 'followers') {
    if (user.mutual) {
      button = (
        <button 
          onClick={onUnfollow}
          className="user-action-btn following"
        >
          Following
        </button>
      );
    } else {
      button = (
        <button 
          onClick={onFollowBack}
          className="user-action-btn follow-back"
        >
          Follow back
        </button>
      );
    }
  } else {
    button = (
      <button 
        onClick={onUnfollow}
        className="user-action-btn following"
      >
        Following
      </button>
    );
  }

  return (
    <div className="user-row">
      <a 
        href={`/profile/${user.username}`} 
        onClick={(e) => {
          e.preventDefault(); 
          console.log(`Maps to ${user.username}'s profile`);
        }} 
        className="user-info-link"
      >
        <div className="user-avatar"></div>
        <div className="user-details">
          <p className="user-name">{user.name}</p>
          <p className="user-username">{user.username}</p>
        </div>
      </a>
      
      <div className="user-actions">
        {button}
      </div>
    </div>
  );
}

export default UserRow;