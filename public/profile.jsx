// profile.jsx
import React from 'react';

const Profile = ({ user }) => {
  return (
    <div>
      {user ? (
        <div className="user-profile">
          <img src="path/to/user/profile/logo.png" alt="User Logo" />
          <h2>{user.username}</h2>
        </div>
      ) : (
        <p>Пользователь не вошел</p>
      )}
    </div>
  );
};

export default Profile;
