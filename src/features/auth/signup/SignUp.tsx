import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  useBreakpointValue,
  IconProps,
  Icon,
} from "@chakra-ui/react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { InputGroup } from "@/components/ui/input-group";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { useColorModeValue } from "@/components/ui/color-mode";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { POSTAPI } from "@/app/api";
import { AlertProps } from "@/app/types/appConfigInterface";

const avatars = [
  { name: "Ryan Florence", url: "https://bit.ly/ryan-florence" },
  { name: "Segun Adebayo", url: "https://bit.ly/sage-adebayo" },
  { name: "Kent Dodds", url: "https://bit.ly/kent-c-dodds" },
  { name: "Prosper Otemuyiwa", url: "https://bit.ly/prosper-baba" },
  { name: "Christian Nwamba", url: "https://bit.ly/code-beast" },
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

const MotionBox = motion(Box);

export default function SignUp() {
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
  } = useForm<any>({ mode: "onChange" });

  const onFormSubmit = (formData: any) => {
    POSTAPI({
      path: "account/register",
      data: formData,
      isPrivateApi: false,
    }).subscribe((res: any) => {
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
          description: res.data?.message || "Registration failed",
          status: "error",
          isVisible: true,
        });
      }
    });
  };

  return (
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
            </Text>
          </Heading>
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Text fontSize="md" fontFamily={"monospace"}>
              <Text as={"span"} bgGradient="to-r" gradientFrom="red.400" gradientTo="pink.400" variant="plain">"</Text>
              We're excited to have you here! Sign up to access your personalized dashboard and explore all the features we offer. Manage all your business categories with just one app, all on a single dashboard. Let’s get started!
              <Text as={"span"} bgGradient="to-r" gradientFrom="red.400" gradientTo="pink.400" variant="plain">"</Text>
            </Text>
          </MotionBox>
          <Stack direction={"row"} gap={4} align={"center"}>
            <AvatarGroup size="lg">
              {avatars.map((avatar) => (
                <Avatar
                  key={avatar.name}
                  name={avatar.name}
                  src={avatar.url}
                />
              ))}
            </AvatarGroup>
            <Text fontFamily={"heading"} fontSize={{ base: "4xl", md: "6xl" }}>+</Text>
            <Flex
              align={"center"}
              justify={"center"}
              fontFamily={"heading"}
              fontSize={{ base: "sm", md: "lg" }}
              bg={"gray.800"}
              color={"white"}
              rounded={"full"}
              w={useBreakpointValue({ base: "44px", md: "60px" })}
              h={useBreakpointValue({ base: "44px", md: "60px" })}
              position={"relative"}
              _before={{
                content: '""',
                width: "full",
                height: "full",
                rounded: "full",
                transform: "scale(1.125)",
                bgGradient: "to-bl",
                gradientFrom: "orange.400",
                gradientTo: "yellow.400",
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
            <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}>
              Create An Account
              <Text as={"span"} bgGradient="to-r" gradientFrom="red.400" gradientTo="pink.400" variant="plain">!</Text>
            </Heading>
            <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
              We provide effective IT solutions to help grow and manage your business with our advanced and secure app at your fingertips
            </Text>
          </Stack>
          <Box mt={10}>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <Stack gap={4}>
                <Field invalid={!!errors.first_name} errorText={errors.first_name?.message?.toString()}>
                  <Input
                    placeholder="First Name"
                    bg={"gray.100"}
                    color={"gray.500"}
                    _placeholder={{ color: "gray.500" }}
                    {...register("first_name", {
                      required: "First Name is required",
                      minLength: { value: 4, message: "First Name should be at least 4 characters long" },
                    })}
                  />
                </Field>

                <Field invalid={!!errors.last_name} errorText={errors.last_name?.message?.toString()}>
                  <Input
                    placeholder="Last Name"
                    bg={"gray.100"}
                    color={"gray.500"}
                    _placeholder={{ color: "gray.500" }}
                    {...register("last_name", { required: "Last Name is required" })}
                  />
                </Field>

                <Field invalid={!!errors.email} errorText={errors.email?.message?.toString()}>
                  <Input
                    placeholder="Email"
                    bg={"gray.100"}
                    color={"gray.500"}
                    _placeholder={{ color: "gray.500" }}
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Enter a valid email address" },
                    })}
                  />
                </Field>

                <Field invalid={!!errors.phone_number} errorText={errors.phone_number?.message?.toString()}>
                  <Input
                    placeholder="Phone No"
                    bg={"gray.100"}
                    color={"gray.500"}
                    _placeholder={{ color: "gray.500" }}
                    type="text"
                    {...register("phone_number", {
                      required: "Phone number is required",
                      pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit phone number" },
                    })}
                  />
                </Field>

                <Field invalid={!!errors.password} errorText={errors.password?.message?.toString()}>
                  <InputGroup
                    endElement={
                      <Icon
                        color={"black"}
                        _hover={{ cursor: "pointer" }}
                        as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                        onClick={() => setShow(!show)}
                      />
                    }
                  >
                    <Input
                      bg={"gray.100"}
                      color={"gray.500"}
                      _placeholder={{ color: "gray.500" }}
                      fontSize="lg"
                      placeholder="Min. 8 characters"
                      type={show ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Password should be at least 8 characters long" },
                      })}
                    />
                  </InputGroup>
                </Field>
              </Stack>
              <br />
              {showAlert.isVisible && (
                <Alert status={showAlert.status as any} title={showAlert.description} mb="8px" />
              )}
              <Button
                fontFamily={"heading"}
                mt={8}
                w={"full"}
                bgGradient="to-r"
                gradientFrom="red.400"
                gradientTo="pink.400"
                color={"white"}
                _hover={{ boxShadow: "xl" }}
                type="submit"
              >
                Submit
              </Button>
            </form>
            <Text mt={5} color={"gray.500"} fontWeight="400" fontSize="14px" textAlign={"center"}>
              Already Have An
              <NavLink to="/auth/login">
                <Text as="span" ms="5px" fontWeight="600">Account</Text>
              </NavLink>
            </Text>
          </Box>
        </Stack>
      </Container>
      <Blur position={"absolute"} top={-10} left={-10} style={{ filter: "blur(70px)" }} />
    </Box>
  );
}
