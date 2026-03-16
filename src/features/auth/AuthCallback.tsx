import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { POSTAPI } from "../../app/api";
import { getOrCreateDeviceId } from "../../utils/services/appServices";
import { getStoredCodeVerifier } from "../../utils/services/pkceService";
import { fetchAppConfig } from "../../app/slices/appConfig/appConfigSlice";
import { login } from "../../app/slices/auth/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
// import { useAuth } from "../../contexts/AuthProvider";

import {
  Flex,
  Box,
  VStack,
  Text,
  Button,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuX, LuArrowRight } from "react-icons/lu";

type AuthStatus = "loading" | "error" | "success";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // const { setLoginAuthInfo } = useAuth();

  const [status, setStatus] = useState<AuthStatus>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Aesthetics for the error card
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(15, 23, 42, 0.9)");
  const cardBorder = useColorModeValue("red.100", "red.900/40");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    // 1. Extract the authorization code & errors from URL parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      // Identity Provider returned an explicit error (e.g. user denied access)
      console.error(`OAuth Callback Error: ${error} - ${errorDescription}`);
      setStatus("error");
      setErrorMsg(errorDescription || `Authorization failed (${error}).`);
      return;
    }

    if (code) {
      exchangeAuthorizationCode(code);
    } else {
      // Neither code nor error is present; malformed callback
      setStatus("error");
      setErrorMsg("No authorization code found in the URL.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exchangeAuthorizationCode = async (code: string) => {
    const clientId = import.meta.env.VITE_CLIENT_ID as string;
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET as string;
    const redirectUrl = (import.meta.env.VITE_REDIRECT_URL as string) || `${window.location.origin}/auth/callback`;

    const deviceId = getOrCreateDeviceId();
    const codeVerifier = getStoredCodeVerifier();

    const apiRequestData = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_url: redirectUrl,
      device_id: deviceId,
      code_verifier: codeVerifier,
    };

    POSTAPI({
      path: "oauth/exchange",
      data: apiRequestData,
      isPrivateApi: true,
    }).subscribe({
      next: (res: any) => {
        console.log("res", res);
        if (res.success) {
          // const loginPayload = {
          //   success: true,
          //   login_info: res.login_info,
          //   access_token: res.access_token,
          //   authProvider: res.authProvider,
          // };
          // setLoginAuthInfo(loginPayload);
          dispatch(login(res));
          dispatch(fetchAppConfig());
          setStatus("success");

          // Extract the redirect URL from the state parameter (passed from SignIn.tsx)
          const params = new URLSearchParams(window.location.search);
          const stateRedirect = params.get("state");
          navigate(stateRedirect || "/myApps");
        } else {
          setStatus("error");
          setErrorMsg(res.message || "Token exchange failed.");
        }
      },
      error: (err: any) => {
        console.error("Error exchanging authorization code:", err);
        setStatus("error");
        setErrorMsg("A network error occurred during authentication exchange.");
      },
    });
  };

  // ─── Render Loading State ──────────────────────────────────────────
  if (status === "loading" || status === "success") {
    return (
      <Flex direction="column" justify="center" align="center" minH="100vh" bg="bg.default">
        <VStack gap={6}>
          <Spinner size="xl" color="brand.500" />
          <VStack gap={2}>
            <Text fontSize="lg" fontWeight="600" color={textColor}>
              Authenticating You...
            </Text>
            <Text fontSize="sm" color={mutedColor}>
              Securely verifying your identity. Please wait.
            </Text>
          </VStack>
        </VStack>
      </Flex>
    );
  }

  // ─── Render Error State ────────────────────────────────────────────
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      minH="100vh"
      bg="bg.default"
      p={4}
    >
      <Box
        bg={cardBg}
        backdropFilter="blur(20px)"
        borderRadius="2xl"
        p={8}
        maxW="400px"
        w="full"
        boxShadow="0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)"
        border="1px solid"
        borderColor={cardBorder}
        animation="fadeIn 0.3s ease-out"
        textAlign="center"
      >
        <VStack gap={6}>
          <Flex
            justify="center"
            align="center"
            w="64px"
            h="64px"
            borderRadius="full"
            bg={useColorModeValue("red.50", "red.900/30")}
            color="red.500"
          >
            <Icon as={LuX} boxSize="32px" />
          </Flex>

          <VStack gap={3}>
            <Text fontSize="xl" fontWeight="700" color={textColor}>
              Authentication Error
            </Text>
            <Text fontSize="md" color={mutedColor}>
              {errorMsg}
            </Text>
          </VStack>

          <Button
            mt={4}
            w="full"
            size="lg"
            h="48px"
            onClick={() => navigate("/auth/login")}
            borderRadius="xl"
            bg="linear-gradient(135deg, #7c3aed 0%, #a855f7 55%, #06b6d4 100%)"
            color="white"
            boxShadow="0 6px 15px rgba(139, 92, 246, 0.3)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(139, 92, 246, 0.45)",
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "0 4px 10px rgba(139, 92, 246, 0.3)",
            }}
          >
            Return to Login
            <LuArrowRight style={{ marginLeft: "8px", strokeWidth: "3px" }} />
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AuthCallback;
