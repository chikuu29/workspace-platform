import { useEffect, useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { POSTAPI } from "../../app/api";
import { getOrCreateDeviceId } from "@/core/utils/services/appServices";
import { getStoredCodeVerifier } from "@/core/utils/services/pkceService";
import { fetchAppConfig } from "../../app/slices/appConfig/appConfigSlice";
import { login } from "../../app/slices/auth/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

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
import { X, ArrowRight } from "lucide-react";

type AuthStatus = "loading" | "error" | "success";
type ExchangeResult = { success: boolean; [key: string]: any };

// ─── Module-level exchange state ────────────────────────────────────────────
//
// WHY module-level instead of useRef / useState:
//
// React Strict Mode (dev only) does:  mount → cleanup → remount
// A useRef resets on remount because it's bound to the component instance.
// Module-level variables persist across both Strict Mode cycles within a
// single page navigation — exactly the scope we need.
//
// Three possible timing scenarios are handled:
//
//  Scenario A — API responds before Strict Mode cleanup:
//    Mount 1 handles the result → navigates away. ✅ Done.
//
//  Scenario B — API responds BETWEEN cleanup and remount (rare gap):
//    _cachedResult is populated, _activeCallback is null (cleared by cleanup).
//    Mount 2 runs, sees _cachedResult is already set → handles it immediately. ✅
//
//  Scenario C — API responds AFTER remount (normal case):
//    Mount 2 registered a fresh _activeCallback.
//    When the response arrives, _activeCallback points to mount 2's handler. ✅
//
// The module state is naturally reset on page reload (new OAuth flow).
// navigate(..., { replace: true }) removes /auth/callback from history so
// the user cannot hit Back and arrive here with stale module state.

let _attempted = false;
let _cachedResult: ExchangeResult | null = null;
let _activeCallback: ((res: ExchangeResult) => void) | null = null;

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [status, setStatus] = useState<AuthStatus>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // All useColorModeValue calls must be unconditionally at the top level.
  // Calling a Hook inside JSX or after a conditional early return violates
  // the Rules of Hooks and causes React's "change in hook order" crash.
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(15, 23, 42, 0.9)");
  const cardBorder = useColorModeValue("red.100", "red.900/40");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const errorIconBg = useColorModeValue("red.50", "red.900/30");

  useEffect(() => {
    // The result handler for the CURRENT component instance.
    // Wrapped in startTransition so Redux dispatches arriving from async
    // RxJS callbacks don't trigger "suspended during sync input" errors
    // when React.lazy Suspense boundaries are still loading chunks.
    const handleResult = (res: ExchangeResult) => {
      if (res.success) {
        startTransition(() => {
          dispatch(login(res));
          dispatch(fetchAppConfig());
          setStatus("success");
        });
        const stateRedirect = new URLSearchParams(window.location.search).get("state");
        // replace: true — removes /auth/callback from history so the browser
        // back button cannot re-trigger this page with the spent auth code.
        navigate(stateRedirect || "/myApps", { replace: true });
      } else {
        startTransition(() => {
          setStatus("error");
          setErrorMsg(res.message || "Token exchange failed.");
        });
      }
    };

    // ── Scenario B: result already arrived before this mount ───────────────
    if (_cachedResult !== null) {
      handleResult(_cachedResult);
      return;
    }

    // Register this instance as the active callback.
    // If the API is already in-flight (Strict Mode second mount), the response
    // will call this when it arrives — correctly targeting the live instance.
    _activeCallback = handleResult;

    // ── Strict Mode guard: don't fire the API call a second time ───────────
    if (_attempted) {
      // Cleanup: deregister so a stale reference can't call a dead instance.
      return () => {
        _activeCallback = null;
      };
    }

    _attempted = true;

    // ── URL parameter extraction ───────────────────────────────────────────
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      // Identity Provider returned an explicit OAuth error (e.g. user denied)
      console.error(`[AuthCallback] OAuth error: ${error} — ${errorDescription}`);
      const errResult: ExchangeResult = {
        success: false,
        message: errorDescription || `Authorization failed (${error}).`,
      };
      _cachedResult = errResult;
      _activeCallback?.(errResult);
      return;
    }

    if (!code) {
      const errResult: ExchangeResult = {
        success: false,
        message: "No authorization code found in the URL.",
      };
      _cachedResult = errResult;
      _activeCallback?.(errResult);
      return;
    }

    // ── Token Exchange (single-use auth code — fired exactly once) ─────────
    const clientId = import.meta.env.VITE_CLIENT_ID as string;
    const redirectUrl =
      (import.meta.env.VITE_REDIRECT_URL as string) ||
      `${window.location.origin}/auth/callback`;

    const subscription = POSTAPI({
      path: "oauth/exchange",
      data: {
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_url: redirectUrl,
        device_id: getOrCreateDeviceId(),
        code_verifier: getStoredCodeVerifier(),
      },
      isPrivateApi: true,
    }).subscribe({
      next: (res: any) => {
        // Cache result so Scenario B is handled if _activeCallback is null.
        _cachedResult = res as ExchangeResult;
        // Call whichever instance is currently active (mount 1 or mount 2).
        _activeCallback?.(res as ExchangeResult);
      },
      error: (err: unknown) => {
        console.error("[AuthCallback] Token exchange network error:", err);
        const errResult: ExchangeResult = {
          success: false,
          message: "A network error occurred during authentication.",
        };
        _cachedResult = errResult;
        _activeCallback?.(errResult);
      },
    });

    // WHY no unsubscribe:
    // React Strict Mode cleanup fires BEFORE mount 2 registers its callback.
    // Calling subscription.unsubscribe() here kills the in-flight HTTP request.
    // Mount 2 then waits on _activeCallback forever — nothing ever calls it.
    //
    // The correct approach: let the subscription stay alive. It will
    // self-complete naturally when the API responds. The _activeCallback
    // pointer is swapped to mount 2's handler in time to receive the result.
    //
    // We only clear the callback reference so a dead instance can't be called
    // if for some reason a stale response arrives after genuine navigation away.
    return () => {
      _activeCallback = null;
    };
  }, [dispatch, navigate]);

  // ─── Loading / Success ────────────────────────────────────────────────────
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

  // ─── Error State ──────────────────────────────────────────────────────────
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
            bg={errorIconBg}
            color="red.500"
          >
            <Icon as={X} boxSize="32px" />
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
            <ArrowRight style={{ marginLeft: "8px", strokeWidth: "3px" }} />
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AuthCallback;
