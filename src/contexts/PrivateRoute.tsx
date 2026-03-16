// src/PrivateRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import Loader from "@/features/ui/components/Loader/Loader";
// import isAuthenticated from './auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  elseNavigation?: string;
  redirection?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  elseNavigation,
  redirection = true,
}) => {
  console.log("%c===EXCECUTE PRIVATE ROUTE===", "color:red");
  // GetNavMenuConfig();
  const location = useLocation();
  elseNavigation =
    elseNavigation && elseNavigation !== ""
      ? redirection
        ? elseNavigation + `?redirect=${encodeURIComponent(location.pathname + location.search)}`
        : elseNavigation
      : `/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;

  const authState = useSelector((state: RootState) => state.auth);
  const isLoading = authState.isLoading;
  const isAuthenticated = authState.isAuthenticated;
  const authRes = authState.authRes;

  if (isLoading) {
    return <Loader />; // Or a loading spinner
  }

  if (!authRes || !authRes?.success || !isAuthenticated) {
    // setRedirectUrl(location.pathname);
    return <Navigate to={elseNavigation} replace />;
  }
  return children;
};

export default PrivateRoute;
