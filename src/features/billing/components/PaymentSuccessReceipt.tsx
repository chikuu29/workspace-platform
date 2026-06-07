/**
 * PaymentSuccessReceipt.tsx
 *
 * Reusable success receipt shown after payment completion.
 * Displays invoice details, payment confirmation, and post-checkout actions.
 * Handles both paid (cash/online) and link-sent (unpaid) states.
 *
 * Usage:
 *   <PaymentSuccessReceipt
 *     invoiceNumber="INV/2026-27/0001"
 *     subscriptionId="SUB-001"
 *     memberName="John Doe"
 *     planName="Pro Membership"
 *     billingCycle="monthly"
 *     total={5900}
 *     status="paid"
 *     paymentMethod="cash"
 *     onBackToDirectory={handleBack}
 *     onPrintReceipt={handlePrint}
 *   />
 */
import React, { memo, useEffect, useState, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Flex,
  Separator,
  Circle,
  Input,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { BRAND_GRADIENT, BRAND_HEX, BRAND_ALT } from "@/theme/tokens/colors";
import {
  CheckCircle2,
  Printer,
  ArrowLeft,
  Copy,
  ExternalLink,
  Check,
  Info,
  Sparkles,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

interface PaymentSuccessReceiptProps {
  /** Invoice number */
  invoiceNumber: string;
  /** Subscription ID */
  subscriptionId: string;
  /** Member name */
  memberName: string;
  /** Plan name */
  planName: string;
  /** Billing cycle */
  billingCycle: string;
  /** Invoice total */
  total: number;
  /** Payment status: paid or sent (pending) */
  status: "paid" | "sent" | "partial";
  /** Payment method used */
  paymentMethod?: string;
  /** Payment link URL (for unpaid/link-sent flows) */
  paymentLinkUrl?: string;
  /** Member email (for link dispatch notice) */
  memberEmail?: string;
  /** Start date */
  startDate?: string;
  /** End date */
  endDate?: string;
  /** Currency symbol */
  currencySymbol?: string;
  /** Navigate back callback */
  onBackToDirectory: () => void;
  /** Print receipt callback */
  onPrintReceipt?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────

const formatINR = (amount: number, symbol: string = "₹"): string =>
  `${symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

// ── Component ────────────────────────────────────────────────────────

const PaymentSuccessReceipt = memo<PaymentSuccessReceiptProps>(
  ({
    invoiceNumber,
    subscriptionId,
    memberName,
    planName,
    billingCycle,
    total,
    status,
    paymentMethod,
    paymentLinkUrl,
    memberEmail,
    startDate,
    endDate,
    currencySymbol = "₹",
    onBackToDirectory,
    onPrintReceipt,
  }) => {
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const receiptBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const muted = "fg.muted";

    const isPaid = status === "paid";
    const [copied, setCopied] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Trigger confetti animation on mount if paid
    useEffect(() => {
      if (isPaid) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
      }
    }, [isPaid]);

    // Copy link handler
    const handleCopyLink = useCallback(async () => {
      if (!paymentLinkUrl) return;
      try {
        await navigator.clipboard.writeText(paymentLinkUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* Fallback silently */
      }
    }, [paymentLinkUrl]);

    const handleOpenLink = useCallback(() => {
      if (paymentLinkUrl) window.open(paymentLinkUrl, "_blank");
    }, [paymentLinkUrl]);

    return (
      <Box maxW="lg" mx="auto" pb={20} position="relative" zIndex={1}>
        {/* Confetti particles (CSS animation) */}
        {showConfetti && (
          <Box
            position="absolute"
            top={-4}
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
            pointerEvents="none"
          >
            <HStack gap={1} opacity={0.8}>
              {[...Array(6)].map((_, i) => (
                <Sparkles
                  key={i}
                  size={16}
                  color={
                    [BRAND_HEX, "#01B574", "#FFB547", "#E53E3E", "#3182CE", "#D69E2E"][i]
                  }
                  style={{
                    animation: `confetti-fall ${1.5 + i * 0.3}s ease-out forwards`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </HStack>
          </Box>
        )}

        <VStack
          p={8}
          borderRadius="3xl"
          bg="app.card.bg"
          borderWidth="1px"
          borderColor="app.card.border"
          gap={6}
          align="center"
          textAlign="center"
          backdropFilter="blur(20px)"
        >
          {/* Success Icon */}
          <Circle
            size={16}
            bg={isPaid ? "green.500" : "purple.500"}
            color="white"
            shadow={isPaid ? "0 0 30px rgba(1,181,116,0.4)" : "0 0 30px rgba(128,90,213,0.4)"}
          >
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </Circle>

          {/* Title */}
          <VStack gap={1}>
            <Text fontSize="lg" fontWeight="950" letterSpacing="tight" color="app.text.primary">
              {isPaid ? "Payment Confirmed" : "Payment Link Dispatched"}
            </Text>
            <Text fontSize="xs" color={muted} fontWeight="600">
              {isPaid
                ? "Membership activated successfully. Official invoice generated."
                : "Payment link sent. Membership activates upon payment."}
            </Text>
          </VStack>

          <Separator opacity={0.06} />

          {/* Invoice Receipt */}
          <Box
            w="full"
            p={6}
            bg={receiptBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            textAlign="left"
          >
            <VStack align="stretch" gap={3}>
              <Flex justify="space-between" align="center">
                <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">
                  INVOICE NUMBER
                </Text>
                <Text fontSize="xs" color="brand.500" fontWeight="900">
                  {invoiceNumber}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">
                  MEMBER NAME
                </Text>
                <Text fontSize="xs" color="app.text.primary" fontWeight="800">
                  {memberName.toUpperCase()}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">
                  PLAN
                </Text>
                <Text fontSize="xs" color="app.text.primary" fontWeight="800">
                  {planName.toUpperCase()}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">
                  BILLING CYCLE
                </Text>
                <Text fontSize="xs" color="app.text.primary" fontWeight="800">
                  {billingCycle.toUpperCase()}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">
                  SUBSCRIPTION ID
                </Text>
                <Text fontSize="xs" color="app.text.primary" fontWeight="800">
                  {subscriptionId}
                </Text>
              </Flex>
              {paymentMethod && (
                <Flex justify="space-between" align="center">
                  <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">
                    PAYMENT METHOD
                  </Text>
                  <Badge
                    colorPalette={paymentMethod === "cash" ? "green" : "brand"}
                    variant="subtle"
                    borderRadius="lg"
                    fontSize="8px"
                    fontWeight="900"
                    px={2}
                  >
                    {paymentMethod.toUpperCase()}
                  </Badge>
                </Flex>
              )}
              <Flex justify="space-between" align="center">
                <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">
                  STATUS
                </Text>
                <Badge
                  colorPalette={isPaid ? "green" : "orange"}
                  variant="subtle"
                  borderRadius="lg"
                  fontSize="8px"
                  fontWeight="900"
                  px={2}
                >
                  {status.toUpperCase()}
                </Badge>
              </Flex>

              <Separator opacity={0.06} />

              <Flex justify="space-between" align="center">
                <Text fontSize="10px" fontWeight="900" color="app.text.primary" letterSpacing="wider">
                  {isPaid ? "AMOUNT COLLECTED" : "AMOUNT DUE"}
                </Text>
                <Text
                  fontSize="md"
                  fontWeight="950"
                  color={isPaid ? "green.500" : "orange.500"}
                >
                  {formatINR(total, currencySymbol)}
                </Text>
              </Flex>
            </VStack>
          </Box>

          {/* Payment Link Section (for unpaid/link flows) */}
          {!isPaid && paymentLinkUrl && (
            <VStack
              w="full"
              p={4}
              bg="purple.500/5"
              border="1px solid"
              borderColor="purple.500/20"
              borderRadius="xl"
              gap={3}
              align="stretch"
            >
              <HStack color="purple.500" gap={2}>
                <Info size={14} />
                <Text fontSize="xs" fontWeight="950">
                  Payment Link Sent
                </Text>
              </HStack>
              <Text
                fontSize="10px"
                color={muted}
                fontWeight="600"
                lineHeight="normal"
                textAlign="left"
              >
                Secure payment link dispatched to {memberEmail || "customer"}.
                Copy or open the link below:
              </Text>
              <HStack w="full" gap={2}>
                <Input
                  readOnly
                  value={paymentLinkUrl}
                  h="36px"
                  borderRadius="xl"
                  bg={useColorModeValue("white", "whiteAlpha.100")}
                  border="1px solid"
                  borderColor={borderColor}
                  fontWeight="600"
                  fontSize="xs"
                  color="app.text.primary"
                />
                <Button
                  size="sm"
                  variant="outline"
                  h="36px"
                  borderRadius="xl"
                  onClick={handleCopyLink}
                  minW="65px"
                  colorPalette={copied ? "green" : "gray"}
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  <Text fontSize="9px" fontWeight="800">
                    {copied ? "Done" : "Copy"}
                  </Text>
                </Button>
                <Button
                  size="sm"
                  colorPalette="purple"
                  h="36px"
                  borderRadius="xl"
                  onClick={handleOpenLink}
                  minW="65px"
                >
                  <ExternalLink size={10} />
                  <Text fontSize="9px" fontWeight="800">Open</Text>
                </Button>
              </HStack>
            </VStack>
          )}

          {/* Post-Checkout Actions */}
          <VStack gap={3} w="full" mt={4}>
            <Button
              colorPalette="brand"
              size="xl"
              h="56px"
              w="full"
              borderRadius="2xl"
              fontWeight="900"
              fontSize="xs"
              letterSpacing="widest"
              textTransform="uppercase"
              onClick={onBackToDirectory}
              bg={BRAND_GRADIENT}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: `0 10px 20px -5px ${BRAND_ALT}4D`,
              }}
              transition="all 0.25s"
            >
              <ArrowLeft size={14} />
              Back to Directory
            </Button>

            {onPrintReceipt && (
              <Button
                variant="outline"
                size="lg"
                h="46px"
                w="full"
                borderRadius="xl"
                fontWeight="800"
                fontSize="xs"
                borderColor={borderColor}
                onClick={onPrintReceipt}
                color="app.text.primary"
              >
                <Printer size={14} />
                Print Receipt
              </Button>
            )}
          </VStack>
        </VStack>
      </Box>
    );
  }
);

PaymentSuccessReceipt.displayName = "PaymentSuccessReceipt";
export default PaymentSuccessReceipt;
