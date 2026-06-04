/**
 * PaymentMethodSelector.tsx
 *
 * Reusable payment method selector for the billing checkout flow.
 * Supports two top-level modes: Cash and Online.
 * Online expands into sub-options: UPI, Card, Payment Link.
 *
 * Usage:
 *   <PaymentMethodSelector
 *     paymentMode={paymentMode}
 *     onlineMethod={onlineMethod}
 *     onPaymentModeChange={setPaymentMode}
 *     onOnlineMethodChange={setOnlineMethod}
 *   />
 */
import React, { memo, useMemo } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  Banknote,
  Globe,
  Smartphone,
  CreditCard,
  Link2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

export type PaymentMode = "cash" | "online";
export type OnlineMethod = "upi" | "card" | "payment_link";

interface PaymentMethodSelectorProps {
  /** Current top-level payment mode */
  paymentMode: PaymentMode;
  /** Current online sub-method (only relevant when paymentMode === "online") */
  onlineMethod: OnlineMethod;
  /** Callback when the top-level mode changes */
  onPaymentModeChange: (mode: PaymentMode) => void;
  /** Callback when the online sub-method changes */
  onOnlineMethodChange: (method: OnlineMethod) => void;
}

// ── Primary Payment Mode Button ──────────────────────────────────────

interface ModeButtonProps {
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  accentColor: string;
  onClick: () => void;
}

const ModeButton = memo<ModeButtonProps>(
  ({ isActive, icon, label, sublabel, accentColor, onClick }) => {
    const cardBg = useColorModeValue("white", "gray.800");
    const inactiveCardBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

    return (
      <Box
        as="button"
        type="button"
        onClick={onClick}
        w="full"
        p={5}
        borderRadius="2xl"
        border="2px solid"
        borderColor={isActive ? `${accentColor}.500` : borderColor}
        bg={isActive ? `${accentColor}.500/5` : inactiveCardBg}
        cursor="pointer"
        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          borderColor: `${accentColor}.500`,
          transform: "translateY(-2px)",
          shadow: "lg",
        }}
        position="relative"
        overflow="hidden"
      >
        {/* Active glow accent */}
        {isActive && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="3px"
            bg={`${accentColor}.500`}
            borderRadius="full"
          />
        )}

        <VStack gap={3} align="center">
          <Box
            p={3}
            borderRadius="xl"
            bg={isActive ? `${accentColor}.500` : `${accentColor}.500/10`}
            color={isActive ? "white" : `${accentColor}.500`}
            transition="all 0.25s"
          >
            {icon}
          </Box>
          <VStack gap={0}>
            <Text
              fontSize="sm"
              fontWeight="950"
              color={isActive ? `${accentColor}.500` : "app.text.primary"}
              letterSpacing="wide"
            >
              {label}
            </Text>
            <Text fontSize="10px" color="fg.muted" fontWeight="600">
              {sublabel}
            </Text>
          </VStack>
          {isActive && (
            <Badge
              colorPalette={accentColor}
              variant="subtle"
              borderRadius="full"
              fontSize="8px"
              fontWeight="900"
              px={2.5}
            >
              SELECTED
            </Badge>
          )}
        </VStack>
      </Box>
    );
  }
);
ModeButton.displayName = "ModeButton";

// ── Online Sub-Method Button ─────────────────────────────────────────

interface SubMethodButtonProps {
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

const SubMethodButton = memo<SubMethodButtonProps>(
  ({ isActive, icon, label, description, onClick }) => {
    const inactiveBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

    return (
      <Box
        as="button"
        type="button"
        onClick={onClick}
        p={4}
        borderRadius="xl"
        border="1.5px solid"
        borderColor={isActive ? "brand.500" : borderColor}
        bg={isActive ? "brand.500/5" : inactiveBg}
        cursor="pointer"
        transition="all 0.2s ease"
        _hover={{
          borderColor: "brand.500",
          bg: "brand.500/5",
        }}
        textAlign="left"
      >
        <HStack gap={3}>
          <Box
            p={2}
            borderRadius="lg"
            bg={isActive ? "brand.500" : "brand.500/10"}
            color={isActive ? "white" : "brand.500"}
            transition="all 0.2s"
            flexShrink={0}
          >
            {icon}
          </Box>
          <VStack align="start" gap={0}>
            <Text
              fontSize="xs"
              fontWeight="900"
              color={isActive ? "brand.500" : "app.text.primary"}
            >
              {label}
            </Text>
            <Text fontSize="10px" color="fg.muted" fontWeight="600">
              {description}
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  }
);
SubMethodButton.displayName = "SubMethodButton";

// ── Main Component ───────────────────────────────────────────────────

const PaymentMethodSelector = memo<PaymentMethodSelectorProps>(
  ({
    paymentMode,
    onlineMethod,
    onPaymentModeChange,
    onOnlineMethodChange,
  }) => {
    // Stable callback references
    const handleSelectCash = useMemo(
      () => () => onPaymentModeChange("cash"),
      [onPaymentModeChange]
    );
    const handleSelectOnline = useMemo(
      () => () => onPaymentModeChange("online"),
      [onPaymentModeChange]
    );
    const handleSelectUpi = useMemo(
      () => () => onOnlineMethodChange("upi"),
      [onOnlineMethodChange]
    );
    const handleSelectCard = useMemo(
      () => () => onOnlineMethodChange("card"),
      [onOnlineMethodChange]
    );
    const handleSelectPaymentLink = useMemo(
      () => () => onOnlineMethodChange("payment_link"),
      [onOnlineMethodChange]
    );

    return (
      <VStack align="stretch" gap={5}>
        {/* Top-Level: Cash vs Online */}
        <VStack align="stretch" gap={2}>
          <Text
            fontSize="9px"
            fontWeight="900"
            color="fg.muted"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Payment Mode
          </Text>
          <SimpleGrid columns={2} gap={4}>
            <ModeButton
              isActive={paymentMode === "cash"}
              icon={<Banknote size={22} />}
              label="Cash"
              sublabel="Collect at counter"
              accentColor="green"
              onClick={handleSelectCash}
            />
            <ModeButton
              isActive={paymentMode === "online"}
              icon={<Globe size={22} />}
              label="Online"
              sublabel="Digital payment"
              accentColor="brand"
              onClick={handleSelectOnline}
            />
          </SimpleGrid>
        </VStack>

        {/* Sub-Level: Online Methods (shown only when online is selected) */}
        {paymentMode === "online" && (
          <VStack
            align="stretch"
            gap={3}
            p={4}
            borderRadius="xl"
            bg={useColorModeValue("brand.50/50", "brand.500/5")}
            border="1px solid"
            borderColor={useColorModeValue("brand.100", "brand.500/15")}
          >
            <Text
              fontSize="9px"
              fontWeight="900"
              color="brand.500"
              letterSpacing="widest"
              textTransform="uppercase"
            >
              Choose Online Method
            </Text>
            <VStack align="stretch" gap={2}>
              <SubMethodButton
                isActive={onlineMethod === "upi"}
                icon={<Smartphone size={16} />}
                label="UPI Payment"
                description="Google Pay, PhonePe, BHIM — customer present"
                onClick={handleSelectUpi}
              />
              <SubMethodButton
                isActive={onlineMethod === "card"}
                icon={<CreditCard size={16} />}
                label="Card Payment"
                description="Debit/Credit card — customer present"
                onClick={handleSelectCard}
              />
              <SubMethodButton
                isActive={onlineMethod === "payment_link"}
                icon={<Link2 size={16} />}
                label="Send Payment Link"
                description="Razorpay link via email/SMS — remote or later payment"
                onClick={handleSelectPaymentLink}
              />
            </VStack>
          </VStack>
        )}
      </VStack>
    );
  }
);

PaymentMethodSelector.displayName = "PaymentMethodSelector";
export default PaymentMethodSelector;
