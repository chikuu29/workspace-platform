import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Alert,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
// import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { useColorModeValue } from "@/components/ui/color-mode";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { POSTAPI } from "@/app/api";
import { AlertProps } from "@/app/types/appConfigInterface";
import { Building2, Mail, Phone, Fingerprint } from "lucide-react";
import { useForm } from "react-hook-form";
import AuthFormInput from "../components/AuthFormInput";

const MotionBox = motion.create(Box);
const MotionStack = motion.create(Stack);

const SignUp = () => {
  const [isLoading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState<AlertProps>({
    title: "",
    description: "",
    status: "info",
    isVisible: false,
  });

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({ mode: "onChange" });

  const onFormSubmit = (formData: any) => {
    setLoading(true);
    setShowAlert((prev) => ({ ...prev, isVisible: false }));

    POSTAPI({
      path: "account/register/organization",
      serverName: "identity",
      data: formData,
      isPrivateApi: false,
    }).subscribe((res: any) => {
      setLoading(false);
      if (res.success) {
        setShowAlert({
          title: "Success",
          description: res?.message || "Organization created successfully",
          status: "success",
          isVisible: true,
        });
      } else {
        let errorDescription = res?.message || "Failed to create organization";
        if (res?.error?.detail) {
          errorDescription = `${errorDescription}: ${res.error.detail}`;
        }
        setShowAlert({
          title: "Error",
          description: errorDescription,
          status: "error",
          isVisible: true,
        });
      }
    });
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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
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

      <Container
        maxW="7xl"
        position="relative"
        zIndex="1"
        py={{ base: 12, md: 24 }}
      >
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          gap={{ base: 16, lg: 32 }}
          alignItems="center"
        >
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
                Start Your{" "}
                <Text
                  as="span"
                  bgGradient="to-r"
                  gradientFrom="brand.400"
                  gradientTo="blue.500"
                  bgClip="text"
                >
                  Business Journey.
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
                  Join the next generation of productivity.
                </Text>
                <Text
                  fontSize="lg"
                  color={useColorModeValue("gray.600", "gray.400")}
                  lineHeight="tall"
                >
                  Unify all your business operations in one powerful workspace.
                  Create your account today and experience a platform built for
                  growth, speed, and total control.
                </Text>
              </Stack>
            </MotionBox>
          </MotionStack>

          {/* Right Side: Sign Up Form */}
          <MotionStack
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            bg={useColorModeValue("white", "navy.800")}
            p={{ base: 8, md: 10 }}
            rounded="3xl"
            shadow="2xl"
            border="1px solid"
            borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
            maxW="lg"
            w="full"
            mx="auto"
          >
            <Stack gap={4} mb={8}>
              <Flex align="center" gap={3}>
                <Box h="2px" w="30px" bg="brand.400" borderRadius="full" />
                <Text
                  textTransform="uppercase"
                  fontSize="xs"
                  fontWeight="800"
                  color="brand.400"
                  letterSpacing="widest"
                >
                  Join Workspace
                </Text>
              </Flex>

              <Stack gap={2}>
                <Heading
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="900"
                  letterSpacing="tight"
                  lineHeight="1"
                >
                  Create Your <br />
                  <Text
                    as="span"
                    bgGradient="to-r"
                    gradientFrom="brand.400"
                    gradientTo="blue.600"
                    bgClip="text"
                  >
                    Account
                  </Text>
                  <Text as="span" color="brand.400">
                    .
                  </Text>
                </Heading>
                <Text color="gray.500" fontSize="md" fontWeight="500">
                  Fill in your details to get started.
                </Text>
              </Stack>
            </Stack>

            <form onSubmit={handleSubmit(onFormSubmit)}>
              <Stack gap={4}>
                {/* <Field
                  invalid={!!errors.business_name}
                  errorText={errors.business_name?.message?.toString()}
                  helperText="No spaces (e.g., my-company, techcorp)"
                  label="Workspace Name"
                >
                  <Input
                    placeholder="Business/Workspace Name"
                    variant="subtle"
                    h="50px"
                    {...register("business_name", {
                      required: "Business Name is required",
                      pattern: { value: /^\S+$/, message: "No spaces allowed" },
                    })}
                    borderRadius="lg"
                  />
                </Field>
                <SimpleGrid columns={2} gap={4}>
                  <Field invalid={!!errors.first_name} errorText={errors.first_name?.message?.toString()}>
                    <Input
                      placeholder="First Name"
                      variant="subtle"
                      h="50px"
                      {...register("first_name", {
                        required: "Required",
                        minLength: { value: 2, message: "Too short" },
                      })}
                      borderRadius="lg"
                    />
                  </Field>
                  <Field invalid={!!errors.last_name} errorText={errors.last_name?.message?.toString()}>
                    <Input
                      placeholder="Last Name"
                      variant="subtle"
                      h="50px"
                      {...register("last_name", { required: "Required" })}
                      borderRadius="lg"
                    />
                  </Field>
                </SimpleGrid>
                <SimpleGrid columns={2} gap={4}>
                  <Field invalid={!!errors.email} errorText={errors.email?.message?.toString()}>
                    <Input
                      placeholder="Email Address"
                      variant="subtle"
                      h="50px"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Invalid email" },
                      })}
                      borderRadius="lg"
                    />
                  </Field>
                  <Field invalid={!!errors.phone_number} errorText={errors.phone_number?.message?.toString()}>
                    <Input
                      placeholder="Phone Number"
                      variant="subtle"
                      h="50px"
                      {...register("phone_number", {
                        required: "Required",
                        pattern: { value: /^[0-9]{10}$/, message: "10 digits required" },
                      })}
                      borderRadius="lg"
                    />
                  </Field>
                </SimpleGrid>



                <Field invalid={!!errors.password} errorText={errors.password?.message?.toString()}>
                  <PasswordInput
                    placeholder="Create Password"
                    h="50px"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Min 8 chars" },
                    })}
                    borderRadius="lg"
                    variant="subtle"
                  />
                </Field> */}
                <MotionBox variants={itemVariants} mb={3}>
                  <AuthFormInput
                    label="Organization Name"
                    required
                    icon={<Building2 size={16} />}
                    error={errors.organization_name?.message?.toString()}
                    hint="No spaces — use letters, numbers or hyphens (e.g. acme-corp)"
                    inputProps={
                      {
                        ...register("organization_name", {
                          required: "Organization name is required",
                          minLength: {
                            value: 2,
                            message: "Enter a valid organization name",
                          },
                          pattern: {
                            value: /^\S+$/,
                            message:
                              "Organization name must not contain spaces",
                          },
                        }),
                        placeholder: "e.g. acme-corp",
                        autoComplete: "organization",
                        "aria-label": "Organization Name",
                      } as any
                    }
                  />
                </MotionBox>

                {/* ── Admin email ──────────────────────────────────── */}
                <MotionBox variants={itemVariants} mb={3}>
                  <AuthFormInput
                    label="Admin Email"
                    required
                    icon={<Mail size={18} />}
                    error={errors.organization_email?.message?.toString()}
                    inputProps={
                      {
                        ...register("organization_email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: "Enter a valid email address",
                          },
                        }),
                        type: "email",
                        placeholder: "admin@yourcompany.com",
                        autoComplete: "email",
                        "aria-label": "Admin Email",
                      } as any
                    }
                  />
                </MotionBox>

                {/* ── Phone number ─────────────────────────────────── */}
                <MotionBox variants={itemVariants} mb={3}>
                  <AuthFormInput
                    label="Phone Number"
                    required
                    icon={<Phone size={17} />}
                    error={errors.phone_number?.message?.toString()}
                    hint="Include country code (e.g. +91 98765 43210)"
                    inputProps={
                      {
                        ...register("phone_number", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\+?[1-9]\d{6,14}$/,
                            message:
                              "Enter a valid phone number with country code",
                          },
                        }),
                        type: "tel",
                        placeholder: "+91 98765 43210",
                        autoComplete: "tel",
                        "aria-label": "Phone Number",
                      } as any
                    }
                  />
                </MotionBox>

                {/* <AnimatePresence>
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
                </AnimatePresence> */}
                {/* ── Alert ─────────────────────────────────────────── */}
                {showAlert.isVisible && (
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    mb={4}
                  >
                    <Alert.Root
                      status={showAlert.status}
                      variant="outline"
                      borderRadius="xl"
                      borderWidth="1.5px"
                      fontSize="sm"
                    >
                      <Alert.Indicator />
                      <Alert.Title fontWeight="semibold">
                        {showAlert.title}
                      </Alert.Title>
                      <Alert.Description>
                        {showAlert.description}
                      </Alert.Description>
                    </Alert.Root>
                  </MotionBox>
                )}
                <Button
                  size="lg"
                  h="56px"
                  variant="premium"
                  borderRadius="xl"
                  fontWeight="700"
                  w="100%"
                  type="submit"
                  loading={isLoading}
                  mt={2}
                >
                  Register Now
                </Button>
              </Stack>
            </form>

            <Text
              mt={6}
              color="gray.500"
              fontSize="sm"
              textAlign="center"
              fontWeight="500"
            >
              Already have an account?{" "}
              <NavLink to="/auth/login">
                <Text
                  as="span"
                  color="brand.500"
                  fontWeight="700"
                  _hover={{ textDecoration: "underline" }}
                >
                  Log In
                </Text>
              </NavLink>
            </Text>
          </MotionStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default SignUp;
