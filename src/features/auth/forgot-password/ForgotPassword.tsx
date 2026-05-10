import {
  Alert,
  Box,
  Button,
  Flex,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Shield, Lock, ChevronLeft, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router";
import { AuthCard } from "../components/AuthCard";
import AuthFormInput from "../components/AuthFormInput";
import { POSTAPI } from "../../../app/api";
import { AlertProps } from "../../../app/interfaces/app.interface";

const MotionBox = motion.create(Box);

type Step = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

interface ForgotPasswordForm {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("EMAIL");
  const [isLoading, setIsLoading] = useState(false);
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
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    mode: "onChange",
  });

  const email = watch("email");
  const otp = watch("otp");

  const handleBack = () => {
    if (step === "OTP") setStep("EMAIL");
    else if (step === "RESET") setStep("OTP");
    else navigate("/auth/login");
  };

  const onSendOTP = handleSubmit(async (data) => {
    setIsLoading(true);
    setShowAlert({ isVisible: false, title: "", description: "", status: "info" });

    POSTAPI({
      path: "/auth/forgot-password",
      data: { email: data.email },
      isPrivateApi: false,
    }).subscribe((res: any) => {
      setIsLoading(false);
      if (res.success) {
        setStep("OTP");
      } else {
        setShowAlert({
          title: "Error",
          description: res.message || "Failed to send reset code.",
          status: "error",
          isVisible: true,
        });
      }
    });
  });

  const onVerifyOTP = handleSubmit(async (data) => {
    setIsLoading(true);
    setShowAlert({ isVisible: false, title: "", description: "", status: "info" });

    POSTAPI({
      path: "/auth/verify-otp",
      data: { email: data.email, otp: data.otp },
      isPrivateApi: false,
    }).subscribe((res: any) => {
      setIsLoading(false);
      if (res.success) {
        setStep("RESET");
      } else {
        setShowAlert({
          title: "Error",
          description: res.message || "Invalid or expired code.",
          status: "error",
          isVisible: true,
        });
      }
    });
  });

  const onResetPassword = handleSubmit(async (data) => {
    if (data.new_password !== data.confirm_password) {
      setShowAlert({
        title: "Validation Error",
        description: "Passwords do not match.",
        status: "error",
        isVisible: true,
      });
      return;
    }

    setIsLoading(true);
    setShowAlert({ isVisible: false, title: "", description: "", status: "info" });

    POSTAPI({
      path: "/auth/reset-password",
      data: {
        email: data.email,
        otp: data.otp,
        new_password: data.new_password,
      },
      isPrivateApi: false,
    }).subscribe((res: any) => {
      setIsLoading(false);
      if (res.success) {
        setStep("SUCCESS");
      } else {
        setShowAlert({
          title: "Error",
          description: res.message || "Failed to reset password.",
          status: "error",
          isVisible: true,
        });
      }
    });
  });

  const renderStep = () => {
    switch (step) {
      case "EMAIL":
        return (
          <MotionBox
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VStack gap={4} align="stretch">
              <AuthFormInput
                label="Email Address"
                icon={<Mail size={17} />}
                error={errors.email?.message}
                required
                inputProps={{
                  ...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }),
                  placeholder: "Enter your registered email",
                  type: "email",
                }}
              />
              <Button
                onClick={onSendOTP}
                loading={isLoading}
                width="full"
                size="lg"
                borderRadius="xl"
                bgGradient="to-r"
                gradientFrom="#6366f1"
                gradientTo="#8b5cf6"
                color="white"
                _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
              >
                Send Reset Code <ArrowRight style={{ marginLeft: "8px" }} />
              </Button>
            </VStack>
          </MotionBox>
        );

      case "OTP":
        return (
          <MotionBox
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VStack gap={4} align="stretch">
              <Text fontSize="sm" color="auth.text.muted" textAlign="center" mb={2}>
                We've sent a 6-digit code to <b>{email}</b>
              </Text>
              <AuthFormInput
                label="Verification Code"
                icon={<Shield size={17} />}
                error={errors.otp?.message}
                required
                inputProps={{
                  ...register("otp", {
                    required: "OTP is required",
                    minLength: { value: 6, message: "OTP must be 6 digits" },
                    maxLength: { value: 6, message: "OTP must be 6 digits" },
                  }),
                  placeholder: "000000",
                  textAlign: "center",
                  letterSpacing: "0.5em",
                  fontSize: "xl",
                  fontWeight: "bold",
                }}
              />
              <Button
                onClick={onVerifyOTP}
                loading={isLoading}
                width="full"
                size="lg"
                borderRadius="xl"
                bgGradient="to-r"
                gradientFrom="#6366f1"
                gradientTo="#8b5cf6"
                color="white"
                _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
              >
                Verify Code <ArrowRight style={{ marginLeft: "8px" }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                color="auth.text.accent"
                onClick={onSendOTP}
                disabled={isLoading}
              >
                Didn't get the code? Resend
              </Button>
            </VStack>
          </MotionBox>
        );

      case "RESET":
        return (
          <MotionBox
            key="reset"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VStack gap={4} align="stretch">
              <AuthFormInput
                label="New Password"
                icon={<Lock size={17} />}
                isPassword
                error={errors.new_password?.message}
                required
                inputProps={{
                  ...register("new_password", {
                    required: "New password is required",
                    minLength: { value: 8, message: "Minimum 8 characters" },
                  }),
                  placeholder: "Create a new password",
                }}
              />
              <AuthFormInput
                label="Confirm Password"
                icon={<Lock size={17} />}
                isPassword
                error={errors.confirm_password?.message}
                required
                inputProps={{
                  ...register("confirm_password", {
                    required: "Please confirm your password",
                    validate: (val) => {
                      if (watch("new_password") !== val) {
                        return "Passwords do not match";
                      }
                    },
                  }),
                  placeholder: "Repeat your new password",
                }}
              />
              <Button
                onClick={onResetPassword}
                loading={isLoading}
                width="full"
                size="lg"
                borderRadius="xl"
                bgGradient="to-r"
                gradientFrom="#6366f1"
                gradientTo="#8b5cf6"
                color="white"
                _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
              >
                Reset Password
              </Button>
            </VStack>
          </MotionBox>
        );

      case "SUCCESS":
        return (
          <MotionBox
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            textAlign="center"
          >
            <VStack gap={6}>
              <Box color="green.400">
                <CheckCircle size={60} />
              </Box>
              <VStack gap={2}>
                <Text fontSize="xl" fontWeight="bold" color="auth.text.primary">
                  Password Updated!
                </Text>
                <Text color="auth.text.muted">
                  Your password has been reset successfully. You can now sign in with your new credentials.
                </Text>
              </VStack>
              <Button
                width="full"
                size="lg"
                borderRadius="xl"
                bgGradient="to-r"
                gradientFrom="#6366f1"
                gradientTo="#8b5cf6"
                color="white"
                onClick={() => navigate("/auth/login")}
              >
                Back to Sign In
              </Button>
            </VStack>
          </MotionBox>
        );
    }
  };

  return (
    <AuthCard
      title={step === "SUCCESS" ? "Success" : "Forgot Password"}
      subtitle={
        step === "EMAIL" ? "Enter your email to receive a reset code" :
        step === "OTP" ? "Verify your identity" :
        step === "RESET" ? "Secure your account" :
        "Operation completed"
      }
      icon={<Shield size={30} color="#6366f1" />}
    >
      <VStack gap={6} width="100%">
        {step !== "SUCCESS" && step !== "EMAIL" && (
          <Flex width="100%">
            <chakra.button
              display="flex"
              alignItems="center"
              gap={2}
              fontSize="sm"
              fontWeight={500}
              color="auth.text.muted"
              _hover={{ color: "auth.text.accent" }}
              onClick={handleBack}
            >
              <ChevronLeft /> Back
            </chakra.button>
          </Flex>
        )}

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {showAlert.isVisible && (
          <Alert.Root
            status={showAlert.status}
            variant="outline"
            borderRadius="xl"
            mb={4}
            w="full"
          >
            <Alert.Indicator />
            <Alert.Title fontWeight="semibold">{showAlert.title}</Alert.Title>
            <Alert.Description>{showAlert.description}</Alert.Description>
          </Alert.Root>
        )}

        {step === "EMAIL" && (
          <Text fontSize="sm" color="auth.text.muted">
            Remembered your password?{" "}
            <Link to="/auth/login">
              <Text as="span" color="auth.text.accent" fontWeight={600} _hover={{ textDecoration: "underline" }}>
                Sign In
              </Text>
            </Link>
          </Text>
        )}
      </VStack>
    </AuthCard>
  );
};

export default ForgotPassword;
