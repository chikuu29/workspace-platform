import { useEffect } from "react";
import { useNavigate } from "react-router";
import { POSTAPI } from "../../app/api";
import { getOrCreateDeviceId } from "../../utils/services/appServices";
import { fetchAppConfig } from "../../app/slices/appConfig/appConfigSlice";
import { login } from "../../app/slices/auth/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { useAuth } from "../../contexts/AuthProvider";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { setLoginAuthInfo } = useAuth();

  // Constants for OAuth configuration
  const clientId = "work_space_platform";
  const clientSecret = "Demo@123";
  const redirectUrl = "http://localhost:5173/auth/callback";

  useEffect(() => {
    // 1. Extract the authorization code from URL parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      exchangeAuthorizationCode(code);
    } else {
      console.error("No authorization code found in URL");
      navigate("/auth/login"); // Redirect back to login if no code
    }
  }, []);

  const exchangeAuthorizationCode = async (code: string) => {
    const deviceId = getOrCreateDeviceId();

    // 2. Prepare the payload for token exchange
    const apiRequestData = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_url: redirectUrl,
      device_id: deviceId,
    };

    // 3. call the API to exchange the code for tokens
    POSTAPI({
      path: "oauth/token",
      data: apiRequestData,
      isPrivateApi: true,
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          // 4. Store tokens and user info in localStorage
          localStorage.setItem("access_token", res.access_token);
          localStorage.setItem("id_token", res.id_token);
          localStorage.setItem("login_info", JSON.stringify(res.login_info));
          localStorage.setItem("tenant_name", res.login_info?.tenant_name);
          localStorage.setItem("authInfo", JSON.stringify(res));

          // 5. Construct the login info object for Redux state
          const loginInfo = {
            login_info: res.login_info || {},
            access_token: res.access_token,
            success: true,
            isAuthenticated: true,
          };

          // 6. Update application state
          setLoginAuthInfo(res.login_info);
          dispatch(fetchAppConfig());
          dispatch(login(loginInfo));

          // 7. Redirect to the main application area
          navigate("/myApps");
        } else {
          console.error("Token exchange failed:", res.message);
          navigate("/auth/login"); // Redirect on failure
        }
      },
      error: (error: any) => {
        console.error("Error exchanging authorization code:", error);
        navigate("/auth/login"); // Redirect on error
      }
    });
  };

  return <div>Processing login...</div>;
};

export default AuthCallback;
