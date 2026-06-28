import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";

const MotionBox = motion.create(Box);

interface AuthCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  maxW?: string;
}

/**
 * AuthCard — 2026 SaaS redesign
 *
 * Provides the full‑screen background + centered glassmorphic card
 * used by both SignIn and SignUp pages.
 *
 * Light mode  : soft indigo/violet mesh gradient background, white card, subtle shadow
 * Dark mode   : deep navy background (rgba 15,23,42), card with backdrop-blur + frosted border
 */
export const AuthCard: React.FC<AuthCardProps> = ({
  icon,
  title,
  subtitle,
  children,
  maxW = "md",
}) => {
  return (
    <Box
      minH="100vh"
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflowX="hidden"
      overflowY="auto"
      p={{ base: 4, md: 8 }}
      // Full page background
      bg="auth.bg"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        // Mesh gradient overlay
        _light: {
          background:
            "radial-gradient(ellipse 80% 60% at 10% -10%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(167,139,250,0.15) 0%, transparent 60%)",
        },
        _dark: {
          background:
            "radial-gradient(ellipse 80% 60% at 10% -10%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(139,92,246,0.10) 0%, transparent 60%)",
        },
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* ── Decorative animated orbs wrapped to prevent container expansion ── */}
      <Box
        position="absolute"
        inset="0"
        overflow="hidden"
        pointerEvents="none"
        zIndex={0}
      >
        <Box
          position="absolute"
          top="8%"
          left="4%"
          w={{ base: "220px", md: "340px" }}
          h={{ base: "220px", md: "340px" }}
          borderRadius="full"
          _light={{ bg: "rgba(99,102,241,0.08)" }}
          _dark={{ bg: "rgba(99,102,241,0.06)" }}
          filter="blur(64px)"
        />
        <Box
          position="absolute"
          bottom="5%"
          right="3%"
          w={{ base: "260px", md: "400px" }}
          h={{ base: "260px", md: "400px" }}
          borderRadius="full"
          _light={{ bg: "rgba(139,92,246,0.09)" }}
          _dark={{ bg: "rgba(139,92,246,0.07)" }}
          filter="blur(80px)"
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w={{ base: "300px", md: "500px" }}
          h={{ base: "300px", md: "500px" }}
          borderRadius="full"
          _light={{ bg: "rgba(236,72,153,0.04)" }}
          _dark={{ bg: "rgba(236,72,153,0.03)" }}
          filter="blur(90px)"
        />
      </Box>

      {/* ── Main glass card ────────────────────────────────────────── */}
      <MotionBox
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        // @ts-ignore - framer-motion transition prop
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        position="relative"
        zIndex={1}
        maxW={maxW}
        w="full"
        bg="auth.card.bg"
        borderRadius="2xl"
        border="1px solid"
        borderColor="auth.card.border"
        overflow="hidden"
        // Glassmorphism
        backdropFilter="blur(24px)"
        _light={{
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px -10px rgba(99,102,241,0.12), 0 0 0 1px rgba(255,255,255,0.6)",
        }}
        _dark={{
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.5), 0 25px 80px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Top accent gradient bar */}
        <Box
          h="3px"
          w="100%"
          bgGradient="to-r"
          gradientFrom="#6366f1"
          gradientVia="#8b5cf6"
          gradientTo="#ec4899"
        />

        {/* ── Header ─────────────────────────────────────────────── */}
        <Box pt={8} pb={6} px={8} textAlign="center">
          <VStack gap={3}>
            {/* Icon badge */}
            <MotionBox
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              // @ts-ignore
              transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
              w="64px"
              h="64px"
              borderRadius="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _light={{
                bg: "rgba(99,102,241,0.1)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.2)",
              }}
              _dark={{
                bg: "rgba(99,102,241,0.15)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
              }}
              mb={1}
            >
              {icon}
            </MotionBox>

            <Heading
              as="h1"
              fontSize={{ base: "1.6rem", md: "1.85rem" }}
              fontWeight={700}
              letterSpacing="-0.025em"
              lineHeight={1.15}
              color="auth.text.primary"
            >
              {title}
            </Heading>
            <Text
              fontSize="sm"
              color="auth.text.muted"
              fontWeight={400}
              lineHeight={1.6}
            >
              {subtitle}
            </Text>
          </VStack>
        </Box>

        {/* ── Form content ───────────────────────────────────────── */}
        <Box px={8} pb={8}>
          {children}
        </Box>
      </MotionBox>
    </Box>
  );
};
