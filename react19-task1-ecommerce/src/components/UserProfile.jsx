import { useUser } from '../context/UserContext';

export default function UserProfile() {
  const { user, isLoggedIn, logoutUser } = useUser();

  if (!isLoggedIn || !user) {
    return (
      <div className="card user-profile-card unauthenticated">
        <div className="profile-placeholder-icon">👤</div>
        <div>
          <h4>No User Registered Yet</h4>
          <p className="text-muted">
            Register using the Registration tab to see user state reflected via React 19 Context.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card user-profile-card authenticated">
      <div className="profile-header">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="profile-details">
          <span className="badge badge-success">Active Session</span>
          <h3 className="profile-name">{user.name}</h3>
          <p className="profile-email">{user.email}</p>
          <small className="profile-time">Registered at: {user.registeredAt}</small>
        </div>
      </div>
      <div className="profile-actions">
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={logoutUser}>
          Reset Session
        </button>
      </div>
    </div>
  );
}
