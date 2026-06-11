/**
 * MembershipCheckout.tsx
 *
 * Streamlined single-page checkout experience for gym membership activation.
 * Route: /:org/workspace/app/gym/checkout/:memberId?planCode=GYM_PRO
 *
 * Implements cash, UPI QR, and Payment Link inline without page navigation.
 * Also supports applying mock coupon/discount codes ("SAVE10", "SAVE20", "FLAT500", "FLAT1000").
 */

import { memo, useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  Separator,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Alert } from "@/components/ui/alert";
import { useParams, useSearchParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Loader2,
  Tag,
  Check,
  QrCode,
  CreditCard,
  Banknote,
  Copy,
  ReceiptText,
  Send,
  Link2,
  User,
  Mail,
  Phone,
  Percent,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { GymApiService } from "./services/gymApi.service";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { useCheckoutPreview } from "./hooks/useCheckoutPreview";
import type { CheckoutPayload } from "./types/Gym.types";

const BRAND_HEX = "#422AFB";
const BRAND_ALT = "#7551FF";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

const HERO_GRADIENT: Record<string, string> = {
  brand: BRAND_GRADIENT,
  blue: "linear-gradient(135deg, #3965FF 0%, #002DFF 100%)",
  green: "linear-gradient(135deg, #01B574 0%, #00875A 100%)",
  orange: "linear-gradient(135deg, #FFB547 0%, #E67E00 100%)",
  red: "linear-gradient(135deg, #EE5D50 0%, #C52A1D 100%)",
  purple: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
  pink: "linear-gradient(135deg, #EC4899 0%, #D946EF 100%)",
  cyan: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
  emerald: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
};

const ACCENT_HEX: Record<string, string> = {
  brand: BRAND_HEX,
  blue: "#3965FF",
  green: "#01B574",
  orange: "#FFB547",
  red: "#EE5D50",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  emerald: "#10B981",
};

const getGradient = (accent?: string): string =>
  HERO_GRADIENT[accent?.toLowerCase() ?? "brand"] ?? HERO_GRADIENT.brand;

const getAccentHex = (accent?: string): string =>
  ACCENT_HEX[accent?.toLowerCase() ?? "brand"] ?? ACCENT_HEX.brand;

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const fmtDate = (d?: string) => {
  if (!d) return "N/A";
  const p = new Date(d);
  return isNaN(p.getTime())
    ? d
    : p.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const BILLING_CYCLE_FULL: Record<string, string> = {
  monthly: "1 Month",
  quarterly: "3 Months",
  yearly: "12 Months",
  "half-yearly": "6 Months",
};

// ─── Info Row ────────────────────────────────────────────────────────
interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

const InfoRow = memo(({ label, value, mono }: InfoRowProps) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  const borderCol = useColorModeValue("rgba(226, 232, 240, 0.5)", "rgba(255, 255, 255, 0.04)");
  return (
    <Flex
      justify="space-between"
      align="center"
      py={3}
      borderBottom="1px solid"
      borderColor={borderCol}
      _last={{ borderBottom: "none" }}
    >
      <Text fontSize="xs" fontWeight="600" color={muted} textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="700"
        color="app.text.primary"
        fontFamily={mono ? "mono" : "inherit"}
      >
        {value}
      </Text>
    </Flex>
  );
});
InfoRow.displayName = "InfoRow";

// ─── Success Screen ───────────────────────────────────────────────────
interface SuccessScreenProps {
  memberName: string;
  planName: string;
  amountPaid: number;
  subscriptionId: string;
  invoiceNumber: string;
  orderNumber: string;
  method: string;
  paymentLinkUrl?: string;
  onDone: () => void;
}

const SuccessScreen = memo(
  ({
    memberName,
    planName,
    amountPaid,
    subscriptionId,
    invoiceNumber,
    orderNumber,
    method,
    paymentLinkUrl,
    onDone,
  }: SuccessScreenProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");
    const cardBg = useColorModeValue("rgba(255,255,255,0.85)", "rgba(11, 20, 55, 0.65)");
    const isLink = method === "payment_link";
    const methodLabel = isLink ? "Payment Link" : method === "upi" ? "UPI" : "Cash";

    const gradient = isLink
      ? "linear-gradient(135deg, #FFB547 0%, #E67E00 100%)"
      : method === "upi"
        ? BRAND_GRADIENT
        : "linear-gradient(135deg, #01B574 0%, #00875A 100%)";

    const glow = isLink ? "#FFB547" : method === "upi" ? BRAND_HEX : "#01B574";
    const [copied, setCopied] = useState(false);

    const handleCopyLink = useCallback(async () => {
      if (!paymentLinkUrl) return;
      await navigator.clipboard.writeText(paymentLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toaster.create({ title: "Copied!", type: "info" });
    }, [paymentLinkUrl]);

    return (
      <VStack gap={6} maxW="480px" mx="auto" textAlign="center" py={4}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="400px"
          h="400px"
          bg={glow}
          filter="blur(120px)"
          opacity={0.1}
          pointerEvents="none"
        />

        <Circle size={24} bg={gradient} boxShadow={`0 20px 50px -15px ${glow}`} zIndex={1}>
          <CheckCircle size={40} color="white" strokeWidth={2.5} />
        </Circle>

        <VStack gap={2} zIndex={1}>
          <Text fontSize="2xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
            {isLink ? "Payment Link Created!" : "Membership Activated!"}
          </Text>
          <Text fontSize="sm" color={muted} maxW="sm" fontWeight="500">
            {isLink
              ? `The payment link for ${memberName} was successfully generated and sent.`
              : `The membership subscription for ${memberName} is now active.`}
          </Text>
        </VStack>

        <Box
          w="full"
          bg="app.card.bg"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
          borderRadius="2xl"
          overflow="hidden"
          zIndex={1}
        >
          <Box h="4px" bg={gradient} />
          <Box p={6}>
            <HStack gap={3} mb={4}>
              <Circle size={8} bg="brand.500/10" color="brand.500">
                <ReceiptText size={14} />
              </Circle>
              <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted}>
                Checkout Receipt Summary
              </Text>
            </HStack>
            <VStack align="stretch" gap={0}>
              {[
                { label: "Member", value: memberName },
                { label: "Plan", value: planName },
                { label: "Total Price", value: formatINR(amountPaid) },
                { label: "Payment Mode", value: methodLabel },
                { label: "Order ID", value: orderNumber },
                { label: "Invoice ID", value: invoiceNumber },
                { label: "Subscription ID", value: subscriptionId },
              ].map(({ label, value }) => (
                <Flex
                  key={label}
                  justify="space-between"
                  align="center"
                  py={2}
                  borderBottom="1px solid"
                  borderColor={useColorModeValue("gray.100", "whiteAlpha.60")}
                  _last={{ borderBottom: "none" }}
                >
                  <Text fontSize="xs" color={muted} fontWeight="600">{label}</Text>
                  <Text fontSize="xs" fontWeight="800" color="app.text.primary">{value}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Box>

        {isLink && paymentLinkUrl && (
          <Box bg="app.card.bg" w="full" backdropFilter="blur(20px)" border="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")} borderRadius="2xl" p={4} zIndex={1}>
            <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted} mb={2} textAlign="left">
              Shareable Payment Link URL
            </Text>
            <Flex gap={2} align="center">
              <Input
                value={paymentLinkUrl}
                readOnly
                h="36px"
                fontSize="xs"
                fontFamily="mono"
                borderRadius="xl"
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "whiteAlpha.100")}
                bg="transparent"
                color={muted}
              />
              <Button
                size="sm"
                h="36px"
                px={3}
                borderRadius="xl"
                colorPalette={copied ? "green" : "brand"}
                variant={copied ? "solid" : "outline"}
                onClick={handleCopyLink}
                fontWeight="700"
                flexShrink={0}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </Button>
            </Flex>
          </Box>
        )}

        <Button
          w="full"
          h="50px"
          borderRadius="xl"
          fontWeight="900"
          fontSize="sm"
          bg={gradient}
          color="white"
          onClick={onDone}
          _hover={{ transform: "translateY(-2px)", boxShadow: `0 12px 25px -8px ${glow}` }}
          transition="all 0.3s"
          zIndex={1}
        >
          {isLink ? "Done — Back to Members" : "Done — View Member Profile"}
        </Button>
      </VStack>
    );
  }
);
SuccessScreen.displayName = "SuccessScreen";

// ═══════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS FOR PERFORMANCE & NO INLINE JSX ARROWS
// ═══════════════════════════════════════════════════════════════════

interface PaymentMethodButtonProps {
  id: "cash" | "upi" | "payment_link";
  label: string;
  icon: React.ElementType;
  selected: boolean;
  accentHex: string;
  muted: string;
  onClick: (id: "cash" | "upi" | "payment_link") => void;
}

const PaymentMethodButton = memo(({ id, label, icon: IconComponent, selected, accentHex, muted, onClick }: PaymentMethodButtonProps) => {
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  return (
    <Button
      onClick={handleClick}
      h="36px"
      borderRadius="lg"
      variant={selected ? "solid" : "ghost"}
      bg={selected ? accentHex : "transparent"}
      color={selected ? "white" : muted}
      fontWeight="800"
      fontSize="xs"
      _hover={selected ? {} : { bg: hoverBg }}
      transition="all 0.2s"
    >
      <IconComponent size={14} style={{ marginRight: "4px" }} />
      {label}
    </Button>
  );
});
PaymentMethodButton.displayName = "PaymentMethodButton";

interface CashSuggestionButtonProps {
  amount: number;
  isSelected: boolean;
  accentHex: string;
  muted: string;
  borderCol: string;
  onClick: (amount: number) => void;
}

const CashSuggestionButton = memo(({ amount, isSelected, accentHex, muted, borderCol, onClick }: CashSuggestionButtonProps) => {
  const handleClick = useCallback(() => {
    onClick(amount);
  }, [amount, onClick]);

  return (
    <Button
      size="xs"
      variant="outline"
      borderRadius="md"
      onClick={handleClick}
      borderColor={isSelected ? accentHex : borderCol}
      color={isSelected ? accentHex : muted}
      fontWeight="700"
    >
      {formatINR(amount)}
    </Button>
  );
});
CashSuggestionButton.displayName = "CashSuggestionButton";

interface LinkViaButtonProps {
  id: "email" | "sms" | "both";
  label: string;
  selected: boolean;
  borderCol: string;
  muted: string;
  onClick: (id: "email" | "sms" | "both") => void;
}

const LinkViaButton = memo(({ id, label, selected, borderCol, muted, onClick }: LinkViaButtonProps) => {
  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  return (
    <Button
      size="sm"
      variant="outline"
      borderRadius="lg"
      h="34px"
      borderColor={selected ? "orange.500" : borderCol}
      color={selected ? "orange.500" : muted}
      bg={selected ? "orange.500/06" : "transparent"}
      onClick={handleClick}
      fontWeight="800"
      fontSize="xs"
    >
      {selected && <Check size={11} style={{ marginRight: "4px" }} />}
      {label}
    </Button>
  );
});
LinkViaButton.displayName = "LinkViaButton";

const Stepper = memo(() => {
  const activeColor = useColorModeValue("brand.600", "brand.400");
  const inactiveColor = useColorModeValue("gray.300", "gray.600");
  const activeBg = useColorModeValue("brand.50", "rgba(66, 42, 251, 0.1)");
  const borderCol = useColorModeValue("gray.200", "whiteAlpha.100");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <HStack gap={0} justify="center" align="center" w="full" maxW="500px" mx="auto" position="relative" px={4}>
      {/* Step 1: Select Plan */}
      <Stack direction={{ base: "column", sm: "row" }} gap={{ base: 1, sm: 2 }} align="center">
        <Circle size="30px" bg="green.500/10" color="green.500" border="1.5px solid" borderColor="green.500/30">
          <Check size={14} strokeWidth={3} />
        </Circle>
        <VStack align={{ base: "center", sm: "start" }} gap={0}>
          <Text fontSize={{ base: "9px", sm: "xs" }} fontWeight="900" color="app.text.primary" lineHeight="shorter">
            Select Plan
          </Text>
          <Text fontSize="10px" fontWeight="600" color="green.500" lineHeight="shorter" display={{ base: "none", sm: "block" }}>
            Completed
          </Text>
        </VStack>
      </Stack>

      {/* Line 1 */}
      <Box flex={1} h="2px" bg="green.500/30" mx={{ base: 2, sm: 4 }} minW={{ base: "15px", sm: "40px" }} />

      {/* Step 2: Checkout */}
      <Stack direction={{ base: "column", sm: "row" }} gap={{ base: 1, sm: 2 }} align="center">
        <Circle size="30px" bg={activeBg} color={activeColor} border="2px solid" borderColor={activeColor} boxShadow={`0 0 12px ${activeColor}40`}>
          <Text fontSize="xs" fontWeight="900">2</Text>
        </Circle>
        <VStack align={{ base: "center", sm: "start" }} gap={0}>
          <Text fontSize={{ base: "9px", sm: "xs" }} fontWeight="900" color="app.text.primary" lineHeight="shorter">
            Payment
          </Text>
          <Text fontSize="10px" fontWeight="700" color={activeColor} lineHeight="shorter" display={{ base: "none", sm: "block" }}>
            In Progress
          </Text>
        </VStack>
      </Stack>

      {/* Line 2 */}
      <Box flex={1} h="2px" bg={borderCol} mx={{ base: 2, sm: 4 }} minW={{ base: "15px", sm: "40px" }} />

      {/* Step 3: Active */}
      <Stack direction={{ base: "column", sm: "row" }} gap={{ base: 1, sm: 2 }} align="center">
        <Circle size="30px" bg="transparent" color={muted} border="1.5px solid" borderColor={inactiveColor}>
          <Text fontSize="xs" fontWeight="900">3</Text>
        </Circle>
        <VStack align={{ base: "center", sm: "start" }} gap={0}>
          <Text fontSize={{ base: "9px", sm: "xs" }} fontWeight="800" color={muted} lineHeight="shorter">
            Activation
          </Text>
          <Text fontSize="10px" fontWeight="600" color={muted} lineHeight="shorter" display={{ base: "none", sm: "block" }}>
            Pending
          </Text>
        </VStack>
      </Stack>
    </HStack>
  );
});
Stepper.displayName = "Stepper";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const MembershipCheckout = memo(() => {
  const { params: memberId } = useParams();
  const [searchParams] = useSearchParams();
  const planCode = searchParams.get("planCode") || "";
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const [couponInput, setCouponInput] = useState("");
  const [activeCoupon, setActiveCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "payment_link">("cash");

  // Cash panel state
  const [cashReceived, setCashReceived] = useState("");

  // UPI panel state
  const [transactionRef, setTransactionRef] = useState("");

  // Payment link panel state
  const [sendLinkVia, setSendLinkVia] = useState<"email" | "sms" | "both">("email");

  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  const { previewData, loading, error, refresh } = useCheckoutPreview(
    memberId,
    planCode,
    undefined,
    activeCoupon || undefined
  );

  const pageBg = useColorModeValue("gray.50", "rgb(9, 11, 23)");
  const muted = useColorModeValue("gray.500", "gray.400");
  // const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(18, 22, 40, 0.72)");
  const cardBg = "app.card.bg"
  const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)");

  const planAccent = previewData?.plan?.accent_color || "brand";
  const accentHex = getAccentHex(planAccent);
  const gradient = getGradient(planAccent);

  const handleApplyCoupon = useCallback(() => {
    setActiveCoupon(couponInput.trim());
  }, [couponInput]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponInput("");
    setActiveCoupon("");
  }, []);

  const changeDue = useMemo(() => {
    if (!cashReceived || !previewData) return 0;
    const received = parseFloat(cashReceived);
    if (isNaN(received)) return 0;
    return received - previewData.pricing.total;
  }, [cashReceived, previewData]);

  // Cash recommendations
  const cashSuggestions = useMemo(() => {
    if (!previewData) return [];
    const total = previewData.pricing.total;
    const suggestions = [total];

    // next 100
    const next100 = Math.ceil(total / 100) * 100;
    if (next100 > total && !suggestions.includes(next100)) suggestions.push(next100);

    // next 500
    const next500 = Math.ceil(total / 500) * 500;
    if (next500 > total && !suggestions.includes(next500)) suggestions.push(next500);

    // next 1000
    const next1000 = Math.ceil(total / 1000) * 1000;
    if (next1000 > total && !suggestions.includes(next1000)) suggestions.push(next1000);

    return suggestions;
  }, [previewData]);

  const handleSuggestCash = useCallback((amount: number) => {
    setCashReceived(amount.toString());
  }, []);

  const handleCouponInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponInput(e.target.value);
  }, []);

  const handleCashReceivedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCashReceived(e.target.value);
  }, []);

  const handleTransactionRefChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionRef(e.target.value);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(e.target.value);
  }, []);

  const handlePaymentMethodChange = useCallback((method: "cash" | "upi" | "payment_link") => {
    setPaymentMethod(method);
  }, []);

  const handleSendLinkViaChange = useCallback((method: "email" | "sms" | "both") => {
    setSendLinkVia(method);
  }, []);

  const handleCheckout = useCallback(() => {
    if (!memberId || !planCode) return;

    if (paymentMethod === "upi" && !transactionRef.trim()) {
      toaster.create({
        title: "Reference ID Required",
        description: "Please enter the UPI Transaction Reference ID.",
        type: "warning",
      });
      return;
    }

    if (paymentMethod === "cash" && cashReceived.trim()) {
      const amt = parseFloat(cashReceived);
      if (!isNaN(amt) && amt < (previewData?.pricing.total || 0)) {
        toaster.create({
          title: "Insufficient Cash",
          description: "Received cash amount cannot be less than the total checkout price.",
          type: "warning",
        });
        return;
      }
    }

    setIsProcessing(true);

    const payload: CheckoutPayload = {
      member_id: previewData?.member?.member_id || memberId || "",
      plan_code: planCode,
      payment_method: paymentMethod,
      transaction_ref: paymentMethod === "upi" ? transactionRef.trim() : undefined,
      notes: notes || `Checkout via Gym SaaS: ${paymentMethod.toUpperCase()}`,
      send_link_via: paymentMethod === "payment_link" ? sendLinkVia : undefined,
      coupon_code: activeCoupon || undefined,
    };

    const sub = GymApiService.checkout(payload).subscribe({
      next: (res) => {
        setIsProcessing(false);
        if (res.success) {
          setSuccessData({
            memberName: previewData?.member.name || res.data.member_id,
            planName: res.data.plan_name || previewData?.plan.name || "Membership",
            amountPaid: res.data.total,
            subscriptionId: res.data.subscription_id,
            invoiceNumber: res.data.invoice_number,
            orderNumber: res.data.order_number,
            memberId: res.data.member_id,
            method: paymentMethod,
            paymentLinkUrl: res.data.payment_link_url,
          });
        } else {
          toaster.create({
            title: "Checkout Failed",
            description: res.message,
            type: "error",
          });
        }
      },
      error: (err) => {
        setIsProcessing(false);
        toaster.create({
          title: "Checkout Error",
          description: err?.response?.data?.message || "Failed to process checkout transaction.",
          type: "error",
        });
      },
    });

    return () => sub.unsubscribe();
  }, [memberId, planCode, paymentMethod, transactionRef, notes, sendLinkVia, activeCoupon, cashReceived, previewData]);

  const handleDone = useCallback(() => {
    if (successData?.method === "payment_link") {
      navigate(`/${organizationName}/workspace/app/${appCode}/membersList`);
    } else {
      navigate(`/${organizationName}/workspace/app/${appCode}/member/${memberId}`);
    }
  }, [successData, navigate, organizationName, appCode, memberId]);

  const handleCancelCheckout = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (successData) {
    return (
      <Box w="full" minH="100vh" py={12} px={{ base: 4, md: 8 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="-10%"
          left="10%"
          w="400px"
          h="400px"

          filter="blur(150px)"
          opacity={0.08}
          pointerEvents="none"
        />
        <SuccessScreen {...successData} onDone={handleDone} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box w="full" minH="100vh" bg={pageBg} py={12} px={{ base: 4, md: 8 }} position="relative" overflow="hidden">
        <VStack gap={4} align="stretch" maxW="960px" mx="auto" mt={8}>
          <Skeleton height="80px" borderRadius="xl" />
          <Grid templateColumns={{ base: "1fr", lg: "1.2fr 1.8fr" }} gap={6}>
            <Skeleton height="350px" borderRadius="xl" />
            <Skeleton height="450px" borderRadius="xl" />
          </Grid>
        </VStack>
      </Box>
    );
  }

  if (error || !previewData) {
    return (
      <Box w="full" minH="100vh" bg={pageBg} py={12} px={{ base: 4, md: 8 }} position="relative" overflow="hidden">
        <VStack gap={6} align="center" py={12} maxW="480px" mx="auto" mt={8}>
          <Alert status="error" title="Checkout Preview Error" borderRadius="xl">
            {error || "An unexpected error occurred while staging the checkout details."}
          </Alert>
          <Button onClick={handleCancelCheckout} variant="outline" borderRadius="xl">
            Go Back
          </Button>
        </VStack>
      </Box>
    );
  }

  // Generate real dynamic UPI QR Code url via API qrserver
  const upiQrString = `upi://pay?pa=gym@upi&pn=GymSaaS&am=${previewData.pricing.total}&cu=INR&tn=Membership-${previewData.plan.code}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiQrString)}`;

  return (
    <Box w="full" minH="100vh" position="relative" overflow="hidden">
      {/* Background Glow Elements */}
      <Box
        position="absolute"
        top="-10%"
        left="10%"
        w="400px"
        h="400px"
        // bg={accentHex}
        filter="blur(150px)"
        opacity={0.08}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="10%"
        right="10%"
        w="400px"
        h="400px"
        bg="brand.500"
        filter="blur(150px)"
        opacity={0.05}
        pointerEvents="none"
      />

      {/* Sticky Header Section */}
      <Box
        // position="sticky"
        // top={{ base: "44px", md: "52px" }}
        // top={"200px"}
        zIndex={9999999}
        w="full"
        py={4}
        mb={4}
      >
        <VStack gap={2} textAlign="center" mb={4}>
          <Heading size="xl" fontWeight="950">
            Membership Checkout
          </Heading>
          <Text color={muted} fontSize="sm" fontWeight="700">
            Review subscription details and complete payment
          </Text>
        </VStack>
        <Stepper />
      </Box>

      {/* Main Content Area */}
      <Box py={8} px={{ base: 4, md: 8 }} maxW="1000px" mx="auto">
        <Grid templateColumns={{ base: "1fr", lg: "1.2fr 1.8fr" }} gap={6} alignItems="start">

          {/* Left Column - Member Detail & Order details & Coupon */}
          <VStack gap={6} align="stretch">

            {/* Member Details Card */}
            <Box bg="app.card.bg" backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={5} boxShadow="sm">
              <HStack gap={4} mb={4}>
                <Circle
                  size="48px"
                  bg={`linear-gradient(135deg, ${accentHex}20, ${accentHex}35)`}
                  color={accentHex}
                  fontWeight="950"
                  fontSize="lg"
                  border="2px solid"
                  borderColor={`${accentHex}40`}
                  boxShadow={`0 4px 14px ${accentHex}25`}
                >
                  {previewData.member.name.charAt(0).toUpperCase()}
                </Circle>
                <VStack align="start" gap={0.5}>
                  <Text fontSize="base" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                    {previewData.member.name}
                  </Text>
                  <HStack gap={2}>
                    <Badge fontSize="9px" fontWeight="900" px={2} py={0.5} borderRadius="md" bg={`${accentHex}12`} color={accentHex} border={`1px solid ${accentHex}20`}>
                      MEMBER ID: {previewData.member.member_id}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>

              <Separator opacity={0.08} my={3} />

              <VStack align="stretch" gap={3}>
                <HStack gap={3}>
                  <Circle size={7} bg="brand.500/10" color="brand.500">
                    <Mail size={13} />
                  </Circle>
                  <VStack align="start" gap={0}>
                    <Text fontSize="10px" fontWeight="700" color={muted} textTransform="uppercase">
                      Email Address
                    </Text>
                    <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                      {previewData.member.email || "No email registered"}
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={3}>
                  <Circle size={7} bg="brand.500/10" color="brand.500">
                    <Phone size={13} />
                  </Circle>
                  <VStack align="start" gap={0}>
                    <Text fontSize="10px" fontWeight="700" color={muted} textTransform="uppercase">
                      Phone Number
                    </Text>
                    <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                      {previewData.member.phone || "No phone registered"}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            {/* Advanced Subscription Summary Card */}
            <Box bg="app.card.bg" backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" overflow="hidden" boxShadow="sm">
              <Flex px={5} py={4} align="center" gap={3} borderBottom="1px solid" borderColor={borderCol} bg={useColorModeValue("rgba(255,255,255,0.4)", "rgba(255,255,255,0.02)")}>
                <Circle size={7} bg={`${accentHex}18`} color={accentHex}>
                  <ReceiptText size={13} />
                </Circle>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                  Subscription Summary
                </Text>
              </Flex>

              <Box p={5}>
                {/* Stylized Plan Details Box */}
                <Box bg={`linear-gradient(135deg, ${accentHex}10, ${accentHex}03)`} border="1px solid" borderColor={`${accentHex}20`} borderRadius="xl" p={4} mb={4}>
                  <Flex justify="space-between" align="start" mb={2}>
                    <VStack align="start" gap={0}>
                      <Text fontSize="xs" fontWeight="900" color={accentHex} textTransform="uppercase" letterSpacing="wider">
                        {previewData.plan.billing_cycle.toUpperCase()} PLAN
                      </Text>
                      <Text fontSize="lg" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                        {previewData.plan.name}
                      </Text>
                    </VStack>
                    <Badge colorPalette="brand" size="md" borderRadius="md" fontWeight="900" bg={accentHex} color="white">
                      {BILLING_CYCLE_FULL[previewData.plan.billing_cycle] || previewData.plan.billing_cycle}
                    </Badge>
                  </Flex>
                  <Text fontSize="xs" color={muted} fontWeight="600" mb={3}>
                    {previewData.plan.description || "Full gym membership access with premium benefits."}
                  </Text>

                  {/* Plan Features Checklist */}
                  <VStack align="stretch" gap={2} mt={3} borderTop="1px solid" borderColor={`${accentHex}15`} pt={3}>
                    {[
                      "Unlimited gym floor access",
                      "Access to all locker rooms & showers",
                      "Complimentary fitness assessment",
                      "1-on-1 personal trainer guidance",
                    ].map((feature, idx) => (
                      <HStack key={idx} gap={2} align="center">
                        <Circle size="14px" bg="green.500/15" color="green.500">
                          <Check size={9} strokeWidth={4} />
                        </Circle>
                        <Text fontSize="xs" fontWeight="700" color="app.text.primary">
                          {feature}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                {/* Period details with Calendar icons */}
                <Grid templateColumns="1fr 1fr" gap={3} mb={5}>
                  <HStack p={3} bg={useColorModeValue("gray.50", "whiteAlpha.50")} border="1px solid" borderColor={borderCol} borderRadius="xl" gap={2.5}>
                    <Circle size={7} bg="brand.500/10" color="brand.500">
                      <CalendarDays size={13} />
                    </Circle>
                    <VStack align="start" gap={0}>
                      <Text fontSize="9px" fontWeight="700" color={muted} textTransform="uppercase">
                        Start Date
                      </Text>
                      <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                        {fmtDate(previewData.dates.start_date)}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack p={3} bg={useColorModeValue("gray.50", "whiteAlpha.50")} border="1px solid" borderColor={borderCol} borderRadius="xl" gap={2.5}>
                    <Circle size={7} bg="brand.500/10" color="brand.500">
                      <CalendarDays size={13} />
                    </Circle>
                    <VStack align="start" gap={0}>
                      <Text fontSize="9px" fontWeight="700" color={muted} textTransform="uppercase">
                        End Date
                      </Text>
                      <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                        {fmtDate(previewData.dates.end_date)}
                      </Text>
                    </VStack>
                  </HStack>
                </Grid>

                {/* Itemized Price Invoice */}
                <VStack align="stretch" gap={0} bg={useColorModeValue("gray.50/50", "whiteAlpha.30")} p={4} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                  <InfoRow label="Base Price" value={formatINR(previewData.plan.price)} />
                  {previewData.pricing.discount_amount > 0 && (
                    <Flex justify="space-between" align="center" py={3} borderBottom="1px solid" borderColor={borderCol}>
                      <HStack gap={1}>
                        <Text fontSize="xs" fontWeight="600" color="green.500" textTransform="uppercase">
                          Discount Applied
                        </Text>
                        {previewData.pricing.coupon_code && (
                          <Badge colorPalette="green" size="sm" borderRadius="md" fontWeight="900">
                            {previewData.pricing.coupon_code}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color="green.500">
                        -{formatINR(previewData.pricing.discount_amount)}
                      </Text>
                    </Flex>
                  )}
                  <InfoRow label="GST (18%)" value={formatINR(previewData.pricing.tax_amount)} />

                  <Separator opacity={0.08} my={3} />

                  <Flex justify="space-between" align="center" pt={1}>
                    <Text fontSize="xs" fontWeight="950" color="app.text.primary" textTransform="uppercase">
                      Total Amount Due
                    </Text>
                    <Text fontSize="xl" fontWeight="950" color={accentHex}>
                      {formatINR(previewData.pricing.total)}
                    </Text>
                  </Flex>
                </VStack>
              </Box>
            </Box>

            {/* Discount / Coupon Card */}
            <Box bg="app.card.bg" backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={5} boxShadow="sm">
              <HStack gap={3} mb={3}>
                <Circle size={7} bg="green.500/10" color="green.500">
                  <Percent size={13} />
                </Circle>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                  Discount Coupon
                </Text>
              </HStack>

              {previewData.pricing.coupon_code ? (
                <Flex align="center" justify="space-between" bg="green.500/08" border="1px dashed" borderColor="green.500/30" p={3} borderRadius="xl">
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" fontWeight="800" color="green.500">
                      Code "{previewData.pricing.coupon_code}" Active
                    </Text>
                    <Text fontSize="10px" color={muted} fontWeight="600">
                      {previewData.pricing.discount_type === "percentage"
                        ? `${previewData.pricing.discount_value}% discount applied`
                        : `${formatINR(previewData.pricing.discount_value)} flat discount`}
                    </Text>
                  </VStack>
                  <Button size="xs" variant="ghost" colorPalette="red" onClick={handleRemoveCoupon} fontWeight="700">
                    Remove
                  </Button>
                </Flex>
              ) : (
                <Flex gap={2}>
                  <Input
                    placeholder="Enter Coupon (e.g. SAVE10)"
                    value={couponInput}
                    onChange={handleCouponInputChange}
                    h="36px"
                    fontSize="xs"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderCol}
                    textTransform="uppercase"
                  />
                  <Button
                    size="sm"
                    h="36px"
                    px={4}
                    borderRadius="xl"
                    bg={gradient}
                    color="white"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                    fontWeight="800"
                  >
                    Apply
                  </Button>
                </Flex>
              )}
            </Box>

          </VStack>

          {/* Right Column - Inline Payment Forms */}
          <Box bg="app.card.bg" backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" overflow="hidden" boxShadow="sm">
            <Flex px={5} py={4} align="center" justify="space-between" borderBottom="1px solid" borderColor={borderCol} bg={useColorModeValue("rgba(255,255,255,0.4)", "rgba(255,255,255,0.02)")}>
              <HStack gap={3}>
                <Circle size={7} bg="brand.500/10" color="brand.500">
                  <CreditCard size={13} />
                </Circle>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                  Select Payment Method & Pay
                </Text>
              </HStack>
              <Badge colorPalette="brand" variant="subtle" borderRadius="md" fontSize="9px" fontWeight="900">
                INLINE PORTAL
              </Badge>
            </Flex>

            {/* Toggle buttons for payment method */}
            <Box p={5} pb={0}>
              <Grid templateColumns="repeat(3, 1fr)" gap={2} bg={useColorModeValue("gray.50", "whiteAlpha.50")} p={1} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                {[
                  { id: "cash", label: "Cash", icon: Banknote },
                  { id: "upi", label: "UPI QR", icon: QrCode },
                  { id: "payment_link", label: "Link", icon: Link2 },
                ].map((item) => (
                  <PaymentMethodButton
                    key={item.id}
                    id={item.id as any}
                    label={item.label}
                    icon={item.icon}
                    selected={paymentMethod === item.id}
                    accentHex={accentHex}
                    muted={muted}
                    onClick={handlePaymentMethodChange}
                  />
                ))}
              </Grid>
            </Box>

            {/* Panel Area */}
            <Box p={5}>

              {/* Cash payment panel */}
              {paymentMethod === "cash" && (
                <VStack gap={4} align="stretch">
                  <Box bg={useColorModeValue("rgba(0,0,0,0.02)", "rgba(255,255,255,0.02)")} p={4} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                    <Text fontSize="xs" fontWeight="700" color={muted} mb={1}>
                      Total Price
                    </Text>
                    <Text fontSize="2xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                      {formatINR(previewData.pricing.total)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="800" color={muted} mb={2} textTransform="uppercase" letterSpacing="wider">
                      Received Amount (Cash)
                    </Text>
                    <Input
                      placeholder="e.g. 6000"
                      type="number"
                      value={cashReceived}
                      onChange={handleCashReceivedChange}
                      h="46px"
                      fontSize="sm"
                      fontWeight="900"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={cashReceived ? accentHex : borderCol}
                      _focus={{ borderColor: accentHex, boxShadow: `0 0 0 1px ${accentHex}` }}
                    />
                  </Box>

                  {/* Suggestion tags */}
                  <HStack gap={2} flexWrap="wrap">
                    {cashSuggestions.map((amount) => (
                      <CashSuggestionButton
                        key={amount}
                        amount={amount}
                        isSelected={parseFloat(cashReceived) === amount}
                        accentHex={accentHex}
                        muted={muted}
                        borderCol={borderCol}
                        onClick={handleSuggestCash}
                      />
                    ))}
                  </HStack>

                  {/* Change due display */}
                  {cashReceived && !isNaN(parseFloat(cashReceived)) && (
                    <Flex justify="space-between" align="center" bg={changeDue >= 0 ? "green.500/08" : "red.500/08"} border="1px solid" borderColor={changeDue >= 0 ? "green.500/20" : "red.500/20"} p={3.5} borderRadius="xl">
                      <Text fontSize="xs" fontWeight="700" color={changeDue >= 0 ? "green.500" : "red.500"}>
                        {changeDue >= 0 ? "Change Due to Member" : "Insufficient Cash"}
                      </Text>
                      <Text fontSize="md" fontWeight="900" color={changeDue >= 0 ? "green.500" : "red.500"}>
                        {formatINR(Math.abs(changeDue))}
                      </Text>
                    </Flex>
                  )}
                </VStack>
              )}

              {/* UPI QR Code Panel */}
              {paymentMethod === "upi" && (
                <VStack gap={4} align="stretch">
                  {/* <Grid templateColumns={{ base: "1fr", sm: "160px 1fr" }} gap={5} alignItems="center"> */}
                  <VStack>
                    {/* QR Code Container */}
                    <Box
                      p={2}
                      bg="white"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.200"
                      boxShadow="xs"
                      w="176px"
                      h="176px"
                      mx="auto"
                    >
                      <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: "160px", height: "160px" }} />
                    </Box>

                    {/* Scan guidelines */}
                    <VStack align="center" gap={2} >
                      <Badge colorPalette="purple" variant="solid" px={2} borderRadius="md" fontSize="9px">
                        SCAN TO PAY
                      </Badge>
                      <Text fontSize="xs" fontWeight="700" color="app.text.primary">
                        Dynamic UPI Payment QR
                      </Text>
                      <Text fontSize="10px" color={muted} lineHeight="relaxed" fontWeight="500">
                        Ask the member to scan this QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to pay <strong>{formatINR(previewData.pricing.total)}</strong>.
                      </Text>
                    </VStack>
                  </VStack>
                  {/* </Grid> */}

                  <Box mt={2}>
                    <Text fontSize="xs" fontWeight="800" color={muted} mb={2} textTransform="uppercase" letterSpacing="wider">
                      UPI Transaction Reference ID *
                    </Text>
                    <Input
                      placeholder="e.g. UPI2026060812345"
                      value={transactionRef}
                      onChange={handleTransactionRefChange}
                      h="46px"
                      fontSize="sm"
                      fontWeight="800"
                      fontFamily={transactionRef ? "mono" : "inherit"}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={transactionRef ? "purple.500" : borderCol}
                      _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                      textTransform="uppercase"
                    />
                  </Box>
                </VStack>
              )}

              {/* Payment Link Panel */}
              {paymentMethod === "payment_link" && (
                <VStack gap={4} align="stretch">
                  <Box p={4} borderRadius="xl" bg={useColorModeValue("orange.50", "rgba(255, 181, 71, 0.06)")} border="1px solid" borderColor="orange.500/20">
                    <HStack gap={2} mb={1}>
                      <Send size={13} color="orange" />
                      <Text fontSize="xs" fontWeight="900" color="orange.500">Remote Deferred Payment</Text>
                    </HStack>
                    <Text fontSize="10px" color={muted} lineHeight="relaxed" fontWeight="500">
                      Generate and send a secure billing checkout link to the member's device. The subscription will activate automatically when they complete payment.
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="800" color={muted} mb={3} textTransform="uppercase" letterSpacing="wider">
                      Send Payment Link Via
                    </Text>
                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                      {[
                        { id: "email", label: "Email" },
                        { id: "sms", label: "SMS" },
                        { id: "both", label: "Email + SMS" },
                      ].map((item) => (
                        <LinkViaButton
                          key={item.id}
                          id={item.id as any}
                          label={item.label}
                          selected={sendLinkVia === item.id}
                          borderCol={borderCol}
                          muted={muted}
                          onClick={handleSendLinkViaChange}
                        />
                      ))}
                    </Grid>
                  </Box>

                  {/* Display contact info being sent to */}
                  <VStack align="stretch" gap={1.5} mt={1} p={3} bg={useColorModeValue("gray.50", "whiteAlpha.50")} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="10px" fontWeight="700" color={muted}>MEMBER EMAIL</Text>
                      <Text fontSize="11px" fontWeight="800" color="app.text.primary">{previewData.member.email || "N/A"}</Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="10px" fontWeight="700" color={muted}>MEMBER PHONE</Text>
                      <Text fontSize="11px" fontWeight="800" color="app.text.primary">{previewData.member.phone || "N/A"}</Text>
                    </Flex>
                  </VStack>
                </VStack>
              )}

              {/* Common optional notes */}
              <Box mt={4}>
                <Text fontSize="xs" fontWeight="800" color={muted} mb={2} textTransform="uppercase" letterSpacing="wider">
                  Auditing Notes (optional)
                </Text>
                <Input
                  placeholder="e.g. Walk-in receptionist signup"
                  value={notes}
                  onChange={handleNotesChange}
                  h="38px"
                  fontSize="xs"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderCol}
                />
              </Box>

              <Separator opacity={0.08} my={5} />

              {/* CTA Action button */}
              <VStack gap={2} align="stretch">
                <Button
                  w="full"
                  h="50px"
                  borderRadius="xl"
                  fontWeight="950"
                  fontSize="sm"
                  bg={paymentMethod === "payment_link" ? "linear-gradient(135deg, #FFB547 0%, #E67E00 100%)" : gradient}
                  color="white"
                  loading={isProcessing}
                  loadingText="Processing Checkout..."
                  onClick={handleCheckout}
                  // _hover={{ transform: "translateY(-1px)", boxShadow: `0 10px 20px -8px ${paymentMethod === "payment_link" ? "#FFB547" : accentHex}` }}
                  transition="all 0.2s"
                >
                  <HStack gap={2}>
                    {paymentMethod === "payment_link" ? <Send size={15} /> : <CheckCircle size={15} />}
                    <Text>
                      {paymentMethod === "payment_link" ? "Generate & Send Payment Link" : `Complete ${paymentMethod === "upi" ? "UPI" : "Cash"} Checkout`}
                    </Text>
                  </HStack>
                </Button>

                <Button
                  w="full"
                  h="38px"
                  variant="ghost"
                  borderRadius="xl"
                  fontSize="xs"
                  fontWeight="700"
                  color={muted}
                  onClick={handleCancelCheckout}
                  _hover={{ color: "app.text.primary" }}
                >
                  Cancel & Go Back
                </Button>
              </VStack>

            </Box>
          </Box>

        </Grid>
      </Box>
    </Box>
  );
});
MembershipCheckout.displayName = "MembershipCheckout";

export default MembershipCheckout;

