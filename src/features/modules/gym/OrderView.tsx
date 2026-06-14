import { memo, useCallback, useState, useMemo, useEffect } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  Grid,
  HStack,
  Separator,
  Skeleton,
  Text,
  VStack,
  Table,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Loader2,
  User,
  Building,
  ReceiptText,
  CreditCard,
  Link2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { useOrderDetails } from "./hooks/useOrderDetails";
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

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: "orange",
  confirmed: "blue",
  invoiced: "purple",
  completed: "green",
  cancelled: "red",
};

const INVOICE_STATUS_COLOR: Record<string, string> = {
  draft: "gray",
  sent: "blue",
  partial: "orange",
  paid: "green",
  cancelled: "red",
  overdue: "red",
  void: "red",
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

// ─── Field Row (Subcomponent) ────────────────────────────────────────────────
interface FieldRowProps {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}

const FieldRow = memo(({ label, value, mono, bold }: FieldRowProps) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  const borderCol = useColorModeValue("gray.100", "whiteAlpha.50");
  return (
    <Flex
      justify="space-between"
      align="center"
      py={2.5}
      borderBottom="1px solid"
      borderColor={borderCol}
      _last={{ borderBottom: "none" }}
    >
      <Text fontSize="xs" fontWeight="600" color={muted} textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight={bold ? "950" : "700"}
        color="app.text.primary"
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
      bg={"app.card.bg"}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={borderCol}
      // borderRadius="24px"
      borderRadius={'md'}
      position="relative"
      zIndex={1}
    // boxShadow={useColorModeValue("0 2px 10px rgba(0,0,0,0.01)", "none")}
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

const OrderView = memo(() => {
  const { params: rawOrderNumber } = useParams();
  const orderNumber = rawOrderNumber ? decodeURIComponent(rawOrderNumber) : undefined;
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const { order, loading, error } = useOrderDetails(orderNumber);
  const { plan } = useGymPlan(order?.plan_code);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);

  // Linked Invoice States
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const planData = plan?.data;
  const accent = planData?.accent_color || "brand";
  const gradient = useMemo(() => getGradient(accent), [accent]);
  const accentHex = useMemo(() => getAccentHex(accent), [accent]);

  // Fetch linked invoice if available
  useEffect(() => {
    if (!order?.invoice_ref) {
      setInvoice(null);
      return;
    }
    setLoadingInvoice(true);
    setInvoiceError(null);
    const sub = GymApiService.getGymInvoice(order.invoice_ref).subscribe({
      next: (res) => {
        if (res.success) {
          setInvoice(res.data);
        } else {
          setInvoiceError((res as any).message ?? "Failed to load linked invoice details.");
        }
        setLoadingInvoice(false);
      },
      error: (err) => {
        setInvoiceError(err?.response?.data?.message || err?.message || "Failed to load linked invoice.");
        setLoadingInvoice(false);
      }
    });
    return () => sub.unsubscribe();
  }, [order?.invoice_ref]);

  const handleConfirmOrder = useCallback(() => {
    if (!orderNumber) return;
    setIsConfirming(true);

    const sub = GymApiService.confirmMembershipOrder(orderNumber).subscribe({
      next: (res) => {
        setIsConfirming(false);
        if (res.success) {
          toaster.create({
            title: "Order Confirmed",
            description: `Invoice ${res.data.invoice_number} created successfully.`,
            type: "success",
          });
          navigate(
            `/${organizationName}/workspace/app/${appCode}/invoiceView/${encodeURIComponent(res.data.invoice_number)}`
          );
        } else {
          toaster.create({
            title: "Confirmation Failed",
            description: (res as any).message ?? "An error occurred.",
            type: "error",
          });
        }
      },
      error: (err) => {
        setIsConfirming(false);
        toaster.create({
          title: "Error",
          description: err?.response?.data?.message || err?.message || "Failed to confirm order.",
          type: "error",
        });
      },
    });

    return () => sub.unsubscribe();
  }, [orderNumber, navigate, organizationName, appCode]);

  const handleSendLink = useCallback(() => {
    if (!order?.invoice_ref) return;
    setIsSendingLink(true);
    const sub = GymApiService.sendGymInvoiceLink(order.invoice_ref, { send_via: "email" }).subscribe({
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
  }, [order?.invoice_ref]);

  const handleViewInvoice = useCallback(() => {
    if (!order?.invoice_ref) return;
    navigate(
      `/${organizationName}/workspace/app/${appCode}/invoiceView/${encodeURIComponent(order.invoice_ref)}`
    );
  }, [order?.invoice_ref, navigate, organizationName, appCode]);

  const handlePayInvoice = useCallback(() => {
    if (!order?.invoice_ref) return;
    navigate(
      `/${organizationName}/workspace/app/${appCode}/paymentSelect/${encodeURIComponent(order.invoice_ref)}`
    );
  }, [order?.invoice_ref, navigate, organizationName, appCode]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleStepClick = useCallback((stepIdx: number) => {
    if (!order) return;
    if (stepIdx === 1) {
      navigate(`/${organizationName}/workspace/app/${appCode}/plans/${order.member_id}`);
    } else if (stepIdx === 2) {
      navigate(`/${organizationName}/workspace/app/${appCode}/reviewOrder/${order.member_id}?planCode=${order.plan_code}`);
    }
  }, [navigate, organizationName, appCode, order]);

  const muted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(18, 22, 40, 0.75)");
  const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");

  const breadcrumbsBorderColor = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.06)");
  const breadcrumbsBg = useColorModeValue("rgba(255,255,255,0.5)", "rgba(255,255,255,0.03)");
  const breadcrumbsStyle = useMemo(() => ({
    borderColor: breadcrumbsBorderColor,
    background: breadcrumbsBg
  }), [breadcrumbsBorderColor, breadcrumbsBg]);

  const confirmBtnStyle = useMemo(() => ({
    background: gradient,
    color: "white",
    boxShadow: `0 8px 24px -6px ${accentHex}60`
  }), [gradient, accentHex]);

  const payBtnStyle = useMemo(() => ({
    background: gradient,
    color: "white",
    boxShadow: `0 8px 24px -6px ${accentHex}60`
  }), [gradient, accentHex]);

  const payBtnHover = useMemo(() => ({
    transform: "translateY(-2px)",
    boxShadow: `0 14px 32px -8px ${accentHex}70`
  }), [accentHex]);

  const backgroundOrb1Style = useMemo(() => ({
    position: "absolute" as const,
    top: "-100px",
    right: "-100px",
    width: "500px",
    height: "500px",
    borderRadius: "full",
    background: `${accentHex}0a`,
    filter: "blur(120px)",
    pointerEvents: "none" as const,
    zIndex: 0
  }), [accentHex]);

  const backgroundOrb2Style = useMemo(() => ({
    position: "absolute" as const,
    bottom: "-80px",
    left: "-80px",
    width: "400px",
    height: "400px",
    borderRadius: "full",
    background: "rgba(57,101,255,0.06)",
    filter: "blur(100px)",
    pointerEvents: "none" as const,
    zIndex: 0
  }), []);

  const relativeBoxStyle = useMemo(() => ({
    width: "100%",
    position: "relative" as const,
    zIndex: 1
  }), []);

  if (loading) {
    return (
      <PageLayout title="Order Details" subtitle="Loading order...">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={6}>
          <VStack gap={4} align="stretch">
            <Skeleton height="150px" borderRadius="24px" />
            <Skeleton height="150px" borderRadius="24px" />
            <Skeleton height="200px" borderRadius="24px" />
          </VStack>
          <Skeleton height="350px" borderRadius="24px" />
        </Grid>
      </PageLayout>
    );
  }

  if (error || !order) {
    return (
      <PageLayout title="Order Not Found" subtitle="Error retrieving order details.">
        <Box p={6} bg="red.500/10" border="1px solid" borderColor="red.500/30" borderRadius="2xl">
          <Text fontWeight="bold" color="red.500">Error: {error || "Order not found."}</Text>
        </Box>
        <Button mt={4} variant="outline" onClick={handleGoBack}>
          Go Back
        </Button>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Order Details"
      subtitle={
        <HStack gap={2.5} mt={1}>
          {order.billing_cycle && (
            <Badge colorPalette={accent} variant="subtle" borderRadius="md" fontSize="9px" fontWeight="950" px={2} py={0.5}>
              {order.billing_cycle.toUpperCase()} PLAN
            </Badge>
          )}
          <Text fontSize="xs" fontWeight="800" color="app.text.muted" fontFamily="mono">
            #{order.order_number}
          </Text>
        </HStack>
      }
      position="relative"
    >
      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Ambient background orbs */}
      <Box style={backgroundOrb1Style} />
      <Box style={backgroundOrb2Style} />

      <Box mx="auto" style={relativeBoxStyle}>
        {/* Breadcrumbs steps */}
        <ProgressStepper currentStep={3} accentHex={accentHex} onStepClick={handleStepClick} />

        <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={6} alignItems="start">
          {/* Left Column: Details */}
          <VStack gap={5} align="stretch">

            {/* Order Header Card */}
            <Box bg={cardBg} backdropFilter="blur(24px) saturate(200%)" border="1px solid" borderColor={borderCol} borderRadius="24px" overflow="hidden" boxShadow={useColorModeValue("0 10px 30px rgba(0,0,0,0.03)", "0 10px 30px rgba(0,0,0,0.25)")}>
              <Box px={6} py={4.5} bg={gradient} color="white">
                <Flex justify="space-between" align="center">
                  <HStack gap={3}>
                    <Circle size={8} bg="whiteAlpha.200" color="white">
                      <FileText size={16} />
                    </Circle>
                    <VStack align="start" gap={0}>
                      <Text fontSize="9px" color="whiteAlpha.700" fontWeight="900" textTransform="uppercase" letterSpacing="wider">
                        Order Number
                      </Text>
                      <Text fontSize="md" fontWeight="950" color="white" fontFamily="mono" letterSpacing="tight">
                        {order.order_number}
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
                    {order.status?.toUpperCase()}
                  </Badge>
                </Flex>
              </Box>
              <Box p={6}>
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={6}>
                  <VStack align="start" gap={1}>
                    <Text fontSize="10px" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                      Start Date
                    </Text>
                    <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                      {fmtDate(order.start_date)}
                    </Text>
                  </VStack>
                  <VStack align="start" gap={1}>
                    <Text fontSize="10px" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                      End Date
                    </Text>
                    <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                      {fmtDate(order.end_date)}
                    </Text>
                  </VStack>
                </Grid>
              </Box>
            </Box>

            {/* Parties: Bill From / Bill To */}
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
                  {order.customer_ref?.name || order.member_id}
                </Text>
                {order.customer_ref?.email && (
                  <Text fontSize="xs" color={muted} fontWeight="600" mt={0.5}>
                    {order.customer_ref.email}
                  </Text>
                )}
                {order.customer_ref?.phone && (
                  <Text fontSize="xs" color={muted} fontWeight="600" mt={0.5}>
                    {order.customer_ref.phone}
                  </Text>
                )}
                {order.member_id && (
                  <Text fontSize="xs" color={muted} fontWeight="600" mt={0.5} fontFamily="mono">
                    ID: {order.member_id}
                  </Text>
                )}
              </SectionCard>
            </Grid>

            {/* Line Items Table */}
            <SectionCard title="Ordered Items" icon={<FileText size={14} />} accentHex={accentHex}>
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
                    {order.line_items?.map((item, index) => (
                      <Table.Row key={index}>
                        <Table.Cell px={6} py={4}>
                          <VStack align="start" gap={0.5}>
                            <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                              {item.description}
                            </Text>
                            {item.service_period_start && item.service_period_end && (
                              <Text fontSize="xs" color={muted} fontWeight="600">
                                {fmtDate(item.service_period_start)} → {fmtDate(item.service_period_end)}
                              </Text>
                            )}
                          </VStack>
                        </Table.Cell>
                        <Table.Cell px={4} py={4} textAlign="center">
                          <Text fontSize="sm" fontWeight="700" color="app.text.primary">{item.quantity || 1}</Text>
                        </Table.Cell>
                        <Table.Cell px={4} py={4} textAlign="right">
                          <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                            {formatINR(item.unit_price)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell px={6} py={4} textAlign="right">
                          <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                            {formatINR(item.line_total)}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              {/* Totals */}
              <Box pt={4} mt={3} borderTop="1px solid" borderColor={borderCol}>
                <VStack align="stretch" gap={0} maxW="250px" ml="auto">
                  <FieldRow label="Subtotal" value={formatINR(order.subtotal ?? 0)} />
                  <FieldRow label="Tax (GST)" value={formatINR(order.tax_amount ?? 0)} />
                  {invoice && (invoice.amount_paid ?? 0) > 0 && (
                    <FieldRow label="Amount Paid" value={`− ${formatINR(invoice.amount_paid)}`} />
                  )}
                  <Separator opacity={0.1} my={2} />
                  <Flex justify="space-between" align="center" pt={2}>
                    <Text fontSize="xs" fontWeight="900" color={muted} textTransform="uppercase" letterSpacing="wider">
                      {invoice ? "Balance Due" : "Total Amount"}
                    </Text>
                    <Text
                      fontSize="2xl"
                      fontWeight="950"
                      color={invoice ? (invoice.balance_due > 0 ? accentHex : "green.500") : accentHex}
                      letterSpacing="tight"
                    >
                      {formatINR(invoice ? invoice.balance_due : order.total)}
                    </Text>
                  </Flex>
                </VStack>
              </Box>
            </SectionCard>

            {/* Linked Invoice Details */}
            {order.invoice_ref && (
              <SectionCard title="Linked Invoice Details" icon={<ReceiptText size={14} />} accentHex={accentHex}>
                {loadingInvoice ? (
                  <VStack gap={2} align="stretch" py={2}>
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                  </VStack>
                ) : invoiceError ? (
                  <Text fontSize="sm" color="red.500" fontWeight="600">{invoiceError}</Text>
                ) : invoice ? (
                  <Box>
                    <FieldRow label="Invoice Number" value={invoice.invoice_number} mono />
                    <Flex justify="space-between" align="center" py={2.5} borderBottom="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.50")}>
                      <Text fontSize="xs" color={muted} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                        Status
                      </Text>
                      <Badge colorPalette={INVOICE_STATUS_COLOR[invoice.status] || "gray"} variant="subtle">
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </Flex>
                    <FieldRow label="Issue Date" value={fmtDate(invoice.issue_date)} />
                    <FieldRow label="Due Date" value={fmtDate(invoice.due_date)} />
                    <FieldRow label="Total Amount" value={formatINR(invoice.total)} />
                    <FieldRow label="Amount Paid" value={formatINR(invoice.amount_paid)} />
                    <FieldRow label="Balance Due" value={formatINR(invoice.balance_due)} bold />
                  </Box>
                ) : (
                  <Text fontSize="sm" color={muted}>No linked invoice details found.</Text>
                )}
              </SectionCard>
            )}

          </VStack>

          {/* Right Column: Pricing & Confirmation Summary */}
          <Box position={{ base: "static", lg: "sticky" }} top="24px">
            <VStack gap={4} align="stretch">

              {/* Quick Summary Card */}
              <SectionCard title="Quick Summary" icon={<FileText size={14} />} accentHex={accentHex}>
                <FieldRow label="Plan" value={planData?.name || order.plan_code || "—"} />
                <FieldRow label="Member" value={order.customer_ref?.name || order.member_id || "—"} />
                <FieldRow label="Billing Cycle" value={order.billing_cycle?.toUpperCase() || "—"} />
                <FieldRow label="Period" value={`${fmtDate(order.start_date)} – ${fmtDate(order.end_date)}`} />
                <Flex justify="space-between" align="center" py={2.5} borderBottom="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.50")}>
                  <Text fontSize="xs" color={muted} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                    Order Status
                  </Text>
                  <Badge colorPalette={ORDER_STATUS_COLOR[order.status] || "gray"} variant="subtle">
                    {order.status.toUpperCase()}
                  </Badge>
                </Flex>
                {order.invoice_ref && (
                  <FieldRow label="Linked Invoice" value={order.invoice_ref} mono />
                )}
                <FieldRow label="Total Amount" value={formatINR(order.total)} bold />
              </SectionCard>

              {/* Actions Card */}
              <SectionCard title="Actions" icon={<CreditCard size={14} />} accentHex={accentHex}>
                <VStack gap={3} align="stretch" mt={1}>

                  {order.status === "pending" && (
                    <Button
                      w="full"
                      h="52px"
                      borderRadius="xl"
                      fontWeight="900"
                      style={confirmBtnStyle}
                      loading={isConfirming}
                      loadingText="Confirming..."
                      onClick={handleConfirmOrder}
                      _hover={{ transform: "translateY(-2px)", boxShadow: `0 14px 32px -8px ${accentHex}70` }}
                      _active={{ transform: "translateY(0)" }}
                      transition="all 0.25s"
                    >
                      <CheckCircle size={16} />
                      <Text ml={2}>Confirm & Generate Invoice</Text>
                    </Button>
                  )}

                  {order.invoice_ref && (
                    <Button
                      w="full"
                      h="44px"
                      variant="solid"
                      colorPalette="brand"
                      bg={accentHex}
                      color="white"
                      borderRadius="xl"
                      fontWeight="700"
                      fontSize="sm"
                      onClick={handleViewInvoice}
                      _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
                      transition="all 0.2s"
                    >
                      <ReceiptText size={14} />
                      <Text ml={2}>View Linked Invoice</Text>
                    </Button>
                  )}

                  {/* If the invoice is loaded, unpaid, and has balance due */}
                  {invoice && invoice.status !== "paid" && invoice.status !== "cancelled" && invoice.balance_due > 0 && (
                    <>
                      <Button
                        w="full"
                        h="52px"
                        borderRadius="xl"
                        fontWeight="900"
                        fontSize="sm"
                        letterSpacing="wide"
                        style={payBtnStyle}
                        _hover={payBtnHover}
                        onClick={handlePayInvoice}
                        transition="all 0.3s"
                      >
                        <CreditCard size={16} />
                        <Text ml={2}>Pay Invoice Now</Text>
                      </Button>

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
                    </>
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
                    <Text ml={1}>Go Back</Text>
                  </Button>

                </VStack>
              </SectionCard>

              {/* Payment Pending Amber Warning */}
              {invoice && invoice.status !== "paid" && invoice.status !== "cancelled" && (
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
                      Payment Pending
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={muted} lineHeight="relaxed">
                    The member's subscription will be activated only after the linked invoice is fully paid.
                  </Text>
                </Box>
              )}

              {/* Linked Payment Transactions */}
              {invoice?.payment_history && invoice.payment_history.length > 0 && (
                <SectionCard title="Payment Transactions" icon={<CreditCard size={14} />} accentHex={accentHex}>
                  <VStack gap={1} align="stretch">
                    {invoice.payment_history.map((p: any, idx: number) => (
                      <Box
                        key={idx}
                        py={3}
                        borderBottom="1px solid"
                        borderColor={useColorModeValue("gray.100", "whiteAlpha.50")}
                        _last={{ borderBottom: "none" }}
                      >
                        <Flex justify="space-between" align="center">
                          <VStack align="start" gap={0.5}>
                            <HStack gap={2}>
                              <Text fontSize="sm" fontWeight="bold" color="app.text.primary">
                                {p.payment_number}
                              </Text>
                              <Badge colorPalette={p.status === "captured" ? "green" : p.status === "pending" ? "blue" : "red"} variant="subtle" size="xs">
                                {p.status.toUpperCase()}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color={muted}>
                              Method: {p.method.toUpperCase()} {p.transaction_ref ? `| Ref: ${p.transaction_ref}` : ""}
                            </Text>
                            <Text fontSize="xs" color={muted}>
                              Date: {fmtDate(p.payment_date)}
                            </Text>
                          </VStack>
                          <Text fontSize="sm" fontWeight="950" color="app.text.primary">
                            {formatINR(p.amount)}
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </SectionCard>
              )}

            </VStack>
          </Box>
        </Grid>
      </Box>
    </PageLayout>
  );
});
OrderView.displayName = "OrderView";

export default OrderView;
