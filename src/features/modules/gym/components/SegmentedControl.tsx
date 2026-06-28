/**
 * SegmentedControl.tsx
 *
 * Reusable segmented tab / filter bar with fluid sliding animation using Framer Motion.
 * Provides a pill-shaped container with an absolute-positioned active background indicator
 * that slides smoothly between options on click.
 */

import { memo, useCallback } from "react";
import { Box, Flex, HStack, Icon } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion, AnimatePresence } from "framer-motion";

// ─── Brand accent ───────────────────────────────────────────────────
const BRAND_HEX = "#422AFB";

// ─── Types & Interfaces ─────────────────────────────────────────────

export interface SegmentedOption {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface SegmentedButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: (id: string) => void;
  icon?: React.ElementType;
}

// ─── SegmentedButton ────────────────────────────────────────────────

const SegmentedButton = memo(({ id, label, active, onClick, icon: ButtonIcon }: SegmentedButtonProps) => {
  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  const textColor = active ? "app.text.primary" : "app.text.muted";
  const hoverColor = useColorModeValue("app.text.primary", "white");

  // Custom dark mode theme values (using navy theme colors)
  const activeBg = useColorModeValue("white", "#1B254B");
  const activeShadow = useColorModeValue(
    "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    "0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)"
  );
  const activeBorder = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");

  return (
    <Box
      as="button"
      onClick={handleClick}
      position="relative"
      px={5}
      h="38px"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="lg"
      fontWeight={active ? "900" : "700"}
      fontSize="sm"
      color={textColor}
      transition="color 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ color: active ? undefined : hoverColor }}
      cursor="pointer"
      flex={1}
      minW="fit-content"
      outline="none"
      userSelect="none"
    >
      {/* Sliding Active Indicator background card */}
      {active && (
        <motion.div
          layoutId="active-pill"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: activeBg,
            borderRadius: "8px",
            boxShadow: activeShadow,
            border: `1px solid ${activeBorder}`,
            borderBottom: `2px solid ${BRAND_HEX}`,
            zIndex: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 32,
          }}
        />
      )}

      {/* Button label text wrapped to render above the animated indicator */}
      <HStack as="span" position="relative" zIndex={2} gap={1.5} align="center">
        {ButtonIcon && <Icon as={ButtonIcon} boxSize={3.5} />}
        <Box as="span">{label}</Box>
      </HStack>
    </Box>
  );
});
SegmentedButton.displayName = "SegmentedButton";

// ─── SegmentedControl ───────────────────────────────────────────────

export interface SegmentedControlProps {
  options: readonly SegmentedOption[];
  activeId: string;
  onChange: (id: string) => void;
}

export const SegmentedControl = memo(({ options, activeId, onChange }: SegmentedControlProps) => {
  const containerBg = useColorModeValue("gray.50", "#0b1437");
  const borderColor = useColorModeValue("rgba(226,232,240,0.86)", "rgba(255,255,255,0.12)");

  return (
    <Flex
      p={1.5}
      bg={"app.card.bg"}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      w="fit-content"
      gap={1}
      position="relative"
    >
      {/* AnimatePresence coordinates layout transitions when elements mount/unmount */}
      <AnimatePresence initial={false}>
        {options.map((opt) => (
          <SegmentedButton
            key={opt.id}
            id={opt.id}
            label={opt.label}
            icon={opt.icon}
            active={activeId === opt.id}
            onClick={onChange}
          />
        ))}
      </AnimatePresence>
    </Flex>
  );
});
SegmentedControl.displayName = "SegmentedControl";
