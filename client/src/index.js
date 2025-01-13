import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  auth: {
    sessionId: localStorage.getItem('sessionId')
  }
});

const Root = () => {
  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('changeRoute', (newRoute) => {
      console.log('Received route change command for this session:', newRoute);
      // Use window.location for more reliable navigation
      window.location.href = newRoute.startsWith('/') 
        ? `${window.location.origin}${newRoute}`
        : newRoute;
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.off('changeRoute');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);

  return (
    <Router>
      <App socket={socket} />
    </Router>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));

// Export socket for use in other components
export { socket };