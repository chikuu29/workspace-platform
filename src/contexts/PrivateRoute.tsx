// src/PrivateRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { GetNavMenuConfig } from "../utils/services/appServices";
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
  GetNavMenuConfig();
  const location = useLocation();
  elseNavigation =
    elseNavigation && elseNavigation !== ""
      ? redirection
        ? elseNavigation + `?redirect=${encodeURIComponent(location.pathname + location.search)}`
        : elseNavigation
      : `/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;

  const { authInfo, loading } = useAuth();
  console.log("auth", authInfo);

  if (loading) {
    return <Loader />; // Or a loading spinner
  }

  if (!authInfo && !authInfo?.success) {
    // setRedirectUrl(location.pathname);
    return <Navigate to={elseNavigation} replace />;
  }
  return children;
};

export default PrivateRoute;
