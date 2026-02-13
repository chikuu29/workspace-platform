import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { POSTAPI } from "../../app/api";
import { getOrCreateDeviceId } from "../../utils/services/appServices";
import { fetchAppConfig } from "../../app/slices/appConfig/appConfigSlice";
import { login } from "../../app/slices/auth/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { useAuth } from "../../contexts/AuthProvider";

const AuthCallback = () => {
  //   const history = useHistory();
  console.log("====CALLING AUTHCALLBACK===");

  const navigate = useNavigate();
  const clientId = "work_space_platform";
  const clientSecret = "Demo@123";
  // const tokenUrl = "https://myomspanel.onrender.com/api/oauth/token/";
  const tokenUrl = "https://localhost:5173s/api/oauth/token/";
  const dispatch = useDispatch<AppDispatch>();
  const { loading, authInfo, setLoginAuthInfo } = useAuth();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    console.log("code", code);

    if (code) {
      exchangeAuthorizationCode(code);
    }
  }, []);

  const exchangeAuthorizationCode = async (code: string) => {
    const deviceId = getOrCreateDeviceId();

    try {
      // Create URLSearchParams for x-www-form-urlencoded encoding
      const formData = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code", // Correct value
        code,
        redirect_uri: "http://localhost:5173/auth/callback",
        device_id: deviceId,
      });

      // Make POST request with proper headers
      // const response = await axios.post(tokenUrl, formData, {
      //   headers: {
      //     "Cache-Control": "no-cache", // Cache-Control header is optional
      //     "Content-Type": "application/x-www-form-urlencoded", // Required
      //   },
      // });
      // console.log("resposce", response);

      // // Store tokens in localStorage
      // const { access_token, refresh_token } = response.data;
      // localStorage.setItem("access_token", access_token);
      // localStorage.setItem("refresh_token", refresh_token);
      const apiRequestData = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code", // Correct value
        code,
        redirect_url: "http://localhost:5173/auth/callback",
        device_id: deviceId,
      };
      POSTAPI({
        path: "oauth/token",
        data: apiRequestData,
        isPrivateApi: true,
      }).subscribe((res: any) => {
        console.log(res);
        if (res.success) {
          localStorage.setItem("access_token", res.access_token);
          localStorage.setItem("id_token", res.id_token);
          localStorage.setItem("login_info", JSON.stringify(res.login_info));
          localStorage.setItem("tenant_name", res["login_info"]["tenant_name"]);
          localStorage.setItem("authInfo", JSON.stringify(res));
          // Ensure data is set before navigating

          let loginInfo: any = {};
          loginInfo["login_info"] = res.login_info || {};
          loginInfo.access_token = res.access_token;
          loginInfo.success = true;
          loginInfo.isAuthenticated = true;
          // loginInfo.login_info=storedLoginInfo

          console.log("Login Info:", loginInfo);
          setLoginAuthInfo(res["login_info"]);
          dispatch(fetchAppConfig());
          // setAuthInfo(loginInfo); // No need for unnecessary nesting
          dispatch(login(loginInfo));
          navigate(`/${res["login_info"]["tenant_name"]}/myApps`);

        }
      });

      // Navigate to the next page
      // navigate("/app/myApps");
    } catch (error: any) {
      console.error(
        "Error exchanging authorization code:",
        error.response?.data || error
      );
    }
  };

  return <div>Processing login...</div>;

  // useEffect(() => {
  //   // Extract query parameters
  //   const query = new URLSearchParams(window.location.search);
  //   const accessToken = query.get('accessToken');

  //   if (accessToken) {
  //     // Store the access token (e.g., in local storage or state management)
  //     localStorage.setItem('accessToken', accessToken);

  //     // Redirect to your application's main page or wherever necessary
  //   //   history.push('/dashboard'); // Change to your desired route
  //   } else {
  //     // Handle missing access token (e.g., redirect to login page)
  //     console.error('No access token received');
  //   //   history.push('/login'); // Redirect to login page
  //   }
  // }, [history]);

  // return <div>Loading...</div>; // Optional loading state
};

export default AuthCallback;
