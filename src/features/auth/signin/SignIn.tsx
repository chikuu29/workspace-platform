// Chakra imports
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Alert } from "@/components/ui/alert";
import { useColorModeValue } from "@/components/ui/color-mode";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react";
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

const CustomSsoIcon = () => {
  const iconStroke = useColorModeValue("#422AFB", "#a78bfa");
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sso-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7551FF" />
          <stop offset="100%" stopColor="#3965FF" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        stroke="url(#sso-icon-grad)"
        strokeWidth="1.8"
        strokeDasharray="6 3"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <path
        d="M12 5.5L7.5 7.2V11.2C7.5 14.5 12 17.5 12 17.5C12 17.5 16.5 14.5 16.5 11.2V7.2L12 5.5Z"
        stroke={iconStroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.circle
        cx="12"
        cy="11.5"
        r="2"
        fill="#7551FF"
        animate={{ scale: [0.8, 1.3, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
};

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  const loginWithSso = async () => {
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
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Flex
      position="relative"
      minH="100vh"
      w="100vw"
      direction={{ base: "column", md: "row" }}
      overflow="hidden"
      bg={useColorModeValue("gray.50", "navy.900")}
    >
      <AppVersionAlert isNewVersionAvailable={isNewVersionAvailable} />

      {/* Ambient decorative backgrounds */}
      <Box
        position="absolute"
        top="-15%"
        left="-10%"
        w="600px"
        h="600px"
        bgGradient="radial(brand.400, transparent)"
        filter="blur(110px)"
        opacity="0.2"
        zIndex="0"
        pointerEvents="none"
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
        zIndex="0"
        pointerEvents="none"
      />

      {/* Left Panel: Marketing Showcase */}

      <Flex
        w={{ base: "100%", md: "50%" }}
        h={{ base: "auto", md: "100vh" }}
        direction="column"
        justifyContent="center"
        alignItems="center"
        position="relative"
        px={{ base: 6, md: 12, lg: 20 }}
        py={{ base: 12, md: 8 }}
        zIndex="1"
        bg={useColorModeValue("white", "navy.900")}
      >
        <MotionStack
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          w="100%"
          maxW="md"
          gap={8}
          align="stretch"
        >
          {/* Portal header with animated Logo */}
          <Stack gap={4} align="center" textAlign="center">
            {/* Logo Container with spring and rotation */}
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              whileHover={{
                scale: 1.05,
                rotate: [0, 6, -6, 0],
              }}
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
              color={useColorModeValue("navy.900", "white")}
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
              color={useColorModeValue("gray.600", "secondaryGray.500")}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
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
              whileHover={{
                scale: 1.025,
                boxShadow: "0 0 25px rgba(117, 81, 255, 0.45)",
              }}
              whileTap={{ scale: 0.975 }}
              cursor="pointer"
              onClick={loginWithSso}
              position="relative"
              borderRadius="xl"
              p="1.5px"
              bgGradient="linear(to-r, brand.400, blue.400, brand.400)"
              bgSize="200% auto"
              animate={{
                backgroundPosition: ["0% center", "200% center"],
                opacity: 1,
                y: 0,
              }}
              transition={{
                backgroundPosition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                },
                opacity: { delay: 0.15 },
                y: { delay: 0.15 },
              }}
              overflow="hidden"
            >
              <Flex
                h="52px"
                w="100%"
                bg={useColorModeValue("white", "navy.950")}
                borderRadius="calc(12px - 1.5px)"
                align="center"
                justify="center"
                px={6}
                transition="background 0.2s"
                _hover={{
                  bg: useColorModeValue("gray.50", "whiteAlpha.50"),
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="center" me={3}>
                  <CustomSsoIcon />
                </Box>
                <Text
                  fontSize="sm"
                  fontWeight="800"
                  letterSpacing="0.02em"
                  bgGradient="to-r"
                  gradientFrom="brand.400"
                  gradientTo="blue.400"
                  bgClip="text"
                >
                  Continue with SSO
                </Text>
              </Flex>
            </MotionBox>

            <Flex align="center" gap={3} px={2}>
              <Box flex="1" h="1px" bg={useColorModeValue("gray.200", "whiteAlpha.100")} />
              <Text
                color={useColorModeValue("gray.400", "secondaryGray.600")}
                fontSize="2xs"
                textAlign="center"
                fontWeight="750"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Secure Enterprise Login
              </Text>
              <Box flex="1" h="1px" bg={useColorModeValue("gray.200", "whiteAlpha.100")} />
            </Flex>

            {/* Footer Registration Link */}
            <Flex justify="center" align="center" mt={2}>
              <Text
                color={useColorModeValue("gray.600", "secondaryGray.500")}
                fontSize="sm"
                fontWeight="500"
              >
                Not registered yet?{" "}
                <NavLink to="/auth/sign-up">
                  <Text
                    as="span"
                    color="brand.500"
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

      {/* Right Panel: Sign In Portal */}
      <Flex
        w={{ base: "100%", md: "50%" }}
        h={{ base: "auto", md: "100vh" }}
        minH={{ base: "auto", md: "100vh" }}
        direction="column"
        justifyContent="center"
        alignItems="center"
        position="relative"
        px={{ base: 6, md: 10, lg: 16 }}
        py={{ base: 12, md: 8 }}
        borderRight={{ base: "none", md: "1px solid" }}
        borderColor={useColorModeValue("gray.200", "whiteAlpha.100")}
        bg="navy.950"
        zIndex="1"
      >
        {/* Sparkly background glow just for Left Panel */}
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
          zIndex="0"
          pointerEvents="none"
        />

        <Flex
          direction="column"
          w="100%"
          maxW="xl"
          h="100%"
          justifyContent="center"
          gap={8}
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
                // color="white"
                textAlign="center"
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
      </Flex>
    </Flex>
  );
};

export default SignIn;
