/**
 * CashPayment.tsx
 *
 * Step 6A in the gym membership sales flow.
 * Route: /:org/workspace/app/gym/cashPayment/:invoiceNumber
 *
 * Purpose:
 *   - Capture cash payment details (amount received, notes)
 *   - Calculate and display change due
 *   - Confirm → POST /gym/invoices/:invoiceNumber/pay (payment_method: "cash")
 *   - On success → subscription is CREATED and member is ACTIVATED
 *   - Show success receipt
 */

import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Circle,
  Flex,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  Separator,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle,
  IndianRupee,
  Loader2,
  ReceiptText,
  User,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { useInvoiceDetails } from "./hooks/useInvoiceDetails";
import { GymApiService } from "./services/gymApi.service";
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
  onDone: () => void;
}

const SuccessScreen = memo(
  ({ memberName, planName, amountPaid, subscriptionId, invoiceNumber, onDone }: SuccessScreenProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");
    const cardBg = useColorModeValue("rgba(255,255,255,0.85)", "rgba(11, 20, 55, 0.65)");

    return (
      <Box textAlign="center">
        {/* Glow */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="400px"
          h="400px"
          bg="green.400"
          filter="blur(120px)"
          opacity={0.12}
          pointerEvents="none"
          zIndex={0}
        />

        <VStack gap={8} position="relative" zIndex={1} maxW="480px" mx="auto">
          {/* Icon */}
          <Circle
            size={28}
            bg="linear-gradient(135deg, #01B574 0%, #00875A 100%)"
            boxShadow="0 20px 50px -15px #01B574"
            animation="pulse 2s infinite"
          >
            <CheckCircle size={48} color="white" strokeWidth={2.5} />
          </Circle>

          <VStack gap={2}>
            <Text fontSize="3xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
              Payment Confirmed!
            </Text>
            <Text fontSize="sm" color={muted} fontWeight="500" maxW="sm">
              The membership for <strong>{memberName}</strong> has been activated successfully.
            </Text>
          </VStack>

          {/* Receipt card */}
          <Box
            w="full"
            bg={cardBg}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
            borderRadius="2xl"
            overflow="hidden"
          >
            <Box h="4px" bg="linear-gradient(90deg, #01B574 0%, #00875A 100%)" />
            <Box p={6}>
              <HStack gap={3} mb={4}>
                <Circle size={8} bg="green.500/10" color="green.500">
                  <ReceiptText size={14} />
                </Circle>
                <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted}>
                  Payment Receipt
                </Text>
              </HStack>
              <VStack align="stretch" gap={0}>
                {[
                  { label: "Member", value: memberName },
                  { label: "Plan", value: planName },
                  { label: "Amount Paid", value: formatINR(amountPaid) },
                  { label: "Payment Method", value: "Cash" },
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
            colorPalette="green"
            fontWeight="900"
            fontSize="sm"
            onClick={onDone}
            bg="linear-gradient(135deg, #01B574 0%, #00875A 100%)"
            color="white"
            _hover={{ transform: "translateY(-2px)", boxShadow: "0 12px 25px -8px #01B574" }}
            transition="all 0.3s"
          >
            Done — View Member Profile
          </Button>
        </VStack>
      </Box>
    );
  }
);
SuccessScreen.displayName = "SuccessScreen";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const CashPayment = memo(() => {
  const { params: rawInvoiceNumber } = useParams();
  const invoiceNumber = rawInvoiceNumber ? decodeURIComponent(rawInvoiceNumber) : undefined;
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const { invoice, loading } = useInvoiceDetails(invoiceNumber);

  const [amountReceived, setAmountReceived] = useState("");
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

  // Focus amount input on load
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const receivedNum = useMemo(() => parseFloat(amountReceived) || 0, [amountReceived]);
  const balanceDue = invoice?.balance_due ?? 0;
  const changeDue = useMemo(() => Math.max(0, receivedNum - balanceDue), [receivedNum, balanceDue]);
  const isShort = receivedNum > 0 && receivedNum < balanceDue;
  const isExact = receivedNum >= balanceDue;

  const handleConfirm = useCallback(() => {
    if (!invoiceNumber) return;

    if (receivedNum < balanceDue) {
      toaster.create({
        title: "Insufficient Amount",
        description: `Amount received (${formatINR(receivedNum)}) is less than the balance due (${formatINR(balanceDue)}).`,
        type: "warning",
      });
      return;
    }

    setIsProcessing(true);

    const sub = GymApiService.payGymInvoice(invoiceNumber, {
      payment_method: "cash",
      notes: notes || `Cash payment. Received: ${formatINR(receivedNum)}. Change: ${formatINR(changeDue)}.`,
    }).subscribe({
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
  }, [invoiceNumber, receivedNum, balanceDue, changeDue, notes, invoice]);

  const handleDone = useCallback(() => {
    if (success?.memberId) {
      navigate(
        `/${organizationName}/workspace/app/${appCode}/memberDetails/${success.memberId}`
      );
    } else {
      navigate(`/${organizationName}/workspace/app/${appCode}/membersList`);
    }
  }, [success, navigate, organizationName, appCode]);

  if (success) {
    return (
      <PageLayout title="Payment Successful" subtitle="">
        <SuccessScreen {...success} onDone={handleDone} />
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Cash Payment" subtitle="Loading...">
        <Skeleton height="400px" borderRadius="2xl" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Cash Payment"
      subtitle={`Invoice ${invoiceNumber} · ${formatINR(balanceDue)} due`}
    >
      {/* Breadcrumb */}
      <HStack gap={2} mb={8} color={muted} fontSize="xs" fontWeight="700">
        <Text>Invoice</Text>
        <ArrowRight size={12} />
        <Text>Select Method</Text>
        <ArrowRight size={12} />
        <Text color="green.500">Cash Payment</Text>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 360px" }} gap={6} maxW="900px" mx="auto" alignItems="start">
        {/* ── Left: Input Form ── */}
        <VStack gap={5} align="stretch">
          {/* Invoice summary */}
          <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={6}>
            <HStack gap={3} mb={4}>
              <Circle size={8} bg="green.500/10" color="green.500">
                <User size={14} />
              </Circle>
              <VStack align="start" gap={0}>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                  {invoice?.customer_ref.name || invoice?.member_id}
                </Text>
                <Text fontSize="xs" color={muted} fontWeight="600">
                  {invoice?.plan_name || invoice?.plan_code} · {invoice?.billing_cycle}
                </Text>
              </VStack>
            </HStack>
            <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor={borderCol}>
              <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                Balance Due
              </Text>
              <Text fontSize="2xl" fontWeight="950" color="brand.500" letterSpacing="tight">
                {formatINR(balanceDue)}
              </Text>
            </Flex>
          </Box>

          {/* Amount received */}
          <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={6}>
            <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted} mb={4}>
              Cash Received
            </Text>
            <Box position="relative">
              <Box
                position="absolute"
                left={4}
                top="50%"
                transform="translateY(-50%)"
                color={muted}
                zIndex={1}
                pointerEvents="none"
              >
                <IndianRupee size={16} />
              </Box>
              <Input
                ref={inputRef}
                type="number"
                placeholder="0"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                pl={10}
                h="64px"
                fontSize="2xl"
                fontWeight="900"
                letterSpacing="tight"
                borderRadius="xl"
                border="2px solid"
                borderColor={
                  isShort
                    ? "red.500"
                    : isExact
                      ? "green.500"
                      : borderCol
                }
                bg={
                  isShort
                    ? "red.500/05"
                    : isExact
                      ? "green.500/05"
                      : "transparent"
                }
                _focus={{
                  borderColor: isShort ? "red.500" : "green.500",
                  boxShadow: `0 0 0 1px ${isShort ? "var(--chakra-colors-red-500)" : "var(--chakra-colors-green-500)"}`,
                }}
                transition="all 0.2s"
                min={0}
              />
            </Box>

            {isShort && receivedNum > 0 && (
              <Alert status="error" borderRadius="xl" mt={3} py={3}>
                <AlertDescription fontSize="xs">
                  ₹{(balanceDue - receivedNum).toLocaleString("en-IN")} short. Please collect the full amount.
                </AlertDescription>
              </Alert>
            )}

            <VStack gap={2} mt={4} align="stretch">
              <Text fontSize="xs" fontWeight="700" color={muted} mb={1}>
                Quick amounts
              </Text>
              <Flex gap={2} flexWrap="wrap">
                {[balanceDue, Math.ceil(balanceDue / 100) * 100, Math.ceil(balanceDue / 500) * 500].filter((v, i, arr) => arr.indexOf(v) === i && v >= balanceDue).map((amount) => (
                  <Button
                    key={amount}
                    size="xs"
                    variant={parseFloat(amountReceived) === amount ? "solid" : "outline"}
                    colorPalette="green"
                    borderRadius="lg"
                    fontWeight="700"
                    onClick={() => setAmountReceived(amount.toString())}
                  >
                    ₹{amount.toLocaleString("en-IN")}
                  </Button>
                ))}
              </Flex>
            </VStack>

            <Box mt={4}>
              <Text fontSize="xs" fontWeight="700" color={muted} mb={2}>
                Notes (optional)
              </Text>
              <Input
                placeholder="e.g., Walk-in member, new signup"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                h="40px"
                fontSize="sm"
                borderRadius="xl"
                border="1px solid"
                borderColor={borderCol}
              />
            </Box>
          </Box>
        </VStack>

        {/* ── Right: Change Calculator ── */}
        <Box position={{ base: "static", lg: "sticky" }} top="24px">
          <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" overflow="hidden">
            <Box
              px={6}
              py={4}
              bg="linear-gradient(135deg, #01B574 0%, #00875A 100%)"
            >
              <HStack gap={3}>
                <Banknote size={16} color="white" />
                <Text fontWeight="900" fontSize="sm" letterSpacing="tight" color="white">
                  Cash Register
                </Text>
              </HStack>
            </Box>

            <VStack align="stretch" p={6} gap={4}>
              {/* Summary rows */}
              <VStack align="stretch" gap={0}>
                {[
                  { label: "Invoice Total", value: formatINR(invoice?.total ?? 0) },
                  { label: "Tax Included", value: formatINR(invoice?.tax_amount ?? 0) },
                  { label: "Balance Due", value: formatINR(balanceDue), bold: true },
                  { label: "Received", value: receivedNum > 0 ? formatINR(receivedNum) : "—" },
                ].map(({ label, value, bold }) => (
                  <Flex
                    key={label}
                    justify="space-between"
                    align="center"
                    py={3}
                    borderBottom="1px solid"
                    borderColor={borderCol}
                    _last={{ borderBottom: "none" }}
                  >
                    <Text fontSize="xs" color={muted} fontWeight="600">{label}</Text>
                    <Text fontSize="sm" fontWeight={bold ? "950" : "700"} color={bold ? "app.text.primary" : "app.text.primary"}>
                      {value}
                    </Text>
                  </Flex>
                ))}
              </VStack>

              <Separator opacity={0.1} />

              {/* Change due */}
              <Box
                p={4}
                borderRadius="xl"
                bg={
                  changeDue > 0
                    ? useColorModeValue("green.50", "rgba(1, 181, 116, 0.08)")
                    : useColorModeValue("gray.50", "rgba(255,255,255,0.02)")
                }
                border="1px solid"
                borderColor={changeDue > 0 ? "green.500/30" : borderCol}
              >
                <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Change Due
                </Text>
                <Text
                  fontSize="3xl"
                  fontWeight="950"
                  color={changeDue > 0 ? "green.500" : muted}
                  letterSpacing="tight"
                >
                  {changeDue > 0 ? formatINR(changeDue) : "₹0"}
                </Text>
              </Box>

              {/* Confirm button */}
              <Button
                w="full"
                h="52px"
                borderRadius="xl"
                fontWeight="900"
                fontSize="sm"
                bg="linear-gradient(135deg, #01B574 0%, #00875A 100%)"
                color="white"
                isDisabled={!isExact || isProcessing}
                loading={isProcessing}
                loadingText="Processing..."
                onClick={handleConfirm}
                _hover={{
                  transform: isExact ? "translateY(-2px)" : "none",
                  boxShadow: isExact ? "0 12px 25px -8px #01B574" : "none",
                }}
                _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
                transition="all 0.3s"
                mt={2}
              >
                <HStack gap={2}>
                  {isProcessing ? <Loader2 size={16} /> : <CheckCircle size={16} />}
                  <Text>Confirm Payment</Text>
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
                onClick={() => navigate(-1)}
                _hover={{ color: "app.text.primary" }}
              >
                <ArrowLeft size={13} />
                <Text ml={1}>Back</Text>
              </Button>
            </VStack>
          </Box>
        </Box>
      </Grid>
    </PageLayout>
  );
});
CashPayment.displayName = "CashPayment";

export default CashPayment;
