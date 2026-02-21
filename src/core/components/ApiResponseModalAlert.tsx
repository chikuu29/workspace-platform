import React, { useMemo } from "react";
import { Badge, Box, Button, HStack, Text, VStack, Circle } from "@chakra-ui/react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import type { AppAlertPayload } from "@/core/utils/apiResponseAlert";
import { motion, AnimatePresence } from "framer-motion";
import { LuCircleCheck, LuCircleX, LuTriangleAlert, LuInfo } from "react-icons/lu";
import { useColorModeValue } from "@/components/ui/color-mode";

interface ApiResponseModalAlertProps {
  payload: AppAlertPayload | null;
  open: boolean;
  onClose: () => void;
}

const MotionCircle = motion(Circle as any);
const MotionBox = motion(Box as any);

const getStatusConfig = (status?: AppAlertPayload["status"]) => {
  switch (status) {
    case "success":
      return {
        palette: "green",
        icon: <LuCircleCheck size="32px" />,
        shadow: "0 10px 30px -10px var(--chakra-colors-green-500)",
        overlayBg: "green.500/10"
      };
    case "warning":
      return {
        palette: "orange",
        icon: <LuTriangleAlert size="32px" />,
        shadow: "0 10px 30px -10px var(--chakra-colors-orange-500)",
        overlayBg: "orange.500/10"
      };
    case "info":
      return {
        palette: "blue",
        icon: <LuInfo size="32px" />,
        shadow: "0 10px 30px -10px var(--chakra-colors-blue-500)",
        overlayBg: "blue.500/10"
      };
    default:
      return {
        palette: "red",
        icon: <LuCircleX size="32px" />,
        shadow: "0 10px 30px -10px var(--chakra-colors-red-500)",
        overlayBg: "red.500/10"
      };
  }
};

/**
 * ApiResponseModalAlert
 * A premium, state-of-the-art modal for API feedback.
 * Features glassmorphism, spring animations, and status-driven aesthetics.
 */
const ApiResponseModalAlert: React.FC<ApiResponseModalAlertProps> = ({ payload, open, onClose }) => {
  const bg = useColorModeValue("white", "gray.950");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const descriptionBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const config = useMemo(() => getStatusConfig(payload?.status), [payload?.status]);

  if (!payload) return null;

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => !e.open && onClose()}
      placement="center"
      motionPreset="scale"
    >
      <DialogContent
        maxW={{ base: "92vw", md: "420px" }}
        rounded="3xl"
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="2xl"
        backdropFilter="blur(20px)"
      >
        <DialogHeader p={0}>
          <Box
            w="full"
            h="140px"
            bg={config.overlayBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
          >
            {/* Visual Decorative Circles */}
            <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" borderRadius="full" bg={`${config.palette}.500/10`} filter="blur(30px)" />
            <Box position="absolute" bottom="-20px" left="-20px" w="80px" h="80px" borderRadius="full" bg={`${config.palette}.500/10`} filter="blur(25px)" />

            <MotionCircle
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              size="70px"
              bg={`${config.palette}.500`}
              color="white"
              boxShadow={config.shadow}
            >
              {config.icon}
            </MotionCircle>
          </Box>
        </DialogHeader>

        <DialogBody px={8} pt={6} pb={4}>
          <VStack gap={4} align="center" textAlign="center">
            <VStack gap={1}>
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
                {payload.status}
              </Badge>
              <Text fontSize="2xl" fontWeight="900" letterSpacing="tight">
                {payload.title}
              </Text>
            </VStack>

            {payload.description && (
              <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                p={4}
                w="full"
                borderRadius="2xl"
                bg={descriptionBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Text fontSize="sm" fontWeight="600" color="gray.500" lineHeight="tall">
                  {payload.description}
                </Text>
              </MotionBox>
            )}
          </VStack>
        </DialogBody>

        <DialogFooter px={8} pb={8} pt={2}>
          <Button
            w="full"
            size="lg"
            colorPalette={config.palette}
            variant="solid"
            fontWeight="800"
            borderRadius="xl"
            onClick={onClose}
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            Acknowledge
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default React.memo(ApiResponseModalAlert);

