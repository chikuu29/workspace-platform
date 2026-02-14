import {
  useContext,
  createContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { login, logout } from "@/app/slices/auth/authSlice";
import { GETAPI } from "@/app/api";
import { fetchAppConfig } from "@/app/slices/appConfig/appConfigSlice";
import type { AppDispatch } from '@/app/store';
import Loader from "@/features/ui/components/Loader/Loader";
import { startLoading, stopLoading } from "@/app/slices/loader/appLoaderSlice";

// Define user type
interface User {
  name: string;
  email: string;
}

// Define context type
interface AuthContextType {
  authInfo: any;
  reloginRequired: boolean;
  login?: (userData: User) => void;
  logoutUser?: () => void;
  loading: boolean;
  setLoginAuthInfo: (data: any) => void;
}

// Define props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provide the context to children components
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [reloginRequired, setReloginRequired] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      dispatch(startLoading("Rebuilding login session, please wait..."));

      try {
        const storedLoginInfo = localStorage.getItem("login_info");
        const accessToken = localStorage.getItem("access_token");

        if (!storedLoginInfo || !accessToken) {
          console.warn("Authentication details missing.");
          setAuthInfo(null); // No redirection, just reset auth state
          return;
        }

        let loginInfo: any = {}
        loginInfo['login_info'] = JSON.parse(storedLoginInfo) || {};
        loginInfo.access_token = accessToken;
        loginInfo.success = true;
        loginInfo.isAuthenticated = true;
        // loginInfo.login_info=storedLoginInfo

        console.log("Login Info:", loginInfo);

        dispatch(fetchAppConfig());
        setAuthInfo(loginInfo); // No need for unnecessary nesting
        dispatch(login(loginInfo));
      } catch (error) {
        console.error("Error fetching login info:", error);
      } finally {
        dispatch(stopLoading());
        setLoading(false);
      }
    };

    if (reloginRequired) {
      fetchData();
    }
  }, [reloginRequired, dispatch]);

  const setLoginAuthInfo = (loginData: any) => {
    console.log("Setting AUTH INFO FROM LOGIN:", loginData);
    setAuthInfo((prevAuth: any) => ({ ...prevAuth, ...loginData }));
    setReloginRequired(false);
  };

  const logoutUser = async () => {
    console.log("Logging out...");
    dispatch(startLoading("Logging you out, please wait..."));

    try {
      GETAPI({
        path: "/auth/logout",
        isPrivateApi: true,
      }).subscribe((res: any) => {
        if (res.success) {

          dispatch(logout());
          localStorage.clear(); // Clear local storage
          dispatch(stopLoading());
          location.reload(); // Refresh page after logout
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <Loader loaderText="Rebuilding login session, please wait..." />;
  }

  return (
    <AuthContext.Provider value={{ setLoginAuthInfo, authInfo, loading, reloginRequired, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
