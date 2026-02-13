// Chakra imports
import {
  Steps,
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AvatarGroup,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Heading,
  Icon,
  IconProps,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
  Field,
} from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import { HSeparator } from "../../../ui/components/separator/Separator";
import { publicAPI } from "../../../app/handlers/axiosHandlers";
// import { AxiosError } from "axios";
import { useAuth } from "../../../contexts/AuthProvider";
import { useDispatch } from "react-redux";
import { login } from "../../../app/slices/auth/authSlice";
// import { GETAPI } from "../../../app/api";
import { fetchAppConfig } from "../../../app/slices/appConfig/appConfigSlice";
import { AppDispatch } from "../../../app/store";
import Brand from "../../../ui/components/Brand/Brand";
// import { setAppConfig } from "../../../app/slices/appConfig/appConfigSlice";

import { motion } from "framer-motion";
import { startLoading } from "../../../app/slices/loader/appLoaderSlice";
import { POSTAPI } from "../../../app/api";
import AppVersionAlert from "../../../ui/components/alert/AppVersionAlert";
import { AlertProps } from "../../../types/appConfigInterface";
import { SiAuthelia } from "react-icons/si";
import { getOrCreateDeviceId } from "../../../utils/services/appServices";
const MotionText = motion(Text);

const SignIn = () => {
  console.log("====CALLING SIGN IN PAGE====");

  const [isNewVersionAvailable, setIsNewVersionAvailable] =
    useState<boolean>(false);
  const checkVersion = async () => {
    try {
      const response = await fetch(`../version.json?t=${Date.now()}`); // Timestamp to prevent caching
      console.log("response", response);
      var CURRENT_VERSION = "{{HASH_PLACEHOLDER}}";
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data["version"] != CURRENT_VERSION) {
        // onOpen();
        setIsNewVersionAvailable(true);
        console.log("NEW VERSION IS AVAILBLE");
      } else {
        console.log("Same Version");
      }
    } catch (error) {
      // setIsNewVersionAvailable(true)
      console.error("Error fetching version:", error);
    }
  };

  // Chakra color mode
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
  const googleActive = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.200" }
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
  // console.log("location", location);
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl: any = searchParams.get("redirect");
  // console.log("redirectUrl", redirectUrl);
  const [userCredentials, setUseCredentials] = useState({
    loginId: "",
    password: "",
  });

  const { loading, authInfo, setLoginAuthInfo } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
          // console.log("redirectUrl",redirectUrl);
          navigate(redirectUrl || "/myApps");
        } else {
          console.log(res);
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
          description: error?.response["data"]["message"],
          status: "error",
          isVisible: true,
        });
      }
    }
  };
  useEffect(() => {
    if (!loading && authInfo && authInfo.success) {
      // Uncomment if you have logic to set a redirect URL
      // setRedirectUrl(location.pathname);
      navigate(redirectUrl || "/myApps", { replace: true });
    }
  }, [loading]);

  const loginWithGoogle = () => {
    console.log("Login With Google");
    dispatch(startLoading("Please Wait We Will Redirected to Google..."));
    // console.log("Location", window.location.origin + "/api/auth/google");

    const redirectTo = encodeURIComponent(window.location.href);
    console.log("Redirecturl", redirectTo);
    console.log("hiii", window.location.href);

    // Redirect to Google OAuth, with the `redirectTo` parameter
    // window.location.href = `http://localhost:5000/auth/google?redirectTo=${redirectTo}`;
    // window.open(window.location.origin+"/api/auth/google",'_self')
    window.open(
      window.location.origin + `/api/v1/oauth/google?redirectTo=${redirectTo}`,
      "_self"
    );
    // window.open("http://localhost:7000/v1/auth/google",'_self')
  };

  const deviceId = getOrCreateDeviceId();

  const loginWithSso = () => {
    console.log("Login With SSO");
    dispatch(startLoading("Please Wait We Will Redirected to SSO..."));
    // console.log("Location", window.location.origin + "/api/auth/google");
    const clientId = "work_space_platform"; // Replace with your OAuth application client ID
    // const redirectUri = 'http://127.0.0.1:3000/callback'; // Your frontend callback URL
    // const authServerUrl = "https://own-oauth-indentity-provider-frontend.onrender.com/oauth/authorize";
    // const redirectTo = "https://myomspanel.onrender.com/auth/callback";

    const authServerUrl = "http://localhost/oauth/authorize";
    const redirectTo = "http://localhost:5173/auth/callback";
    console.log("Redirecturl", redirectTo);
    console.log("hiii", window.location.href);
    // const authUrl = `${authServerUrl}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    // window.location.href = authUrl;
    console.log(
      "url",
      authServerUrl +
      `?client_id=${clientId}&response_type=code&redirect_uri=${redirectTo}&device_id=123`
    );
    window.open(
      authServerUrl +
      `?client_id=${clientId}&response_type=code&redirect_url=${redirectTo}&scope=openid profile email&device_id=${deviceId}`,
      "_self"
    );
  };

  // const silentAuth = (clientId:any, redirectUrl:any, authServerUrl:any) => {
  //   return new Promise((resolve, reject) => {
  //     const state = Math.random().toString(36).substring(2);
  //     const iframe = document.createElement('iframe');
  //     // iframe.style.display = 'none';
  //     iframe.src = "http://localhost/oauth/authorize?client_id=client_id&response_type=code&redirect_url=http://localhost:5173/auth/callback&scope=openid%20profile%20email&device_id=123";

  //     document.body.appendChild(iframe);

  //     const messageListener = (event:any) => {

  //       console.log("event/data",event.data);

  //       if (event.origin !== authServerUrl) return;

  //       const { code, error } = event.data;

  //       if (code) {
  //         resolve(code);
  //       } else if (error) {
  //         reject(error);
  //       }

  //       window.removeEventListener('message', messageListener);
  //       document.body.removeChild(iframe);
  //     };

  //     window.addEventListener('message', messageListener);
  //   });
  // };

  const Blur = (props: IconProps) => {
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
                bgGradient="linear(to-r, red.400,pink.400)"
                bgClip="text"
              >
                Platform!
              </Text>{" "}
              {/* Full-Stack Developers */}
            </Heading>
            <MotionText
              size={"sm"}
              m={0}
              fontFamily={"monospace"}
              initial={{ opacity: 0, x: -50 }} // Start off-screen to the left
              animate={{ opacity: 1, x: 0 }} // Fade in and slide into place
              transition={{ duration: 0.8 }} // Animation duration
            >
              <Text
                as={"span"}
                bgGradient="linear(to-r, red.400,pink.400)"
                bgClip="text"
              >
                "
              </Text>
              We're excited to have you here! Sign in to access your
              personalized dashboard and explore all the features we offer.
              Manage all your business categories with just one app, all on a
              single dashboard. Let’s get started!
              <Text
                as={"span"}
                bgGradient="linear(to-r, red.400,pink.400)"
                bgClip="text"
              >
                "
              </Text>
            </MotionText>
          </Stack>
          <Stack
            // bg={"gray.50"}
            background={"transparent"}
            rounded={"xl"}
            // p={{ base: 4, sm: 6, md: 8 }}
            gap={{ base: 8 }}
            maxW={{ lg: "lg" }}
          >
            <Stack gap={2}>
              <Heading
                // color={"gray.800"}
                lineHeight={1.1}
                fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
              >
                Sign In
                <Text
                  as={"span"}
                  bgGradient="linear(to-r, red.400,pink.400)"
                  bgClip="text"
                >
                  !
                </Text>
              </Heading>
              <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
                Simply sign in with your user ID and password to start managing
                your business at your fingertips.
              </Text>
            </Stack>
            {/* <Button
              onClick={loginWithGoogle}
              fontSize="sm"
              me="0px"
              mb="26px"
              py="15px"
              h="50px"
              borderRadius="16px"
              bg={googleBg}
              color={googleText}
              fontWeight="500"
              _hover={googleHover}
              _active={googleActive}
              _focus={googleActive}
            >
              <Icon as={FcGoogle} w="20px" h="20px" me="10px" />
              Sign in with Google
            </Button> */}
            <Button
              onClick={loginWithSso}
              fontSize="sm"
              me="0px"
              mb="26px"
              py="15px"
              h="50px"
              borderRadius="16px"
              bg={googleBg}
              color={googleText}
              fontWeight="500"
              _hover={googleHover}
              _active={googleActive}
              _focus={googleActive}
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
              {/* <Stack spacing={4}> */}
              <form onSubmit={handleSubmit}>
                <Field.Root>
                  <Field.Label
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Email<Text color={brandStars}>*</Text>
                  </Field.Label>
                  <Input
                    required={true}
                    required={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: "0px", md: "0px" }}
                    type="email"
                    placeholder="mail@simmmple.com"
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    id="loginId"
                    name="loginId"
                    onValueChange={(e) => {
                      handleChange(e);
                    }}
                    onFocus={checkVersion}
                  />
                  <Field.Label
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    display="flex"
                  >
                    Password<Text color={brandStars}>*</Text>
                  </Field.Label>
                  <InputGroup size="md">
                    <Input
                      required={true}
                      fontSize="sm"
                      placeholder="Min. 8 characters"
                      mb="24px"
                      size="lg"
                      type={show ? "text" : "password"}
                      variant="auth"
                      name="password"
                      onValueChange={(e) => {
                        handleChange(e);
                      }}
                    />
                    <InputRightElement
                      display="flex"
                      alignItems="center"
                      mt="4px"
                      onClick={handleClick}
                    >
                      <Icon
                        color={textColorSecondary}
                        _hover={{ cursor: "pointer" }}
                        as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <Flex justifyContent="space-between" align="center" mb="24px">
                    <Field.Root display="flex" alignItems="center">
                      <Checkbox.Root id="remember-login" colorPalette="brandScheme" me="10px"><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root>
                      <Field.Label
                        htmlFor="remember-login"
                        mb="0"
                        fontWeight="normal"
                        color={textColor}
                        fontSize="sm"
                      >
                        Keep me logged in
                      </Field.Label>
                    </Field.Root>
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
                    <Alert.Root
                      status={showAlert.status}
                      marginBottom={"8px"}
                      borderRadius={"8px"}
                    >
                      <Alert.Indicator />
                      {showAlert.description}
                    </Alert.Root>
                  )}

                  <Button
                    fontSize="sm"
                    variant="brand"
                    fontWeight="500"
                    w="100%"
                    h="50"
                    mb="24px"
                    type="submit"
                    loadingText="Authentication Process Started.."
                    loading={isLoading}
                  >
                    Login
                  </Button>
                </Field.Root>
              </form>
              {/* </Stack> */}

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


