import React, { useEffect, useState } from 'react';
import { socket } from '../../index';

const withRealTimeTracking = (WrappedComponent) => {
  return function WithRealTimeTracking(props) {
    const [componentState, setComponentState] = useState({});

    useEffect(() => {
      const sessionId = localStorage.getItem('sessionId');
      const componentName = WrappedComponent.displayName || WrappedComponent.name;

      // Send initial component mount data
      fetch(`${process.env.REACT_APP_API_URL}/api/cheddchedd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          componentName,
          eventType: 'component_mount',
          pageUrl: window.location.href
        })
      });

      // Listen for component-specific updates
      socket.on('componentUpdate', ({ updates, targetComponent }) => {
        if (targetComponent === componentName && props.onUpdate) {
          props.onUpdate(updates);
        }
      });

      socket.on('componentUpdate', ({ component, data }) => {
        if (component === WrappedComponent.name) {
          setComponentState(data);
        }
      });

      return () => {
        socket.off('componentUpdate');
        // Send unmount data
        fetch(`${process.env.REACT_APP_API_URL}/api/cheddchedd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            componentName,
            eventType: 'component_unmount',
            pageUrl: window.location.href
          })
        });
      };
    }, [props.onUpdate]);

    return <WrappedComponent {...props} {...componentState} socket={socket} />;
  };
};

export default withRealTimeTracking;
