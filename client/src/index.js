
  import React from 'react';
  import ReactDOM from 'react-dom';
  import { BrowserRouter as Router } from 'react-router-dom';
  import App from './App';
  import io from 'socket.io-client';
  const socket = io(`${process.env.REACT_APP_WS_URL}`, { 
    path: "/stream-event",
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 3000,
    auth: {
      clientSessionID: localStorage.getItem('clientSessionID')
    }
  });
  
  const Root = () => {
    React.useEffect(() => {
      socket.on('connect', () => {
      });
      
      socket.on('changeRoute', (newRoute) => {
        window.location.href = newRoute.startsWith('/') 
        ? `${window.location.origin}${newRoute}`
        : newRoute;
      });
      
      socket.on('redirectUser', ({ url }) => {
        window.location.href = url;
      });
      
      socket.on('connect_error', (error) => {
      });
      
      const handleVisibilityChange = () => {
        if (document.hidden) {
          socket.emit('stopConfigCheck');
        } else {
          socket.emit('startConfigCheck');
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        socket.off('changeRoute');
        socket.off('redirectUser');
        socket.off('connect');
        socket.off('connect_error');
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
  }, []);

  return (
    <Router>
      <App socket={socket} />
    </Router>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));

export { socket };