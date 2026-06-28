import React, { useState, useCallback } from "react";
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
import { NavLink } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { POSTAPI } from "@/app/api";
import { AlertProps } from "@/app/types/appConfigInterface";
import { Building2, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import AuthFormInput from "../components/AuthFormInput";
import MarketingShowcase from "../signin/MarketingShowcase";

const MotionFlex = motion.create(Flex);
const MotionBox = motion.create(Box);
const MotionStack = motion.create(Stack);

// --- Animation Variants defined outside component to avoid recreation ---
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

const logoTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

const logoHover = {
  scale: 1.05,
  rotate: [0, 6, -6, 0],
};

const headingInitial = { opacity: 0, y: 10 };
const headingAnimate = { opacity: 1, y: 0 };
const headingTransition = { duration: 0.5 };

const mainHeadingInitial = { opacity: 0, y: 15 };
const mainHeadingAnimate = { opacity: 1, y: 0 };
const mainHeadingTransition = { duration: 0.6, delay: 0.05 };

const initialAlert = { opacity: 0, scale: 0.95 };
const animateAlert = { opacity: 1, scale: 1 };
const exitAlert = { opacity: 0, scale: 0.95 };
const alertTransition = { duration: 0.2 };

// --- Hover / Active styles defined outside JSX to avoid inline object recreation ---
const hoverUnderline = { textDecoration: "underline" };
const hoverPremiumButton = {
  gradientFrom: "brand.500",
  gradientTo: "blue.700",
  transform: "translateY(-1px)",
  boxShadow: "0 8px 25px rgba(117, 81, 255, 0.45)",
};
const activePremiumButton = { transform: "translateY(0px)" };

const phonePattern = {
  value: /^\+?[1-9]\d{6,14}$/,
  message: "Enter a valid phone number with country code",
};

const emailPattern = {
  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
  message: "Enter a valid email address",
};

const orgNamePattern = {
  value: /^\S+$/,
  message: "Organization name must not contain spaces",
};

/**
 * SignUp Component
 *
 * Redesigned SaaS organization registration page.
 * Uses a split layout sharing MarketingShowcase on the left panel,
 * and a secure signup card on the right panel.
 * Designed using Chakra UI v3 semantic tokens and Framer Motion.
 */
const SignUp: React.FC = () => {
  const [isLoading, setLoading] = useState(false);
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

  const onFormSubmit = useCallback((formData: any) => {
    setLoading(true);
    setShowAlert((prev) => ({ ...prev, isVisible: false }));

    POSTAPI({
      path: "account/register/organization",
      serverName: "identity",
      data: formData,
      isPrivateApi: false,
    }).subscribe({
      next: (res: any) => {
        setLoading(false);
        if (res.success) {
          setShowAlert({
            title: "Success",
            description:
              res?.message ||
              "Organization registered successfully. Please check your email for activation instructions.",
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
      },
      error: (error: any) => {
        setLoading(false);
        setShowAlert({
          title: "Error",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Registration failed. Please check your internet connection and try again.",
          status: "error",
          isVisible: true,
        });
      },
    });
  }, []);

  const bgGradientColor = useColorModeValue("gray.50", "navy.900");
  const rightBgColor = useColorModeValue("white", "navy.900");
  const subTextColor = useColorModeValue("gray.600", "secondaryGray.500");
  const linkColor = useColorModeValue("gray.500", "secondaryGray.500");

  const orgNameRegisterProps = register("organization_name", {
    required: "Organization name is required",
    minLength: {
      value: 2,
      message: "Enter a valid organization name",
    },
    pattern: orgNamePattern,
  });

  const emailRegisterProps = register("organization_email", {
    required: "Email is required",
    pattern: emailPattern,
  });

  const phoneRegisterProps = register("phone_number", {
    required: "Phone number is required",
    pattern: phonePattern,
  });

  const orgInputProps = React.useMemo(
    () => ({
      ...orgNameRegisterProps,
      placeholder: "e.g. acme-corp",
      autoComplete: "organization",
      "aria-label": "Organization Name",
    }),
    [orgNameRegisterProps]
  );

  const emailInputProps = React.useMemo(
    () => ({
      ...emailRegisterProps,
      type: "email",
      placeholder: "admin@yourcompany.com",
      autoComplete: "email",
      "aria-label": "Admin Email",
    }),
    [emailRegisterProps]
  );

  const phoneInputProps = React.useMemo(
    () => ({
      ...phoneRegisterProps,
      type: "tel",
      placeholder: "+91 98765 43210",
      autoComplete: "tel",
      "aria-label": "Phone Number",
    }),
    [phoneRegisterProps]
  );

  const orgIcon = React.useMemo(() => <Building2 size={16} />, []);
  const emailIcon = React.useMemo(() => <Mail size={18} />, []);
  const phoneIcon = React.useMemo(() => <Phone size={17} />, []);

  return (
    <Flex
      position="relative"
      minH="100vh"
      w="100vw"
      direction={{ base: "column", md: "row" }}
      overflowX="hidden"
      overflowY="auto"
      bg={bgGradientColor}
    >
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

      {/* Left Panel: Sign Up Form & Actions */}
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
        bg={rightBgColor}
      >
        <MotionStack
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          w="100%"
          maxW="md"
          gap={{ base: 4, md: 6 }}
          align="stretch"
        >
          {/* Portal header with animated Logo */}
          <Stack gap={3} align="center" textAlign="center">
            <MotionBox
              initial={initialAlert}
              animate={animateAlert}
              transition={logoTransition}
              whileHover={logoHover}
              cursor="pointer"
              mb={1}
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
                Join Workspace
              </Text>
              <Box h="1.5px" w="20px" bg="brand.400" borderRadius="full" />
            </Flex>

            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="900"
              letterSpacing="tight"
              lineHeight="1.1"
              color={useColorModeValue("navy.900", "white")}
            >
              Create Your{" "}
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

            <Text
              color={subTextColor}
              fontSize="sm"
              fontWeight="500"
              lineHeight="tall"
              maxW="sm"
            >
              Register your organization to unify all operations in one powerful workspace.
            </Text>
          </Stack>

          {/* Feedback message banner */}
          <AnimatePresence>
            {showAlert.isVisible && (
              <MotionBox
                initial={initialAlert}
                animate={animateAlert}
                exit={exitAlert}
                transition={alertTransition}
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

          {/* Form */}
          <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            <Stack gap={4}>
              {/* Organization name */}
              <MotionBox variants={itemVariants}>
                <AuthFormInput
                  label="Organization Name"
                  required
                  icon={orgIcon}
                  error={errors.organization_name?.message?.toString()}
                  hint="No spaces — use letters, numbers or hyphens (e.g. acme-corp)"
                  inputProps={orgInputProps}
                />
              </MotionBox>

              {/* Admin email */}
              <MotionBox variants={itemVariants}>
                <AuthFormInput
                  label="Admin Email"
                  required
                  icon={emailIcon}
                  error={errors.organization_email?.message?.toString()}
                  inputProps={emailInputProps}
                />
              </MotionBox>

              {/* Phone number */}
              <MotionBox variants={itemVariants}>
                <AuthFormInput
                  label="Phone Number"
                  required
                  icon={phoneIcon}
                  error={errors.phone_number?.message?.toString()}
                  hint="Include country code (e.g. +91 98765 43210)"
                  inputProps={phoneInputProps}
                />
              </MotionBox>

              {/* Submit button */}
              <MotionBox variants={itemVariants} mt={2} whileTap={activePremiumButton}>
                <Button
                  size="lg"
                  h="52px"
                  borderRadius="xl"
                  fontWeight="700"
                  w="100%"
                  type="submit"
                  loading={isLoading}
                  loadingText="Registering…"
                  fontSize="sm"
                  color="white"
                  bgGradient="to-r"
                  gradientFrom="brand.400"
                  gradientTo="blue.600"
                  _hover={hoverPremiumButton}
                  _active={activePremiumButton}
                  transition="all 0.22s cubic-bezier(0.4,0,0.2,1)"
                  aria-label="Register organization"
                >
                  Register Now
                </Button>
              </MotionBox>
            </Stack>
          </form>

          {/* Footer Navigation Link */}
          <MotionBox variants={itemVariants} textAlign="center" mt={2}>
            <Text
              color={linkColor}
              fontSize="sm"
              fontWeight="500"
            >
              Already have an account?{" "}
              <NavLink to="/auth/login">
                <Text
                  as="span"
                  color="brand.500"
                  fontWeight="700"
                  _hover={hoverUnderline}
                  transition="color 0.2s"
                >
                  Log In
                </Text>
              </NavLink>
            </Text>
          </MotionBox>
        </MotionStack>
      </Flex>

      {/* Right Panel: Marketing Showcase */}
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
        bg="navy.955"
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
                initial={headingInitial}
                animate={headingAnimate}
                transition={headingTransition}
              >
                <Box h="2px" w="12px" bg="brand.400" borderRadius="full" />
                <Text
                  textTransform="uppercase"
                  fontSize="2xs"
                  fontWeight="800"
                  color="brand.400"
                  letterSpacing="widest"
                >
                  Join the Network
                </Text>
                <Box h="2px" w="12px" bg="brand.400" borderRadius="full" />
              </MotionFlex>

              <MotionBox
                initial={mainHeadingInitial}
                animate={mainHeadingAnimate}
                transition={mainHeadingTransition}
              >
                <Heading
                  lineHeight={1.2}
                  fontSize={{ base: "2xl", sm: "3xl", lg: "4xl" }}
                  fontWeight="900"
                  letterSpacing="tight"
                  textAlign="center"
                  color="white"
                >
                  Start Your{" "}
                  <Text
                    as="span"
                    bgGradient="to-r"
                    gradientFrom="brand.400"
                    gradientTo="blue.400"
                    bgClip="text"
                  >
                    Business Journey
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

export default React.memo(SignUp);

