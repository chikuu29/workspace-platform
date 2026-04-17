// Chakra imports
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Icon,
    Input,
    SimpleGrid,
    Stack,
    Text,
} from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { useColorModeValue } from "@/components/ui/color-mode";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { HSeparator } from "@/features/ui/components/separator/Separator";
// import { useAuth } from "@/contexts/AuthProvider";
import { useDispatch } from "react-redux";
import { login } from "@/app/slices/auth/authSlice";
import { fetchAppConfig } from "@/app/slices/appConfig/appConfigSlice";
import { AppDispatch } from "@/app/store";
import { motion, AnimatePresence } from "framer-motion";
import { startLoading } from "@/app/slices/loader/appLoaderSlice";
import { POSTAPI } from "@/app/api";
import AppVersionAlert from "@/features/ui/components/alert/AppVersionAlert";
import { AlertProps } from "@/app/types/appConfigInterface";
import { SiAuthelia } from "react-icons/si";
import { getOrCreateDeviceId } from "@/utils/services/appServices";
import {
    generateCodeVerifier,
    generateCodeChallenge,
    storeCodeVerifier,
} from "@/utils/services/pkceService";

const MotionBox = motion.create(Box);
const MotionStack = motion.create(Stack);
const MotionIcon = motion.create(Icon);

const SignIn = () => {
    const [isNewVersionAvailable, setIsNewVersionAvailable] = useState<boolean>(false);
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
    // const { authInfo, setLoginAuthInfo } = useAuth();

    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get("redirect");
    const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
    const googleText = useColorModeValue("navy.700", "white");
    const googleHover = { bg: useColorModeValue("gray.200", "whiteAlpha.300") };

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

            if (data["version"] !== CURRENT_VERSION && CURRENT_VERSION !== "{{HASH_PLACEHOLDER}}") {
                setIsNewVersionAvailable(true);
            }
        } catch (error) {
            // Ignore version check failures to avoid noisy logs on auth route.
        }
    }, []);

    useEffect(() => {
        checkVersion();
    }, [checkVersion]);

    // useEffect(() => {
    //     if (authInfo?.success) {
    //         navigate(redirectUrl || "/myApps", { replace: true });
    //     }
    // }, [authInfo, navigate, redirectUrl]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setShowAlert(prev => ({ ...prev, isVisible: false }));

        try {
            POSTAPI({
                path: "auth/login",
                data: userCredentials,
                isPrivateApi: false,
            }).subscribe({
                next: (res: any) => {
                    setLoading(false);
                    if (res.success) {
                        // setLoginAuthInfo(res["login_info"]);
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
                        title: error.message === "Network Error" ? "Network Error" : "error",
                        description: error.message === "Network Error"
                            ? "Please Check Your Internet Connection"
                            : (error?.response?.data?.message || "Login failed"),
                        status: "error",
                        isVisible: true,
                    });
                }
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
        const clientId = import.meta.env.VITE_CLIENT_ID as string;
        const authServerUrl = import.meta.env.VITE_OAUTH_URL as string;
        const redirectTo = (import.meta.env.VITE_REDIRECT_URL as string) || `${window.location.origin}/auth/callback`;
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
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <Box
            position="relative"
            minH="100vh"
            display="flex"
            alignItems="center"
            overflow="hidden"
            bg={useColorModeValue("gray.50", "navy.900")}
        >
            <AppVersionAlert isNewVersionAvailable={isNewVersionAvailable} />

            {/* Background Decorative Elements */}
            <Box
                position="absolute"
                top="-15%"
                left="-10%"
                w="500px"
                h="500px"
                bgGradient="radial(brand.400, transparent)"
                filter="blur(80px)"
                opacity="0.4"
                zIndex="0"
            />
            <Box
                position="absolute"
                bottom="-15%"
                right="-10%"
                w="600px"
                h="600px"
                bgGradient="radial(blue.500, transparent)"
                filter="blur(100px)"
                opacity="0.3"
                zIndex="0"
            />

            <Container maxW="7xl" position="relative" zIndex="1" py={{ base: 12, md: 24 }}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 16, lg: 32 }} alignItems="center">

                    {/* Left Side: Welcome Content */}
                    <MotionStack
                        gap={8}
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <MotionBox variants={itemVariants}>
                            <Heading
                                lineHeight={1.1}
                                fontSize={{ base: "4xl", sm: "5xl", md: "6xl" }}
                                fontWeight="900"
                                letterSpacing="tight"
                            >
                                Unify Your{" "}
                                <Text
                                    as="span"
                                    bgGradient="to-r"
                                    gradientFrom="brand.400"
                                    gradientTo="blue.500"
                                    bgClip="text"
                                >
                                    Entire Business.
                                </Text>
                            </Heading>
                        </MotionBox>

                        <MotionBox
                            variants={itemVariants}
                            p={8}
                            borderRadius="3xl"
                            bg={useColorModeValue("whiteAlpha.700", "whiteAlpha.100")}
                            backdropFilter="blur(16px)"
                            border="1px solid"
                            borderColor={useColorModeValue("white", "whiteAlpha.200")}
                            boxShadow="2xl"
                        >
                            <Stack gap={4}>
                                <Text
                                    fontSize="xl"
                                    fontWeight="600"
                                    color={useColorModeValue("gray.800", "white")}
                                >
                                    Experience the next generation of productivity.
                                </Text>
                                <Text
                                    fontSize="lg"
                                    color={useColorModeValue("gray.600", "gray.400")}
                                    lineHeight="tall"
                                >
                                    Every category of your business, unified in one powerful workspace.
                                    Sign in to access your dashboard and manage operations with
                                    unprecedented speed and security.
                                </Text>
                            </Stack>
                        </MotionBox>
                    </MotionStack>

                    {/* Right Side: Sign In Form */}
                    <MotionStack
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        bg={useColorModeValue("white", "navy.800")}
                        p={{ base: 8, md: 12 }}
                        rounded="3xl"
                        shadow="2xl"
                        border="1px solid"
                        borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
                        maxW="lg"
                        w="full"
                        mx="auto"
                    >
                        <Stack gap={4} mb={10}>
                            <Flex align="center" gap={3}>
                                <Box h="2px" w="30px" bg="brand.400" borderRadius="full" />
                                <Text
                                    textTransform="uppercase"
                                    fontSize="xs"
                                    fontWeight="800"
                                    color="brand.400"
                                    letterSpacing="widest"
                                >
                                    Portal Access
                                </Text>
                            </Flex>

                            <Stack gap={2}>
                                <Heading
                                    fontSize={{ base: "3xl", md: "4xl" }}
                                    fontWeight="900"
                                    letterSpacing="tight"
                                    lineHeight="1"
                                >
                                    Sign In to <br />
                                    <Text
                                        as="span"
                                        bgGradient="to-r"
                                        gradientFrom="brand.400"
                                        gradientTo="blue.600"
                                        bgClip="text"
                                    >
                                        Workspace
                                    </Text>
                                    <Text as="span" color="brand.400">.</Text>
                                </Heading>
                                <Text color="gray.500" fontSize="lg" fontWeight="500" lineHeight="tall">
                                    Secure enterprise access to manage <br />
                                    all your business at one place.
                                </Text>
                            </Stack>
                        </Stack>

                        <MotionBox
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                onClick={loginWithSso}
                                variant="premium"
                                size="lg"
                                h="70px"
                                borderRadius="2xl"
                                w="full"
                                mb={6}
                                fontSize="lg"
                                fontWeight="800"
                                letterSpacing="tight"
                                boxShadow="0 20px 40px -12px rgba(66, 42, 251, 0.4)"
                            >
                                <MotionBox
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    me={4}
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.15, 1]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Icon as={SiAuthelia} w={7} h={7} />
                                </MotionBox>
                                Continue with SSO
                            </Button>
                        </MotionBox>

                        <Text
                            color="gray.500"
                            fontSize="xs"
                            textAlign="center"
                            fontWeight="600"
                            textTransform="uppercase"
                            letterSpacing="widest"
                            mb={4}
                        >
                            Secure Enterprise Login
                        </Text>

                        {/* 
                        <Flex align="center" mb={6}>
                            <HSeparator flex="1" />
                            <Text color="gray.400" mx={4} fontSize="xs" fontWeight="bold" textTransform="uppercase">
                                or
                            </Text>
                            <HSeparator flex="1" />
                        </Flex>

                        <form onSubmit={handleSubmit}>
                            <Stack gap={5}>
                                <Field
                                    label={
                                        <Flex gap={1} fontWeight="600">
                                            Email<Text color="red.500">*</Text>
                                        </Flex>
                                    }
                                >
                                    <Input
                                        required
                                        variant="subtle"
                                        h="50px"
                                        type="email"
                                        placeholder="name@company.com"
                                        name="loginId"
                                        value={userCredentials.loginId}
                                        onChange={handleChange}
                                        borderRadius="lg"
                                        _focus={{ borderColor: "brand.300", bg: useColorModeValue("white", "navy.700") }}
                                    />
                                </Field>

                                <Field
                                    label={
                                        <Flex gap={1} fontWeight="600">
                                            Password<Text color="red.500">*</Text>
                                        </Flex>
                                    }
                                >
                                    <PasswordInput
                                        required
                                        h="50px"
                                        placeholder="Min. 8 characters"
                                        name="password"
                                        value={userCredentials.password}
                                        onChange={handleChange}
                                        borderRadius="lg"
                                        variant="subtle"
                                        _focus={{ borderColor: "brand.300", bg: useColorModeValue("white", "navy.700") }}
                                    />
                                </Field>

                                <Flex justifyContent="space-between" align="center">
                                    <Checkbox id="remember-login" colorPalette="brand" size="sm">
                                        <Text fontSize="sm" fontWeight="500">Remember me</Text>
                                    </Checkbox>
                                    <NavLink to="/auth/forgot-password">
                                        <Text
                                            color="brand.500"
                                            fontSize="sm"
                                            fontWeight="600"
                                            _hover={{ textDecoration: "underline" }}
                                        >
                                            Forgot password?
                                        </Text>
                                    </NavLink>
                                </Flex>

                                <AnimatePresence>
                                    {showAlert.isVisible && (
                                        <MotionBox
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <Alert
                                                status={showAlert.status as any}
                                                title={showAlert.description}
                                                borderRadius="lg"
                                            />
                                        </MotionBox>
                                    )}
                                </AnimatePresence>

                                <Button
                                    size="lg"
                                    h="56px"
                                    colorPalette="brand"
                                    borderRadius="xl"
                                    fontWeight="700"
                                    w="100%"
                                    type="submit"
                                    loading={isLoading}
                                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                                    transition="all 0.2s"
                                >
                                    Sign In
                                </Button>
                            </Stack>
                        </form>
                        */}

                        <Text
                            mt={8}
                            color="gray.500"
                            fontSize="sm"
                            textAlign="center"
                            fontWeight="500"
                        >
                            Not registered yet?{" "}
                            <NavLink to="/auth/sign-up">
                                <Text
                                    as="span"
                                    color="brand.500"
                                    fontWeight="700"
                                    _hover={{ textDecoration: "underline" }}
                                >
                                    Create an Account
                                </Text>
                            </NavLink>
                        </Text>
                    </MotionStack>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default SignIn;
