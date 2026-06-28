import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Alert } from "@/components/ui/alert";
import { useColorModeValue, DarkMode } from "@/components/ui/color-mode";
import { NavLink, useLocation, useNavigate } from "react-router";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/app/slices/auth/authSlice";
import { fetchAppConfig } from "@/app/slices/appConfig/appConfigSlice";
import { AppDispatch } from "@/app/store";
import { motion, AnimatePresence } from "framer-motion";
import { startLoading } from "@/app/slices/loader/appLoaderSlice";
import { POSTAPI } from "@/app/api";
import AppVersionAlert from "@/features/ui/components/alert/AppVersionAlert";
import { AlertProps } from "@/app/types/appConfigInterface";
import { Fingerprint } from "lucide-react";
import { getOrCreateDeviceId } from "@/core/utils/services/appServices";
import { env } from "@/app/env";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  storeCodeVerifier,
} from "@/core/utils/services/pkceService";
import MarketingShowcase from "./MarketingShowcase";

const MotionFlex = motion.create(Flex);
const MotionBox = motion.create(Box);
const MotionStack = motion.create(Stack);

const SignIn = () => {
  const [isNewVersionAvailable, setIsNewVersionAvailable] =
    useState<boolean>(false);
  const [isLoading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState<AlertProps>({
    title: "",
    description: "",
    status: "info",
    isVisible: false,
  });
  const [userCredentials, setUserCredentials] = useState({
    loginId: "",
    password: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect");

  const checkVersion = useCallback(async () => {
    try {
      const versionUrl = `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`;
      const response = await fetch(versionUrl);
      const CURRENT_VERSION = "{{HASH_PLACEHOLDER}}";
      if (!response.ok) return;

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) return;

      const responseText = await response.text();
      let data: Record<string, string>;
      try {
        data = JSON.parse(responseText);
      } catch {
        return;
      }

      if (
        data["version"] !== CURRENT_VERSION &&
        CURRENT_VERSION !== "{{HASH_PLACEHOLDER}}"
      ) {
        setIsNewVersionAvailable(true);
      }
    } catch (error) {
      // Ignore version check failures to avoid noisy logs on auth route.
    }
  }, []);

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowAlert((prev) => ({ ...prev, isVisible: false }));

    try {
      POSTAPI({
        path: "auth/login",
        data: userCredentials,
        isPrivateApi: false,
      }).subscribe({
        next: (res: any) => {
          setLoading(false);
          if (res.success) {
            dispatch(fetchAppConfig());
            dispatch(login(res));
            setShowAlert({
              title: "Success",
              description: res.message || "Login successful",
              status: "success",
              isVisible: true,
            });
            setTimeout(() => navigate(redirectUrl || "/myApps"), 500);
          } else {
            setShowAlert({
              title: "Login Failed",
              description: res.message || "Invalid credentials",
              status: "error",
              isVisible: true,
            });
          }
        },
        error: (error: any) => {
          setLoading(false);
          setShowAlert({
            title:
              error.message === "Network Error" ? "Network Error" : "error",
            description:
              error.message === "Network Error"
                ? "Please Check Your Internet Connection"
                : error?.response?.data?.message || "Login failed",
            status: "error",
            isVisible: true,
          });
        },
      });
    } catch (error: any) {
      setLoading(false);
      setShowAlert({
        title: "Error",
        description: "An unexpected error occurred",
        status: "error",
        isVisible: true,
      });
    }
  }, [userCredentials, dispatch, navigate, redirectUrl]);

  const loginWithSso = useCallback(async () => {
    dispatch(startLoading("Redirecting to SSO..."));
    const clientId = env("VITE_CLIENT_ID");
    const authServerUrl = env("VITE_OAUTH_URL");
    const redirectTo =
      env("VITE_REDIRECT_URL") || `${window.location.origin}/auth/callback`;
    const deviceId = getOrCreateDeviceId();

    // PKCE: Generate verifier, persist it, and derive the challenge (S256)
    const codeVerifier = generateCodeVerifier();
    storeCodeVerifier(codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const authUrl = new URL(authServerUrl);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_url", redirectTo);
    authUrl.searchParams.set("scope", "openid profile email");
    authUrl.searchParams.set("device_id", deviceId);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    // Pass the redirect parameter in the state to preserve it through the OAuth flow
    if (redirectUrl) {
      authUrl.searchParams.set("state", redirectUrl);
    }

    window.open(authUrl.toString(), "_self");
  }, [dispatch, redirectUrl]);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
      },
    },
  }), []);

  const ssoIconColor = useColorModeValue("#422AFB", "#a78bfa");
  const ssoButtonBorder = useColorModeValue("brand.200", "brand.400");
  const ssoButtonBg = useColorModeValue("white", "whiteAlpha.50");
  const ssoButtonHoverBg = useColorModeValue("brand.50", "whiteAlpha.100");
  const ssoButtonHoverBorder = useColorModeValue("brand.500", "brand.300");
  const ssoButtonTextColor = useColorModeValue("brand.500", "brand.200");
  const dividerBg = useColorModeValue("gray.200", "whiteAlpha.100");
  const dividerTextColor = useColorModeValue("gray.500", "secondaryGray.600");
  const textLinkColor = useColorModeValue("brand.500", "brand.400");
  const textMutedColor = useColorModeValue("gray.600", "secondaryGray.500");
  const headerTextColor = useColorModeValue("navy.900", "white");
  const mainWrapperBg = useColorModeValue("gray.50", "navy.900");
  const formPanelBg = useColorModeValue("white", "navy.900");

  return (
    <Flex
      position="relative"
      minH="100vh"
      w="100vw"
      direction={{ base: "column", md: "row" }}
      overflowX="hidden"
      overflowY="auto"
      bg={mainWrapperBg}
    >
      <AppVersionAlert isNewVersionAvailable={isNewVersionAvailable} />

      {/* Ambient decorative backgrounds wrapped to prevent layout expansion */}
      <Box
        position="absolute"
        inset="0"
        overflow="hidden"
        pointerEvents="none"
        zIndex="0"
      >
        <Box
          position="absolute"
          top="-15%"
          left="-10%"
          w="600px"
          h="600px"
          bgGradient="radial(brand.400, transparent)"
          filter="blur(110px)"
          opacity="0.2"
        />
        <Box
          position="absolute"
          bottom="-15%"
          right="-10%"
          w="700px"
          h="700px"
          bgGradient="radial(blue.500, transparent)"
          filter="blur(130px)"
          opacity="0.18"
        />
      </Box>

      {/* Left Panel: Sign In Form & Actions */}
      <Flex
        w={{ base: "100%", md: "50%" }}
        minH={{ base: "auto", md: "100vh" }}
        direction="column"
        justifyContent="center"
        alignItems="center"
        position="relative"
        px={{ base: 6, md: 12, lg: 20 }}
        py={{ base: 8, md: 10, lg: 12 }}
        zIndex="1"
        bg={formPanelBg}
      >
        <MotionStack
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          w="100%"
          maxW="md"
          gap={{ base: 6, md: 8 }}
          align="stretch"
        >
          {/* Portal header with static Logo */}
          <Stack gap={4} align="center" textAlign="center">
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              cursor="pointer"
              mb={2}
            >
              <Image
                src="/assets/icons/workspace-logo.svg"
                alt="Workspace Logo"
                h="46px"
                w="auto"
                objectFit="contain"
              />
            </MotionBox>

            <Flex align="center" gap={2}>
              <Box h="1.5px" w="20px" bg="brand.400" borderRadius="full" />
              <Text
                textTransform="uppercase"
                fontSize="2xs"
                fontWeight="800"
                color="brand.400"
                letterSpacing="widest"
              >
                Portal Access
              </Text>
              <Box h="1.5px" w="20px" bg="brand.400" borderRadius="full" />
            </Flex>

            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="900"
              letterSpacing="tight"
              lineHeight="1.1"
              color={headerTextColor}
            >
              Sign In to{" "}
              <Text
                as="span"
                bgGradient="to-r"
                gradientFrom="brand.400"
                gradientTo="blue.600"
                bgClip="text"
              >
                Workspace
              </Text>
              <Text as="span" color="brand.400">
                .
              </Text>
            </Heading>

            <Text
              color={textMutedColor}
              fontSize="sm"
              fontWeight="500"
              lineHeight="tall"
              maxW="sm"
            >
              Secure enterprise access to manage all your business at one place.
            </Text>
          </Stack>

          {/* Feedback message banner */}
          <AnimatePresence>
            {showAlert.isVisible && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Alert
                  status={showAlert.status as any}
                  variant="outline"
                  borderRadius="xl"
                  borderWidth="1.5px"
                  fontSize="sm"
                  title={showAlert.title}
                >
                  {showAlert.description}
                </Alert>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Login actions panel */}
          <Stack gap={6}>
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              cursor="pointer"
              onClick={loginWithSso}
            >
              <Button
                size="lg"
                h="54px"
                w="100%"
                borderRadius="xl"
                border="1px solid"
                borderColor={ssoButtonBorder}
                bg={ssoButtonBg}
                _hover={{
                  bg: ssoButtonHoverBg,
                  borderColor: ssoButtonHoverBorder,
                  boxShadow: "0 8px 30px rgba(117, 81, 255, 0.12)",
                }}
                transition="all 0.2s ease"
              >
                <Fingerprint size={20} color={ssoIconColor} />
                <Text
                  fontSize="sm"
                  fontWeight="800"
                  color={ssoButtonTextColor}
                  ml={2}
                >
                  Continue with SSO
                </Text>
              </Button>
            </MotionBox>

            <Flex align="center" gap={3} px={2}>
              <Box flex="1" h="1px" bg={dividerBg} />
              <Text
                color={dividerTextColor}
                fontSize="2xs"
                textAlign="center"
                fontWeight="750"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Secure Enterprise Login
              </Text>
              <Box flex="1" h="1px" bg={dividerBg} />
            </Flex>

            {/* Footer Registration Link */}
            <Flex justify="center" align="center" mt={2}>
              <Text
                color={textMutedColor}
                fontSize="sm"
                fontWeight="500"
              >
                Not registered yet?{" "}
                <NavLink to="/auth/sign-up">
                  <Text
                    as="span"
                    color={textLinkColor}
                    fontWeight="700"
                    _hover={{ textDecoration: "underline" }}
                    transition="color 0.2s"
                  >
                    Create an Account
                  </Text>
                </NavLink>
              </Text>
            </Flex>
          </Stack>
        </MotionStack>
      </Flex>

      {/* Right Panel: Feature Showcase */}
      <Flex
        w={{ base: "100%", md: "50%" }}
        minH={{ base: "auto", md: "100vh" }}
        direction="column"
        justifyContent="center"
        alignItems="center"
        position="relative"
        px={{ base: 6, md: 10, lg: 16 }}
        py={{ base: 8, md: 10, lg: 12 }}
        borderRight={{ base: "none", md: "1px solid" }}
        borderColor={useColorModeValue("gray.200", "whiteAlpha.100")}
        bg="navy.950"
        zIndex="1"
      >
        {/* Sparkly background glow wrapped to prevent layout expansion */}
        <Box
          position="absolute"
          inset="0"
          overflow="hidden"
          pointerEvents="none"
          zIndex="0"
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="450px"
            h="450px"
            bgGradient="radial(brand.400, transparent)"
            filter="blur(120px)"
            opacity="0.12"
          />
        </Box>

        <DarkMode>
          <Flex
            direction="column"
            w="100%"
            maxW="xl"
            justifyContent="center"
            gap={{ base: 4, md: 6, lg: 8 }}
            zIndex="1"
          >
            {/* Headline Text */}
            <Stack gap={2.5} align="center" textAlign="center">
              <MotionFlex
                align="center"
                justify="center"
                gap={2.5}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box h="2px" w="12px" bg="brand.400" borderRadius="full" />
                <Text
                  textTransform="uppercase"
                  fontSize="2xs"
                  fontWeight="800"
                  color="brand.400"
                  letterSpacing="widest"
                >
                  Empower Your Business
                </Text>
                <Box h="2px" w="12px" bg="brand.400" borderRadius="full" />
              </MotionFlex>

              <MotionBox
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
              >
                <Heading
                  lineHeight={1.2}
                  fontSize={{ base: "2xl", sm: "3xl", lg: "4xl" }}
                  fontWeight="900"
                  letterSpacing="tight"
                  textAlign="center"
                  color={{ _dark: "#f1f1f1", _light: "#D946EF" }}
                // color="#D946EF"
                >
                  All-In-One SaaS{" "}
                  <Text
                    as="span"
                    bgGradient="to-r"
                    gradientFrom="brand.400"
                    gradientTo="blue.400"
                    bgClip="text"
                  >
                    Enterprise Hub
                  </Text>
                  .
                </Heading>
              </MotionBox>
            </Stack>

            {/* Rotating marketing panel */}
            <MarketingShowcase />
          </Flex>
        </DarkMode>
      </Flex>
    </Flex>
  );
};

export default React.memo(SignIn);
