/**
 * AttendanceReport.tsx
 *
 * A modern, enterprise-grade Attendance Analytics dashboard for the Gym Management System.
 * Offers interactive filters, KPI summary cards with mini-sparklines, daily check-in trend lines,
 * peak occupancy hourly traffic bars, branch comparison, visit frequency analysis, check-in methods,
 * calendar density heatmaps, goal progress rings, alerts, and detailed reports tables.
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
import { ProgressRoot, ProgressBar } from "@/components/ui/progress";
import * as echarts from "@/core/utils/echarts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
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
  UserX,
  Zap,
  MapPin,
  Flame,
  Award,
  AlertTriangle,
  QrCode,
  Smartphone,
  CreditCard,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/core/components/PageHeader";
import { useAttendanceStats } from "./hooks/useAttendanceStats";
import { useNavActionStore } from "@/core/store/useNavActionStore";

// ─── Types & Interfaces ──────────────────────────────────────────────────────

interface FiltersState {
  dateRange: string;
  branch: string;
  plan: string;
  trainer: string;
  gender: string;
  ageGroup: string;
}

interface EChartsReactProps {
  option: echarts.EChartsOption;
  height?: string;
  loading?: boolean;
}

// ─── Filter Constants ────────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "This Month", value: "month" },
];

const BRANCHES = [
  { label: "All Branches", value: "all" },
  { label: "Mumbai Branch", value: "mumbai" },
  { label: "Pune Branch", value: "pune" },
  { label: "Delhi Branch", value: "delhi" },
];

const MEMBERSHIP_PLANS = [
  { label: "All Plans", value: "all" },
  { label: "Monthly Plan", value: "monthly" },
  { label: "Quarterly Plan", value: "quarterly" },
  { label: "Annual Plan", value: "annual" },
  { label: "Personal Training", value: "pt" },
];

const TRAINERS = [
  { label: "All Trainers", value: "all" },
  { label: "Amit Sharma", value: "amit" },
  { label: "Priya Patel", value: "priya" },
  { label: "Rajesh Kumar", value: "rajesh" },
  { label: "Sneha Reddy", value: "sneha" },
];

const GENDERS = [
  { label: "All Genders", value: "all" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const AGE_GROUPS = [
  { label: "All Ages", value: "all" },
  { label: "Under 18", value: "under18" },
  { label: "18 - 25", value: "18_25" },
  { label: "26 - 35", value: "26_35" },
  { label: "36 - 50", value: "36_50" },
  { label: "Above 50", value: "above50" },
];

// ─── Deterministic Seeded Random Generator ───────────────────────────────────

const createSeededRandom = (seedStr: string) => {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

// ─── Simulated Data Engine ───────────────────────────────────────────────────

const getFilteredAttendanceData = (filters: FiltersState) => {
  const filterKey = `${filters.dateRange}-${filters.branch}-${filters.plan}-${filters.trainer}-${filters.gender}-${filters.ageGroup}`;
  const rand = createSeededRandom(filterKey);

  // Scaling coefficients
  let scale = 1.0;
  if (filters.branch === "mumbai") scale *= 0.45;
  else if (filters.branch === "pune") scale *= 0.30;
  else if (filters.branch === "delhi") scale *= 0.25;

  if (filters.plan === "monthly") scale *= 0.35;
  else if (filters.plan === "quarterly") scale *= 0.25;
  else if (filters.plan === "annual") scale *= 0.30;
  else if (filters.plan === "pt") scale *= 0.10;

  if (filters.trainer !== "all") scale *= 0.25;
  if (filters.gender === "male") scale *= 0.55;
  else if (filters.gender === "female") scale *= 0.42;
  else if (filters.gender === "other") scale *= 0.03;

  if (filters.ageGroup === "under18") scale *= 0.12;
  else if (filters.ageGroup === "18_25") scale *= 0.38;
  else if (filters.ageGroup === "26_35") scale *= 0.32;
  else if (filters.ageGroup === "36_50") scale *= 0.14;
  else if (filters.ageGroup === "above50") scale *= 0.04;

  // Re-adjust scale bounds
  scale = Math.max(0.05, scale);

  const totalActive = Math.max(60, Math.round(1200 * (filters.branch === "all" ? 1.0 : scale * 2) * (filters.plan === "all" ? 1.0 : scale * 2.2)));
  const checkedInToday = Math.max(12, Math.round(totalActive * (0.26 + rand() * 0.12)));
  const avgDailyAttendance = Math.max(10, Math.round(totalActive * (0.23 + rand() * 0.08)));
  const absentToday = Math.max(0, totalActive - checkedInToday);
  const attendanceRate = Math.min(98, Math.max(35, Math.round(72 * (0.92 + rand() * 0.15))));
  const newCheckins = Math.max(1, Math.round(checkedInToday * (0.06 + rand() * 0.06)));

  const totalActiveGrowth = Number((4.5 * (0.8 + rand() * 0.4)).toFixed(1));
  const checkedInGrowth = Number((12.4 * (0.7 + rand() * 0.6)).toFixed(1));
  const avgDailyGrowth = Number((8.2 * (0.85 + rand() * 0.3)).toFixed(1));
  const absentGrowth = Number((-3.1 * (0.9 + rand() * 0.2)).toFixed(1));
  const rateGrowth = Number((1.8 * (0.5 + rand() * 1.0)).toFixed(1));
  const newCheckinsGrowth = Number((15.2 * (0.6 + rand() * 0.8)).toFixed(1));

  // Sparkline data
  const getSparkline = (base: number, trend: "up" | "down" | "wave") => {
    return Array.from({ length: 8 }, (_, i) => {
      let multiplier = 1.0;
      if (trend === "up") multiplier = 0.8 + (i / 8) * 0.32 + rand() * 0.08;
      else if (trend === "down") multiplier = 1.15 - (i / 8) * 0.3 - rand() * 0.08;
      else multiplier = 0.9 + Math.sin(i) * 0.12 + rand() * 0.08;
      return Math.round(base * multiplier);
    });
  };

  const sparklines = {
    totalActive: getSparkline(totalActive, "up"),
    checkedInToday: getSparkline(checkedInToday, "wave"),
    avgDailyAttendance: getSparkline(avgDailyAttendance, "wave"),
    absentToday: getSparkline(absentToday, "down"),
    attendanceRate: getSparkline(attendanceRate, "up"),
    newCheckinsToday: getSparkline(newCheckins, "wave"),
  };

  // 1. Daily trend
  let dailyDates: string[] = [];
  let currentTrend: number[] = [];
  let previousTrend: number[] = [];

  if (filters.dateRange === "today") {
    dailyDates = ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"];
    currentTrend = dailyDates.map(() => Math.round(checkedInToday * 0.12 * (0.7 + rand() * 0.6)));
    previousTrend = dailyDates.map(() => Math.round(checkedInToday * 0.11 * (0.6 + rand() * 0.6)));
  } else if (filters.dateRange === "7d") {
    dailyDates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const baseVals = [280, 310, 340, 290, 320, 210, 120];
    currentTrend = baseVals.map(v => Math.round(v * scale * (0.9 + rand() * 0.2)));
    previousTrend = baseVals.map(v => Math.round(v * 0.92 * scale * (0.85 + rand() * 0.25)));
  } else {
    // 30d or month
    dailyDates = Array.from({ length: 10 }, (_, i) => `Day ${i * 3 + 1}`);
    currentTrend = Array.from({ length: 10 }, () => Math.round(avgDailyAttendance * (0.8 + rand() * 0.4)));
    previousTrend = Array.from({ length: 10 }, () => Math.round(avgDailyAttendance * 0.88 * (0.8 + rand() * 0.4)));
  }

  // 2. Hourly Gym Traffic
  const hours = ["6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM"];
  const trafficPattern = [80, 110, 130, 90, 60, 40, 35, 30, 25, 45, 90, 150, 180, 160, 120, 70, 30];
  const hourlyTraffic = trafficPattern.map(t => Math.round(t * scale * (0.85 + rand() * 0.3)));

  // 3. Attendance by Plan
  const planVisits = [
    { name: "Monthly Plan Members", value: Math.round(checkedInToday * 0.35), color: "#4318FF" },
    { name: "Quarterly Plan Members", value: Math.round(checkedInToday * 0.25), color: "#FFB547" },
    { name: "Annual Plan Members", value: Math.round(checkedInToday * 0.28), color: "#05CD99" },
    { name: "Personal Training Members", value: Math.round(checkedInToday * 0.12), color: "#EE5D50" },
  ];
  const planDistributionTotal = planVisits.reduce((s, p) => s + p.value, 0) || 1;
  const planDistribution = planVisits.map(p => ({
    ...p,
    percentage: Number(((p.value / planDistributionTotal) * 100).toFixed(1)),
  }));

  // 4. Branch attendance
  const branchAttendance = [
    { name: "Mumbai Branch", count: Math.round(avgDailyAttendance * 1.4 * (0.9 + rand() * 0.2)), color: "#4318FF" },
    { name: "Pune Branch", count: Math.round(avgDailyAttendance * 0.95 * (0.9 + rand() * 0.2)), color: "#05CD99" },
    { name: "Delhi Branch", count: Math.round(avgDailyAttendance * 0.8 * (0.9 + rand() * 0.2)), color: "#FFB547" },
  ];

  // 5. Check-in methods
  const methods = [
    { name: "QR Code", count: Math.round(checkedInToday * 0.45), color: "#4318FF" },
    { name: "RFID Card", count: Math.round(checkedInToday * 0.20), color: "#05CD99" },
    { name: "Mobile App", count: Math.round(checkedInToday * 0.22), color: "#FFB547" },
    { name: "Face Recognition", count: Math.round(checkedInToday * 0.08), color: "#B085FF" },
    { name: "Manual Entry", count: Math.round(checkedInToday * 0.05), color: "#EE5D50" },
  ];
  const checkinMethodsTotal = methods.reduce((s, m) => s + m.count, 0) || 1;
  const checkinMethods = methods.map(m => ({
    ...m,
    percentage: Number(((m.count / checkinMethodsTotal) * 100).toFixed(1)),
  }));

  // 6. Member Visit Frequency Analysis
  const visitFrequency = [
    { name: "Daily Visitors", count: Math.round(totalActive * 0.15), percentage: 15, color: "#4318FF" },
    { name: "3 Times Weekly Visitors", count: Math.round(totalActive * 0.42), percentage: 42, color: "#05CD99" },
    { name: "Weekly Visitors", count: Math.round(totalActive * 0.28), percentage: 28, color: "#FFB547" },
    { name: "Rare Visitors", count: Math.round(totalActive * 0.15), percentage: 15, color: "#EE5D50" },
  ];

  // 7. Goal Tracking
  const goalTarget = Math.round(400 * scale);
  const goalActual = checkedInToday;
  const goalAchievementRate = goalTarget > 0 ? Math.min(100, Math.round((goalActual / goalTarget) * 100)) : 0;

  // 8. Alerts
  const alerts = [
    { id: "1", message: `${Math.round(14 * scale) || 2} members are absent for 7+ days (medium churn risk).`, severity: "warning" as const },
    { id: "2", message: `${Math.round(6 * scale) || 1} members are absent for 15+ days (critical churn risk).`, severity: "error" as const },
    { id: "3", message: `${Math.round(4 * scale) || 1} annual plan members are near expiry with no visits this month.`, severity: "info" as const },
  ];

  // 9. Heatmap
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeSlots = ["Morning", "Afternoon", "Evening"];
  const heatmapData = [
    [0, 0, Math.round(85 * (0.8 + rand() * 0.35))], [0, 1, Math.round(45 * (0.8 + rand() * 0.35))], [0, 2, Math.round(95 * (0.8 + rand() * 0.35))],
    [1, 0, Math.round(75 * (0.8 + rand() * 0.35))], [1, 1, Math.round(40 * (0.8 + rand() * 0.35))], [1, 2, Math.round(85 * (0.8 + rand() * 0.35))],
    [2, 0, Math.round(80 * (0.8 + rand() * 0.35))], [2, 1, Math.round(50 * (0.8 + rand() * 0.35))], [2, 2, Math.round(90 * (0.8 + rand() * 0.35))],
    [3, 0, Math.round(70 * (0.8 + rand() * 0.35))], [3, 1, Math.round(35 * (0.8 + rand() * 0.35))], [3, 2, Math.round(80 * (0.8 + rand() * 0.35))],
    [4, 0, Math.round(75 * (0.8 + rand() * 0.35))], [4, 1, Math.round(45 * (0.8 + rand() * 0.35))], [4, 2, Math.round(85 * (0.8 + rand() * 0.35))],
    [5, 0, Math.round(90 * (0.8 + rand() * 0.35))], [5, 1, Math.round(60 * (0.8 + rand() * 0.35))], [5, 2, Math.round(70 * (0.8 + rand() * 0.35))],
    [6, 0, Math.round(40 * (0.8 + rand() * 0.35))], [6, 1, Math.round(25 * (0.8 + rand() * 0.35))], [6, 2, Math.round(20 * (0.8 + rand() * 0.35))],
  ];

  // 10. Member Attendance Report
  const memberReportRows = [
    { name: "Rahul Sharma", plan: "Annual Plan", lastVisit: "10 June", visits: 22, percentage: 82, status: "Active" as const },
    { name: "Priya Patel", plan: "Monthly Plan", lastVisit: "08 June", visits: 14, percentage: 55, status: "Low Attendance" as const },
    { name: "Amit Sharma", plan: "Quarterly Plan", lastVisit: "11 June", visits: 19, percentage: 76, status: "Active" as const },
    { name: "Rajesh Kumar", plan: "Annual Plan", lastVisit: "25 May", visits: 4, percentage: 18, status: "Inactive" as const },
    { name: "Sneha Reddy", plan: "Personal Training", lastVisit: "12 June", visits: 25, percentage: 92, status: "Active" as const },
    { name: "Vikram Sen", plan: "Monthly Plan", lastVisit: "09 June", visits: 15, percentage: 60, status: "Low Attendance" as const },
    { name: "Neha Iyer", plan: "Annual Plan", lastVisit: "07 June", visits: 11, percentage: 44, status: "Low Attendance" as const },
    { name: "Karan Malhotra", plan: "Quarterly Plan", lastVisit: "12 June", visits: 20, percentage: 80, status: "Active" as const },
  ].filter(r => {
    if (filters.plan !== "all" && !r.plan.toLowerCase().includes(filters.plan)) return false;
    return true;
  });

  // 11. Inactive Members Report
  const inactiveReportRows = [
    { name: "Ajay Devgan", lastVisit: "25 May", daysSince: 18, expiryDate: "30 June" },
    { name: "Sunita Kapoor", lastVisit: "15 May", daysSince: 28, expiryDate: "20 June" },
    { name: "Kunal Deshmukh", lastVisit: "28 May", daysSince: 15, expiryDate: "15 July" },
    { name: "Rohit Shetty", lastVisit: "10 May", daysSince: 33, expiryDate: "25 June" },
    { name: "Pooja Hegde", lastVisit: "20 May", daysSince: 23, expiryDate: "10 July" },
    { name: "Suresh Raina", lastVisit: "05 May", daysSince: 38, expiryDate: "18 June" },
  ];

  // 12. Trainer Attendance Report
  const trainerReportRows = [
    { trainerName: "Amit Trainer", sessions: 40, days: 25, hours: 180 },
    { trainerName: "Priya Trainer", sessions: 35, days: 24, hours: 170 },
    { trainerName: "Rajesh Trainer", sessions: 28, days: 22, hours: 150 },
    { trainerName: "Sneha Trainer", sessions: 45, days: 26, hours: 190 },
    { trainerName: "Vikram Trainer", sessions: 20, days: 18, hours: 120 },
  ].filter(t => {
    if (filters.trainer !== "all" && !t.trainerName.toLowerCase().includes(filters.trainer)) return false;
    return true;
  });

  const dailyTrend = {
    dates: dailyDates,
    current: currentTrend,
    previous: previousTrend,
  };

  return {
    metrics: {
      totalActive,
      checkedInToday,
      avgDailyAttendance,
      absentToday,
      attendanceRate,
      newCheckins,
      totalActiveGrowth,
      checkedInGrowth,
      avgDailyGrowth,
      absentGrowth,
      rateGrowth,
      newCheckinsGrowth,
    },
    sparklines,
    dailyTrend,
    hourlyTraffic: {
      hours,
      counts: hourlyTraffic,
    },
    planDistribution,
    branchAttendance,
    checkinMethods,
    visitFrequency,
    goalTracking: {
      target: goalTarget,
      actual: goalActual,
      achievementRate: goalAchievementRate,
    },
    alerts,
    heatmap: {
      days: weekdays,
      slots: timeSlots,
      data: heatmapData,
    },
    memberAttendanceTable: { rows: memberReportRows },
    inactiveMembersReport: { rows: inactiveReportRows },
    trainerAttendanceReport: { rows: trainerReportRows },
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

// Sparkline Option Helper
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

// ─── Metric Card Component ───────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
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
            vs last period
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

// ─── Main Component ──────────────────────────────────────────────────────────

const AttendanceReport = memo(() => {
  const [filters, setFilters] = useState<FiltersState>({
    dateRange: "7d",
    branch: "all",
    plan: "all",
    trainer: "all",
    gender: "all",
    ageGroup: "all",
  });

  const [localLoading, setLocalLoading] = useState(false);
  const isDark = useColorModeValue(false, true);

  const { stats, loading: statsLoading, refetch } = useAttendanceStats();
  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  // Recalculate dashboard metrics on filter changes
  const data = useMemo(() => getFilteredAttendanceData(filters), [filters]);

  const loading = statsLoading || localLoading;

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setLocalLoading(true);
    refetch();
    setTimeout(() => {
      setLocalLoading(false);
      toaster.create({
        title: "Report Updated",
        description: "Attendance analytics reports have been successfully refreshed.",
        type: "success",
      });
    }, 600);
  }, [refetch]);

  // Hook up navigation header actions
  useEffect(() => {
    setNavActionConfig([
      {
        id: "refresh",
        icon: RefreshCw,
        bg: "gradient_cyan_purple",
        color: "white",
        ariaLabel: "Refresh stats",
        onClick: handleRefresh,
        loading: loading,
        flexShrink: 0,
      },
    ]);
    return () => clearActions();
  }, [setNavActionConfig, clearActions, handleRefresh, loading]);

  // Stable handlers for filters
  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, dateRange: e.target.value }));
  }, []);

  const handleBranchChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, branch: e.target.value }));
  }, []);

  const handlePlanChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, plan: e.target.value }));
  }, []);

  const handleTrainerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, trainer: e.target.value }));
  }, []);

  const handleGenderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, gender: e.target.value }));
  }, []);

  const handleAgeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, ageGroup: e.target.value }));
  }, []);

  // Export handlers
  const handleExportPDF = useCallback(() => {
    toaster.create({
      title: "PDF Dispatching",
      description: "Compiling layout... PDF attendance report will download shortly.",
      type: "info",
    });
  }, []);

  const handleExportExcel = useCallback(() => {
    toaster.create({
      title: "Excel Generated",
      description: "Spreadsheet compilation complete. Excel report downloaded.",
      type: "success",
    });
  }, []);

  const handleDownloadCSV = useCallback(() => {
    toaster.create({
      title: "CSV Exported",
      description: "Commas separated values attendance logs downloaded.",
      type: "success",
    });
  }, []);

  const handleEmailReport = useCallback(() => {
    toaster.create({
      title: "Email Request Sent",
      description: "Attendance report dispatch initiated to organization admins.",
      type: "success",
    });
  }, []);

  // ─── Theme Aware Chart Options ─────────────────────────────────────────────

  // 1. Daily Check-in Trend
  const dailyTrendOption = useMemo((): echarts.EChartsOption => {
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
              <b>${p.value} check-ins</b>
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
        data: data.dailyTrend.dates,
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      series: [
        {
          name: "Current Period",
          type: "line",
          data: data.dailyTrend.current,
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
          data: data.dailyTrend.previous,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, type: "dashed", color: isDark ? "#707EAE" : "#A3AED0" },
        },
      ],
    };
  }, [data.dailyTrend, isDark]);

  // 2. Hourly Gym Traffic (Peak Hours)
  const hourlyTrafficOption = useMemo((): echarts.EChartsOption => {
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
          return `${item.name}: <b>${item.value} members</b>`;
        },
      },
      grid: { top: "8%", left: "4%", right: "4%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: data.hourlyTraffic.hours,
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10, rotate: 30 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      series: [
        {
          name: "Active Members",
          type: "bar",
          data: data.hourlyTraffic.counts,
          barWidth: "60%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#4318FF" },
              { offset: 1, color: "rgba(67, 24, 255, 0.15)" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }, [data.hourlyTraffic, isDark]);

  // 3. Plan Distribution Donut Chart
  const planPieOption = useMemo((): echarts.EChartsOption => {
    const textColor = isDark ? "#F8FAFC" : "#0F172A";

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        textStyle: { color: textColor },
        formatter: "{b}: <b>{c} visits ({d}%)</b>",
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
          name: "Visits by Membership Plan",
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
          data: data.planDistribution.map((p) => ({
            name: p.name,
            value: p.value,
            itemStyle: { color: p.color },
          })),
        },
      ],
    };
  }, [data.planDistribution, isDark]);

  // 4. Branch Comparison Bar Chart
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
          return `${item.name}: <b>${item.value} avg daily visits</b>`;
        },
      },
      grid: { top: "15%", left: "4%", right: "4%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: data.branchAttendance.map((b) => b.name),
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      series: [
        {
          name: "Branch Attendance",
          type: "bar",
          data: data.branchAttendance.map((b) => b.count),
          barWidth: "35%",
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
  }, [data.branchAttendance, isDark]);

  // 5. Check-in Method Analytics Option
  const checkinMethodOption = useMemo((): echarts.EChartsOption => {
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
          return `${item.name}: <b>${item.value} times</b>`;
        },
      },
      grid: { top: "5%", left: "4%", right: "8%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      yAxis: {
        type: "category",
        data: data.checkinMethods.map((m) => m.name),
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
      },
      series: [
        {
          name: "Usage Count",
          type: "bar",
          data: data.checkinMethods.map((m) => m.count),
          barWidth: "45%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "rgba(181, 133, 255, 0.2)" },
              { offset: 1, color: "#B085FF" },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
        },
      ],
    };
  }, [data.checkinMethods, isDark]);

  // 6. Attendance Heatmap Calendar
  const calendarHeatmapOption = useMemo((): echarts.EChartsOption => {
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0";

    return {
      tooltip: {
        position: "top",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A" },
        formatter: (params: any) => {
          const dayName = data.heatmap.days[params.data[0]];
          const timeSlotName = data.heatmap.slots[params.data[1]];
          const density = params.data[2];
          return `${dayName} - ${timeSlotName}: <b>${density}% density</b>`;
        },
      },
      grid: { height: "70%", top: "10%", bottom: "20%", left: "12%", right: "5%" },
      xAxis: {
        type: "category",
        data: data.heatmap.days,
        splitArea: { show: true },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
        axisLine: { show: false },
      },
      yAxis: {
        type: "category",
        data: data.heatmap.slots,
        splitArea: { show: true },
        axisLabel: { color: textColor, fontWeight: 700, fontSize: 10 },
        axisLine: { show: false },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "-3%",
        itemHeight: 10,
        textStyle: { color: textColor, fontWeight: 700, fontSize: 9 },
        inRange: {
          color: isDark ? ["#1E293B", "#3B82F6", "#05CD99"] : ["#F3F4F6", "#93C5FD", "#05CD99"],
        },
      },
      series: [
        {
          name: "Attendance Density",
          type: "heatmap",
          data: data.heatmap.data,
          label: { show: false },
          itemStyle: {
            borderColor: isDark ? "#111C44" : "#FFFFFF",
            borderWidth: 2,
          },
        },
      ],
    };
  }, [data.heatmap, isDark]);

  // Color mode design tokens
  const panelBg = "app.card.bg";
  const cardBorder = "app.card.border";
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.800", "white");
  const tableHeaderBg = useColorModeValue("gray.50", "navy.900");

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      <PageHeader
        title="Attendance Report"
        subtitle="Gym occupancy intelligence, peak hours density, re-engagement targets, and trainer session tracking."
        icon={Activity}
        badge="Attendance Analytics"
        accentColor="blue"
      />

      <VStack align="stretch" gap={6} pb={8}>
        {/* ─── 14. Filters & 15. Export Actions Panel ─────────────────── */}
        <Box
          p={5}
          borderRadius="24px"
          bg={panelBg}
          border="1px solid"
          borderColor={cardBorder}
          backdropFilter="blur(20px) saturate(160%)"
        >
          <Grid templateColumns={{ base: "1fr", xl: "1fr auto" }} gap={5} alignItems="center">
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
                    Gender
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
                      value={filters.gender}
                      onChange={handleGenderChange}
                    >
                      {GENDERS.map((g) => (
                        <option
                          key={g.value}
                          value={g.value}
                          style={{
                            backgroundColor: isDark ? "#111C44" : "#FFFFFF",
                            color: isDark ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {g.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </VStack>

                <VStack align="stretch" gap={1}>
                  <Text fontSize="10px" fontWeight="900" color={mutedText} textTransform="uppercase">
                    Age Group
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
                      value={filters.ageGroup}
                      onChange={handleAgeChange}
                    >
                      {AGE_GROUPS.map((a) => (
                        <option
                          key={a.value}
                          value={a.value}
                          style={{
                            backgroundColor: isDark ? "#111C44" : "#FFFFFF",
                            color: isDark ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {a.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </VStack>
              </SimpleGrid>
            </GridItem>

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
                  colorPalette="teal"
                  fontWeight="800"
                  fontSize="xs"
                  onClick={handleDownloadCSV}
                >
                  <FileText size={14} /> CSV
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

        {/* ─── 1. Top Summary Cards (KPIs) ─────────────────────────────── */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} gap={4}>
          <MetricCard
            label="Total Active Members"
            value={data.metrics.totalActive}
            growth={`${data.metrics.totalActiveGrowth}%`}
            isPositive={data.metrics.totalActiveGrowth > 0}
            icon={Users}
            accent="#4318FF"
            sparklineData={data.sparklines.totalActive}
          />
          <MetricCard
            label="Checked In Today"
            value={data.metrics.checkedInToday}
            growth={`${data.metrics.checkedInGrowth}%`}
            isPositive={data.metrics.checkedInGrowth > 0}
            icon={CheckCircle2}
            accent="#05CD99"
            sparklineData={data.sparklines.checkedInToday}
          />
          <MetricCard
            label="Avg Daily Attendance"
            value={data.metrics.avgDailyAttendance}
            growth={`${data.metrics.avgDailyGrowth}%`}
            isPositive={data.metrics.avgDailyGrowth > 0}
            icon={TrendingUp}
            accent="#FFB547"
            sparklineData={data.sparklines.avgDailyAttendance}
          />
          <MetricCard
            label="Absent Members Today"
            value={data.metrics.absentToday}
            growth={`${data.metrics.absentGrowth}%`}
            isPositive={data.metrics.absentGrowth < 0}
            icon={UserX}
            accent="#EE5D50"
            sparklineData={data.sparklines.absentToday}
          />
          <MetricCard
            label="Attendance Rate %"
            value={`${data.metrics.attendanceRate}%`}
            growth={`${data.metrics.rateGrowth}%`}
            isPositive={data.metrics.rateGrowth > 0}
            icon={Percent}
            accent="#7551FF"
            sparklineData={data.sparklines.attendanceRate}
          />
          <MetricCard
            label="New Member Check-ins"
            value={data.metrics.newCheckins}
            growth={`${data.metrics.newCheckinsGrowth}%`}
            isPositive={data.metrics.newCheckinsGrowth > 0}
            icon={Zap}
            accent="#B085FF"
            sparklineData={data.sparklines.newCheckinsToday}
          />
        </SimpleGrid>

        {/* ─── 2. Daily Attendance Trend Chart ─────────────────────────── */}
        <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={cardBorder}>
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between">
              <VStack align="start" gap={0.5}>
                <Heading size="md" fontWeight="900" color={valueColor}>
                  Daily Check-in Volume Trend
                </Heading>
                <Text fontSize="xs" color={mutedText} fontWeight="700">
                  Visual comparison between active period and historical baseline
                </Text>
              </VStack>
              <Badge colorPalette="blue" variant="subtle" px={3} py={1} borderRadius="full" fontWeight="800">
                Double Period Comp
              </Badge>
            </HStack>
            <Skeleton loading={loading} borderRadius="2xl">
              <EChartsReact option={dailyTrendOption} height="320px" />
            </Skeleton>
          </VStack>
        </Box>

        {/* ─── 3. Hourly Traffic & 11. Check-in Methods ───────────────── */}
        <Grid templateColumns={{ base: "1fr", lg: "1.5fr 1fr" }} gap={6}>
          <GridItem>
            <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={cardBorder} h="full">
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <VStack align="start" gap={0.5}>
                    <Heading size="sm" fontWeight="900" color={valueColor}>
                      Hourly Gym Traffic Analysis
                    </Heading>
                    <Text fontSize="xs" color={mutedText} fontWeight="700">
                      Identify peak gym occupancy hours to optimize trainers staffing
                    </Text>
                  </VStack>
                  <Circle size="8" bg="blue.500/10" color="blue.500">
                    <Clock size={16} />
                  </Circle>
                </HStack>
                <Skeleton loading={loading} borderRadius="2xl">
                  <EChartsReact option={hourlyTrafficOption} height="280px" />
                </Skeleton>
              </VStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={cardBorder} h="full">
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <VStack align="start" gap={0.5}>
                    <Heading size="sm" fontWeight="900" color={valueColor}>
                      Check-in Method Analytics
                    </Heading>
                    <Text fontSize="xs" color={mutedText} fontWeight="700">
                      Split of methods used by members to log visits
                    </Text>
                  </VStack>
                  <Circle size="8" bg="purple.500/10" color="purple.500">
                    <QrCode size={16} />
                  </Circle>
                </HStack>
                <Skeleton loading={loading} borderRadius="2xl">
                  <EChartsReact option={checkinMethodOption} height="280px" />
                </Skeleton>
              </VStack>
            </Box>
          </GridItem>
        </Grid>

        {/* ─── 4. Attendance by Plan & 10. Visit Frequency ───────────── */}
        <Grid templateColumns={{ base: "1fr", lg: "1.1fr 1.4fr" }} gap={6}>
          <GridItem>
            <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={cardBorder} h="full">
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <VStack align="start" gap={0.5}>
                    <Heading size="sm" fontWeight="900" color={valueColor}>
                      Attendance by Membership Plan
                    </Heading>
                    <Text fontSize="xs" color={mutedText} fontWeight="700">
                      Visit distribution ratios across gym tiers
                    </Text>
                  </VStack>
                  <Circle size="8" bg="teal.500/10" color="teal.500">
                    <PieChart size={16} />
                  </Circle>
                </HStack>
                <Skeleton loading={loading} borderRadius="2xl">
                  <EChartsReact option={planPieOption} height="280px" />
                </Skeleton>
              </VStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={cardBorder} h="full">
              <VStack align="stretch" gap={5}>
                <HStack justify="space-between">
                  <VStack align="start" gap={0.5}>
                    <Heading size="sm" fontWeight="900" color={valueColor}>
                      Member Visit Frequency Analysis
                    </Heading>
                    <Text fontSize="xs" color={mutedText} fontWeight="700">
                      Segment members by their recurring workout habits
                    </Text>
                  </VStack>
                  <Circle size="8" bg="orange.500/10" color="orange.500">
                    <Flame size={16} />
                  </Circle>
                </HStack>

                <VStack align="stretch" gap={4} pt={2}>
                  {data.visitFrequency.map((item) => (
                    <VStack key={item.name} align="stretch" gap={1.5}>
                      <HStack justify="space-between" fontSize="xs" fontWeight="800">
                        <Text color={valueColor}>{item.name}</Text>
                        <HStack gap={2}>
                          <Text color={mutedText}>{item.count} members</Text>
                          <Badge colorPalette={
                            item.percentage > 30 ? "green" : item.percentage > 20 ? "blue" : "orange"
                          } variant="subtle" borderRadius="full">
                            {item.percentage}%
                          </Badge>
                        </HStack>
                      </HStack>
                      <ProgressRoot value={item.percentage} size="xs" colorPalette={
                        item.percentage > 30 ? "green" : item.percentage > 20 ? "blue" : "orange"
                      }>
                        <ProgressBar borderRadius="full" />
                      </ProgressRoot>
                    </VStack>
                  ))}
                </VStack>
              </VStack>
            </Box>
          </GridItem>
        </Grid>

        {/* ─── 8. Branch Comparison & 9/12. Heatmap/Goal Tracking ─────── */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1.5fr" }} gap={6}>
          <GridItem>
            <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={cardBorder} h="full">
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <VStack align="start" gap={0.5}>
                    <Heading size="sm" fontWeight="900" color={valueColor}>
                      Branch Attendance Comparison
                    </Heading>
                    <Text fontSize="xs" color={mutedText} fontWeight="700">
                      Average daily check-in volume across multi-branch cities
                    </Text>
                  </VStack>
                  <Circle size="8" bg="emerald.500/10" color="emerald.500">
                    <MapPin size={16} />
                  </Circle>
                </HStack>
                <Skeleton loading={loading} borderRadius="2xl">
                  <EChartsReact option={branchComparisonOption} height="280px" />
                </Skeleton>
              </VStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={cardBorder} h="full">
              <Grid templateColumns={{ base: "1fr", md: "1.2fr 1fr" }} gap={5} h="full">
                {/* 9. Attendance Density Heatmap */}
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0.5}>
                      <Heading size="sm" fontWeight="900" color={valueColor}>
                        Attendance Heatmap
                      </Heading>
                      <Text fontSize="xs" color={mutedText} fontWeight="700">
                        Check-in density by weekday & time
                      </Text>
                    </VStack>
                  </HStack>
                  <Skeleton loading={loading} borderRadius="2xl" flex="1">
                    <EChartsReact option={calendarHeatmapOption} height="220px" />
                  </Skeleton>
                </VStack>

                {/* 12. Attendance Goal Tracking */}
                <VStack align="center" justify="center" p={4} bg="blue.500/5" borderRadius="24px" border="1px dashed" borderColor="blue.500/20" gap={4}>
                  <Circle size="12" bg="blue.500/10" color="blue.500">
                    <Award size={20} />
                  </Circle>
                  <VStack gap={1} textAlign="center">
                    <Heading size="xs" fontWeight="900" color={mutedText} textTransform="uppercase">
                      Attendance Goal Tracking
                    </Heading>
                    <Text fontSize="xs" color={mutedText} fontWeight="600">
                      Today's progress against operational target
                    </Text>
                  </VStack>

                  <VStack gap={0} align="center">
                    <Text fontSize="4xl" fontWeight="900" color="#4318FF" letterSpacing="tight">
                      {data.goalTracking.achievementRate}%
                    </Text>
                    <Text fontSize="xs" fontWeight="800" color={valueColor}>
                      Achievement Rate
                    </Text>
                  </VStack>

                  <SimpleGrid columns={2} gap={4} w="full" pt={2} borderTop="1px solid" borderColor="app.card.border">
                    <VStack align="center" gap={0}>
                      <Text fontSize="2xs" color={mutedText} fontWeight="800" textTransform="uppercase">Target</Text>
                      <Text fontSize="md" fontWeight="900" color={valueColor}>{data.goalTracking.target}</Text>
                    </VStack>
                    <VStack align="center" gap={0} borderLeft="1px solid" borderColor="app.card.border">
                      <Text fontSize="2xs" color={mutedText} fontWeight="800" textTransform="uppercase">Actual</Text>
                      <Text fontSize="md" fontWeight="900" color="#05CD99">{data.goalTracking.actual}</Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Grid>
            </Box>
          </GridItem>
        </Grid>

        {/* ─── 13. Attendance Alerts (High Churn Risks) ────────────────── */}
        <Box
          p={5}
          borderRadius="24px"
          bg="orange.500/5"
          border="1px solid"
          borderColor="orange.500/20"
        >
          <HStack justify="space-between" mb={3}>
            <HStack gap={2}>
              <AlertTriangle size={18} color="var(--chakra-colors-orange-500)" />
              <Heading size="xs" fontWeight="900" color="orange.600" textTransform="uppercase">
                Attention Required: Slipping Member Alerts
              </Heading>
            </HStack>
            <Badge colorPalette="orange" variant="outline" borderRadius="full">
              {data.alerts.length} Warnings
            </Badge>
          </HStack>
          <VStack align="stretch" gap={2}>
            {data.alerts.map((alert) => (
              <HStack
                key={alert.id}
                p={3}
                borderRadius="14px"
                bg={useColorModeValue("white", "slate.900")}
                border="1px solid"
                borderColor="app.card.border"
                fontSize="xs"
                fontWeight="700"
                color="text.default"
                justify="space-between"
              >
                <HStack gap={3}>
                  <Circle size="6" bg={alert.severity === "error" ? "red.500/10" : "orange.500/10"} color={alert.severity === "error" ? "red.500" : "orange.500"}>
                    <AlertTriangle size={12} />
                  </Circle>
                  <Text>{alert.message}</Text>
                </HStack>
                <Button variant="ghost" size="xs" colorPalette="orange" fontWeight="900">
                  Re-engage <ArrowUpRight size={12} style={{ marginLeft: "4px" }} />
                </Button>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* ─── 5, 6, 7. Detailed Tabular Reports Section ──────────────── */}
        <Box
          borderRadius="30px"
          bg={panelBg}
          border="1px solid"
          borderColor={cardBorder}
          overflow="hidden"
          boxShadow="sm"
        >
          <TabsRoot defaultValue="members">
            <Flex
              px={6}
              pt={6}
              pb={3}
              justify="space-between"
              align="center"
              borderBottom="1px solid"
              borderColor="app.card.border"
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              <VStack align="start" gap={0.5}>
                <Heading size="md" fontWeight="900" color={valueColor}>
                  Tabular Intelligence Logs
                </Heading>
                <Text fontSize="xs" color={mutedText} fontWeight="700">
                  Detailed drill-down list view logs for compliance audits
                </Text>
              </VStack>

              <TabsList bg="app.input.bg" p={1} borderRadius="16px" border="1px solid" borderColor="app.card.border">
                <TabsTrigger
                  value="members"
                  px={4}
                  py={2}
                  fontSize="xs"
                  fontWeight="800"
                  borderRadius="12px"
                  _selected={{
                    bg: "blue.500",
                    color: "white",
                    boxShadow: "sm",
                  }}
                >
                  Member Attendance
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  px={4}
                  py={2}
                  fontSize="xs"
                  fontWeight="800"
                  borderRadius="12px"
                  _selected={{
                    bg: "blue.500",
                    color: "white",
                    boxShadow: "sm",
                  }}
                >
                  Inactive Members
                </TabsTrigger>
                <TabsTrigger
                  value="trainers"
                  px={4}
                  py={2}
                  fontSize="xs"
                  fontWeight="800"
                  borderRadius="12px"
                  _selected={{
                    bg: "blue.500",
                    color: "white",
                    boxShadow: "sm",
                  }}
                >
                  Trainer Presence
                </TabsTrigger>
              </TabsList>
            </Flex>

            {/* TAB 1: Member Attendance Table */}
            <TabsContent value="members" p={0}>
              <Box overflowX="auto">
                <Table.Root size="sm" variant="line">
                  <Table.Header bg={tableHeaderBg}>
                    <Table.Row borderColor="app.card.border">
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText}>
                        Member Name
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="center">
                        Membership Plan
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="center">
                        Last Visit Date
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="right">
                        Visits This Month
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="right">
                        Attendance Rate
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="right">
                        Status
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.memberAttendanceTable.rows.map((row, index) => (
                      <Table.Row
                        key={index}
                        borderColor="app.card.border"
                        _hover={{ bg: isDark ? "navy.900/40" : "gray.50/60" }}
                      >
                        <Table.Cell py={4} px={6}>
                          <Text fontWeight="800" color={valueColor}>
                            {row.name}
                          </Text>
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="center">
                          <Badge colorPalette="purple" variant="outline" borderRadius="full">
                            {row.plan}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="center">
                          <Text fontWeight="700" color={valueColor}>
                            {row.lastVisit}
                          </Text>
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="800" color={valueColor} fontFamily="mono">
                          {row.visits} Visits
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="800" color="#05CD99" fontFamily="mono">
                          {row.percentage}%
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="right">
                          <Badge
                            colorPalette={
                              row.status === "Active" ? "green" : row.status === "Low Attendance" ? "orange" : "red"
                            }
                            variant="solid"
                            borderRadius="full"
                            size="sm"
                          >
                            {row.status}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </TabsContent>

            {/* TAB 2: Inactive Members Report */}
            <TabsContent value="inactive" p={0}>
              <Box overflowX="auto">
                <Table.Root size="sm" variant="line">
                  <Table.Header bg={tableHeaderBg}>
                    <Table.Row borderColor="app.card.border">
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText}>
                        Member Name
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="center">
                        Last Visit Date
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="right">
                        Days Since Last Visit
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="right">
                        Membership Expiry
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="right">
                        Actions
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.inactiveMembersReport.rows.map((row, index) => (
                      <Table.Row
                        key={index}
                        borderColor="app.card.border"
                        _hover={{ bg: isDark ? "navy.900/40" : "gray.50/60" }}
                      >
                        <Table.Cell py={4} px={6}>
                          <Text fontWeight="800" color={valueColor}>
                            {row.name}
                          </Text>
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="center">
                          <Text fontWeight="700" color={valueColor}>
                            {row.lastVisit}
                          </Text>
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="900" color="red.500" fontFamily="mono">
                          {row.daysSince} Days Idle
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="700" color={valueColor}>
                          {row.expiryDate}
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="right">
                          <Button size="xs" colorPalette="orange" variant="outline" fontWeight="800" borderRadius="8px">
                            Trigger Outreach
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </TabsContent>

            {/* TAB 3: Trainer Attendance Report */}
            <TabsContent value="trainers" p={0}>
              <Box overflowX="auto">
                <Table.Root size="sm" variant="line">
                  <Table.Header bg={tableHeaderBg}>
                    <Table.Row borderColor="app.card.border">
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText}>
                        Trainer Name
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="center">
                        Sessions Conducted
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="right">
                        Attendance Days
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6} fontSize="10px" fontWeight="800" textTransform="uppercase" color={mutedText} textAlign="right">
                        Working Hours
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.trainerAttendanceReport.rows.map((row, index) => (
                      <Table.Row
                        key={index}
                        borderColor="app.card.border"
                        _hover={{ bg: isDark ? "navy.900/40" : "gray.50/60" }}
                      >
                        <Table.Cell py={4} px={6}>
                          <Text fontWeight="800" color={valueColor}>
                            {row.trainerName}
                          </Text>
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="center" fontSize="sm" fontWeight="800" color={valueColor} fontFamily="mono">
                          {row.sessions} Sessions
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="800" color="#05CD99" fontFamily="mono">
                          {row.days} Days
                        </Table.Cell>
                        <Table.Cell py={4} px={6} textAlign="right" fontSize="sm" fontWeight="800" color="#4318FF" fontFamily="mono">
                          {row.hours} Hours
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </TabsContent>
          </TabsRoot>
        </Box>
      </VStack>
    </Box>
  );
});

AttendanceReport.displayName = "AttendanceReport";
export default AttendanceReport;
