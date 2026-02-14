import { Steps, Box } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Navigate, Route, Routes } from "react-router-dom";
import SignInPage from "@/features/auth/signin/SignIn";

export default function Auth() {

  const authBg = useColorModeValue("white", "navy.900");
  return (
    <Box
      bg={authBg}
      float="right"
      minHeight="100vh"
      height="100%"
      position="relative"
      w="100%"
      transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
      transitionDuration=".2s, .2s, .35s"
      transitionProperty="top, bottom, width"
      transitionTimingFunction="linear, linear, ease"
    >
      {true ? (
        <Box mx="auto" minH="100vh">
          <Routes>
            <Route
              path="/auth"
              element={<Navigate to="/auth/sign-in" replace />}
            />
            <Route path="/auth/sign-in" element={<SignInPage />} />
            {/* <Route path="sign-in" element={<SignInPage />} /> */}
          </Routes>
        </Box>
      ) : null}
    </Box>
  );
}
