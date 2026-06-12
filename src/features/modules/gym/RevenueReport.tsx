/**
 * RevenueReport.tsx
 *
 * A modern, enterprise-grade Revenue Analytics & Tax Report dashboard for the
 * Gym Management System. Offers interactive filters, summary cards with sparklines,
 * dual-period comparison line charts, source breakdown donuts, payment method charts,
 * branch comparisons, and tabbed detailed tables.
 *
 * Built with Chakra UI v3 and Apache ECharts.
 */

import { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Icon,
  Separator,
  SimpleGrid,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import { NativeSelectRoot, NativeSelectField } from "@/components/ui/native-select";
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import * as echarts from "@/core/utils/echarts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Dumbbell,
  FileDown,
  FileSpreadsheet,
  FileText,
  Mail,
  Percent,
  PieChart,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/core/components/PageHeader";

// ─── Types & Interfaces ──────────────────────────────────────────────────────

interface FiltersState {
  dateRange: string;
  branch: string;
  plan: string;
  paymentMethod: string;
  trainer: string;
  revenueType: string;
}

interface EChartsReactProps {
  option: echarts.EChartsOption;
  height?: string;
  loading?: boolean;
}

// ─── Filter Constants ────────────────────────────────────────────────────────

const BRANCHES = [
  { label: "All Branches", value: "all" },
  { label: "Mumbai Branch", value: "mumbai" },
  { label: "Pune Branch", value: "pune" },
  { label: "Delhi Branch", value: "delhi" },
];

const DATE_RANGES = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Year", value: "year" },
];

const MEMBERSHIP_PLANS = [
  { label: "All Plans", value: "all" },
  { label: "Monthly Plan", value: "monthly" },
  { label: "Quarterly Plan", value: "quarterly" },
  { label: "Half Yearly Plan", value: "half_yearly" },
  { label: "Annual Plan", value: "annual" },
];

const PAYMENT_METHODS = [
  { label: "All Methods", value: "all" },
  { label: "UPI", value: "upi" },
  { label: "Cash", value: "cash" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Debit Card", value: "debit_card" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Online Gateway", value: "online_gateway" },
];

const TRAINERS = [
  { label: "All Trainers", value: "all" },
  { label: "Amit Sharma", value: "amit" },
  { label: "Priya Patel", value: "priya" },
  { label: "Rajesh Kumar", value: "rajesh" },
  { label: "Sneha Reddy", value: "sneha" },
];

const REVENUE_TYPES = [
  { label: "All Revenue Types", value: "all" },
  { label: "Membership Plans", value: "membership" },
  { label: "Personal Training", value: "pt" },
  { label: "Supplement Sales", value: "supplements" },
  { label: "Joining Fees", value: "joining" },
  { label: "Locker Rental", value: "locker" },
  { label: "Other Services", value: "other" },
];

// ─── Helpers ────────────────────────────────────────────────────────

const fmtCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

// ─── Mock Data Generator ──────────────────────────────────────────────────────

const getFilteredDashboardData = (filters: FiltersState) => {
  // Base metrics for 30d
  let baseRevenue = 450000;
  let baseGrowth = 12.4;

  if (filters.dateRange === "7d") {
    baseRevenue = 95000;
    baseGrowth = 8.2;
  } else if (filters.dateRange === "90d") {
    baseRevenue = 1350000;
    baseGrowth = 14.5;
  } else if (filters.dateRange === "year") {
    baseRevenue = 5400000;
    baseGrowth = 18.2;
  }

  // Branch coefficients
  let branchCoeff = 1.0;
  if (filters.branch === "mumbai") branchCoeff = 0.45;
  else if (filters.branch === "pune") branchCoeff = 0.30;
  else if (filters.branch === "delhi") branchCoeff = 0.25;

  // Plan coefficients
  let planCoeff = 1.0;
  if (filters.plan === "monthly") planCoeff = 0.20;
  else if (filters.plan === "quarterly") planCoeff = 0.25;
  else if (filters.plan === "half_yearly") planCoeff = 0.15;
  else if (filters.plan === "annual") planCoeff = 0.40;

  // Payment method coefficients
  let pmCoeff = 1.0;
  if (filters.paymentMethod === "upi") pmCoeff = 0.45;
  else if (filters.paymentMethod === "cash") pmCoeff = 0.15;
  else if (filters.paymentMethod === "credit_card") pmCoeff = 0.20;
  else if (filters.paymentMethod === "debit_card") pmCoeff = 0.08;
  else if (filters.paymentMethod === "bank_transfer") pmCoeff = 0.07;
  else if (filters.paymentMethod === "online_gateway") pmCoeff = 0.05;

  // Trainer coefficients
  let trainerCoeff = 1.0;
  if (filters.trainer !== "all") trainerCoeff = 0.22; // PT specific drop

  // Revenue type coefficients
  let typeCoeff = 1.0;
  if (filters.revenueType === "membership") typeCoeff = 0.65;
  else if (filters.revenueType === "pt") typeCoeff = 0.20;
  else if (filters.revenueType === "supplements") typeCoeff = 0.08;
  else if (filters.revenueType === "joining") typeCoeff = 0.03;
  else if (filters.revenueType === "locker") typeCoeff = 0.02;
  else if (filters.revenueType === "other") typeCoeff = 0.02;

  // Combined factor
  const factor = branchCoeff * planCoeff * pmCoeff * trainerCoeff * typeCoeff;

  const totalRevenue = Math.round(baseRevenue * factor);
  const taxCollected = Math.round(totalRevenue * 0.0844); // CGST/SGST ~ 18% on taxable subtotal
  const pendingPayments = Math.round(totalRevenue * 0.044);
  const refundAmount = Math.round(totalRevenue * 0.026);
  const netRevenue = totalRevenue - refundAmount;
  const growthPercentage = Number((baseGrowth * (0.95 + Math.random() * 0.1)).toFixed(1));

  // Generate charts data
  let trendDates: string[] = [];
  let trendCurrent: number[] = [];
  let trendPrevious: number[] = [];

  if (filters.dateRange === "7d") {
    trendDates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyBase = totalRevenue / 7;
    trendCurrent = Array.from({ length: 7 }, () => Math.round(dailyBase * (0.8 + Math.random() * 0.4)));
    trendPrevious = Array.from({ length: 7 }, () => Math.round(dailyBase * 0.92 * (0.8 + Math.random() * 0.4)));
  } else if (filters.dateRange === "30d") {
    trendDates = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const weeklyBase = totalRevenue / 4;
    trendCurrent = Array.from({ length: 4 }, () => Math.round(weeklyBase * (0.85 + Math.random() * 0.3)));
    trendPrevious = Array.from({ length: 4 }, () => Math.round(weeklyBase * 0.9 * (0.85 + Math.random() * 0.3)));
  } else if (filters.dateRange === "90d") {
    trendDates = ["Month 1", "Month 2", "Month 3"];
    const monthlyBase = totalRevenue / 3;
    trendCurrent = Array.from({ length: 3 }, () => Math.round(monthlyBase * (0.9 + Math.random() * 0.2)));
    trendPrevious = Array.from({ length: 3 }, () => Math.round(monthlyBase * 0.88 * (0.9 + Math.random() * 0.2)));
  } else {
    trendDates = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyBase = totalRevenue / 12;
    trendCurrent = Array.from({ length: 12 }, () => Math.round(monthlyBase * (0.75 + Math.random() * 0.5)));
    trendPrevious = Array.from({ length: 12 }, () => Math.round(monthlyBase * 0.85 * (0.75 + Math.random() * 0.5)));
  }

  // Sparkline generator
  const getSparkline = (baseVal: number, direction: "up" | "down" | "flat" | "wave") => {
    const length = 8;
    return Array.from({ length }, (_, i) => {
      let coeff = 1.0;
      if (direction === "up") coeff = 0.7 + (i / length) * 0.4 + Math.random() * 0.1;
      else if (direction === "down") coeff = 1.2 - (i / length) * 0.5 - Math.random() * 0.1;
      else if (direction === "wave") coeff = 0.9 + Math.sin(i) * 0.15 + Math.random() * 0.08;
      else coeff = 0.95 + Math.random() * 0.1;
      return Math.round(baseVal * coeff);
    });
  };

  const sparklines = {
    totalRevenue: getSparkline(100, "up"),
    netRevenue: getSparkline(95, "up"),
    taxCollected: getSparkline(18, "flat"),
    pendingPayments: getSparkline(30, "down"),
    refundAmount: getSparkline(5, "wave"),
    growth: getSparkline(12, "wave"),
  };

  // Breakdown by Source
  const sources = [
    { label: "Membership Plans", valKey: "membership", ratio: 0.65, color: "#4318FF" },
    { label: "Personal Training", valKey: "pt", ratio: 0.20, color: "#6AD2FF" },
    { label: "Supplement Sales", valKey: "supplements", ratio: 0.08, color: "#FFB547" },
    { label: "Joining Fees", valKey: "joining", ratio: 0.03, color: "#05CD99" },
    { label: "Locker Rental", valKey: "locker", ratio: 0.02, color: "#EE5D50" },
    { label: "Other Services", valKey: "other", ratio: 0.02, color: "#B085FF" },
  ];

  let revenueBreakdown = sources.map((s) => {
    let sourceAmount = 0;
    if (filters.revenueType === "all" || filters.revenueType === s.valKey) {
      sourceAmount = filters.revenueType === s.valKey ? totalRevenue : Math.round(totalRevenue * s.ratio);
    }
    return {
      name: s.label,
      value: sourceAmount,
      percentage: 0,
      color: s.color,
    };
  });

  const totalBreakdownAmt = revenueBreakdown.reduce((sum, item) => sum + item.value, 0);
  if (totalBreakdownAmt > 0) {
    revenueBreakdown = revenueBreakdown.map((item) => ({
      ...item,
      percentage: Number(((item.value / totalBreakdownAmt) * 100).toFixed(1)),
    }));
  }

  // Tax Report details
  const taxableRevenue = Math.round(totalRevenue * 0.82);
  const gstCollected = taxCollected;
  const cgstAmount = Math.round(gstCollected / 2);
  const sgstAmount = gstCollected - cgstAmount;
  const taxExemptRevenue = totalRevenue - taxableRevenue;
  const taxPercentage = 18;

  const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const taxMonthlyTrend = monthsList.map((m) => ({
    month: m,
    amount: Math.round((gstCollected / 12) * (0.8 + Math.random() * 0.4)),
  }));

  // Payment Method Analytics
  const pms = [
    { label: "UPI", valKey: "upi", ratio: 0.45, color: "#4318FF" },
    { label: "Cash", valKey: "cash", ratio: 0.15, color: "#05CD99" },
    { label: "Credit Card", valKey: "credit_card", ratio: 0.20, color: "#FFB547" },
    { label: "Debit Card", valKey: "debit_card", ratio: 0.08, color: "#EE5D50" },
    { label: "Bank Transfer", valKey: "bank_transfer", ratio: 0.07, color: "#6AD2FF" },
    { label: "Online Gateway", valKey: "online_gateway", ratio: 0.05, color: "#B085FF" },
  ];

  let paymentMethodAnalytics = pms.map((p) => {
    let pmAmount = 0;
    if (filters.paymentMethod === "all" || filters.paymentMethod === p.valKey) {
      pmAmount = filters.paymentMethod === p.valKey ? totalRevenue : Math.round(totalRevenue * p.ratio);
    }
    return {
      method: p.label,
      amount: pmAmount,
      percentage: 0,
      color: p.color,
    };
  });

  const totalPMAmt = paymentMethodAnalytics.reduce((sum, item) => sum + item.amount, 0);
  if (totalPMAmt > 0) {
    paymentMethodAnalytics = paymentMethodAnalytics.map((item) => ({
      ...item,
      percentage: Number(((item.amount / totalPMAmt) * 100).toFixed(1)),
    }));
  }

  // Membership plans
  const plansList = [
    { name: "Monthly Plan", ratio: 0.20, members: 120 },
    { name: "Quarterly Plan", ratio: 0.25, members: 85 },
    { name: "Half Yearly Plan", ratio: 0.15, members: 45 },
    { name: "Annual Plan", ratio: 0.40, members: 60 },
  ];

  const membershipRevenue = plansList.map((p) => {
    const planRev = Math.round(totalRevenue * p.ratio);
    const planMembers = Math.round(p.members * branchCoeff);
    return {
      planName: p.name,
      memberCount: planMembers,
      revenue: planRev,
      avgRevenue: planMembers > 0 ? Math.round(planRev / planMembers) : 0,
    };
  });

  // Trainers performance
  const trainersList = [
    { name: "Amit Sharma", sessions: 45, revenueRatio: 0.35 },
    { name: "Priya Patel", sessions: 38, revenueRatio: 0.30 },
    { name: "Rajesh Kumar", sessions: 25, revenueRatio: 0.20 },
    { name: "Sneha Reddy", sessions: 20, revenueRatio: 0.15 },
  ];

  const ptRevenueTotal = Math.round(totalRevenue * 0.20);
  const trainerRevenue = trainersList.map((t) => {
    const trainerRev = Math.round(ptRevenueTotal * t.revenueRatio);
    const commission = Math.round(trainerRev * 0.15);
    return {
      trainerName: t.name,
      sessions: Math.round(t.sessions * branchCoeff),
      revenue: trainerRev,
      commission,
    };
  });

  // Unpaid/outstanding members
  const outstandingData = [
    { name: "Kunal Sen", amount: 4500, dueDate: "2026-06-05", status: "Overdue" },
    { name: "Meera Nair", amount: 7200, dueDate: "2026-06-02", status: "Overdue" },
    { name: "Rohan Das", amount: 3000, dueDate: "2026-06-10", status: "Unpaid" },
    { name: "Aditi Rao", amount: 12000, dueDate: "2026-05-20", status: "Overdue" },
    { name: "Siddharth Malhotra", amount: 5000, dueDate: "2026-06-11", status: "Unpaid" },
  ];

  const outstandingPayments = outstandingData.map((o) => {
    const dueTime = new Date(o.dueDate).getTime();
    const nowTime = new Date("2026-06-12").getTime();
    const daysOverdue = Math.max(0, Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24)));
    return {
      memberName: o.name,
      pendingAmount: Math.round(o.amount * (0.8 + Math.random() * 0.4)),
      dueDate: o.dueDate,
      daysOverdue,
      status: o.status,
    };
  });

  // Discounts analysis
  const discountData = [
    { label: "Coupon Discounts", ratio: 0.45, color: "#4318FF" },
    { label: "Referral Discounts", ratio: 0.25, color: "#05CD99" },
    { label: "Manual Discounts", ratio: 0.18, color: "#FFB547" },
    { label: "Promotional Discounts", ratio: 0.12, color: "#B085FF" },
  ];

  const totalDiscountsProvided = Math.round(totalRevenue * 0.05);
  const discountAnalysis = discountData.map((d) => {
    const amt = Math.round(totalDiscountsProvided * d.ratio);
    return {
      category: d.label,
      amount: amt,
      percentage: totalDiscountsProvided > 0 ? Number(((amt / totalDiscountsProvided) * 100).toFixed(1)) : 0,
      color: d.color,
    };
  });

  // Refund and Cancellation
  const refundCancellation = {
    refundAmount,
    cancellationCount: Math.round(18 * branchCoeff),
    refundPercentage: totalRevenue > 0 ? Number(((refundAmount / totalRevenue) * 100).toFixed(1)) : 0,
  };

  // Invoice Report table
  const invoicesData = [
    { id: "INV-2026-001", name: "Aarav Mehta", amount: 15000, tax: 2700, status: "Paid", date: "2026-06-11" },
    { id: "INV-2026-002", name: "Ishaan Sharma", amount: 4500, tax: 810, status: "Paid", date: "2026-06-10" },
    { id: "INV-2026-003", name: "Ananya Iyer", amount: 7200, tax: 1296, status: "Pending", date: "2026-06-09" },
    { id: "INV-2026-004", name: "Kabir Kapoor", amount: 12000, tax: 2160, status: "Paid", date: "2026-06-08" },
    { id: "INV-2026-005", name: "Riya Verma", amount: 3000, tax: 540, status: "Failed", date: "2026-06-07" },
    { id: "INV-2026-006", name: "Dev Patel", amount: 9500, tax: 1710, status: "Paid", date: "2026-06-06" },
  ];

  const invoiceReport = invoicesData.map((i) => ({
    invoiceId: i.id,
    memberName: i.name,
    amount: Math.round(i.amount * (0.9 + Math.random() * 0.2)),
    taxAmount: Math.round(i.tax * (0.9 + Math.random() * 0.2)),
    status: i.status as "Paid" | "Pending" | "Failed",
    date: i.date,
  }));

  // Branch revenues
  const branchData = [
    { name: "Mumbai Branch", ratio: 0.45, color: "#4318FF" },
    { name: "Pune Branch", ratio: 0.30, color: "#05CD99" },
    { name: "Delhi Branch", ratio: 0.25, color: "#FFB547" },
  ];

  const branchComparison = branchData.map((b) => {
    const amt = Math.round(totalRevenue * b.ratio);
    return {
      branchName: b.name,
      amount: amt,
      percentage: totalRevenue > 0 ? Number(((amt / totalRevenue) * 100).toFixed(1)) : 0,
      color: b.color,
    };
  });

  return {
    metrics: {
      totalRevenue,
      netRevenue,
      taxCollected,
      pendingPayments,
      refundAmount,
      growthPercentage,
    },
    sparklines,
    revenueTrend: {
      dates: trendDates,
      current: trendCurrent,
      previous: trendPrevious,
    },
    revenueBreakdown,
    taxReport: {
      taxableRevenue,
      gstCollected,
      cgstAmount,
      sgstAmount,
      taxExemptRevenue,
      taxPercentage,
      monthlyTrend: taxMonthlyTrend,
    },
    paymentMethodAnalytics,
    membershipRevenue,
    trainerRevenue,
    outstandingPayments,
    discountAnalysis,
    refundCancellation,
    invoiceReport,
    branchComparison,
  };
};

// ─── Reusable ECharts Wrapper Component ──────────────────────────────────────

const EChartsReact = memo(({ option, height = "300px", loading = false }: EChartsReactProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const isDark = useColorModeValue(false, true);

  // Initialise
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current);
    chartInstanceRef.current = chart;

    return () => {
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  // Update Options & Theme Loading States
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    if (loading) {
      chart.showLoading("default", {
        text: "",
        color: isDark ? "#7551FF" : "#4318FF",
        textColor: isDark ? "#FFFFFF" : "#2B3674",
        maskColor: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.4)",
      });
    } else {
      chart.hideLoading();
      chart.setOption(option, true);
    }
  }, [option, loading, isDark]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <Box ref={containerRef} w="full" h={height} minH={height} />;
});
EChartsReact.displayName = "EChartsReact";

// ─── Sub-Components ─────────────────────────────────────────────────────────

// Sparkline Mini Option Helper
const getSparklineOption = (data: number[], color: string, isDark: boolean): echarts.EChartsOption => ({
  grid: { left: 0, right: 0, top: 2, bottom: 2 },
  xAxis: { type: "category", show: false },
  yAxis: { type: "value", show: false },
  series: [
    {
      data,
      type: "line",
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 1.5, color },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${color}33` },
          { offset: 1, color: `${color}00` },
        ]),
      },
    },
  ],
});

interface MetricCardProps {
  label: string;
  value: string;
  growth: string;
  isPositive: boolean;
  icon: React.ElementType;
  accent: string;
  sparklineData: number[];
}

const MetricCard = memo(({ label, value, growth, isPositive, icon, accent, sparklineData }: MetricCardProps) => {
  const isDark = useColorModeValue(false, true);
  const cardBg = "app.card.bg";
  const cardBorder = "app.card.border";
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.800", "white");

  const sparklineOption = useMemo(
    () => getSparklineOption(sparklineData, accent, isDark),
    [sparklineData, accent, isDark]
  );

  return (
    <Box
      p={5}
      borderRadius="24px"
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      backdropFilter="blur(20px) saturate(160%)"
      boxShadow="sm"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
    >
      <HStack justify="space-between" align="start" mb={2}>
        <VStack align="start" gap={0.5}>
          <Text fontSize="xs" fontWeight="800" color={mutedText} textTransform="uppercase" letterSpacing="wider">
            {label}
          </Text>
          <Heading size="lg" fontWeight="900" color={valueColor} letterSpacing="tight">
            {value}
          </Heading>
        </VStack>
        <Circle size="10" bg={`${accent}15`} color={accent}>
          <Icon as={icon} boxSize={5} />
        </Circle>
      </HStack>

      <HStack justify="space-between" mt={3} gap={4}>
        <HStack gap={1}>
          <Badge colorPalette={isPositive ? "green" : "red"} variant="subtle" size="sm" borderRadius="full">
            {isPositive ? "+" : ""}
            {growth}
          </Badge>
          <Text fontSize="2xs" color={mutedText} fontWeight="700">
            vs last month
          </Text>
        </HStack>
        <Box w="60px" h="25px">
          <EChartsReact option={sparklineOption} height="25px" />
        </Box>
      </HStack>
    </Box>
  );
});
MetricCard.displayName = "MetricCard";

// ─── Main Page Component ─────────────────────────────────────────────────────

const RevenueReport = memo(() => {
  const [filters, setFilters] = useState<FiltersState>({
    dateRange: "30d",
    branch: "all",
    plan: "all",
    paymentMethod: "all",
    trainer: "all",
    revenueType: "all",
  });

  const [loading, setLoading] = useState(false);
  const isDark = useColorModeValue(false, true);

  // Recalculate mock data on filter change
  const data = useMemo(() => getFilteredDashboardData(filters), [filters]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toaster.create({
        title: "Report Updated",
        description: "Dashboard reports have been successfully refreshed.",
        type: "success",
      });
    }, 600);
  }, []);

  // Stable filter change handlers to prevent unnecessary re-renders
  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, dateRange: e.target.value }));
  }, []);

  const handleBranchChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, branch: e.target.value }));
  }, []);

  const handlePlanChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, plan: e.target.value }));
  }, []);

  const handleMethodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, paymentMethod: e.target.value }));
  }, []);

  const handleTrainerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, trainer: e.target.value }));
  }, []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, revenueType: e.target.value }));
  }, []);

  // Export handlers
  const handleExportPDF = useCallback(() => {
    toaster.create({
      title: "PDF Export Started",
      description: "Compiling document layout... PDF report will download shortly.",
      type: "info",
    });
  }, []);

  const handleExportExcel = useCallback(() => {
    toaster.create({
      title: "Excel Export Started",
      description: "Compiling spreadsheet... Excel report downloaded.",
      type: "success",
    });
  }, []);

  const handleEmailReport = useCallback(() => {
    toaster.create({
      title: "Email Request Dispatched",
      description: "Financial intelligence reports dispatched to branch admins.",
      type: "success",
    });
  }, []);

  // ─── Theme Aware Chart Options ─────────────────────────────────────────────

  // 1. Revenue Trend Option
  const revenueTrendOption = useMemo((): echarts.EChartsOption => {
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0";

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A" },
        formatter: (params: any) => {
          let res = `<div style="font-weight: 700; margin-bottom: 4px;">${params[0].name}</div>`;
          params.forEach((p: any) => {
            res += `<div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px;">
              <span style="display: flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${p.color}; display: inline-block;"></span>
                ${p.seriesName}:
              </span>
              <b>${fmtCurrency(p.value)}</b>
            </div>`;
          });
          return res;
        },
      },
      legend: {
        bottom: 0,
        textStyle: { color: textColor, fontWeight: 700, fontSize: 11 },
        icon: "circle",
      },
      grid: { top: "12%", left: "3%", right: "3%", bottom: "12%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.revenueTrend.dates,
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: {
          color: textColor,
          fontWeight: 700,
          fontSize: 10,
          formatter: (v: any) => fmtCurrency(v).replace("₹", ""),
        },
      },
      series: [
        {
          name: "Current Period",
          type: "line",
          data: data.revenueTrend.current,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3, color: "#4318FF" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(67, 24, 255, 0.25)" },
              { offset: 1, color: "rgba(67, 24, 255, 0.0)" },
            ]),
          },
        },
        {
          name: "Previous Period",
          type: "line",
          data: data.revenueTrend.previous,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, type: "dashed", color: isDark ? "#707EAE" : "#A3AED0" },
        },
      ],
    };
  }, [data.revenueTrend, isDark]);

  // 2. Revenue Source Pie Option
  const revenuePieOption = useMemo((): echarts.EChartsOption => {
    const textColor = isDark ? "#F8FAFC" : "#0F172A";

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        textStyle: { color: textColor },
        formatter: "{b}: <b>{c} ({d}%)</b>",
      },
      legend: {
        orient: "vertical",
        right: "5%",
        top: "middle",
        textStyle: { color: isDark ? "#94A3B8" : "#64748B", fontWeight: 700, fontSize: 10 },
        icon: "circle",
        itemGap: 10,
      },
      series: [
        {
          name: "Revenue Sources",
          type: "pie",
          radius: ["55%", "78%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: true,
          padAngle: 3,
          itemStyle: {
            borderRadius: 6,
            borderColor: isDark ? "#111C44" : "#FFFFFF",
            borderWidth: 2,
          },
          label: { show: false },
          labelLine: { show: false },
          data: data.revenueBreakdown.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color },
          })),
        },
      ],
    };
  }, [data.revenueBreakdown, isDark]);

  // 3. Tax Trend Option
  const taxTrendOption = useMemo((): echarts.EChartsOption => {
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0";

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A" },
      },
      grid: { top: "15%", left: "4%", right: "4%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: data.taxReport.monthlyTrend.map((t) => t.month),
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: {
          color: textColor,
          fontWeight: 700,
          fontSize: 10,
          formatter: (v: any) => fmtCurrency(v).replace("₹", ""),
        },
      },
      series: [
        {
          name: "GST Collection",
          type: "bar",
          data: data.taxReport.monthlyTrend.map((t) => t.amount),
          barWidth: "40%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#05CD99" },
              { offset: 1, color: "rgba(5, 205, 153, 0.2)" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }, [data.taxReport, isDark]);

  // 4. Payment Method Analytics Option
  const paymentMethodOption = useMemo((): echarts.EChartsOption => {
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0";

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A" },
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}: <b>${fmtCurrency(item.value)}</b>`;
        },
      },
      grid: { top: "5%", left: "4%", right: "8%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: {
          color: textColor,
          fontWeight: 700,
          fontSize: 10,
          formatter: (v: any) => fmtCurrency(v).replace("₹", ""),
        },
      },
      yAxis: {
        type: "category",
        data: data.paymentMethodAnalytics.map((p) => p.method),
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      series: [
        {
          name: "Payment Collection",
          type: "bar",
          data: data.paymentMethodAnalytics.map((p) => p.amount),
          barWidth: "45%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "rgba(117, 81, 255, 0.2)" },
              { offset: 1, color: "#7551FF" },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
        },
      ],
    };
  }, [data.paymentMethodAnalytics, isDark]);

  // 5. Multi Branch Comparison Option
  const branchComparisonOption = useMemo((): echarts.EChartsOption => {
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0";

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A" },
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}: <b>${fmtCurrency(item.value)}</b>`;
        },
      },
      grid: { top: "15%", left: "4%", right: "4%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: data.branchComparison.map((b) => b.branchName),
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: {
          color: textColor,
          fontWeight: 700,
          fontSize: 10,
          formatter: (v: any) => fmtCurrency(v).replace("₹", ""),
        },
      },
      series: [
        {
          name: "Branch Revenue",
          type: "bar",
          data: data.branchComparison.map((b) => b.amount),
          barWidth: "35%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#4318FF" },
              { offset: 1, color: "rgba(67, 24, 255, 0.2)" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }, [data.branchComparison, isDark]);

  // Color mode design styles
  const panelBg = "app.card.bg";
  const cardBorder = "app.card.border";
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.800", "white");
  const tableHeaderBg = useColorModeValue("gray.50", "navy.900");

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      <PageHeader
        title="Revenue Analytics & Tax Report"
        subtitle="Financial intelligence platform for multi-branch membership tracking, payment collection, taxes, and refunds."
        icon={Wallet}
        badge="Financial Intelligence"
        accentColor="blue"
      />

      <VStack align="stretch" gap={6} pb={8}>
        {/* ─── Financial Filters & Export Actions ─────────────────────── */}
        <Box
          p={5}
          borderRadius="24px"
          bg={panelBg}
          border="1px solid"
          borderColor={cardBorder}
          backdropFilter="blur(20px) saturate(160%)"
        >
          <Grid templateColumns={{ base: "1fr", xl: "1fr auto" }} gap={5} alignItems="center">
            {/* Dynamic Select Dropdowns */}
            <GridItem>
              <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={3}>
                <VStack align="stretch" gap={1}>
                  <Text fontSize="10px" fontWeight="900" color={mutedText} textTransform="uppercase">
                    Date Range
                  </Text>
                  <NativeSelectRoot>
                    <NativeSelectField
                      h="36px"
                      fontSize="xs"
                      borderRadius="12px"
                      bg="app.input.bg"
                      borderColor={cardBorder}
                      color="text.default"
                      fontWeight="700"
                      value={filters.dateRange}
                      onChange={handleDateRangeChange}
                    >
                      {DATE_RANGES.map((d) => (
                        <option
                          key={d.value}
                          value={d.value}
                          style={{
                            backgroundColor: isDark ? "#111C44" : "#FFFFFF",
                            color: isDark ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {d.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </VStack>

                <VStack align="stretch" gap={1}>
                  <Text fontSize="10px" fontWeight="900" color={mutedText} textTransform="uppercase">
                    Branch Selection
                  </Text>
                  <NativeSelectRoot>
                    <NativeSelectField
                      h="36px"
                      fontSize="xs"
                      borderRadius="12px"
                      bg="app.input.bg"
                      borderColor={cardBorder}
                      color="text.default"
                      fontWeight="700"
                      value={filters.branch}
                      onChange={handleBranchChange}
                    >
                      {BRANCHES.map((b) => (
                        <option
                          key={b.value}
                          value={b.value}
                          style={{
                            backgroundColor: isDark ? "#111C44" : "#FFFFFF",
                            color: isDark ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {b.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </VStack>

                <VStack align="stretch" gap={1}>
                  <Text fontSize="10px" fontWeight="900" color={mutedText} textTransform="uppercase">
                    Membership Plan
                  </Text>
                  <NativeSelectRoot>
                    <NativeSelectField
                      h="36px"
                      fontSize="xs"
                      borderRadius="12px"
                      bg="app.input.bg"
                      borderColor={cardBorder}
                      color="text.default"
                      fontWeight="700"
                      value={filters.plan}
                      onChange={handlePlanChange}
                    >
                      {MEMBERSHIP_PLANS.map((m) => (
                        <option
                          key={m.value}
                          value={m.value}
                          style={{
                            backgroundColor: isDark ? "#111C44" : "#FFFFFF",
                            color: isDark ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {m.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </VStack>

                <VStack align="stretch" gap={1}>
                  <Text fontSize="10px" fontWeight="900" color={mutedText} textTransform="uppercase">
                    Payment Method
                  </Text>
                  <NativeSelectRoot>
                    <NativeSelectField
                      h="36px"
                      fontSize="xs"
                      borderRadius="12px"
                      bg="app.input.bg"
                      borderColor={cardBorder}
                      color="text.default"
                      fontWeight="700"
                      value={filters.paymentMethod}
                      onChange={handleMethodChange}
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <option
                          key={pm.value}
                          value={pm.value}
                          style={{
                            backgroundColor: isDark ? "#111C44" : "#FFFFFF",
                            color: isDark ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {pm.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </VStack>

                <VStack align="stretch" gap={1}>
                  <Text fontSize="10px" fontWeight="900" color={mutedText} textTransform="uppercase">
                    Trainer
                  </Text>
                  <NativeSelectRoot>
                    <NativeSelectField
                      h="36px"
                      fontSize="xs"
                      borderRadius="12px"
                      bg="app.input.bg"
                      borderColor={cardBorder}
                      color="text.default"
                      fontWeight="700"
                      value={filters.trainer}
                      onChange={handleTrainerChange}
                    >
                      {TRAINERS.map((t) => (
                        <option
                          key={t.value}
                          value={t.value}
                          style={{
                            backgroundColor: isDark ? "#111C44" : "#FFFFFF",
                            color: isDark ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {t.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </VStack>

                <VStack align="stretch" gap={1}>
                  <Text fontSize="10px" fontWeight="900" color={mutedText} textTransform="uppercase">
                    Revenue Type
                  </Text>
                  <NativeSelectRoot>
                    <NativeSelectField
                      h="36px"
                      fontSize="xs"
                      borderRadius="12px"
                      bg="app.input.bg"
                      borderColor={cardBorder}
                      color="text.default"
                      fontWeight="700"
                      value={filters.revenueType}
                      onChange={handleTypeChange}
                    >
                      {REVENUE_TYPES.map((rt) => (
                        <option
                          key={rt.value}
                          value={rt.value}
                          style={{
                            backgroundColor: isDark ? "#111C44" : "#FFFFFF",
                            color: isDark ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {rt.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </VStack>
              </SimpleGrid>
            </GridItem>

            {/* Action Buttons */}
            <GridItem display="flex" alignItems="flex-end">
              <HStack gap={2} w="full" justify={{ base: "stretch", xl: "flex-end" }}>
                <Button
                  size="sm"
                  h="36px"
                  borderRadius="12px"
                  variant="subtle"
                  colorPalette="blue"
                  fontWeight="800"
                  fontSize="xs"
                  onClick={handleExportPDF}
                >
                  <FileDown size={14} /> PDF
                </Button>
                <Button
                  size="sm"
                  h="36px"
                  borderRadius="12px"
                  variant="subtle"
                  colorPalette="green"
                  fontWeight="800"
                  fontSize="xs"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet size={14} /> Excel
                </Button>
                <Button
                  size="sm"
                  h="36px"
                  borderRadius="12px"
                  variant="subtle"
                  colorPalette="purple"
                  fontWeight="800"
                  fontSize="xs"
                  onClick={handleEmailReport}
                >
                  <Mail size={14} /> Email
                </Button>
                <Button
                  size="sm"
                  h="36px"
                  w="36px"
                  borderRadius="12px"
                  variant="outline"
                  borderColor={cardBorder}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw size={14} className={loading ? "spin" : ""} />
                </Button>
              </HStack>
            </GridItem>
          </Grid>
        </Box>

        {/* ─── Top Summary Cards ──────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} gap={4}>
          <MetricCard
            label="Total Revenue"
            value={fmtCurrency(data.metrics.totalRevenue)}
            growth={`${data.metrics.growthPercentage}%`}
            isPositive={data.metrics.growthPercentage > 0}
            icon={Wallet}
            accent="#4318FF"
            sparklineData={data.sparklines.totalRevenue}
          />
          <MetricCard
            label="Net Revenue"
            value={fmtCurrency(data.metrics.netRevenue)}
            growth={`${(data.metrics.growthPercentage * 0.95).toFixed(1)}%`}
            isPositive={data.metrics.growthPercentage > 0}
            icon={TrendingUp}
            accent="#05CD99"
            sparklineData={data.sparklines.netRevenue}
          />
          <MetricCard
            label="Tax Collected"
            value={fmtCurrency(data.metrics.taxCollected)}
            growth="14.2%"
            isPositive={true}
            icon={Percent}
            accent="#FFB547"
            sparklineData={data.sparklines.taxCollected}
          />
          <MetricCard
            label="Pending Payments"
            value={fmtCurrency(data.metrics.pendingPayments)}
            growth="-5.4%"
            isPositive={false}
            icon={Clock}
            accent="#EE5D50"
            sparklineData={data.sparklines.pendingPayments}
          />
          <MetricCard
            label="Refund Amount"
            value={fmtCurrency(data.metrics.refundAmount)}
            growth="-8.1%"
            isPositive={false}
            icon={XCircle}
            accent="#B085FF"
            sparklineData={data.sparklines.refundAmount}
          />
          <MetricCard
            label="Monthly Growth"
            value={`${data.metrics.growthPercentage}%`}
            growth="+2.1%"
            isPositive={true}
            icon={Activity}
            accent="#6AD2FF"
            sparklineData={data.sparklines.growth}
          />
        </SimpleGrid>

        {/* ─── Revenue Trend & Breakdown Row ──────────────────────────── */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Revenue Trend Line Chart */}
          <GridItem
            p={5}
            borderRadius="24px"
            bg={panelBg}
            border="1px solid"
            borderColor={cardBorder}
            backdropFilter="blur(20px) saturate(160%)"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <VStack align="start" gap={0}>
                <Heading size="sm" fontWeight="900" color={valueColor}>
                  Revenue Trend
                </Heading>
                <Text fontSize="2xs" color={mutedText} fontWeight="600">
                  Compare current selected range vs previous period
                </Text>
              </VStack>
            </Flex>
            <EChartsReact option={revenueTrendOption} height="320px" loading={loading} />
          </GridItem>

          {/* Revenue Source Breakdown Donut Chart */}
          <GridItem
            p={5}
            borderRadius="24px"
            bg={panelBg}
            border="1px solid"
            borderColor={cardBorder}
            backdropFilter="blur(20px) saturate(160%)"
            position="relative"
          >
            <VStack align="start" gap={0} mb={4}>
              <Heading size="sm" fontWeight="900" color={valueColor}>
                Revenue Breakdown
              </Heading>
              <Text fontSize="2xs" color={mutedText} fontWeight="600">
                Source split by service categories
              </Text>
            </VStack>
            <Box h="280px" w="full" position="relative">
              <EChartsReact option={revenuePieOption} height="280px" loading={loading} />
              {/* Donut Center Summary */}
              <Box
                position="absolute"
                top="46%"
                left="35%"
                transform="translate(-50%, -50%)"
                textAlign="center"
                pointerEvents="none"
              >
                <Text fontSize="10px" fontWeight="900" color={mutedText} textTransform="uppercase" letterSpacing="wider">
                  Total
                </Text>
                <Text fontSize="sm" fontWeight="900" color={valueColor}>
                  {fmtCurrency(data.metrics.totalRevenue)}
                </Text>
              </Box>
            </Box>
          </GridItem>
        </Grid>

        {/* ─── Tax Collection Report Section ──────────────────────────── */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Tax Metrics Panel */}
          <GridItem
            p={5}
            borderRadius="24px"
            bg={panelBg}
            border="1px solid"
            borderColor={cardBorder}
            backdropFilter="blur(20px) saturate(160%)"
          >
            <VStack align="stretch" gap={4} h="full" justify="space-between">
              <VStack align="start" gap={0}>
                <Heading size="sm" fontWeight="900" color={valueColor}>
                  Tax Collection Analytics
                </Heading>
                <Text fontSize="2xs" color={mutedText} fontWeight="600">
                  GST breakdown for the selected period
                </Text>
              </VStack>

              <SimpleGrid columns={2} gap={4}>
                <Box p={4} borderRadius="20px" bg={useColorModeValue("gray.50", "rgba(255,255,255,0.02)")}>
                  <Text fontSize="2xs" color={mutedText} fontWeight="700">
                    TAXABLE REVENUE
                  </Text>
                  <Text fontSize="md" fontWeight="900" color={valueColor}>
                    {fmtCurrency(data.taxReport.taxableRevenue)}
                  </Text>
                </Box>
                <Box p={4} borderRadius="20px" bg={useColorModeValue("gray.50", "rgba(255,255,255,0.02)")}>
                  <Text fontSize="2xs" color={mutedText} fontWeight="700">
                    GST COLLECTED
                  </Text>
                  <Text fontSize="md" fontWeight="900" color="#05CD99">
                    {fmtCurrency(data.taxReport.gstCollected)}
                  </Text>
                </Box>
                <Box p={4} borderRadius="20px" bg={useColorModeValue("gray.50", "rgba(255,255,255,0.02)")}>
                  <Text fontSize="2xs" color={mutedText} fontWeight="700">
                    CGST AMOUNT (9%)
                  </Text>
                  <Text fontSize="md" fontWeight="900" color={valueColor}>
                    {fmtCurrency(data.taxReport.cgstAmount)}
                  </Text>
                </Box>
                <Box p={4} borderRadius="20px" bg={useColorModeValue("gray.50", "rgba(255,255,255,0.02)")}>
                  <Text fontSize="2xs" color={mutedText} fontWeight="700">
                    SGST AMOUNT (9%)
                  </Text>
                  <Text fontSize="md" fontWeight="900" color={valueColor}>
                    {fmtCurrency(data.taxReport.sgstAmount)}
                  </Text>
                </Box>
                <Box p={4} borderRadius="20px" bg={useColorModeValue("gray.50", "rgba(255,255,255,0.02)")}>
                  <Text fontSize="2xs" color={mutedText} fontWeight="700">
                    TAX EXEMPT REVENUE
                  </Text>
                  <Text fontSize="md" fontWeight="900" color={valueColor}>
                    {fmtCurrency(data.taxReport.taxExemptRevenue)}
                  </Text>
                </Box>
                <Box p={4} borderRadius="20px" bg={useColorModeValue("gray.50", "rgba(255,255,255,0.02)")}>
                  <Text fontSize="2xs" color={mutedText} fontWeight="700">
                    TAX PERCENTAGE
                  </Text>
                  <Text fontSize="md" fontWeight="900" color={valueColor}>
                    {data.taxReport.taxPercentage}%
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </GridItem>

          {/* Tax Trend Chart */}
          <GridItem
            p={5}
            borderRadius="24px"
            bg={panelBg}
            border="1px solid"
            borderColor={cardBorder}
            backdropFilter="blur(20px) saturate(160%)"
          >
            <VStack align="start" gap={0} mb={4}>
              <Heading size="sm" fontWeight="900" color={valueColor}>
                Tax Collection Trend
              </Heading>
              <Text fontSize="2xs" color={mutedText} fontWeight="600">
                Monthly GST collection values
              </Text>
            </VStack>
            <EChartsReact option={taxTrendOption} height="230px" loading={loading} />
          </GridItem>
        </Grid>

        {/* ─── Payment Methods & Branch Comparison ────────────────────── */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Payment Method Bar Chart */}
          <GridItem
            p={5}
            borderRadius="24px"
            bg={panelBg}
            border="1px solid"
            borderColor={cardBorder}
            backdropFilter="blur(20px) saturate(160%)"
          >
            <VStack align="start" gap={0} mb={4}>
              <Heading size="sm" fontWeight="900" color={valueColor}>
                Payment Method Analytics
              </Heading>
              <Text fontSize="2xs" color={mutedText} fontWeight="600">
                Revenue collection distribution channels
              </Text>
            </VStack>
            <EChartsReact option={paymentMethodOption} height="240px" loading={loading} />
          </GridItem>

          {/* Branch Revenue Comparison */}
          <GridItem
            p={5}
            borderRadius="24px"
            bg={panelBg}
            border="1px solid"
            borderColor={cardBorder}
            backdropFilter="blur(20px) saturate(160%)"
          >
            <VStack align="start" gap={0} mb={4}>
              <Heading size="sm" fontWeight="900" color={valueColor}>
                Multi-Branch Revenue Comparison
              </Heading>
              <Text fontSize="2xs" color={mutedText} fontWeight="600">
                Revenue comparison across gym branches
              </Text>
            </VStack>
            <EChartsReact option={branchComparisonOption} height="240px" loading={loading} />
          </GridItem>
        </Grid>

        {/* ─── Discounts, Refunds, & Cancellations ────────────────────── */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Discount Analysis */}
          <GridItem
            p={5}
            borderRadius="24px"
            bg={panelBg}
            border="1px solid"
            borderColor={cardBorder}
            backdropFilter="blur(20px) saturate(160%)"
          >
            <VStack align="stretch" gap={4}>
              <VStack align="start" gap={0}>
                <Heading size="sm" fontWeight="900" color={valueColor}>
                  Discount Analysis
                </Heading>
                <Text fontSize="2xs" color={mutedText} fontWeight="600">
                  Total promotional discounts provided by category
                </Text>
              </VStack>

              <VStack align="stretch" gap={3}>
                {data.discountAnalysis.map((d) => (
                  <VStack key={d.category} align="stretch" gap={1}>
                    <HStack justify="space-between" fontSize="xs">
                      <Text fontWeight="800" color={valueColor}>
                        {d.category}
                      </Text>
                      <Text fontWeight="900" color={mutedText}>
                        {fmtCurrency(d.amount)} ({d.percentage}%)
                      </Text>
                    </HStack>
                    <Box h="6px" bg="blackAlpha.100" borderRadius="full" overflow="hidden">
                      <Box h="full" w={`${d.percentage}%`} bg={d.color} borderRadius="full" />
                    </Box>
                  </VStack>
                ))}
              </VStack>
            </VStack>
          </GridItem>

          {/* Refund & Cancellation Analytics */}
          <GridItem
            p={5}
            borderRadius="24px"
            bg={panelBg}
            border="1px solid"
            borderColor={cardBorder}
            backdropFilter="blur(20px) saturate(160%)"
          >
            <VStack align="stretch" gap={5} h="full" justify="space-between">
              <VStack align="start" gap={0}>
                <Heading size="sm" fontWeight="900" color={valueColor}>
                  Refund & Cancellation Analytics
                </Heading>
                <Text fontSize="2xs" color={mutedText} fontWeight="600">
                  Revenue returns and membership terminations
                </Text>
              </VStack>

              <SimpleGrid columns={3} gap={4} textAlign="center" py={2}>
                <Box>
                  <Text fontSize="2xs" color={mutedText} fontWeight="800" mb={1}>
                    REFUND AMOUNT
                  </Text>
                  <Text fontSize="xl" fontWeight="900" color="#EE5D50">
                    {fmtCurrency(data.refundCancellation.refundAmount)}
                  </Text>
                </Box>
                <Box borderLeft="1px solid" borderRight="1px solid" borderColor={cardBorder}>
                  <Text fontSize="2xs" color={mutedText} fontWeight="800" mb={1}>
                    CANCELLATIONS
                  </Text>
                  <Text fontSize="xl" fontWeight="900" color={valueColor}>
                    {data.refundCancellation.cancellationCount}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="2xs" color={mutedText} fontWeight="800" mb={1}>
                    REFUND RATE
                  </Text>
                  <Text fontSize="xl" fontWeight="900" color={valueColor}>
                    {data.refundCancellation.refundPercentage}%
                  </Text>
                </Box>
              </SimpleGrid>

              <Box p={4} borderRadius="20px" bg={useColorModeValue("gray.50", "rgba(255,255,255,0.02)")}>
                <HStack gap={3}>
                  <Icon as={CreditCard} boxSize={5} color="#7551FF" />
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" fontWeight="900" color={valueColor}>
                      Cancellation Impact Minimal
                    </Text>
                    <Text fontSize="2xs" color={mutedText} fontWeight="600">
                      Refunds represent less than 3% of gross collections.
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        {/* ─── Data Tables Section ────────────────────────────────────── */}
        <TabsRoot defaultValue="memberships" variant="subtle" w="full">
            <TabsList
              bg="app.input.bg"
              p={1}
              borderRadius="14px"
              border="1px solid"
              borderColor="app.card.border"
              w="fit-content"
              gap={1}
              mb={6}
            >
              <TabsTrigger
                value="memberships"
                fontSize="xs"
                fontWeight="800"
                borderRadius="10px"
                px={4}
                py={2}
                cursor="pointer"
                color="text.muted"
                _selected={{
                  bg: "app.card.bg",
                  color: "brand.500",
                  boxShadow: "sm",
                }}
              >
                Membership Revenue
              </TabsTrigger>
              <TabsTrigger
                value="trainers"
                fontSize="xs"
                fontWeight="800"
                borderRadius="10px"
                px={4}
                py={2}
                cursor="pointer"
                color="text.muted"
                _selected={{
                  bg: "app.card.bg",
                  color: "brand.500",
                  boxShadow: "sm",
                }}
              >
                Trainer Performance
              </TabsTrigger>
              <TabsTrigger
                value="outstanding"
                fontSize="xs"
                fontWeight="800"
                borderRadius="10px"
                px={4}
                py={2}
                cursor="pointer"
                color="text.muted"
                _selected={{
                  bg: "app.card.bg",
                  color: "brand.500",
                  boxShadow: "sm",
                }}
              >
                Outstanding Payments
              </TabsTrigger>
              <TabsTrigger
                value="invoices"
                fontSize="xs"
                fontWeight="800"
                borderRadius="10px"
                px={4}
                py={2}
                cursor="pointer"
                color="text.muted"
                _selected={{
                  bg: "app.card.bg",
                  color: "brand.500",
                  boxShadow: "sm",
                }}
              >
                Invoice History
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Membership Revenue Table */}
            <TabsContent value="memberships" w="full">
              <Box
                overflowX="auto"
                w="full"
                border="1px solid"
                borderColor="app.card.border"
                borderRadius="24px"
                bg="app.card.bg"
                pt={5}
                pb={2}
                px={0}
                overflow="hidden"
                boxShadow="sm"
              >
                <Table.Root size="sm" variant="line">
                  <Table.Header bg={tableHeaderBg}>
                    <Table.Row borderColor="app.card.border">
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
                        Plan Details
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        Active Members
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="right">
                        Revenue Generated
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="right">
                        Avg Yield / Member
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.membershipRevenue.map((plan, idx) => {
                      const icons = [Dumbbell, Activity, Users, Wallet];
                      const PlanIcon = icons[idx % icons.length];
                      const colorsList = ["#4318FF", "#05CD99", "#FFB547", "#B085FF"];
                      const planColor = colorsList[idx % colorsList.length];

                      return (
                        <Table.Row
                          key={plan.planName}
                          borderColor="app.card.border"
                          transition="all 0.15s"
                          _hover={{ bg: useColorModeValue("rgba(66, 42, 251, 0.02)", "rgba(117, 81, 255, 0.04)") }}
                        >
                          <Table.Cell py={4} px={6}>
                            <HStack gap={3}>
                              <Circle size="9" bg={`${planColor}15`} color={planColor}>
                                <Icon as={PlanIcon} boxSize={4} />
                              </Circle>
                              <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="800" color={valueColor}>
                                  {plan.planName}
                                </Text>
                                <Text fontSize="2xs" color={mutedText} fontWeight="600">
                                  GYM-PLAN-{plan.planName.toUpperCase().replace(" ", "-")}
                                </Text>
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center">
                            <HStack justify="center" gap={2}>
                              <Text fontSize="sm" fontWeight="800" color={valueColor} fontFamily="mono">
                                {plan.memberCount}
                              </Text>
                              <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">
                                {Number(((plan.memberCount / 100) * 10).toFixed(1))}% share
                              </Badge>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="900" color={valueColor} fontFamily="mono">
                            {fmtCurrency(plan.revenue)}
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="800" color="#05CD99" fontFamily="mono">
                            {fmtCurrency(plan.avgRevenue)}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            </TabsContent>

            {/* Tab 2: Trainer Performance Table */}
            <TabsContent value="trainers" w="full">
              <Box
                overflowX="auto"
                w="full"
                border="1px solid"
                borderColor="app.card.border"
                borderRadius="24px"
                bg="app.card.bg"
                pt={5}
                pb={2}
                px={0}
                overflow="hidden"
                boxShadow="sm"
              >
                <Table.Root size="sm" variant="line">
                  <Table.Header bg={tableHeaderBg}>
                    <Table.Row borderColor="app.card.border">
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
                        Trainer Details
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        PT Sessions Conducted
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="right">
                        Gross PT Revenue
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="right">
                        Payout Commission (15%)
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.trainerRevenue.map((trainer, idx) => {
                      const colorsList = ["#4318FF", "#05CD99", "#FFB547", "#B085FF"];
                      const trColor = colorsList[idx % colorsList.length];
                      const initials = trainer.trainerName.split(" ").map(n => n[0]).join("");

                      return (
                        <Table.Row
                          key={trainer.trainerName}
                          borderColor="app.card.border"
                          transition="all 0.15s"
                          _hover={{ bg: useColorModeValue("rgba(66, 42, 251, 0.02)", "rgba(117, 81, 255, 0.04)") }}
                        >
                          <Table.Cell py={4} px={6}>
                            <HStack gap={3}>
                              <Circle size="9" bg={trColor} color="white" fontSize="xs" fontWeight="900" shadow="sm">
                                {initials}
                              </Circle>
                              <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="800" color={valueColor}>
                                  {trainer.trainerName}
                                </Text>
                                <Text fontSize="2xs" color={mutedText} fontWeight="600">
                                  Certified Personal Coach
                                </Text>
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center">
                            <VStack gap={1} align="center">
                              <Text fontSize="sm" fontWeight="800" color={valueColor} fontFamily="mono">
                                {trainer.sessions}
                              </Text>
                              <Box w="60px" h="4px" bg="blackAlpha.100" borderRadius="full" overflow="hidden">
                                <Box h="full" w={`${Math.min(100, (trainer.sessions / 50) * 100)}%`} bg="#6AD2FF" borderRadius="full" />
                              </Box>
                            </VStack>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="900" color={valueColor} fontFamily="mono">
                            {fmtCurrency(trainer.revenue)}
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="800" color="#7551FF" fontFamily="mono">
                            {fmtCurrency(trainer.commission)}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            </TabsContent>

            {/* Tab 3: Outstanding Payments Table */}
            <TabsContent value="outstanding" w="full">
              <Box
                overflowX="auto"
                w="full"
                border="1px solid"
                borderColor="app.card.border"
                borderRadius="24px"
                bg="app.card.bg"
                pt={5}
                pb={2}
                px={0}
                overflow="hidden"
                boxShadow="sm"
              >
                <Table.Root size="sm" variant="line">
                  <Table.Header bg={tableHeaderBg}>
                    <Table.Row borderColor="app.card.border">
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
                        Member Name
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="right">
                        Pending Amount
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        Due Date
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        Overdue Aging
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        Status Badge
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        Actions
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.outstandingPayments.map((p, idx) => {
                      const colorsList = ["#EE5D50", "#FFB547", "#EE5D50", "#FFB547", "#FFB547"];
                      const borderCol = colorsList[idx % colorsList.length];
                      const initials = p.memberName.split(" ").map(n => n[0]).join("");

                      const triggerReminder = () => {
                        toaster.create({
                          title: "Reminder Sent",
                          description: `SMS & Email payment notifications dispatched to ${p.memberName}.`,
                          type: "success",
                        });
                      };

                      return (
                        <Table.Row
                          key={p.memberName}
                          borderColor="app.card.border"
                          transition="all 0.15s"
                          _hover={{ bg: useColorModeValue("rgba(66, 42, 251, 0.02)", "rgba(117, 81, 255, 0.04)") }}
                        >
                          <Table.Cell py={4} px={6}>
                            <HStack gap={3}>
                              <Circle size="9" bg={`${borderCol}15`} color={borderCol} fontSize="xs" fontWeight="900">
                                {initials}
                              </Circle>
                              <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="800" color={valueColor}>
                                  {p.memberName}
                                </Text>
                                <Text fontSize="2xs" color={mutedText} fontWeight="600">
                                  {p.memberName.toLowerCase().replace(" ", "")}@gymclient.com
                                </Text>
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="900" color="#EE5D50" fontFamily="mono">
                            {fmtCurrency(p.pendingAmount)}
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center">
                            <HStack justify="center" gap={1.5}>
                              <Icon as={Calendar} boxSize={3.5} color={mutedText} />
                              <Text fontSize="sm" fontWeight="700" color={valueColor} fontFamily="mono">
                                {p.dueDate}
                              </Text>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center">
                            <Badge colorPalette="red" variant="solid" borderRadius="full" size="sm" px={2.5}>
                              {p.daysOverdue} days late
                            </Badge>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center">
                            <Badge
                              colorPalette={p.status === "Overdue" ? "red" : "orange"}
                              variant="subtle"
                              borderRadius="full"
                              size="sm"
                              px={2.5}
                            >
                              <HStack gap={1}>
                                <Icon as={p.status === "Overdue" ? AlertCircle : Clock} boxSize={3} />
                                <Text fontSize="2xs" fontWeight="800">{p.status}</Text>
                              </HStack>
                            </Badge>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center">
                            <Button
                              size="xs"
                              colorPalette="red"
                              variant="subtle"
                              borderRadius="full"
                              fontWeight="800"
                              onClick={triggerReminder}
                            >
                              <Icon as={Mail} boxSize={3} /> Remind
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            </TabsContent>

            {/* Tab 4: Invoice Report Table */}
            <TabsContent value="invoices" w="full">
              <Box
                overflowX="auto"
                w="full"
                border="1px solid"
                borderColor="app.card.border"
                borderRadius="24px"
                bg="app.card.bg"
                pt={5}
                pb={2}
                px={0}
                overflow="hidden"
                boxShadow="sm"
              >
                <Table.Root size="sm" variant="line">
                  <Table.Header bg={tableHeaderBg}>
                    <Table.Row borderColor="app.card.border">
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
                        Invoice ID
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
                        Billed Member
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="right">
                        Gross Amount
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="right">
                        Tax (GST)
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        Payment Status
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        Billing Date
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color={mutedText} textAlign="center">
                        Actions
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.invoiceReport.map((inv, idx) => {
                      const colorsList = ["#4318FF", "#05CD99", "#FFB547", "#B085FF"];
                      const avatarCol = colorsList[idx % colorsList.length];
                      const initials = inv.memberName.split(" ").map(n => n[0]).join("");

                      const downloadInvoice = () => {
                        toaster.create({
                          title: "Download Started",
                          description: `PDF files for ${inv.invoiceId} are being downloaded.`,
                          type: "success",
                        });
                      };

                      return (
                        <Table.Row
                          key={inv.invoiceId}
                          borderColor="app.card.border"
                          transition="all 0.15s"
                          _hover={{ bg: useColorModeValue("rgba(66, 42, 251, 0.02)", "rgba(117, 81, 255, 0.04)") }}
                        >
                          <Table.Cell py={4} px={6} fontSize="xs" fontWeight="800" color={valueColor} fontFamily="mono">
                            <HStack gap={2}>
                              <Icon as={FileText} boxSize={3.5} color="brand.500" />
                              <Text>{inv.invoiceId}</Text>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell py={4} px={6}>
                            <HStack gap={3}>
                              <Circle size="9" bg={`${avatarCol}15`} color={avatarCol} fontSize="xs" fontWeight="900">
                                {initials}
                              </Circle>
                              <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="800" color={valueColor}>
                                  {inv.memberName}
                                </Text>
                                <Text fontSize="2xs" color={mutedText} fontWeight="600">
                                  Standard Subscription
                                </Text>
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="900" color={valueColor} fontFamily="mono">
                            {fmtCurrency(inv.amount)}
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="800" color={mutedText} fontFamily="mono">
                            {fmtCurrency(inv.taxAmount)}
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center">
                            <Badge
                              colorPalette={inv.status === "Paid" ? "green" : inv.status === "Pending" ? "orange" : "red"}
                              variant="subtle"
                              borderRadius="full"
                              size="sm"
                              px={2.5}
                            >
                              <HStack gap={1}>
                                <Icon as={inv.status === "Paid" ? CheckCircle2 : inv.status === "Pending" ? Clock : XCircle} boxSize={3} />
                                <Text fontSize="2xs" fontWeight="800">{inv.status}</Text>
                              </HStack>
                            </Badge>
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center" fontSize="sm" fontWeight="700" color={valueColor} fontFamily="mono">
                            {inv.date}
                          </Table.Cell>
                          <Table.Cell py={4} px={6} textAlign="center">
                            <IconButton
                              size="xs"
                              variant="ghost"
                              colorPalette="gray"
                              aria-label="Download Invoice"
                              onClick={downloadInvoice}
                            >
                              <FileDown size={14} />
                            </IconButton>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            </TabsContent>
          </TabsRoot>
      </VStack>
    </Box>
  );
});

RevenueReport.displayName = "RevenueReport";
export default RevenueReport;
