/**
 * QuickActionCard.tsx
 *
 * Clickable workflow shortcut with icon, label, description,
 * and smooth hover animation. Uses semantic design tokens.
 */
import { memo } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";

// ── Types ────────────────────────────────────────────────────────────

interface QuickActionCardProps {
  /** Primary label */
  label: string;
  /** Short description */
  description: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Chakra color token for accent tint */
  accentColor: string;
  /** Click handler */
  onClick: () => void;
}

// ── Component ────────────────────────────────────────────────────────

const QuickActionCard = memo(({
  label,
  description,
  icon: IconComponent,
  accentColor,
  onClick,
}: QuickActionCardProps) => {
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");

  return (
    <Box
      as="button"
      w="full"
      textAlign="left"
      p={4}
      borderRadius="xl"
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(16px) saturate(140%)"
      boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}
      cursor="pointer"
      transition="all 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        borderColor: accentColor,
        transform: "translateY(-2px)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
      }}
      onClick={onClick}
      role="group"
    >
      <HStack gap={3} w="full" justify="space-between">
        <HStack gap={3} minW={0}>
          {/* Icon circle with soft tint */}
          <Flex
            align="center"
            justify="center"
            w="40px"
            h="40px"
            borderRadius="lg"
            bg={`${accentColor}/12`}
            color={accentColor}
            flexShrink={0}
          >
            <IconComponent size={20} strokeWidth={2} />
          </Flex>

          <VStack align="start" gap={0} minW={0}>
            <Text
              fontSize="sm"
              fontWeight="800"
              color="app.text.primary"
              lineHeight="1.3"
            >
              {label}
            </Text>
            <Text
              fontSize="xs"
              fontWeight="600"
              color="app.text.muted"
              lineHeight="1.4"
              truncate
            >
              {description}
            </Text>
          </VStack>
        </HStack>

        {/* Arrow indicator — appears on hover */}
        <Box
          opacity={0}
          transform="translateX(-4px)"
          transition="all 0.2s"
          color="app.text.muted"
          flexShrink={0}
          _groupHover={{
            opacity: 1,
            transform: "translateX(0)",
            color: accentColor,
          }}
        >
          <ArrowRight size={16} strokeWidth={2} />
        </Box>
      </HStack>
    </Box>
  );
});

QuickActionCard.displayName = "QuickActionCard";
export default QuickActionCard;
