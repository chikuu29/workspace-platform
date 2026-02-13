import {
  Steps,
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  Avatar,
  AvatarGroup,
  useBreakpointValue,
  IconProps,
  Icon,
  InputGroup,
  InputRightElement,
  Show,
  Alert,
} from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { NavLink } from "react-router-dom";

const avatars = [
  {
    name: "Ryan Florence",
    url: "https://bit.ly/ryan-florence",
  },
  {
    name: "Segun Adebayo",
    url: "https://bit.ly/sage-adebayo",
  },
  {
    name: "Kent Dodds",
    url: "https://bit.ly/kent-c-dodds",
  },
  {
    name: "Prosper Otemuyiwa",
    url: "https://bit.ly/prosper-baba",
  },
  {
    name: "Christian Nwamba",
    url: "https://bit.ly/code-beast",
  },
];

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
import { motion } from "framer-motion";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { POSTAPI } from "../../../app/api";
import AppOtp from "../../../ui/components/auth/AppOtp";
import { AlertProps } from "../../../types/appConfigInterface";

const MotionText = motion(Text);
export default function SignUP() {
  console.log("===SIGN UP===");
  const bg = useColorModeValue("gray.50", "whiteAlpha.200");
  const [show, setShow] = useState(false);

  const [showAlert, setShowAlert] = useState<AlertProps>({
    title: "",
    description: "",
    status: "info",
    isVisible: false,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    mode: "onChange",
  });

  const onFormSubmit = (formData: any) => {
    console.log(formData);

    POSTAPI({
      path: "account/register",
      data: formData,
      isPrivateApi: false,
    }).subscribe((res: any) => {
      console.log("res", res);
      if (res.success) {
        setShowAlert({
          title: "Success",
          description: "Account created successfully",
          status: "success",
          isVisible: true,
        });
      } else {

        setShowAlert({
          title: "Error",
          description: res.data.message,
          status: "error",
          isVisible: true,
        });
      }
    });
  };

  // return ;

  return (
    <Box position={"relative"}>
      {/* <AppOtp></AppOtp> */}
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
            We're excited to have you here! Sign in to access your personalized
            dashboard and explore all the features we offer. Manage all your
            business categories with just one app, all on a single dashboard.
            Let’s get started!
            <Text
              as={"span"}
              bgGradient="linear(to-r, red.400,pink.400)"
              bgClip="text"
            >
              "
            </Text>
          </MotionText>
          <Stack direction={"row"} gap={4} align={"center"}>
            <AvatarGroup>
              {avatars.map((avatar) => (
                <Avatar.Root
                  key={avatar.name}
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  size={useBreakpointValue({ base: "md", md: "lg" })}
                  position={"relative"}
                  zIndex={2}
                  _before={{
                    content: '""',
                    width: "full",
                    height: "full",
                    rounded: "full",
                    transform: "scale(1.125)",
                    bgGradient: "linear(to-bl, red.400,pink.400)",
                    position: "absolute",
                    zIndex: -1,
                    top: 0,
                    left: 0,
                  }}><Avatar.Fallback name={avatar.name} /><Avatar.Image src={avatar.url} /></Avatar.Root>
              ))}
            </AvatarGroup>
            <Text fontFamily={"heading"} fontSize={{ base: "4xl", md: "6xl" }}>
              +
            </Text>
            <Flex
              align={"center"}
              justify={"center"}
              fontFamily={"heading"}
              fontSize={{ base: "sm", md: "lg" }}
              bg={"gray.800"}
              color={"white"}
              rounded={"full"}
              minWidth={useBreakpointValue({ base: "44px", md: "60px" })}
              minHeight={useBreakpointValue({ base: "44px", md: "60px" })}
              position={"relative"}
              _before={{
                content: '""',
                width: "full",
                height: "full",
                rounded: "full",
                transform: "scale(1.125)",
                bgGradient: "linear(to-bl, orange.400,yellow.400)",
                position: "absolute",
                zIndex: -1,
                top: 0,
                left: 0,
              }}
            >
              YOU
            </Flex>
          </Stack>
        </Stack>
        <Stack
          bg={bg}
          rounded={"xl"}
          p={{ base: 4, sm: 6, md: 8 }}
          gap={{ base: 8 }}
          maxW={{ lg: "lg" }}
        >
          <Stack gap={4}>
            <Heading
              lineHeight={1.1}
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
            >
              Create An Account
              <Text
                as={"span"}
                bgGradient="linear(to-r, red.400,pink.400)"
                bgClip="text"
              >
                !
              </Text>
            </Heading>
            <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
              We provide effective IT solutions to help grow and manage your
              business with our advanced and secure app at your fingertips
            </Text>
          </Stack>
          <Box mt={10}>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <Stack gap={4}>
                <Input
                  placeholder="First Name"
                  bg={"gray.100"}
                  border={0}
                  color={"gray.500"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  {...register("first_name", {
                    required: "First Name is required",
                    minLength: {
                      value: 4,
                      message:
                        "First Name should be at least 4 characters long",
                    },
                  })}
                />
                {errors.first_name && (
                  <Text color={"gray.500"}>
                    {errors["first_name"]?.message?.toString()}
                  </Text>
                )}

                <Input
                  placeholder="Last Name"
                  bg={"gray.100"}
                  border={0}
                  color={"gray.500"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  {...register("last_name", {
                    required: "Last Name is required",
                  })}
                />
                {errors.last_name && (
                  <Text color={"gray.500"}>
                    {errors?.last_name?.message?.toString()}
                  </Text>
                )}

                <Input
                  placeholder="Email"
                  bg={"gray.100"}
                  border={0}
                  color={"gray.500"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <Text color={"gray.500"}>
                    {errors?.email?.message?.toString()}
                  </Text>
                )}

                <Input
                  placeholder="Phone No"
                  bg={"gray.100"}
                  border={0}
                  color={"gray.500"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  type="text"
                  {...register("phone_number", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Enter a valid 10-digit phone number",
                    },
                  })}
                />
                {errors.phone_number && (
                  <Text color={"gray.500"}>
                    {errors?.phone_number?.message?.toString()}
                  </Text>
                )}

                <InputGroup size="md">
                  <Input
                    bg={"gray.100"}
                    border={0}
                    color={"gray.500"}
                    _placeholder={{
                      color: "gray.500",
                    }}
                    fontSize="lg"
                    placeholder="Min. 8 characters"
                    type={show ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message:
                          "Password should be at least 8 characters long",
                      },
                    })}
                  />
                  <InputRightElement
                    display="flex"
                    alignItems="center"
                    mt="2px"
                    onClick={() => setShow(!show)}
                  >
                    <Icon
                      color={"black"}
                      _hover={{ cursor: "pointer" }}
                      as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.password && (
                  <Text color={"gray.500"}>
                    {errors?.password?.message?.toString()}
                  </Text>
                )}
              </Stack>
              <br />
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
                fontFamily={"heading"}
                mt={8}
                w={"full"}
                bgGradient="linear(to-r, red.400,pink.400)"
                color={"white"}
                _hover={{
                  bgGradient: "linear(to-r, red.400,pink.400)",
                  boxShadow: "xl",
                }}
                type="submit"
              >
                Submit
              </Button>
            </form>

            <Text
              mt={5}
              color={"gray.500"}
              fontWeight="400"
              fontSize="14px"
              textAlign={"center"}
            >
              Already Have An
              <NavLink to="/auth/sign-in">
                <Text as="span" ms="5px" fontWeight="600">
                  Account
                </Text>
              </NavLink>
            </Text>
          </Box>
          form
        </Stack>
      </Container>
      <Blur
        position={"absolute"}
        top={-10}
        left={-10}
        style={{ filter: "blur(70px)" }}
      />
    </Box>
  );
}
