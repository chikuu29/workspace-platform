import { memo, useCallback, useState, useMemo } from "react";
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
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { useOrderDetails } from "./hooks/useOrderDetails";
import { GymApiService } from "./services/gymApi.service";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

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
  brand: "#7551FF",
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
    : p.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
};

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
      py={3.5}
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
      <Box px={6} py={3}>
        {children}
      </Box>
    </Box>
  );
});
SectionCard.displayName = "SectionCard";

const OrderView = memo(() => {
  const { params: rawOrderNumber } = useParams();
  const orderNumber = rawOrderNumber ? decodeURIComponent(rawOrderNumber) : undefined;
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const { order, loading, error } = useOrderDetails(orderNumber);
  const [isConfirming, setIsConfirming] = useState(false);

  const muted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(18, 22, 40, 0.75)");
  const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");

  const accent = "brand";
  const gradient = useMemo(() => getGradient(accent), [accent]);
  const accentHex = useMemo(() => getAccentHex(accent), [accent]);

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

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

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

  if (loading) {
    return (
      <PageLayout title="Order Details" subtitle="Loading order...">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={6}>
          <VStack gap={4} align="stretch">
            <Skeleton height="150px" borderRadius="24px" />
            <Skeleton height="150px" borderRadius="24px" />
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
      subtitle={order.order_number}
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

      <Box position="absolute" top="-100px" right="-100px" w="500px" h="500px" borderRadius="full" bg={`${accentHex}0a`} filter="blur(120px)" pointerEvents="none" zIndex={0} />

      <Box maxW="1400px" mx="auto" position="relative" zIndex={1}>
        {/* Breadcrumbs steps */}
        <HStack
          gap={2.5}
          mb={8}
          p={1.5}
          px={4}
          borderRadius="full"
          style={breadcrumbsStyle}
          backdropFilter="blur(10px)"
          w="fit-content"
          fontSize="11px"
          fontWeight="800"
          letterSpacing="wider"
          textTransform="uppercase"
          color={muted}
        >
          <Text opacity={0.6}>Select Plan</Text>
          <ArrowRight size={10} />
          <Text opacity={0.6}>Review Order</Text>
          <ArrowRight size={10} />
          <Text color={accentHex}>Order View</Text>
          <ArrowRight size={10} />
          <Text opacity={0.6}>Invoice</Text>
          <ArrowRight size={10} />
          <Text opacity={0.6}>Payment</Text>
        </HStack>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={6} alignItems="start">
          {/* Left Column: Details */}
          <VStack gap={5} align="stretch">
            {/* Member Details */}
            <SectionCard title="Customer Reference" icon={<User size={14} />} accentHex={accentHex}>
              <InfoRow label="Name" value={order.customer_ref?.name || "—"} />
              <InfoRow label="Email" value={order.customer_ref?.email || "—"} />
              <InfoRow label="Phone" value={order.customer_ref?.phone || "—"} />
              <InfoRow label="Member ID" value={order.member_id || "—"} mono />
            </SectionCard>

            {/* Order Items */}
            <SectionCard title="Ordered Items" icon={<FileText size={14} />} accentHex={accentHex}>
              {order.line_items?.map((item, index) => (
                <Box key={index} py={3} borderBottom="1px solid" borderColor="rgba(226, 232, 240, 0.5)" _last={{ borderBottom: "none" }}>
                  <Flex justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" fontWeight="bold" color="app.text.primary">{item.description}</Text>
                      <Text fontSize="xs" color={muted}>Period: {fmtDate(item.service_period_start)} to {fmtDate(item.service_period_end)}</Text>
                    </VStack>
                    <Text fontSize="sm" fontWeight="bold" color="app.text.primary">{formatINR(item.line_total)}</Text>
                  </Flex>
                </Box>
              ))}
            </SectionCard>
          </VStack>

          {/* Right Column: Pricing & Confirmation Summary */}
          <VStack gap={5} align="stretch">
            <Box bg={cardBg} backdropFilter="blur(24px) saturate(200%)" border="1px solid" borderColor={borderCol} borderRadius="24px" p={6}>
              <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted} mb={4}>Order Summary</Text>

              <InfoRow label="Subtotal" value={formatINR(order.subtotal)} />
              <InfoRow label="Tax Amount" value={formatINR(order.tax_amount)} />
              <Separator opacity={0.1} my={4} />

              <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="sm" fontWeight="bold" color="app.text.primary">Total Amount</Text>
                <Text fontSize="xl" fontWeight="950" color={accentHex}>{formatINR(order.total)}</Text>
              </Flex>

              <Button
                w="full"
                h="52px"
                borderRadius="2xl"
                fontWeight="900"
                style={confirmBtnStyle}
                disabled={order.status !== "pending" || isConfirming}
                onClick={handleConfirmOrder}
                _hover={{ transform: "translateY(-2px)", boxShadow: `0 14px 32px -8px ${accentHex}70` }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.25s"
              >
                <HStack gap={2}>
                  {isConfirming ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  <Text>{isConfirming ? "Confirming Order..." : "Confirm & Generate Invoice"}</Text>
                </HStack>
              </Button>
            </Box>
          </VStack>
        </Grid>
      </Box>
    </PageLayout>
  );
});
OrderView.displayName = "OrderView";

export default OrderView;
