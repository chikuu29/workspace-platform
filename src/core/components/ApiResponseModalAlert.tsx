import React, { useEffect, useMemo } from "react";
import { Badge, Box, Button, Text, VStack, Circle, HStack, Progress } from "@chakra-ui/react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import { CloseButton } from "@/components/ui/close-button";
import { motion } from "framer-motion";
import { LuCircleCheck, LuCircleX, LuTriangleAlert, LuInfo } from "react-icons/lu";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useApiResponseModalStore } from "@/core/store/useApiResponseModalStore";

const MotionCircle = motion.create(Circle as any);
const MotionBox = motion.create(Box as any);

const getStatusConfig = (status?: "success" | "error" | "warning" | "info") => {
  switch (status) {
    case "success":
      return {
        palette: "green",
        icon: <LuCircleCheck size="32px" />,
        shadow: "0 18px 42px -24px var(--chakra-colors-green-500)",
        glow: "green.500/20",
      };
    case "warning":
      return {
        palette: "orange",
        icon: <LuTriangleAlert size="32px" />,
        shadow: "0 18px 42px -24px var(--chakra-colors-orange-500)",
        glow: "orange.500/20",
      };
    case "info":
      return {
        palette: "blue",
        icon: <LuInfo size="32px" />,
        shadow: "0 18px 42px -24px var(--chakra-colors-blue-500)",
        glow: "blue.500/20",
      };
    default:
      return {
        palette: "red",
        icon: <LuCircleX size="32px" />,
        shadow: "0 18px 42px -24px var(--chakra-colors-red-500)",
        glow: "red.500/20",
      };
  }
};

/**
 * ApiResponseModalAlert
 * A premium, state-of-the-art modal for API feedback.
 * Features glassmorphism, spring animations, and status-driven aesthetics.
 */
const ApiResponseModalAlert: React.FC = () => {
  const open = useApiResponseModalStore((state) => state.open);
  const payload = useApiResponseModalStore((state) => state.config);
  const onClose = useApiResponseModalStore((state) => state.closeModal);
  const bg = useColorModeValue("white", "navy.900");
  const borderColor = useColorModeValue("secondaryGray.200", "whiteAlpha.200");
  const textMuted = useColorModeValue("secondaryGray.700", "secondaryGray.400");
  const surfaceBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const progressTrackBg = useColorModeValue("secondaryGray.200", "whiteAlpha.200");
  const iconSurfaceBg = useColorModeValue("white", "navy.800");
  const titleColor = useColorModeValue("secondaryGray.900", "white");
  const closeBtnBg = useColorModeValue("whiteAlpha.900", "blackAlpha.400");
  const closeBtnBorder = useColorModeValue("gray.200", "whiteAlpha.300");
  const closeBtnHoverBg = useColorModeValue("gray.100", "whiteAlpha.300");
  const gradientTop = useColorModeValue(
    "linear-gradient(100deg, rgba(66,42,251,0.12) 0%, rgba(57,101,255,0.10) 55%, rgba(1,181,116,0.08) 100%)",
    "linear-gradient(100deg, rgba(66,42,251,0.28) 0%, rgba(54,82,186,0.24) 55%, rgba(1,181,116,0.20) 100%)"
  );

  const config = useMemo(() => getStatusConfig(payload?.type), [payload?.type]);

  useEffect(() => {
    if (!open || !payload?.autoClose) return;
    const timeout = setTimeout(() => onClose(), payload.duration ?? 2500);
    return () => clearTimeout(timeout);
  }, [open, onClose, payload?.autoClose, payload?.duration]);

  if (!payload) return null;

  const handleClose = () => {
    payload.onConfirm?.();
    onClose();
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => !e.open && handleClose()}
      placement="center"
      motionPreset="scale"
    >
      <DialogContent
        maxW={{ base: "92vw", md: "500px" }}
        rounded="3xl"
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="0 30px 70px -35px rgba(17, 28, 68, 0.55)"
        backdropFilter="blur(20px)"
      >
        <DialogHeader p={0} position="relative">
          <CloseButton
            position="absolute"
            top="3"
            right="3"
            zIndex={5}
            bg={closeBtnBg}
            border="1px solid"
            borderColor={closeBtnBorder}
            borderRadius="full"
            boxShadow="sm"
            _hover={{ bg: closeBtnHoverBg }}
            onClick={handleClose}
            aria-label="Close alert"
          />
          <Progress.Root
            value={payload.autoClose ? 100 : 0}
            size="xs"
            colorPalette="brand"
            striped={payload.autoClose}
            animated={payload.autoClose}
            visibility={payload.autoClose ? "visible" : "hidden"}
          >
            <Progress.Track bg={progressTrackBg}>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Box
            w="full"
            p={{ base: 6, md: 8 }}
            bgImage={gradientTop}
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top="-20px" right="-20px" w="140px" h="140px" borderRadius="full" bg="brand.500/12" filter="blur(34px)" />
            <Box position="absolute" bottom="-26px" left="-24px" w="120px" h="120px" borderRadius="full" bg={config.glow} filter="blur(28px)" />

            <HStack gap={4} align="center">
              <MotionCircle
                initial={{ scale: 0.8, opacity: 0, y: 6 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                size="64px"
                bg={iconSurfaceBg}
                color={`${config.palette}.500`}
                border="1px solid"
                borderColor={`${config.palette}.500/40`}
                boxShadow={config.shadow}
              >
                {config.icon}
              </MotionCircle>

              <VStack align="start" gap={1}>
                <Badge
                  colorPalette={config.palette}
                  variant="subtle"
                  px={3}
                  py={1}
                  borderRadius="full"
                  textTransform="uppercase"
                  fontSize="10px"
                  fontWeight="800"
                  letterSpacing="widest"
                >
                  {payload.type}
                </Badge>
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="900" letterSpacing="tight" color={titleColor}>
                  {payload.title}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </DialogHeader>

        <DialogBody px={{ base: 6, md: 8 }} pt={6} pb={4}>
          {payload.message && (
            <MotionBox
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              p={4}
              w="full"
              borderRadius="xl"
              bg={surfaceBg}
              border="1px solid"
              borderColor={borderColor}
            >
              <Text fontSize="sm" fontWeight="600" color={textMuted} lineHeight="tall">
                {payload.message}
              </Text>
            </MotionBox>
          )}
        </DialogBody>

        <DialogFooter px={{ base: 6, md: 8 }} pb={{ base: 6, md: 7 }} pt={2} w="full">
          <Button
            w="full"
            size="lg"
            colorPalette="brand"
            variant="solid"
            fontWeight="800"
            borderRadius="xl"
            onClick={handleClose}
            _hover={{ transform: "translateY(-1px)", boxShadow: "0 12px 28px -16px var(--chakra-colors-brand-500)" }}
            transition="all 0.2s ease"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default React.memo(ApiResponseModalAlert);
