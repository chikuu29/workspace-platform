/**
 * ReviewOrder.tsx
 *
 * Step 3 in the gym membership sales flow — premium redesign.
 * Route: /:org/workspace/app/gym/reviewOrder/:memberId?planCode=GYM_PRO
 *
 * Design: Glassmorphism cards with dynamic gradient hero headers matching the plan's accent color,
 *         ambient backround orbs, premium breadcrumbs, and entrance animations.
 */

import { memo, useMemo, useCallback, useState } from "react";
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
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams, useSearchParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Edit2,
  FileText,
  Loader2,
  Tag,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { useGymMember } from "./hooks/useGymMember";
import { useGymPlan } from "./hooks/useGymPlan";
import { GymApiService } from "./services/gymApi.service";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
const BRAND_HEX = "#422AFB";
const BRAND_ALT = "#7551FF";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

// ─── Design Constants ─────────────────────────────────────────────────────────

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

// ─── Section Card ────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentHex: string;
}

const SectionCard = memo(({ title, icon, children, accentHex }: SectionCardProps) => {
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(18, 22, 40, 0.75)");
  const borderCol = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.07)");

  const iconCircleStyle = useMemo(() => ({
    background: `${accentHex}18`,
    color: accentHex
  }), [accentHex]);

  const headerBg = useColorModeValue("rgba(255,255,255,0.4)", "rgba(255,255,255,0.02)");

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

// ─── Member Context Bar ──────────────────────────────────────────────

interface MemberContextBarProps {
  memberName: string;
  memberId: string | undefined;
  email?: string;
  phone?: string;
  currentPlan?: string;
  memberStatus?: string;
}

const MemberContextBar = memo(({
  memberName, memberId, email, phone, currentPlan, memberStatus
}: MemberContextBarProps) => {
  const cardBg = useColorModeValue("rgba(255,255,255,0.85)", "rgba(18,22,40,0.65)");
  const border = useColorModeValue("rgba(226,232,240,0.7)", "rgba(255,255,255,0.08)");
  const muted = useColorModeValue("gray.500", "gray.400");

  const statusColor = memberStatus === "active" ? "#c3f400"
    : memberStatus === "attention" ? "#FFB547"
      : "#3965FF";

  return (
    <Box
      p={{ base: 4, md: 5 }}
      borderRadius="20px"
      bg={cardBg}
      backdropFilter="blur(24px) saturate(180%)"
      border="1px solid"
      borderColor={border}
      boxShadow={useColorModeValue("0 4px 24px rgba(0,0,0,0.04)", "0 4px 24px rgba(0,0,0,0.20)")}
      mb={6}
    >
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        {/* Left — Member identity */}
        <HStack gap={4}>
          {/* Avatar with status ring */}
          <Box position="relative">
            <Circle
              size={12}
              bg={`linear-gradient(135deg, ${BRAND_HEX}22, ${BRAND_ALT}22)`}
              border="2px solid"
              borderColor={`${statusColor}55`}
              color={BRAND_HEX}
              fontWeight="900"
              fontSize="lg"
            >
              {memberName.slice(0, 1).toUpperCase()}
            </Circle>
            <Circle
              size={3}
              bg={statusColor}
              position="absolute"
              bottom={0}
              right={0}
              border="2px solid"
              borderColor={useColorModeValue("white", "rgba(18,22,40,0.9)")}
              boxShadow={`0 0 8px ${statusColor}80`}
            />
          </Box>

          <VStack align="start" gap={0.5}>
            <HStack gap={2}>
              <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                {memberName}
              </Text>
              {currentPlan && (
                <Badge
                  fontSize="9px"
                  fontWeight="900"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  bg={`${BRAND_HEX}26`}
                  color={BRAND_HEX}
                  border={`1px solid ${BRAND_HEX}40`}
                >
                  {currentPlan}
                </Badge>
              )}
            </HStack>
            <Text fontSize="10px" color={muted} fontWeight="600" fontFamily="mono">
              {memberId}
            </Text>
          </VStack>
        </HStack>

        {/* Right — Contact info pills */}
        <HStack gap={3} flexWrap="wrap">
          {email && (
            <Box
              px={3}
              py={1.5}
              borderRadius="full"
              bg={useColorModeValue("gray.50", "rgba(255,255,255,0.04)")}
              border="1px solid"
              borderColor={border}
            >
              <VStack align="start" gap={0}>
                <Text fontSize="8px" color={muted} fontWeight="800" letterSpacing="wider">EMAIL</Text>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary">{email}</Text>
              </VStack>
            </Box>
          )}
          {phone && (
            <Box
              px={3}
              py={1.5}
              borderRadius="full"
              bg={useColorModeValue("gray.50", "rgba(255,255,255,0.04)")}
              border="1px solid"
              borderColor={border}
            >
              <VStack align="start" gap={0}>
                <Text fontSize="8px" color={muted} fontWeight="800" letterSpacing="wider">PHONE</Text>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary">{phone}</Text>
              </VStack>
            </Box>
          )}
        </HStack>
      </Flex>
    </Box>
  );
});
MemberContextBar.displayName = "MemberContextBar";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const ReviewOrder = memo(() => {
  const { params: memberId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const planCode = searchParams.get("planCode") ?? undefined;

  const { member, loading: memberLoading } = useGymMember(memberId);
  const { plan, loading: planLoading } = useGymPlan(planCode);

  const [isGenerating, setIsGenerating] = useState(false);

  const loading = memberLoading || planLoading;
  const muted = useColorModeValue("gray.500", "gray.400");
  const pageBg = useColorModeValue("rgba(248,250,252,1)", "bg.default");

  // ── Derived values ────────────────────────────────────────────────

  const planData = plan?.data;
  const accent = planData?.accent_color || "brand";
  const gradient = useMemo(() => getGradient(accent), [accent]);
  const accentHex = useMemo(() => getAccentHex(accent), [accent]);

  const memberName = useMemo(() => {
    const d = member?.data;
    return `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || memberId || "Member";
  }, [member, memberId]);

  const startDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const endDate = useMemo(() => {
    if (!plan) return "—";
    const d = new Date(startDate);
    switch (plan.data.billing_cycle as string) {
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "quarterly":
        d.setMonth(d.getMonth() + 3);
        break;
      case "yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
      case "half-yearly":
        d.setMonth(d.getMonth() + 6);
        break;
      default:
        d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().split("T")[0];
  }, [plan, startDate]);

  const estimatedTax = useMemo(() => {
    if (!plan) return 0;
    // 18% GST estimate (server computes actual amount on invoice creation)
    return Math.round(plan.data.price * 0.18);
  }, [plan]);

  const estimatedTotal = useMemo(() => {
    if (!plan) return 0;
    return plan.data.price + estimatedTax;
  }, [plan, estimatedTax]);

  const duration = useMemo(() => {
    return plan ? BILLING_CYCLE_FULL[plan.data.billing_cycle] ?? plan.data.billing_cycle : "—";
  }, [plan]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handleEditPlan = useCallback(() => {
    navigate(
      `/${organizationName}/workspace/app/${appCode}/plans/${memberId}`
    );
  }, [navigate, organizationName, appCode, memberId]);

  const handleGoBack = useCallback(() => {
    navigate(
      `/${organizationName}/workspace/app/${appCode}/plans/${memberId}`
    );
  }, [navigate, organizationName, appCode, memberId]);

  const handleGenerateInvoice = useCallback(() => {
    const effectiveMemberId = member?.data?.member_id || memberId;
    if (!effectiveMemberId || !planCode) {
      toaster.create({ title: "Missing data", description: "Member or plan not found.", type: "error" });
      return;
    }

    setIsGenerating(true);

    const sub = GymApiService.createMembershipOrder({
      member_id: effectiveMemberId,
      plan_code: planCode,
      start_date: startDate,
    }).subscribe({
      next: (orderRes) => {
        setIsGenerating(false);
        if (orderRes.success) {
          const orderNumber = orderRes.data.order_number;
          toaster.create({
            title: "Order Placed",
            description: `Order ${orderNumber} created. Proceed to confirm.`,
            type: "success",
          });
          navigate(
            `/${organizationName}/workspace/app/${appCode}/orderView/${encodeURIComponent(orderNumber)}`
          );
        } else {
          toaster.create({
            title: "Order Creation Failed",
            description: (orderRes as any).message ?? "An error occurred.",
            type: "error",
          });
        }
      },
      error: (err) => {
        setIsGenerating(false);
        toaster.create({
          title: "Error",
          description: err?.response?.data?.message || err?.message || "Failed to place order.",
          type: "error",
        });
      },
    });
    return () => sub.unsubscribe();
  }, [member, memberId, planCode, startDate, navigate, organizationName, appCode]);

  // ── Stable styles to avoid inline object creation ─────────────────

  const ambientOrbStyle = useMemo(() => ({
    background: `${accentHex}0a`,
  }), [accentHex]);

  const verticalBarBg = useMemo(() => ({
    background: gradient
  }), [gradient]);

  const breadcrumbsBorderColor = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.06)");
  const breadcrumbsBg = useColorModeValue("rgba(255,255,255,0.5)", "rgba(255,255,255,0.03)");
  const breadcrumbsStyle = useMemo(() => ({
    borderColor: breadcrumbsBorderColor,
    background: breadcrumbsBg
  }), [breadcrumbsBorderColor, breadcrumbsBg]);

  const orderSummaryHeaderStyle = useMemo(() => ({
    background: gradient
  }), [gradient]);

  const noteBoxBg = useMemo(() => ({
    background: `${accentHex}0f`,
    borderColor: `${accentHex}25`
  }), [accentHex]);

  const noteBoxTextStyle = useMemo(() => ({
    color: accentHex
  }), [accentHex]);

  const generateInvoiceBtnStyle = useMemo(() => ({
    background: gradient,
    color: "white",
    boxShadow: `0 8px 24px -6px ${accentHex}60`
  }), [gradient, accentHex]);

  const generateInvoiceBtnHover = useMemo(() => ({
    transform: "translateY(-2px)",
    boxShadow: `0 14px 32px -8px ${accentHex}70`
  }), [accentHex]);

  const editPlanBtnBorderColor = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
  const editPlanBtnHoverBg = useColorModeValue("gray.50", "rgba(255,255,255,0.04)");
  const editPlanBtnStyle = useMemo(() => ({
    borderColor: editPlanBtnBorderColor
  }), [editPlanBtnBorderColor]);

  const editPlanBtnHoverStyle = useMemo(() => ({
    bg: editPlanBtnHoverBg
  }), [editPlanBtnHoverBg]);

  const backBtnHoverBg = useColorModeValue("gray.50", "rgba(255,255,255,0.03)");
  const backBtnHoverStyle = useMemo(() => ({
    color: "app.text.primary",
    bg: backBtnHoverBg
  }), [backBtnHoverBg]);

  const generateInvoiceIcon = useMemo(() => {
    return isGenerating ? (
      <Loader2 size={16} className="animate-spin" />
    ) : (
      <CheckCircle size={16} />
    );
  }, [isGenerating]);

  // ── Loading skeleton ──────────────────────────────────────────────

  if (loading) {
    return (
      <Box w="full" minH="100vh" bg={pageBg} fontFamily="'Inter', sans-serif" py={8}>
        <Box maxW="1400px" mx="auto" px={{ base: 4, md: 8 }}>
          <Flex justify="space-between" align="start" mb={8}>
            <VStack align="start" gap={2}>
              <Skeleton height="32px" width="200px" borderRadius="lg" />
              <Skeleton height="16px" width="340px" borderRadius="md" />
            </VStack>
            <Skeleton height="40px" width="100px" borderRadius="xl" />
          </Flex>
          <Skeleton height="76px" borderRadius="20px" mb={6} />
          <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={6}>
            <VStack gap={5} align="stretch">
              <Skeleton height="180px" borderRadius="24px" />
              <Skeleton height="180px" borderRadius="24px" />
            </VStack>
            <Skeleton height="420px" borderRadius="24px" />
          </Grid>
        </Box>
      </Box>
    );
  }

  const summaryCardBg = useColorModeValue("rgba(255,255,255,0.82)", "rgba(18, 22, 40, 0.75)");
  const summaryCardBorderColor = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)");

  return (
    <Box
      w="full"
      minH="100vh"
      bg={pageBg}
      fontFamily="'Inter', sans-serif"
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
        @keyframes cardEnter {
          0%  { opacity: 0; transform: translateY(20px); }
          100%{ opacity: 1; transform: translateY(0); }
        }
        .card-enter-1 {
          opacity: 0;
          animation: cardEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.05s;
        }
        .card-enter-2 {
          opacity: 0;
          animation: cardEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.12s;
        }
        .card-enter-right {
          opacity: 0;
          animation: cardEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.18s;
        }
      `}</style>

      {/* ── Ambient Background Orbs ── */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="500px"
        h="500px"
        borderRadius="full"
        style={ambientOrbStyle}
        filter="blur(120px)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-80px"
        left="-80px"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="rgba(57,101,255,0.06)"
        filter="blur(100px)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* ── Page Content ── */}
      <Box maxW="1400px" mx="auto" position="relative" zIndex={1}>

        {/* ── Member Context Bar ── */}
        {!memberLoading && member ? (
          <MemberContextBar
            memberName={memberName}
            memberId={member.data.member_id || memberId}
            email={member.data.email}
            phone={member.data.phone}
            currentPlan={member.data.plan}
            memberStatus={member.data.status}
          />
        ) : null}

        {/* ── Breadcrumb steps ── */}
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
          boxShadow={useColorModeValue("0 2px 10px rgba(0,0,0,0.02)", "none")}
        >
          <Text
            cursor="pointer"
            onClick={handleEditPlan}
            _hover={{ color: "app.text.primary" }}
            transition="color 0.2s"
          >
            Select Plan
          </Text>
          <ArrowRight size={10} color={accentHex} strokeWidth={2.5} />
          <Text color={accentHex}>Review Order</Text>
          <ArrowRight size={10} />
          <Text opacity={0.6}>Invoice</Text>
          <ArrowRight size={10} />
          <Text opacity={0.6}>Payment</Text>
        </HStack>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={6} alignItems="start">
          {/* ── Left: Details ── */}
          <VStack gap={5} align="stretch">
            {/* Selected Plan Details */}
            <Box className="card-enter-1">
              <SectionCard title="Selected Plan" icon={<Tag size={14} />} accentHex={accentHex}>
                <InfoRow label="Plan Name" value={plan?.data?.name || "—"} />
                <InfoRow label="Plan Code" value={planCode || "—"} mono />
                <InfoRow
                  label="Base Price"
                  value={plan ? formatINR(plan.data.price) : "—"}
                />
                <InfoRow
                  label="Billing Cycle"
                  value={duration}
                />
              </SectionCard>
            </Box>

            {/* Dates / Subscription Period */}
            <Box className="card-enter-2">
              <SectionCard title="Subscription Period" icon={<CalendarDays size={14} />} accentHex={accentHex}>
                <InfoRow label="Start Date" value={fmtDate(startDate)} />
                <InfoRow label="End Date" value={fmtDate(endDate)} />
                <InfoRow label="Duration" value={duration} />
              </SectionCard>
            </Box>
          </VStack>

          {/* ── Right: Order Summary ── */}
          <Box position={{ base: "static", lg: "sticky" }} top="24px" className="card-enter-right">
            <Box
              bg={summaryCardBg}
              backdropFilter="blur(24px) saturate(200%)"
              border="1px solid"
              borderColor={summaryCardBorderColor}
              borderRadius="24px"
              overflow="hidden"
              boxShadow={useColorModeValue("0 10px 30px rgba(0,0,0,0.03)", "0 10px 30px rgba(0,0,0,0.25)")}
            >
              {/* Header with plan-specific gradient */}
              <Box
                px={6}
                py={4.5}
                style={orderSummaryHeaderStyle}
                color="white"
              >
                <HStack gap={3}>
                  <Icon size="sm">
                    <FileText size={16} />
                  </Icon>
                  <Text fontWeight="900" fontSize="sm" letterSpacing="tight">
                    Order Summary
                  </Text>
                </HStack>
              </Box>

              <VStack align="stretch" p={6} gap={4}>
                {/* Plan summary details */}
                <VStack align="stretch" gap={0}>
                  <Flex justify="space-between" py={3.5} borderBottom="1px solid" borderColor="app.card.border">
                    <Text fontSize="sm" color={muted} fontWeight="600">Plan</Text>
                    <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                      {plan?.data?.name || "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" py={3.5} borderBottom="1px solid" borderColor="app.card.border">
                    <Text fontSize="sm" color={muted} fontWeight="600">Subtotal</Text>
                    <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                      {plan ? formatINR(plan.data.price) : "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" py={3.5} borderBottom="1px solid" borderColor="app.card.border">
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" color={muted} fontWeight="600">Tax</Text>
                      <Text fontSize="9px" color={muted} fontWeight="500">~18% GST (estimated)</Text>
                    </VStack>
                    <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                      ≈ {plan ? formatINR(estimatedTax) : "—"}
                    </Text>
                  </Flex>
                </VStack>

                <Separator opacity={0.06} />

                {/* Total */}
                <Flex justify="space-between" align="center">
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                      Estimated Total
                    </Text>
                    <Text fontSize="9px" color={muted} fontWeight="500">
                      Exact amount confirmed on invoice
                    </Text>
                  </VStack>
                  <Text fontSize="2xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                    {plan ? formatINR(estimatedTotal) : "—"}
                  </Text>
                </Flex>

                {/* Tax warning/disclaimer matching the plan's theme */}
                <Box
                  p={3.5}
                  borderRadius="xl"
                  border="1px solid"
                  style={noteBoxBg}
                >
                  <Text fontSize="xs" fontWeight="700" lineHeight="relaxed" style={noteBoxTextStyle}>
                    💡 The exact GST amount will be computed by the server when you generate the invoice.
                  </Text>
                </Box>

                {/* Actions */}
                <VStack gap={3} mt={2}>
                  {/* Primary CTA: Place Order */}
                  <Button
                    w="full"
                    h="52px"
                    borderRadius="2xl"
                    fontWeight="900"
                    fontSize="sm"
                    letterSpacing="wide"
                    style={generateInvoiceBtnStyle}
                    _hover={generateInvoiceBtnHover}
                    _active={{ transform: "translateY(0) scale(0.98)" }}
                    transition="all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    disabled={!plan || !member || isGenerating}
                    onClick={handleGenerateInvoice}
                  >
                    <HStack gap={2}>
                      {generateInvoiceIcon}
                      <Text>{isGenerating ? "Placing Order..." : "Place Order"}</Text>
                    </HStack>
                  </Button>

                  {/* Edit Plan */}
                  <Button
                    w="full"
                    h="46px"
                    variant="outline"
                    borderRadius="xl"
                    fontWeight="700"
                    fontSize="sm"
                    onClick={handleEditPlan}
                    style={editPlanBtnStyle}
                    _hover={editPlanBtnHoverStyle}
                    _active={{ transform: "scale(0.97)" }}
                    transition="all 0.2s"
                  >
                    <Edit2 size={14} />
                    <Text ml={2}>Edit Plan</Text>
                  </Button>

                </VStack>
              </VStack>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
});
ReviewOrder.displayName = "ReviewOrder";

export default ReviewOrder;

