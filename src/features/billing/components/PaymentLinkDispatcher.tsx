/**
 * PaymentLinkDispatcher.tsx
 *
 * Reusable component for sending/displaying payment links.
 * Used when the customer is not present or wants to pay later.
 * Shows the generated Razorpay/custom payment link with copy/open actions.
 *
 * Usage:
 *   <PaymentLinkDispatcher
 *     paymentLinkUrl="https://pay.saas-platform.com/checkout/INV-001"
 *     invoiceNumber="INV/2026-27/0001"
 *     total={5900}
 *     memberEmail="john@example.com"
 *     isLoading={isSending}
 *     onSendLink={handleSendLink}
 *   />
 */
import React, { memo, useCallback, useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  Link2,
  Copy,
  ExternalLink,
  Mail,
  Smartphone,
  Check,
  Send,
  Info,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

type SendVia = "email" | "sms" | "both";

interface PaymentLinkDispatcherProps {
  /** The generated payment link URL (null if not yet generated) */
  paymentLinkUrl: string | null;
  /** Invoice number for display */
  invoiceNumber?: string;
  /** Total amount for display */
  total?: number;
  /** Member email for display */
  memberEmail?: string;
  /** Whether the send request is in progress */
  isLoading?: boolean;
  /** Callback to trigger payment link generation */
  onSendLink: (sendVia: SendVia) => void;
  /** Currency symbol */
  currencySymbol?: string;
}

// ── Component ────────────────────────────────────────────────────────

const PaymentLinkDispatcher = memo<PaymentLinkDispatcherProps>(
  ({
    paymentLinkUrl,
    invoiceNumber,
    total,
    memberEmail,
    isLoading = false,
    onSendLink,
    currencySymbol = "₹",
  }) => {
    const [copied, setCopied] = useState(false);
    const [sendVia, setSendVia] = useState<SendVia>("email");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

    // Stable handlers
    const handleCopy = useCallback(async () => {
      if (!paymentLinkUrl) return;
      try {
        await navigator.clipboard.writeText(paymentLinkUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
        const input = document.createElement("input");
        input.value = paymentLinkUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }, [paymentLinkUrl]);

    const handleOpen = useCallback(() => {
      if (!paymentLinkUrl) return;
      window.open(paymentLinkUrl, "_blank");
    }, [paymentLinkUrl]);

    const handleSelectEmail = useMemo(
      () => () => setSendVia("email"),
      []
    );
    const handleSelectSms = useMemo(
      () => () => setSendVia("sms"),
      []
    );
    const handleSelectBoth = useMemo(
      () => () => setSendVia("both"),
      []
    );

    const handleSend = useCallback(
      () => onSendLink(sendVia),
      [onSendLink, sendVia]
    );

    // Pre-send state: show send options
    if (!paymentLinkUrl) {
      return (
        <VStack
          align="stretch"
          gap={4}
          p={5}
          borderRadius="2xl"
          border="1px solid"
          borderColor="purple.500/20"
          bg="purple.500/5"
        >
          <HStack gap={2}>
            <Box p={1.5} borderRadius="lg" bg="purple.500/10" color="purple.500">
              <Link2 size={14} />
            </Box>
            <Text
              fontSize="xs"
              fontWeight="950"
              color="purple.500"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Send Payment Link
            </Text>
          </HStack>

          <Text fontSize="11px" color="fg.muted" fontWeight="600" lineHeight="tall">
            Generate a secure Razorpay payment link and send it to the customer
            via email or SMS. They can pay remotely at their convenience.
          </Text>

          {/* Send via selector */}
          <VStack align="stretch" gap={2}>
            <Text
              fontSize="9px"
              fontWeight="900"
              color="fg.muted"
              letterSpacing="widest"
            >
              SEND VIA
            </Text>
            <HStack gap={2}>
              <Button
                size="xs"
                h="32px"
                borderRadius="lg"
                variant={sendVia === "email" ? "solid" : "outline"}
                colorPalette="purple"
                onClick={handleSelectEmail}
                gap={1}
              >
                <Mail size={12} />
                <Text fontSize="10px" fontWeight="800">Email</Text>
              </Button>
              <Button
                size="xs"
                h="32px"
                borderRadius="lg"
                variant={sendVia === "sms" ? "solid" : "outline"}
                colorPalette="purple"
                onClick={handleSelectSms}
                gap={1}
              >
                <Smartphone size={12} />
                <Text fontSize="10px" fontWeight="800">SMS</Text>
              </Button>
              <Button
                size="xs"
                h="32px"
                borderRadius="lg"
                variant={sendVia === "both" ? "solid" : "outline"}
                colorPalette="purple"
                onClick={handleSelectBoth}
                gap={1}
              >
                <Send size={12} />
                <Text fontSize="10px" fontWeight="800">Both</Text>
              </Button>
            </HStack>
          </VStack>

          {memberEmail && (
            <HStack gap={2} p={2} borderRadius="lg" bg="purple.500/5">
              <Info size={12} color="var(--chakra-colors-purple-500)" />
              <Text fontSize="10px" color="fg.muted" fontWeight="600">
                Link will be sent to: <Text as="span" fontWeight="900" color="app.text.primary">{memberEmail}</Text>
              </Text>
            </HStack>
          )}

          <Button
            colorPalette="purple"
            size="md"
            h="46px"
            w="full"
            borderRadius="xl"
            fontWeight="900"
            fontSize="xs"
            letterSpacing="widest"
            textTransform="uppercase"
            onClick={handleSend}
            loading={isLoading}
            loadingText="Generating Link..."
          >
            <Link2 size={14} />
            Generate & Send Payment Link
          </Button>
        </VStack>
      );
    }

    // Post-send state: show the generated link
    return (
      <VStack
        align="stretch"
        gap={4}
        p={5}
        borderRadius="2xl"
        border="1px solid"
        borderColor="green.500/20"
        bg="green.500/5"
      >
        <HStack gap={2}>
          <Box p={1.5} borderRadius="lg" bg="green.500" color="white">
            <Check size={14} />
          </Box>
          <Text
            fontSize="xs"
            fontWeight="950"
            color="green.500"
            letterSpacing="wider"
            textTransform="uppercase"
          >
            Payment Link Generated
          </Text>
        </HStack>

        <Text fontSize="11px" color="fg.muted" fontWeight="600" lineHeight="tall">
          A secure payment link has been dispatched
          {memberEmail ? ` to ${memberEmail}` : " to the customer"}.
          The operator can also copy or open the link directly:
        </Text>

        {/* Link display + actions */}
        <VStack align="stretch" gap={2}>
          <Text
            fontSize="9px"
            fontWeight="900"
            color="fg.muted"
            letterSpacing="widest"
          >
            PAYMENT URL
          </Text>
          <HStack w="full" gap={2}>
            <Input
              readOnly
              value={paymentLinkUrl}
              h="38px"
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
              h="38px"
              borderRadius="xl"
              onClick={handleCopy}
              minW="70px"
              colorPalette={copied ? "green" : "gray"}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <Text fontSize="10px" fontWeight="800">
                {copied ? "Copied!" : "Copy"}
              </Text>
            </Button>
            <Button
              size="sm"
              colorPalette="purple"
              h="38px"
              borderRadius="xl"
              onClick={handleOpen}
              minW="70px"
            >
              <ExternalLink size={12} />
              <Text fontSize="10px" fontWeight="800">Open</Text>
            </Button>
          </HStack>
        </VStack>

        {/* Invoice info */}
        {invoiceNumber && total && (
          <Flex
            justify="space-between"
            align="center"
            p={3}
            borderRadius="lg"
            bg="green.500/5"
            border="1px solid"
            borderColor="green.500/10"
          >
            <Text fontSize="10px" color="fg.muted" fontWeight="800">
              {invoiceNumber}
            </Text>
            <Badge colorPalette="green" variant="subtle" borderRadius="md" fontSize="9px" fontWeight="900">
              {currencySymbol}{total.toLocaleString("en-IN")} PENDING
            </Badge>
          </Flex>
        )}
      </VStack>
    );
  }
);

PaymentLinkDispatcher.displayName = "PaymentLinkDispatcher";
export default PaymentLinkDispatcher;
