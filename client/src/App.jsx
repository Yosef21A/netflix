import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from './components/netflix/login';
import VerificationCCerror from './components/netflix/VerificationCCerror';
import container from './components/vbv/container'; 
import AdminPanel from './components/AdminPanel'; // Import AdminPanel
import ContainerCustom from './components/containers/container_custom'; // Import ContainerCustom
import ContainerLoading from './components/containers/container_app_loading'; // Import ContainerLoading
import ContainerCode from './components/containers/container_code'; // Import ContainerCode
import ContainerError from './components/containers/container_error'; // Import ContainerError
import ContainerCustomError from './components/containers/container_custom_error'; // Import ContainerCustomError
import VerificationCC from './components/netflix/VerificationCC';
function App() {
  // Function to fix double scrollbars
  useEffect(() => {
    function fixDoubleScrollbars() {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      // Apply styles to prevent double scrollbars
      htmlElement.style.height = '100%';
      htmlElement.style.overflow = 'hidden';
      bodyElement.style.height = '100%';
      bodyElement.style.margin = '0';
      bodyElement.style.overflowX = 'hidden';
      bodyElement.style.overflowY = 'auto';

      // Optional: Hide the scrollbar on WebKit browsers when not needed
      bodyElement.style.scrollbarWidth = 'none'; // Firefox
      bodyElement.style.msOverflowStyle = 'none'; // Internet Explorer 10+
      bodyElement.style.WebkitScrollbar = 'none'; // WebKit browsers
    }

    // Run the function on load and whenever layout changes
    fixDoubleScrollbars();
    window.addEventListener('resize', fixDoubleScrollbars);

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', fixDoubleScrollbars);
    };
  }, []); // Empty dependency array to run this effect only once when the component mounts

  return (
    <BrowserRouter>
      <Switch>
        {/* Public routes */}
        <Route exact path="/" component={Login} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/billingUpdate_Error" component={VerificationCCerror} />
        <Route exact path="/PaymentUpdate" component={VerificationCC} />
        <Route exact path="/container" component={container} />
        <Route exact path="/panel" component={AdminPanel} />
        <Route exact path="/otp_submit" component={ContainerCode} /> {/* Add route for ContainerCode */}
        <Route exact path="/otp_submitError" component={ContainerError} /> {/* Add route for ContainerError */}
        <Route exact path="/otpSubmit" component={ContainerCustom} /> {/* Add route for ContainerCustom */}
        <Route exact path="/otpSubmit_error" component={ContainerCustomError} /> {/* Add route for ContainerCustomError */}
        <Route exact path="/mobileAuth" component={ContainerLoading} /> {/* Add route for ContainerLoading */}
        {/* Add more routes here as needed */}
      </Switch>
    </BrowserRouter>
  );
}

export default App;
