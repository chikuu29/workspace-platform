/**
 * InvoiceDetails.tsx
 *
 * Step 4 in the gym membership sales flow.
 * Route: /:org/workspace/app/gym/invoiceView/:invoiceNumber
 *
 * Purpose:
 *   - Display the generated invoice with full details (server-computed tax)
 *   - Two-column layout: invoice content | action panel
 *   - Actions: Pay Now → paymentSelect, Send Link, Cancel Invoice
 *
 * Architecture note:
 *   No subscription exists yet. The invoice_number from route params
 *   is the state carrier for the rest of the flow.
 */

import { memo, useCallback, useState, useMemo } from "react";
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
  Separator,
  Skeleton,
  Text,
  VStack,
  Table,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Alert } from "@/components/ui/alert";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  FileText,
  Link2,
  Loader2,
  ReceiptText,
  Trash2,
  XCircle,
  AlertTriangle,
  Building,
  User,
  Check,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { useInvoiceDetails } from "./hooks/useInvoiceDetails";
import { useGymPlan } from "./hooks/useGymPlan";
import { GymApiService } from "./services/gymApi.service";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
// ─── Design Constants ─────────────────────────────────────────────────────────

const HERO_GRADIENT: Record<string, string> = {
  brand: "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)",
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
  brand: "#422AFB",
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
    maximumFractionDigits: 2,
  }).format(amount);

const fmtDate = (d?: string) => {
  if (!d) return "N/A";
  const p = new Date(d);
  return isNaN(p.getTime())
    ? d
    : p.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
};

const STATUS_COLOR: Record<string, string> = {
  draft: "gray",
  sent: "blue",
  partial: "orange",
  paid: "green",
  cancelled: "red",
  overdue: "red",
};

// ─── Invoice Field Row ────────────────────────────────────────────────

interface FieldRowProps {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}

const FieldRow = memo(({ label, value, mono, bold }: FieldRowProps) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  return (
    <Flex
      justify="space-between"
      align="center"
      py={2.5}
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.100", "whiteAlpha.50")}
      _last={{ borderBottom: "none" }}
    >
      <Text fontSize="xs" color={muted} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight={bold ? "900" : "700"}
        color={bold ? "app.text.primary" : "app.text.primary"}
        fontFamily={mono ? "mono" : "inherit"}
        letterSpacing={mono ? "tight" : "normal"}
      >
        {value}
      </Text>
    </Flex>
  );
});
FieldRow.displayName = "FieldRow";

// ─── Section Card Wrapper ───────────────────────────────────────────

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentHex: string;
}

const SectionCard = memo(({ title, icon, children, accentHex }: SectionCardProps) => {
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(18, 22, 40, 0.75)");
  const borderCol = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.07)");
  const headerBg = useColorModeValue("rgba(255,255,255,0.4)", "rgba(255,255,255,0.02)");

  const iconCircleStyle = useMemo(() => ({
    background: `${accentHex}18`,
    color: accentHex
  }), [accentHex]);

  return (
    <Box
      bg={cardBg}
      backdropFilter="blur(24px) saturate(200%)"
      border="1px solid"
      borderColor={borderCol}
      borderRadius="24px"
      overflow="hidden"
      boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.02)", "0 4px 20px rgba(0,0,0,0.15)")}
    >
      <Flex
        px={6}
        py={4}
        gap={3.5}
        align="center"
        borderBottom="1px solid"
        borderColor={borderCol}
        bg={headerBg}
      >
        <Circle size={8} style={iconCircleStyle}>
          {icon}
        </Circle>
        <Text fontSize="sm" fontWeight="900" color="app.text.primary" letterSpacing="tight">
          {title}
        </Text>
      </Flex>
      <Box px={6} py={4}>
        {children}
      </Box>
    </Box>
  );
});
SectionCard.displayName = "SectionCard";

interface ProgressStepperProps {
  currentStep: number;
  accentHex: string;
  onStepClick?: (stepIndex: number) => void;
}

const ProgressStepper = memo(({ currentStep, accentHex, onStepClick }: ProgressStepperProps) => {
  const steps = [
    { label: "Select Plan", index: 1 },
    { label: "Review Order", index: 2 },
    { label: "Invoice Details", index: 3 },
    { label: "Collect Payment", index: 4 },
  ];

  const muted = useColorModeValue("gray.500", "gray.400");
  const borderCol = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.02)");

  return (
    <Box
      w="100%"
      mb={8}
      p={4}
      px={6}
      bg={cardBg}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={borderCol}
      borderRadius="24px"
      position="relative"
      zIndex={1}
      boxShadow={useColorModeValue("0 2px 10px rgba(0,0,0,0.01)", "none")}
    >
      <Flex justify="space-between" align="center" position="relative" maxW="900px" mx="auto">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.index;
          const isActive = currentStep === step.index;
          const isClickable = isCompleted && !!onStepClick;

          const handleStepClick = () => {
            if (isClickable && onStepClick) {
              onStepClick(step.index);
            }
          };

          return (
            <HStack key={step.index} gap={3} align="center" flex={idx === steps.length - 1 ? "none" : 1}>
              <HStack
                gap={2}
                align="center"
                cursor={isClickable ? "pointer" : "default"}
                onClick={handleStepClick}
                role={isClickable ? "button" : undefined}
                _hover={isClickable ? { opacity: 0.85 } : undefined}
                transition="opacity 0.2s"
              >
                <Circle
                  size={7}
                  bg={isCompleted ? "green.500" : isActive ? accentHex : "transparent"}
                  border="2px solid"
                  borderColor={isCompleted ? "green.500" : isActive ? accentHex : useColorModeValue("gray.300", "gray.600")}
                  color={isCompleted || isActive ? "white" : muted}
                  fontWeight="800"
                  fontSize="xs"
                  boxShadow={isActive ? `0 0 12px ${accentHex}50` : "none"}
                  transition="all 0.3s"
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : step.index}
                </Circle>
                <Text
                  fontSize="xs"
                  fontWeight={isActive ? "900" : "700"}
                  color={isActive ? "app.text.primary" : muted}
                  letterSpacing="tight"
                >
                  {step.label}
                </Text>
              </HStack>

              {idx < steps.length - 1 && (
                <Box
                  h="2px"
                  flex={1}
                  mx={4}
                  bg={isCompleted ? "green.500" : useColorModeValue("gray.200", "whiteAlpha.100")}
                  transition="all 0.3s"
                />
              )}
            </HStack>
          );
        })}
      </Flex>
    </Box>
  );
});
ProgressStepper.displayName = "ProgressStepper";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const InvoiceDetails = memo(() => {
  const { params: rawInvoiceNumber } = useParams();
  const invoiceNumber = rawInvoiceNumber ? decodeURIComponent(rawInvoiceNumber) : undefined;
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const { invoice, loading, error, refetch } = useInvoiceDetails(invoiceNumber);
  const { plan } = useGymPlan(invoice?.plan_code);

  const planData = plan?.data;
  const accent = planData?.accent_color || "brand";
  const gradient = useMemo(() => getGradient(accent), [accent]);
  const accentHex = useMemo(() => getAccentHex(accent), [accent]);

  const payBtnStyle = useMemo(() => ({
    background: gradient,
    color: "white",
    boxShadow: `0 8px 24px -6px ${accentHex}60`
  }), [gradient, accentHex]);

  const payBtnHover = useMemo(() => ({
    transform: "translateY(-2px)",
    boxShadow: `0 14px 32px -8px ${accentHex}70`
  }), [accentHex]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleStepClick = useCallback((stepIdx: number) => {
    if (!invoice) return;
    if (stepIdx === 1) {
      navigate(`/${organizationName}/workspace/app/${appCode}/plans/${invoice.member_id}`);
    } else if (stepIdx === 2) {
      navigate(`/${organizationName}/workspace/app/${appCode}/reviewOrder/${invoice.member_id}?planCode=${invoice.plan_code}`);
    } else if (stepIdx === 3 && invoice.order_number) {
      navigate(`/${organizationName}/workspace/app/${appCode}/orderView/${encodeURIComponent(invoice.order_number)}`);
    }
  }, [navigate, organizationName, appCode, invoice]);

  const handleViewOrder = useCallback(() => {
    if (!invoice?.order_number) return;
    navigate(
      `/${organizationName}/workspace/app/${appCode}/orderView/${encodeURIComponent(
        invoice.order_number
      )}`
    );
  }, [navigate, organizationName, appCode, invoice?.order_number]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);

  const muted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("rgba(255,255,255,0.82)", "rgba(18, 22, 40, 0.75)");
  const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)");
  const tableBorderColor = useColorModeValue("gray.100", "whiteAlpha.80");

  const isPaid = invoice?.status === "paid";
  const isCancelled = invoice?.status === "cancelled";
  const canPay = !isPaid && !isCancelled && invoice?.balance_due && invoice.balance_due > 0;

  const statusColor = useMemo(
    () => STATUS_COLOR[invoice?.status ?? "draft"] ?? "gray",
    [invoice?.status]
  );

  // ── Navigation handlers ───────────────────────────────────────────

  const handlePayNow = useCallback(() => {
    if (!invoiceNumber) return;
    navigate(
      `/${organizationName}/workspace/app/${appCode}/paymentSelect/${encodeURIComponent(invoiceNumber)}`
    );
  }, [invoiceNumber, navigate, organizationName, appCode]);

  const handleSendLink = useCallback(() => {
    if (!invoiceNumber) return;
    setIsSendingLink(true);
    const sub = GymApiService.sendGymInvoiceLink(invoiceNumber, { send_via: "email" }).subscribe({
      next: (res) => {
        setIsSendingLink(false);
        if (res.success) {
          toaster.create({
            title: "Payment Link Sent",
            description: `Link dispatched via email for ${res.data.invoice_number}.`,
            type: "success",
          });
        } else {
          toaster.create({ title: "Error", description: (res as any).message, type: "error" });
        }
      },
      error: (err) => {
        setIsSendingLink(false);
        toaster.create({
          title: "Error",
          description: err?.response?.data?.message || "Failed to send payment link.",
          type: "error",
        });
      },
    });
    return () => sub.unsubscribe();
  }, [invoiceNumber]);

  const handleCancel = useCallback(() => {
    if (!invoiceNumber) return;
    setIsCancelling(true);
    const sub = GymApiService.cancelGymInvoice(invoiceNumber).subscribe({
      next: (res) => {
        setIsCancelling(false);
        if (res.success) {
          toaster.create({
            title: "Invoice Cancelled",
            description: "The invoice has been cancelled. No membership was created.",
            type: "info",
          });
          refetch();
        } else {
          toaster.create({ title: "Error", description: (res as any).message, type: "error" });
        }
      },
      error: (err) => {
        setIsCancelling(false);
        toaster.create({
          title: "Error",
          description: err?.response?.data?.message || "Failed to cancel invoice.",
          type: "error",
        });
      },
    });
    return () => sub.unsubscribe();
  }, [invoiceNumber, refetch]);

  // ── Error state ───────────────────────────────────────────────────

  if (error) {
    return (
      <PageLayout title="Invoice Not Found" subtitle="">
        <Alert status="error" borderRadius="2xl" title="Invoice Error">
          {error}
        </Alert>
        <Button
          mt={4}
          variant="outline"
          borderRadius="xl"
          onClick={handleGoBack}
          fontWeight="700"
        >
          <ArrowLeft size={14} />
          <Text ml={2}>Go Back</Text>
        </Button>
      </PageLayout>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────

  if (loading) {
    return (
      <PageLayout title="Invoice" subtitle="Loading invoice...">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 320px" }} gap={6}>
          <VStack gap={4} align="stretch">
            {[80, 200, 140, 100].map((h) => (
              <Skeleton key={h} height={`${h}px`} borderRadius="2xl" />
            ))}
          </VStack>
          <Skeleton height="400px" borderRadius="2xl" />
        </Grid>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Invoice Details"
      subtitle={
        <HStack gap={2.5} mt={1}>
          {invoice?.billing_cycle && (
            <Badge colorPalette={accent} variant="subtle" borderRadius="md" fontSize="9px" fontWeight="950" px={2} py={0.5}>
              {invoice.billing_cycle.toUpperCase()} PLAN
            </Badge>
          )}
          <Text fontSize="xs" fontWeight="800" color="app.text.muted" fontFamily="mono">
            #{invoice?.invoice_number}
          </Text>
        </HStack>
      }
      icon={ReceiptText}
      position="relative"
    >
      {/* Ambient background orbs */}
      <Box position="absolute" top="-100px" right="-100px" w="500px" h="500px" borderRadius="full" bg={`${accentHex}0a`} filter="blur(120px)" pointerEvents="none" zIndex={0} />
      <Box position="absolute" bottom="-80px" left="-80px" w="400px" h="400px" borderRadius="full" bg="rgba(57,101,255,0.06)" filter="blur(100px)" pointerEvents="none" zIndex={0} />

      {/* Breadcrumbs steps */}
      <ProgressStepper currentStep={3} accentHex={accentHex} onStepClick={handleStepClick} />

      {/* Cancelled banner */}
      {isCancelled && (
        <Alert status="warning" borderRadius="2xl" mb={6} title="Invoice Cancelled">
          This invoice was cancelled. No membership has been created. Go back to start a new enrollment.
        </Alert>
      )}

      <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={6} alignItems="start">

        {/* ── Left: Invoice Document ── */}
        <VStack gap={5} align="stretch">

          {/* Invoice Header Card */}
          <Box bg={cardBg} backdropFilter="blur(24px) saturate(200%)" border="1px solid" borderColor={borderCol} borderRadius="24px" overflow="hidden" boxShadow={useColorModeValue("0 10px 30px rgba(0,0,0,0.03)", "0 10px 30px rgba(0,0,0,0.25)")}>
            {/* Header with plan-specific gradient */}
            <Box px={6} py={4.5} bg={gradient} color="white">
              <Flex justify="space-between" align="center">
                <HStack gap={3}>
                  <Circle size={8} bg="whiteAlpha.200" color="white">
                    <ReceiptText size={16} />
                  </Circle>
                  <VStack align="start" gap={0}>
                    <Text fontSize="9px" color="whiteAlpha.700" fontWeight="900" textTransform="uppercase" letterSpacing="wider">
                      Invoice Number
                    </Text>
                    <Text fontSize="md" fontWeight="950" color="white" fontFamily="mono" letterSpacing="tight">
                      {invoice?.invoice_number}
                    </Text>
                  </VStack>
                </HStack>
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  borderRadius="full"
                  px={3.5}
                  py={1}
                  fontSize="10px"
                  fontWeight="950"
                  letterSpacing="wider"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  {invoice?.status?.toUpperCase()}
                </Badge>
              </Flex>
            </Box>
            <Box p={6}>
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={6}>
                <VStack align="start" gap={1}>
                  <Text fontSize="10px" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                    Issue Date
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                    {fmtDate(invoice?.issue_date)}
                  </Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="10px" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                    Due Date
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                    {fmtDate(invoice?.due_date)}
                  </Text>
                </VStack>
              </Grid>
            </Box>
          </Box>

          {/* Parties — Bill From / Bill To */}
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
            <SectionCard title="Bill From" icon={<Building size={14} />} accentHex="#8B5CF6">
              <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                Your Gym Organization
              </Text>
              <Text fontSize="xs" color={muted} fontWeight="500" mt={1}>
                Tax Invoiced by your registered entity
              </Text>
            </SectionCard>

            <SectionCard title="Bill To" icon={<User size={14} />} accentHex="#3965FF">
              <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                {invoice?.customer_ref.name || invoice?.member_id}
              </Text>
              {invoice?.customer_ref.email && (
                <Text fontSize="xs" color={muted} fontWeight="600" mt={0.5}>
                  {invoice.customer_ref.email}
                </Text>
              )}
              {invoice?.customer_ref.phone && (
                <Text fontSize="xs" color={muted} fontWeight="600" mt={0.5}>
                  {invoice.customer_ref.phone}
                </Text>
              )}
            </SectionCard>
          </Grid>

          {/* Line Items Table */}
          <SectionCard title="Line Items" icon={<FileText size={14} />} accentHex={accentHex}>
            <Box overflowX="auto" mx={-6} mt={-3} mb={-3}>
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row bg={useColorModeValue("gray.50", "rgba(255,255,255,0.02)")}>
                    <Table.ColumnHeader px={6} py={3} fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted}>
                      Description
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} textAlign="center" fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted}>
                      Qty
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} textAlign="right" fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted}>
                      Unit Price
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px={6} py={3} textAlign="right" fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted}>
                      Total
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell px={6} py={4}>
                      <VStack align="start" gap={0.5}>
                        <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                          {invoice?.plan_name || "Gym Membership"}{" "}
                          {invoice?.billing_cycle && (
                            <Badge
                              colorPalette={accent}
                              variant="subtle"
                              fontSize="9px"
                              fontWeight="900"
                              letterSpacing="wider"
                              borderRadius="md"
                              ml={1}
                            >
                              {invoice.billing_cycle.toUpperCase()}
                            </Badge>
                          )}
                        </Text>
                        {invoice?.start_date && invoice?.end_date && (
                          <Text fontSize="xs" color={muted} fontWeight="600">
                            {fmtDate(invoice.start_date)} → {fmtDate(invoice.end_date)}
                          </Text>
                        )}
                      </VStack>
                    </Table.Cell>
                    <Table.Cell px={4} py={4} textAlign="center">
                      <Text fontSize="sm" fontWeight="700" color="app.text.primary">1</Text>
                    </Table.Cell>
                    <Table.Cell px={4} py={4} textAlign="right">
                      <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                        {formatINR(invoice?.subtotal ?? 0)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell px={6} py={4} textAlign="right">
                      <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                        {formatINR(invoice?.subtotal ?? 0)}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Box>

            {/* Totals */}
            <Box pt={4} mt={3} borderTop="1px solid" borderColor={borderCol}>
              <VStack align="stretch" gap={0} maxW="250px" ml="auto">
                <FieldRow label="Subtotal" value={formatINR(invoice?.subtotal ?? 0)} />
                <FieldRow label="Tax (GST)" value={formatINR(invoice?.tax_amount ?? 0)} />
                {(invoice?.amount_paid ?? 0) > 0 && (
                  <FieldRow label="Amount Paid" value={`− ${formatINR(invoice?.amount_paid ?? 0)}`} />
                )}
                <Separator opacity={0.1} my={2} />
                <Flex justify="space-between" align="center" pt={2}>
                  <Text fontSize="xs" fontWeight="900" color={muted} textTransform="uppercase" letterSpacing="wider">
                    Balance Due
                  </Text>
                  <Text fontSize="2xl" fontWeight="950" color={canPay ? accentHex : "green.500"} letterSpacing="tight">
                    {formatINR(invoice?.balance_due ?? 0)}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          </SectionCard>
        </VStack>

        {/* ── Right: Action Panel ── */}
        <Box position={{ base: "static", lg: "sticky" }} top="24px">
          <VStack gap={4} align="stretch">
            {/* Quick Summary */}
            <SectionCard title="Quick Summary" icon={<FileText size={14} />} accentHex={accentHex}>
              <FieldRow label="Plan" value={invoice?.plan_name || invoice?.plan_code || "—"} />
              <FieldRow label="Member" value={invoice?.customer_ref.name || invoice?.member_id || "—"} />
              <FieldRow label="Period" value={invoice?.start_date ? `${fmtDate(invoice.start_date)} – ${fmtDate(invoice.end_date)}` : "—"} />
              {invoice?.order_number && (
                <FieldRow label="Order Number" value={invoice.order_number} mono />
              )}
              <FieldRow label="Total" value={formatINR(invoice?.total ?? 0)} bold />
            </SectionCard>

            {/* Actions */}
            <SectionCard title="Actions" icon={<CreditCard size={14} />} accentHex={accentHex}>
              <VStack gap={3} align="stretch" mt={1}>
                {canPay && (
                  <Button
                    w="full"
                    h="52px"
                    borderRadius="xl"
                    fontWeight="900"
                    fontSize="sm"
                    letterSpacing="wide"
                    style={payBtnStyle}
                    _hover={payBtnHover}
                    onClick={handlePayNow}
                    transition="all 0.3s"
                  >
                    <CreditCard size={16} />
                    <Text ml={2}>Pay Now</Text>
                  </Button>
                )}

                {isPaid && (
                  <Button
                    w="full"
                    h="52px"
                    borderRadius="xl"
                    colorPalette="green"
                    variant="solid"
                    disabled
                  >
                    <CheckCircle size={16} />
                    <Text ml={2}>Paid — Membership Active</Text>
                  </Button>
                )}

                {canPay && (
                  <Button
                    w="full"
                    h="44px"
                    variant="outline"
                    borderRadius="xl"
                    fontWeight="700"
                    fontSize="sm"
                    loading={isSendingLink}
                    loadingText="Sending..."
                    onClick={handleSendLink}
                    borderColor={borderCol}
                    _hover={{ bg: "rgba(255,255,255,0.04)" }}
                  >
                    <Link2 size={14} />
                    <Text ml={2}>Send Payment Link</Text>
                  </Button>
                )}

                <Button
                  w="full"
                  h="38px"
                  variant="ghost"
                  borderRadius="xl"
                  fontSize="xs"
                  fontWeight="600"
                  color={muted}
                  onClick={handleGoBack}
                  _hover={{ color: "app.text.primary", bg: "rgba(255,255,255,0.03)" }}
                >
                  <ArrowLeft size={13} />
                  <Text ml={1}>Back to Review</Text>
                </Button>

                {invoice?.order_number && (
                  <Button
                    w="full"
                    h="38px"
                    variant="outline"
                    borderRadius="xl"
                    fontSize="xs"
                    fontWeight="600"
                    borderColor={borderCol}
                    onClick={handleViewOrder}
                    _hover={{ bg: "rgba(255,255,255,0.03)", borderColor: accentHex }}
                  >
                    <FileText size={13} />
                    <Text ml={2}>View Originating Order</Text>
                  </Button>
                )}

                {canPay && (
                  <>
                    <Separator opacity={0.1} />
                    <Button
                      w="full"
                      h="38px"
                      variant="ghost"
                      borderRadius="xl"
                      fontSize="xs"
                      fontWeight="600"
                      colorPalette="red"
                      loading={isCancelling}
                      loadingText="Cancelling..."
                      onClick={handleCancel}
                      _hover={{ bg: "red.500/08" }}
                    >
                      <XCircle size={13} />
                      <Text ml={1}>Cancel Invoice</Text>
                    </Button>
                  </>
                )}
              </VStack>
            </SectionCard>

            {/* Info note */}
            {!isPaid && !isCancelled && (
              <Box
                p={4}
                borderRadius="xl"
                bg={useColorModeValue("amber.50", "rgba(255, 181, 71, 0.08)")}
                border="1px solid"
                borderColor="orange.500/25"
              >
                <HStack gap={2} mb={1}>
                  <AlertTriangle size={13} color="var(--chakra-colors-orange-500)" />
                  <Text fontSize="xs" fontWeight="900" color="orange.500">
                    No membership yet
                  </Text>
                </HStack>
                <Text fontSize="xs" color={muted} lineHeight="relaxed">
                  The member's subscription will be activated only after payment is collected.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Grid>
    </PageLayout>
  );
});
InvoiceDetails.displayName = "InvoiceDetails";

export default InvoiceDetails;
