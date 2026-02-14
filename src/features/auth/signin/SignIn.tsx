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
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { HSeparator } from "@/features/ui/components/separator/Separator";
import { useAuth } from "@/contexts/AuthProvider";
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

const MotionBox = motion(Box);
const MotionStack = motion(Stack);

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
    const { authInfo, setLoginAuthInfo } = useAuth();

    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get("redirect");

    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = "gray.400";
    const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
    const textColorBrand = useColorModeValue("brand.500", "white");
    const brandStars = useColorModeValue("brand.500", "brand.400");
    const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
    const googleText = useColorModeValue("navy.700", "white");
    const googleHover = { bg: useColorModeValue("gray.200", "whiteAlpha.300") };

    const checkVersion = useCallback(async () => {
        try {
            const response = await fetch(`../version.json?t=${Date.now()}`);
            const CURRENT_VERSION = "{{HASH_PLACEHOLDER}}";
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            if (data["version"] !== CURRENT_VERSION && CURRENT_VERSION !== "{{HASH_PLACEHOLDER}}") {
                setIsNewVersionAvailable(true);
            }
        } catch (error) {
            console.error("Error fetching version:", error);
        }
    }, []);

    useEffect(() => {
        checkVersion();
    }, [checkVersion]);

    useEffect(() => {
        if (authInfo?.success) {
            navigate(redirectUrl || "/myApps", { replace: true });
        }
    }, [authInfo, navigate, redirectUrl]);

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
                path: "/auth/login",
                data: userCredentials,
                isPrivateApi: false,
            }).subscribe({
                next: (res: any) => {
                    setLoading(false);
                    if (res.success) {
                        setLoginAuthInfo(res["login_info"]);
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

    const loginWithSso = () => {
        dispatch(startLoading("Redirecting to SSO..."));
        const clientId = "work_space_platform";
        const authServerUrl = "http://localhost/oauth/authorize";
        const redirectTo = "http://localhost:5173/auth/callback";
        const deviceId = getOrCreateDeviceId();

        window.open(
            `${authServerUrl}?client_id=${clientId}&response_type=code&redirect_url=${redirectTo}&scope=openid profile email&device_id=${deviceId}`,
            "_self"
        );
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
                                lineHeight={1.2}
                                fontSize={{ base: "4xl", sm: "5xl", md: "6xl" }}
                                fontWeight="800"
                                letterSpacing="tight"
                            >
                                Welcome to Our{" "}
                                <Text
                                    as="span"
                                    bgGradient="to-r"
                                    gradientFrom="brand.400"
                                    gradientTo="blue.500"
                                    bgClip="text"
                                >
                                    Platform!
                                </Text>
                            </Heading>
                        </MotionBox>

                        <MotionBox
                            variants={itemVariants}
                            p={6}
                            borderRadius="2xl"
                            bg={useColorModeValue("whiteAlpha.600", "whiteAlpha.100")}
                            backdropFilter="blur(10px)"
                            border="1px solid"
                            borderColor={useColorModeValue("white", "whiteAlpha.200")}
                            boxShadow="xl"
                        >
                            <Text
                                fontSize="lg"
                                color={useColorModeValue("gray.600", "gray.300")}
                                lineHeight="tall"
                            >
                                <Icon as={SiAuthelia} color="brand.400" mr={2} verticalAlign="middle" />
                                We're excited to have you here! Sign in to access your
                                personalized dashboard and explore all the features we offer.
                                Manage all your business categories with just one app, all on a
                                single dashboard.
                            </Text>
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
                        <Stack gap={2} mb={6}>
                            <Heading size="xl" fontWeight="700">
                                Sign In
                                <Text as="span" color="brand.400">.</Text>
                            </Heading>
                            <Text color="gray.500" fontSize="md">
                                Enter your credentials to access your account.
                            </Text>
                        </Stack>

                        <Button
                            onClick={loginWithSso}
                            variant="outline"
                            h="56px"
                            borderRadius="xl"
                            fontWeight="600"
                            fontSize="sm"
                            bg={googleBg}
                            color={googleText}
                            _hover={googleHover}
                            w="full"
                            mb={4}
                            transition="all 0.2s"
                        >
                            <Icon as={SiAuthelia} w={5} h={5} me={3} />
                            Continue with SSO
                        </Button>

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
