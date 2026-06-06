/**
 * OnlinePayment.tsx
 *
 * Step 6B in the gym membership sales flow.
 * Route: /:org/workspace/app/gym/onlinePayment/:invoiceNumber?method=upi|card
 *
 * Purpose:
 *   - Capture UPI transaction reference OR card details
 *   - Confirm → POST /gym/invoices/:invoiceNumber/pay (payment_method: "upi" | "card")
 *   - On success → subscription is CREATED and member is ACTIVATED
 *   - Show success receipt
 */

import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  Grid,
  HStack,
  Icon,
  Input,
  Separator,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams, useSearchParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Loader2,
  QrCode,
  ReceiptText,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { useInvoiceDetails } from "./hooks/useInvoiceDetails";
import { GymApiService } from "./services/gymApi.service";
import type { PayInvoicePayload } from "./types/Gym.types";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

// ─── Helpers ─────────────────────────────────────────────────────────

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// ─── Success Screen ───────────────────────────────────────────────────

interface SuccessScreenProps {
  memberName: string;
  planName: string;
  amountPaid: number;
  subscriptionId: string;
  invoiceNumber: string;
  method: string;
  onDone: () => void;
}

const SuccessScreen = memo(
  ({ memberName, planName, amountPaid, subscriptionId, invoiceNumber, method, onDone }: SuccessScreenProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");
    const methodLabel = method === "upi" ? "UPI" : "Card";
    const gradient =
      method === "upi"
        ? "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
        : "linear-gradient(135deg, #3965FF 0%, #002DFF 100%)";
    const glow = method === "upi" ? "#7551FF" : "#3965FF";

    return (
      <VStack gap={8} maxW="480px" mx="auto" textAlign="center">
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="400px"
          h="400px"
          bg={method === "upi" ? "brand.500" : "blue.500"}
          filter="blur(120px)"
          opacity={0.1}
          pointerEvents="none"
        />

        <Circle size={28} bg={gradient} boxShadow={`0 20px 50px -15px ${glow}`} zIndex={1}>
          <CheckCircle size={48} color="white" strokeWidth={2.5} />
        </Circle>

        <VStack gap={2} zIndex={1}>
          <Text fontSize="3xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
            Payment Confirmed!
          </Text>
          <Text fontSize="sm" color={muted} maxW="sm">
            {memberName}'s membership has been activated via {methodLabel}.
          </Text>
        </VStack>

        <Box
          w="full"
          bg={useColorModeValue("rgba(255,255,255,0.85)", "rgba(11, 20, 55, 0.65)")}
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
                Receipt
              </Text>
            </HStack>
            <VStack align="stretch" gap={0}>
              {[
                { label: "Member", value: memberName },
                { label: "Plan", value: planName },
                { label: "Amount Paid", value: formatINR(amountPaid) },
                { label: "Payment Method", value: methodLabel },
                { label: "Invoice", value: invoiceNumber },
                { label: "Subscription ID", value: subscriptionId },
              ].map(({ label, value }) => (
                <Flex
                  key={label}
                  justify="space-between"
                  align="center"
                  py={2.5}
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

        <Button
          w="full"
          h="52px"
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
          Done — View Member Profile
        </Button>
      </VStack>
    );
  }
);
SuccessScreen.displayName = "SuccessScreen";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const OnlinePayment = memo(() => {
  const { params: rawInvoiceNumber } = useParams();
  const invoiceNumber = rawInvoiceNumber ? decodeURIComponent(rawInvoiceNumber) : undefined;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const method = (searchParams.get("method") || "upi") as "upi" | "card";
  const isUPI = method === "upi";

  const { invoice, loading } = useInvoiceDetails(invoiceNumber);

  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<null | {
    memberName: string;
    planName: string;
    amountPaid: number;
    subscriptionId: string;
    invoiceNumber: string;
    memberId: string;
  }>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const muted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(11, 20, 55, 0.55)");
  const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");

  const gradient = isUPI
    ? "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
    : "linear-gradient(135deg, #3965FF 0%, #002DFF 100%)";
  const glowColor = isUPI ? "#7551FF" : "#3965FF";
  const MethodIcon = isUPI ? QrCode : CreditCard;

  useEffect(() => {
    if (!loading && inputRef.current) inputRef.current.focus();
  }, [loading]);

  const handleConfirm = useCallback(() => {
    if (!invoiceNumber) return;

    if (!transactionRef.trim()) {
      toaster.create({
        title: "Reference Required",
        description: `Please enter the ${isUPI ? "UPI transaction ID" : "card authorization code"}.`,
        type: "warning",
      });
      return;
    }

    setIsProcessing(true);

    const payload: PayInvoicePayload = {
      payment_method: method,
      transaction_ref: transactionRef.trim(),
      notes: notes || `${isUPI ? "UPI" : "Card"} payment. Ref: ${transactionRef.trim()}`,
    };

    const sub = GymApiService.payGymInvoice(invoiceNumber, payload).subscribe({
      next: (res) => {
        setIsProcessing(false);
        if (res.success) {
          setSuccess({
            memberName: invoice?.customer_ref.name || res.data.member_id,
            planName: res.data.plan_name || invoice?.plan_name || "Membership",
            amountPaid: res.data.amount_paid,
            subscriptionId: res.data.subscription_id,
            invoiceNumber: res.data.invoice_number,
            memberId: res.data.member_id,
          });
        } else {
          toaster.create({ title: "Payment Failed", description: (res as any).message, type: "error" });
        }
      },
      error: (err) => {
        setIsProcessing(false);
        toaster.create({
          title: "Error",
          description: err?.response?.data?.message || "Failed to process payment.",
          type: "error",
        });
      },
    });

    return () => sub.unsubscribe();
  }, [invoiceNumber, method, transactionRef, notes, invoice, isUPI]);

  const handleDone = useCallback(() => {
    const memberId = success?.memberId;
    if (memberId) {
      navigate(`/${organizationName}/workspace/app/${appCode}/member/${memberId}`);
    } else {
      navigate(`/${organizationName}/workspace/app/${appCode}/membersList`);
    }
  }, [success, navigate, organizationName, appCode]);

  if (success) {
    return (
      <PageLayout title="Payment Successful" subtitle="">
        <SuccessScreen {...success} method={method} onDone={handleDone} />
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Online Payment" subtitle="Loading...">
        <Skeleton height="400px" borderRadius="2xl" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={isUPI ? "UPI Payment" : "Card Payment"}
      subtitle={`Invoice ${invoiceNumber} · ${formatINR(invoice?.balance_due ?? 0)} due`}
    >
      {/* Breadcrumb */}
      <HStack gap={2} mb={8} color={muted} fontSize="xs" fontWeight="700">
        <Text>Invoice</Text>
        <ArrowRight size={12} />
        <Text>Select Method</Text>
        <ArrowRight size={12} />
        <Text color="brand.500">{isUPI ? "UPI" : "Card"} Payment</Text>
      </HStack>

      <Box maxW="640px" mx="auto">
        <Grid templateColumns={{ base: "1fr" }} gap={5}>
          {/* Invoice summary */}
          <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" overflow="hidden">
            <Box h="4px" bg={gradient} />
            <Box p={6}>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                    Amount to Collect
                  </Text>
                  <Text fontSize="3xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                    {formatINR(invoice?.balance_due ?? 0)}
                  </Text>
                  <Text fontSize="xs" color={muted} fontWeight="600">
                    {invoice?.plan_name} · {invoice?.billing_cycle}
                  </Text>
                </VStack>
                <VStack align="end" gap={0.5}>
                  <Badge colorPalette={isUPI ? "purple" : "blue"} variant="subtle" borderRadius="full" px={3}>
                    {isUPI ? "UPI" : "CARD"}
                  </Badge>
                  <Text fontSize="xs" color={muted} fontWeight="600">
                    For: {invoice?.customer_ref.name || invoice?.member_id}
                  </Text>
                </VStack>
              </Flex>
            </Box>
          </Box>

          {/* Input */}
          <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={6}>
            <HStack gap={3} mb={6}>
              <Circle size={10} bg={isUPI ? "purple.500/10" : "blue.500/10"} color={isUPI ? "purple.500" : "blue.500"}>
                <MethodIcon size={18} />
              </Circle>
              <VStack align="start" gap={0}>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                  {isUPI ? "UPI Transaction Details" : "Card Payment Details"}
                </Text>
                <Text fontSize="xs" color={muted} fontWeight="500">
                  {isUPI
                    ? "Enter the UPI transaction/reference ID from the payment app"
                    : "Enter the authorization code or card last 4 digits"}
                </Text>
              </VStack>
            </HStack>

            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="700" color={muted} mb={2} textTransform="uppercase" letterSpacing="wider">
                  {isUPI ? "UPI Transaction ID *" : "Authorization / Reference Code *"}
                </Text>
                <Input
                  ref={inputRef}
                  placeholder={isUPI ? "e.g. UPI202606051234567" : "e.g. AUTH-1234-5678"}
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  h="48px"
                  fontSize="sm"
                  fontWeight="700"
                  fontFamily={transactionRef ? "mono" : "inherit"}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={transactionRef ? (isUPI ? "purple.500" : "blue.500") : borderCol}
                  _focus={{
                    borderColor: isUPI ? "purple.500" : "blue.500",
                    boxShadow: `0 0 0 1px var(--chakra-colors-${isUPI ? "purple" : "blue"}-500)`,
                  }}
                  textTransform="uppercase"
                />
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="700" color={muted} mb={2} textTransform="uppercase" letterSpacing="wider">
                  Notes (optional)
                </Text>
                <Input
                  placeholder={isUPI ? "e.g., Google Pay transfer" : "e.g., Visa card ending 4242"}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  h="40px"
                  fontSize="sm"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderCol}
                />
              </Box>

              <Separator opacity={0.1} mt={2} />

              <Button
                w="full"
                h="52px"
                borderRadius="xl"
                fontWeight="900"
                fontSize="sm"
                bg={gradient}
                color="white"
                disabled={!transactionRef.trim()}
                loading={isProcessing}
                loadingText="Processing..."
                onClick={handleConfirm}
                _hover={{
                  transform: transactionRef ? "translateY(-2px)" : "none",
                  boxShadow: transactionRef ? `0 12px 25px -8px ${glowColor}` : "none",
                }}
                _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
                transition="all 0.3s"
              >
                <HStack gap={2}>
                  {isProcessing ? <Loader2 size={16} /> : <CheckCircle size={16} />}
                  <Text>Confirm {isUPI ? "UPI" : "Card"} Payment</Text>
                </HStack>
              </Button>

              <Button
                w="full"
                h="38px"
                variant="ghost"
                borderRadius="xl"
                fontSize="xs"
                fontWeight="600"
                color={muted}
                onClick={handleGoBack}
                _hover={{ color: "app.text.primary" }}
              >
                <ArrowLeft size={13} />
                <Text ml={1}>Back</Text>
              </Button>
            </VStack>
          </Box>
        </Grid>
      </Box>
    </PageLayout>
  );
});
OnlinePayment.displayName = "OnlinePayment";

export default OnlinePayment;
