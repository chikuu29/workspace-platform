import {
  useContext,
  createContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useLocation } from "react-router";
import { useDispatch } from "react-redux";
import { login, logout, AuthPayload } from "@/app/slices/auth/authSlice";
import { GETAPI } from "@/app/api";
import { fetchAppConfig } from "@/app/slices/appConfig/appConfigSlice";
import type { AppDispatch } from "@/app/store";
import Loader from "@/features/ui/components/Loader/Loader";
import { startLoading, stopLoading } from "@/app/slices/loader/appLoaderSlice";

// --- Context Type Definitions ---

interface AuthContextType {
  /** Full auth payload from /auth/me or initial login */
  authInfo: AuthPayload | null;
  /** Whether a re-login/session check is required */
  reloginRequired: boolean;
  /** Update auth info after initial login (bypasses /auth/me fetch) */
  setLoginAuthInfo: (data: AuthPayload) => void;
  /** Trigger a server logout and clear all in-memory state */
  logoutUser: () => void;
  /** Whether the auth hydration request is in-flight */
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// --- Context ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const [authInfo, setAuthInfo] = useState<AuthPayload | null>(null);
  const [reloginRequired, setReloginRequired] = useState(true);
  const routerLocation = useLocation();

  /**
   * Hydrate auth state from the server on every mount / page refresh.
   *
   * WHY /auth/me instead of localStorage?
   * - The httpOnly cookie is immune to XSS (JavaScript cannot read it).
   * - The server is the single source of truth for permissions/roles.
   * - On every refresh, the user gets the freshest data.
   * - `withCredentials: true` on axios ensures the cookie is sent
   *   automatically — no manual token attachment needed for this call.
   */
  const hydrateSession = useCallback(async () => {
    setLoading(true);
    dispatch(startLoading("Restoring your session…"));

    try {
      // Subscribe to the RxJS observable returned by GETAPI.
      // The httpOnly session-token cookie is sent automatically.
      GETAPI({
        path: "/auth/me",
        isPrivateApi: true, // public axios instance — cookie is enough
      }).subscribe({
        next: (res: any) => {
          if (res.success) {

            console.log("res", res);

            const payload: AuthPayload = {
              success: true,
              login_info: res.login_info,
              access_token: res.access_token,
              authProvider: res.authProvider,
            };

            setAuthInfo(payload);
            dispatch(login(payload));
            dispatch(fetchAppConfig());
          } else {
            // Server says session is invalid → not authenticated
            setAuthInfo(null);
          }
          dispatch(stopLoading());
          setLoading(false);
        },
        error: () => {
          // Network error or 401 — treat as unauthenticated
          const isAuthRoute = routerLocation.pathname.startsWith("/auth");
          if (!isAuthRoute) {
            console.warn("Session hydration failed — redirecting to login.");
          }
          setAuthInfo(null);
          dispatch(stopLoading());
          setLoading(false);
        },
      });
    } catch {
      setAuthInfo(null);
      dispatch(stopLoading());
      setLoading(false);
    }
  }, [dispatch, routerLocation.pathname]);

  useEffect(() => {
    // Skip hydration on auth routes (/auth/login, /auth/callback, /auth/sign-up)
    // — there's no session cookie yet. After OAuth callback completes,
    // setLoginAuthInfo() sets state directly without needing /auth/me.
    // const isAuthRoute = routerLocation.pathname.startsWith("/auth");

    // if (isAuthRoute) {
    //   setLoading(false);
    //   return;
    // }

    if (reloginRequired) {
      hydrateSession();
    }
  }, [reloginRequired, hydrateSession]);

  /**
   * Called immediately after a successful login or OAuth callback
   * to set auth state without waiting for /auth/me.
   * On subsequent refreshes, hydrateSession will re-fetch from server.
   */
  const setLoginAuthInfo = useCallback(
    (payload: AuthPayload) => {
      setAuthInfo(payload);
      dispatch(login(payload));
      setReloginRequired(false);
    },
    [dispatch]
  );

  /**
   * Logout: call server to clear httpOnly cookie, then wipe in-memory state.
   */
  const logoutUser = useCallback(() => {
    dispatch(startLoading("Logging you out…"));

    const finalizeLogout = () => {
      dispatch(logout());
      setAuthInfo(null);
      dispatch(stopLoading());
      // Full reload ensures all in-memory state is cleared
      window.location.href = "/auth/login";
    };

    GETAPI({
      path: "/auth/logout",
      isPrivateApi: true,
    }).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          console.warn(
            "Logout API did not succeed, completing local logout."
          );
        }
        finalizeLogout();
      },
      error: (error: any) => {
        console.warn("Logout API failed, completing local logout.", error);
        finalizeLogout();
      },
    });
  }, [dispatch]);

  if (loading) {
    return <Loader loaderText="Restoring your session…" />;
  }

  return (
    <AuthContext.Provider
      value={{ setLoginAuthInfo, authInfo, loading, reloginRequired, logoutUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// --- Custom Hook ---

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
