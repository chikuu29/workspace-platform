import React, { useCallback, useEffect, useMemo } from "react";
import { Badge, Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import { CloseButton } from "@/components/ui/close-button";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useApiResponseModalStore } from "@/core/store/useApiResponseModalStore";

// ─── Status Visual Config ────────────────────────────────────────────────────
// Maps each status type to its Chakra color palette and icon.
// Uses the project's existing palette tokens (green, red, orange, blue).
const STATUS_MAP = {
  success: { palette: "green", icon: <CheckCircle size={24} /> },
  error: { palette: "red", icon: <XCircle size={24} /> },
  warning: { palette: "orange", icon: <AlertTriangle size={24} /> },
  info: { palette: "blue", icon: <Info size={24} /> },
} as const;

const FALLBACK_STATUS = STATUS_MAP.error;
const AUTO_CLOSE_DEFAULT_MS = 2500;

/**
 * ApiResponseModalAlert
 *
 * Minimal, user-friendly API feedback modal.
 * Uses project semantic tokens (app.card.*, app.text.*) for consistent theming.
 * Zustand selectors are individual for granular re-render control.
 */
const ApiResponseModalAlert: React.FC = () => {
  const open = useApiResponseModalStore((s) => s.open);
  const payload = useApiResponseModalStore((s) => s.config);
  const closeStore = useApiResponseModalStore((s) => s.closeModal);

  // ── Project semantic tokens ──
  const cardBg = useColorModeValue("white", "navy.800");
  const cardBorder = useColorModeValue("app.card.border", "app.card.border");
  const textPrimary = useColorModeValue("app.text.primary", "app.text.primary");
  const textMuted = useColorModeValue("app.text.muted", "app.text.muted");
  const msgBg = useColorModeValue("secondaryGray.300", "whiteAlpha.50");

  const status = useMemo(
    () => STATUS_MAP[payload?.type ?? "error"] ?? FALLBACK_STATUS,
    [payload?.type]
  );

  // ── Auto-close effect ──
  useEffect(() => {
    if (!open || !payload?.autoClose) return;
    const id = setTimeout(closeStore, payload.duration ?? AUTO_CLOSE_DEFAULT_MS);
    return () => clearTimeout(id);
  }, [open, payload?.autoClose, payload?.duration, closeStore]);

  // ── Stable handlers ──
  const handleConfirm = useCallback(() => {
    payload?.onConfirm?.();
    closeStore();
  }, [payload, closeStore]);

  const handleOpenChange = useCallback(
    (e: { open: boolean }) => {
      if (!e.open) handleConfirm();
    },
    [handleConfirm]
  );

  // Always render DialogRoot so Chakra can properly clean up the backdrop
  // on close. Guarding with `if (!payload) return null` would unmount the
  // dialog mid-exit-animation, leaving an invisible overlay blocking clicks.
  return (
    <DialogRoot
      open={open}
      onOpenChange={handleOpenChange}
      placement="center"
      motionPreset="scale"
    >
      <DialogContent
        maxW={{ base: "90vw", md: "420px" }}
        rounded="2xl"
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        overflow="hidden"
        boxShadow="0 20px 50px -12px rgba(0,0,0,0.25)"
      >
        {/* ── Close ─────────────────────────────────────────────── */}
        <CloseButton
          position="absolute"
          top="3"
          right="3"
          zIndex={5}
          size="sm"
          borderRadius="full"
          onClick={handleConfirm}
          aria-label="Close alert"
        />

        {/* ── Header: icon + title ──────────────────────────────── */}
        <DialogHeader p={0}>
          {/* Subtle accent strip at top */}
          <Box h="3px" bg={`${status.palette}.500`} />

          <VStack gap={3} align="center" pt={8} pb={4} px={6}>
            {/* Status icon circle */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="56px"
              h="56px"
              borderRadius="full"
              bg={`${status.palette}.500/12`}
              color={`${status.palette}.500`}
            >
              {status.icon}
            </Box>

            {/* Status badge */}
            <Badge
              colorPalette={status.palette}
              variant="subtle"
              px={2.5}
              py={0.5}
              borderRadius="full"
              textTransform="uppercase"
              fontSize="xs"
              fontWeight="700"
              letterSpacing="wider"
            >
              {payload?.type ?? "error"}
            </Badge>

            {/* Title */}
            <Text
              fontSize="lg"
              fontWeight="700"
              color={textPrimary}
              textAlign="center"
              lineHeight="short"
            >
              {payload?.title ?? ""}
            </Text>
          </VStack>
        </DialogHeader>

        {/* ── Body: message ─────────────────────────────────────── */}
        {payload?.message && (
          <DialogBody px={6} pt={0} pb={2}>
            <Box
              p={4}
              borderRadius="xl"
              bg={msgBg}
              border="1px solid"
              borderColor={cardBorder}
            >
              <Text
                fontSize="sm"
                fontWeight="500"
                color={textMuted}
                lineHeight="tall"
                textAlign="center"
              >
                {payload.message}
              </Text>
            </Box>
          </DialogBody>
        )}

        {/* ── Footer: actions ───────────────────────────────────── */}
        <DialogFooter px={6} pb={6} pt={3}>
          <HStack w="full" gap={3}>
            <Button
              flex={1}
              size="lg"
              variant="ghost"
              fontWeight="600"
              borderRadius="xl"
              color={textMuted}
              onClick={closeStore}
            >
              Dismiss
            </Button>
            <Button
              flex={2}
              size="lg"
              colorPalette="brand"
              variant="solid"
              fontWeight="700"
              borderRadius="xl"
              onClick={handleConfirm}
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "0 8px 24px -8px var(--chakra-colors-brand-500)",
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s ease"
            >
              Continue
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default React.memo(ApiResponseModalAlert);
