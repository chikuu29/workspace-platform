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
    useBreakpointValue,
} from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Alert,
} from "@/components/ui/alert";
import { InputGroup } from "@/components/ui/input-group";
import { Field } from "@/components/ui/field";
import { useColorModeValue } from "@/components/ui/color-mode";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { HSeparator } from "@/features/ui/components/separator/Separator";
import { useAuth } from "@/contexts/AuthProvider";
import { useDispatch } from "react-redux";
import { login } from "@/app/slices/auth/authSlice";
import { fetchAppConfig } from "@/app/slices/appConfig/appConfigSlice";
import { AppDispatch } from "@/app/store";
import { motion } from "framer-motion";
import { startLoading } from "@/app/slices/loader/appLoaderSlice";
import { POSTAPI } from "@/app/api";
import AppVersionAlert from "@/features/ui/components/alert/AppVersionAlert";
import { AlertProps } from "@/app/types/appConfigInterface";
import { SiAuthelia } from "react-icons/si";
import { getOrCreateDeviceId } from "@/utils/services/appServices";

const MotionText = motion(Box);

const SignIn = () => {
    console.log("====CALLING SIGN IN PAGE====");

    const [isNewVersionAvailable, setIsNewVersionAvailable] =
        useState<boolean>(false);
    const checkVersion = async () => {
        try {
            const response = await fetch(`../version.json?t=${Date.now()}`);
            console.log("response", response);
            var CURRENT_VERSION = "{{HASH_PLACEHOLDER}}";
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            if (data["version"] != CURRENT_VERSION) {
                setIsNewVersionAvailable(true);
                console.log("NEW VERSION IS AVAILBLE");
            } else {
                console.log("Same Version");
            }
        } catch (error) {
            console.error("Error fetching version:", error);
        }
    };

    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = "gray.400";
    const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
    const textColorBrand = useColorModeValue("brand.500", "white");
    const brandStars = useColorModeValue("brand.500", "brand.400");
    const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
    const googleText = useColorModeValue("navy.700", "white");
    const googleHover = useColorModeValue(
        { bg: "gray.200" },
        { bg: "whiteAlpha.300" }
    );

    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const [isLoading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState<AlertProps>({
        title: "",
        description: "",
        status: "info",
        isVisible: false,
    });
    const navigate = useNavigate();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl: any = searchParams.get("redirect");
    const [userCredentials, setUseCredentials] = useState({
        loginId: "",
        password: "",
    });

    const { authInfo, setLoginAuthInfo } = useAuth();

    const handleChange = (e: any) => {
        const { name, value } = (e.target || e);
        setUseCredentials({
            ...userCredentials,
            [name]: value,
        });
    };
    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("userCredentials", userCredentials);
        setLoading(true);
        try {
            POSTAPI({
                path: "/auth/login",
                data: userCredentials,
                isPrivateApi: false,
            }).subscribe((res: any) => {
                if (res.success) {
                    console.log(res);

                    setLoading(false);
                    const responseInfo: any = res["login_info"];
                    console.log("AuthInfo", responseInfo);
                    setLoginAuthInfo(responseInfo);
                    dispatch(fetchAppConfig());
                    dispatch(login(res));
                    setShowAlert({
                        title: res?.message,
                        description: res["message"],
                        status: "success",
                        isVisible: true,
                    });
                    navigate(redirectUrl || "/myApps");
                } else {
                    console.log(res);
                    setLoading(false);
                }
            });
        } catch (error: any) {
            console.log(error);
            setLoading(false);
            if (error.message === "Network Error") {
                setShowAlert({
                    title: error?.message,
                    description: "Please Check Your Internet Connections",
                    status: "error",
                    isVisible: true,
                });
            } else {
                setShowAlert({
                    title: error?.statusText,
                    description: error?.response?.["data"]?.["message"] || "Login failed",
                    status: "error",
                    isVisible: true,
                });
            }
        }
    };

    useEffect(() => {
        if (authInfo && authInfo.success) {
            navigate(redirectUrl || "/myApps", { replace: true });
        }
    }, [authInfo]);

    const deviceId = getOrCreateDeviceId();

    const loginWithSso = () => {
        console.log("Login With SSO");
        dispatch(startLoading("Please Wait We Will Redirected to SSO..."));
        const clientId = "work_space_platform";
        const authServerUrl = "http://localhost/oauth/authorize";
        const redirectTo = "http://localhost:5173/auth/callback";

        window.open(
            authServerUrl +
            `?client_id=${clientId}&response_type=code&redirect_url=${redirectTo}&scope=openid profile email&device_id=${deviceId}`,
            "_self"
        );
    };

    const Blur = (props: any) => {
        return (
            <Icon
                width={useBreakpointValue({ base: "100%", md: "40vw", lg: "30vw" })}
                zIndex={useBreakpointValue({ base: -1, md: -1, lg: 0 })}
                height="200px"
                viewBox="0 0 528 560"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                {...props}
            >
                <circle cx="71" cy="61" r="111" fill="#F56565" />
                <circle cx="244" cy="106" r="139" fill="#ED64A6" />
                <circle cy="291" r="139" fill="#ED64A6" />
                <circle cx="80.5" cy="189.5" r="101.5" fill="#ED8936" />
                <circle cx="196.5" cy="317.5" r="101.5" fill="#ECC94B" />
                <circle cx="70.5" cy="458.5" r="101.5" fill="#48BB78" />
                <circle cx="426.5" cy="-0.5" r="101.5" fill="#4299E1" />
            </Icon>
        );
    };

    return (
        <>
            <AppVersionAlert isNewVersionAvailable={isNewVersionAvailable} />
            <Box position={"relative"}>
                <Container
                    as={SimpleGrid}
                    maxW={"7xl"}
                    columns={{ base: 1, md: 2 }}
                    gap={{ base: 10, lg: 32 }}
                    py={{ base: 10, sm: 20, lg: 32 }}
                >
                    <Stack gap={{ base: 10, md: 20 }}>
                        <Heading
                            lineHeight={1.1}
                            fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
                        >
                            Welcome to Our{" "}
                            <Text
                                as={"span"}
                                bgGradient="to-r"
                                gradientFrom="red.400"
                                gradientTo="pink.400"
                                variant="plain"
                            >
                                Platform!
                            </Text>{" "}
                        </Heading>
                        <MotionText
                            m={0}
                            fontFamily={"monospace"}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Text
                                as={"span"}
                                bgGradient="to-r"
                                gradientFrom="red.400"
                                gradientTo="pink.400"
                                variant="plain"
                            >
                                "
                            </Text>
                            We're excited to have you here! Sign in to access your
                            personalized dashboard and explore all the features we offer.
                            Manage all your business categories with just one app, all on a
                            single dashboard. Let’s get started!
                            <Text
                                as={"span"}
                                bgGradient="to-r"
                                gradientFrom="red.400"
                                gradientTo="pink.400"
                                variant="plain"
                            >
                                "
                            </Text>
                        </MotionText>
                    </Stack>
                    <Stack
                        background={"transparent"}
                        rounded={"xl"}
                        gap={{ base: 8 }}
                        maxW={{ lg: "lg" }}
                    >
                        <Stack gap={2}>
                            <Heading
                                lineHeight={1.1}
                                fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                            >
                                Sign In
                                <Text
                                    as={"span"}
                                    bgGradient="to-r"
                                    gradientFrom="red.400"
                                    gradientTo="pink.400"
                                    variant="plain"
                                >
                                    !
                                </Text>
                            </Heading>
                            <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
                                Simply sign in with your user ID and password to start managing
                                your business at your fingertips.
                            </Text>
                        </Stack>
                        <Button
                            onClick={loginWithSso}
                            fontSize="sm"
                            mb="26px"
                            py="15px"
                            h="50px"
                            borderRadius="16px"
                            bg={googleBg}
                            color={googleText}
                            fontWeight="500"
                            _hover={googleHover}
                        >
                            <Icon as={SiAuthelia} w="20px" h="20px" me="10px" />
                            LOGIN WITH SSO
                        </Button>
                        <Flex align="center" mb="0px">
                            <HSeparator />
                            <Text color="gray.400" mx="14px">
                                or
                            </Text>
                            <HSeparator />
                        </Flex>
                        <Box>
                            <form onSubmit={handleSubmit}>
                                <Field
                                    label={
                                        <Flex gap={1}>
                                            Email<Text color={brandStars}>*</Text>
                                        </Flex>
                                    }
                                    mb="24px"
                                >
                                    <Input
                                        required
                                        variant="outline"
                                        fontSize="sm"
                                        type="email"
                                        placeholder="mail@simmmple.com"
                                        fontWeight="500"
                                        size="lg"
                                        id="loginId"
                                        name="loginId"
                                        value={userCredentials.loginId}
                                        onChange={handleChange}
                                        onFocus={checkVersion}
                                    />
                                </Field>
                                <Field
                                    label={
                                        <Flex gap={1}>
                                            Password<Text color={brandStars}>*</Text>
                                        </Flex>
                                    }
                                    mb="24px"
                                >
                                    <InputGroup
                                        endElement={
                                            <Icon
                                                color={textColorSecondary}
                                                _hover={{ cursor: "pointer" }}
                                                as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                                                onClick={handleClick}
                                            />
                                        }
                                    >
                                        <Input
                                            required
                                            fontSize="sm"
                                            placeholder="Min. 8 characters"
                                            size="lg"
                                            type={show ? "text" : "password"}
                                            variant="outline"
                                            name="password"
                                            value={userCredentials.password}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                </Field>
                                <Flex justifyContent="space-between" align="center" mb="24px">
                                    <Checkbox id="remember-login" colorPalette="blue" me="10px">
                                        Keep me logged in
                                    </Checkbox>
                                    <NavLink to="/auth/forgot-password">
                                        <Text
                                            color={textColorBrand}
                                            fontSize="sm"
                                            w="124px"
                                            fontWeight="500"
                                        >
                                            Forgot password?
                                        </Text>
                                    </NavLink>
                                </Flex>

                                {showAlert.isVisible && (
                                    <Alert
                                        status={showAlert.status as any}
                                        title={showAlert.description}
                                        mb="8px"
                                    />
                                )}

                                <Button
                                    fontSize="sm"
                                    variant="solid"
                                    colorPalette="blue"
                                    fontWeight="500"
                                    w="100%"
                                    h="50px"
                                    mb="24px"
                                    type="submit"
                                    loading={isLoading}
                                >
                                    Login
                                </Button>
                            </form>

                            <Flex
                                flexDirection="column"
                                justifyContent="center"
                                alignItems="start"
                                maxW="100%"
                                mt="0px"
                            >
                                <Text
                                    color={textColorDetails}
                                    fontWeight="400"
                                    fontSize="14px"
                                    textAlign={"center"}
                                >
                                    Not registered yet?
                                    <NavLink to="/auth/sign-up">
                                        <Text
                                            color={textColorBrand}
                                            as="span"
                                            ms="5px"
                                            fontWeight="500"
                                        >
                                            Create an Account
                                        </Text>
                                    </NavLink>
                                </Text>
                            </Flex>
                        </Box>
                    </Stack>
                </Container>
                <Blur
                    position={"absolute"}
                    top={-10}
                    left={-10}
                    style={{ filter: "blur(70px)" }}
                />
            </Box>
        </>
    );
};

export default SignIn;
