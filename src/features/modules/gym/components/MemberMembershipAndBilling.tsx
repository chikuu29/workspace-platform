/**
 * MemberMembershipAndBilling.tsx
 *
 * Dedicated tabbed cockpit component for Member details:
 *   - Tab 1: Current Active Membership (with plan details & renew action)
 *   - Tab 2: Orders List (paginated)
 *   - Tab 3: Invoices List (paginated)
 *   - Tab 4: Payments List (paginated)
 */
import { memo, useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Button, Circle, Flex, HStack, Icon, Separator,
  SimpleGrid, Text, VStack, Badge, Table, IconButton, Grid, Heading,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  CalendarDays, Clock, CreditCard, ChevronRight, Zap, Sparkles,
  ShoppingBag, Receipt, IndianRupee, AlertCircle, RefreshCw,
} from "lucide-react";
import { GymApiService } from "../services/gymApi.service";
import Pagination, { PageSize } from "./Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { toaster } from "@/components/ui/toaster";
import { SegmentedControl } from "./SegmentedControl";
import type { SegmentedOption } from "./SegmentedControl";

const BRAND_HEX = "#422AFB";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

const BILLING_LABEL: Record<string, string> = {
  monthly: "month",
  quarterly: "quarter",
  yearly: "year",
  "half-yearly": "6 months",
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtDate = (d?: string) => {
  if (!d) return "N/A";
  const p = new Date(d);
  return Number.isNaN(p.getTime())
    ? "N/A"
    : p.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const fmtCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

// ─── Local SectionHeading ─────────────────────────────────────────────────────
const SectionHeading = memo(({ children }: { children: React.ReactNode }) => (
  <HStack gap={2}>
    <Box w={1} h={5} bg={BRAND_GRADIENT} borderRadius="full" />
    <Text fontSize="sm" fontWeight="800" color="app.text.primary" letterSpacing="tight">
      {children}
    </Text>
  </HStack>
));
SectionHeading.displayName = "SectionHeading";

// ─── Props ───────────────────────────────────────────────────────────────────
interface MemberMembershipAndBillingProps {
  memberId: string;
  onAssignPlan?: () => void;
  onViewInvoice?: (invoiceNo: string) => void;
  onViewOrder?: (orderId: string) => void;
}

type TabKey = "membership" | "orders" | "invoices" | "payments";

export const MemberMembershipAndBilling = memo(({
  memberId,
  onAssignPlan,
  onViewInvoice,
  onViewOrder,
}: MemberMembershipAndBillingProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("membership");
  const muted = useColorModeValue("gray.500", "gray.400");
  const border = useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)");

  // Data States
  const [membership, setMembership] = useState<any>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);
  const [orderPage, setOrderPage] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPageSize, setOrderPageSize] = useState<PageSize>(12);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicePage, setInvoicePage] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [invoicePageSize, setInvoicePageSize] = useState<PageSize>(12);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [payments, setPayments] = useState<any[]>([]);
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentPageSize, setPaymentPageSize] = useState<PageSize>(12);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // ── API Fetchers ──
  const fetchMembership = useCallback(() => {
    setLoadingMembership(true);
    GymApiService.getMemberMembership(memberId).subscribe({
      next: (res: any) => {
        setMembership(res && res.data ? res : null);
        setLoadingMembership(false);
      },
      error: () => {
        setMembership(null);
        setLoadingMembership(false);
      },
    });
  }, [memberId]);

  const fetchOrders = useCallback(() => {
    setLoadingOrders(true);
    GymApiService.getMemberOrders(memberId, orderPage + 1, orderPageSize).subscribe({
      next: (res: any) => {
        if (res.success) {
          setOrders(res.data);
          setOrderTotal(res.pagination?.total || res.data.length);
        }
        setLoadingOrders(false);
      },
      error: () => setLoadingOrders(false),
    });
  }, [memberId, orderPage, orderPageSize]);

  const fetchInvoices = useCallback(() => {
    setLoadingInvoices(true);
    GymApiService.getMemberInvoices(memberId, invoicePage + 1, invoicePageSize).subscribe({
      next: (res: any) => {
        if (res.success) {
          setInvoices(res.data);
          setInvoiceTotal(res.pagination?.total || res.data.length);
        }
        setLoadingInvoices(false);
      },
      error: () => setLoadingInvoices(false),
    });
  }, [memberId, invoicePage, invoicePageSize]);

  const fetchPayments = useCallback(() => {
    setLoadingPayments(true);
    GymApiService.getMemberPayments(memberId, paymentPage + 1, paymentPageSize).subscribe({
      next: (res: any) => {
        if (res.success) {
          setPayments(res.data);
          setPaymentTotal(res.pagination?.total || res.data.length);
        }
        setLoadingPayments(false);
      },
      error: () => setLoadingPayments(false),
    });
  }, [memberId, paymentPage, paymentPageSize]);

  // Sync data queries on active tab change
  useEffect(() => {
    if (activeTab === "membership") fetchMembership();
    else if (activeTab === "orders") fetchOrders();
    else if (activeTab === "invoices") fetchInvoices();
    else if (activeTab === "payments") fetchPayments();
  }, [activeTab, fetchMembership, fetchOrders, fetchInvoices, fetchPayments]);

  const daysRemaining = useMemo(() => {
    if (!membership?.data?.end_date) return null;
    const end = new Date(membership.data.end_date);
    if (Number.isNaN(end.getTime())) return null;
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [membership]);

  const tabOptions = useMemo<readonly SegmentedOption[]>(() => [
    { id: "membership", label: "Membership", icon: Sparkles },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "payments", label: "Payments", icon: CreditCard },
  ], []);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id as TabKey);
  }, []);

  return (
    <VStack align="stretch" gap={5}>
      {/* Tab Navigation header */}
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={3} pb={2} borderBottom="1px solid" borderColor={border}>
        <SectionHeading>Membership & Billing</SectionHeading>
        
        <Box maxW="full" overflowX="auto" css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
          <SegmentedControl
            options={tabOptions}
            activeId={activeTab}
            onChange={handleTabChange}
          />
        </Box>
      </Flex>

      {/* Tab Panels with fixed minimum height to prevent layout shifts */}
      <Box minH={{ base: "auto", md: "380px" }} w="full">
        {/* ─── TAB 1: MEMBERSHIP ─── */}
        {activeTab === "membership" && (
          <Box>
            {loadingMembership ? (
              <VStack align="stretch" gap={4}>
                <Skeleton height="140px" borderRadius="2xl" />
                <Skeleton height="80px" borderRadius="xl" />
              </VStack>
            ) : membership ? (
              <VStack align="stretch" gap={4.5}>
                {/* Membership Details Card */}
                <Box
                  p={5}
                  borderRadius="2xl"
                  bg={useColorModeValue("rgba(248,250,252,0.6)", "rgba(255,255,255,0.02)")}
                  border="1px solid"
                  borderColor={useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.06)")}
                  position="relative"
                  overflow="hidden"
                >
                  {/* Accent strip */}
                  <Box position="absolute" top={0} left={0} right={0} h="3px" bg={BRAND_GRADIENT} />

                  <VStack align="stretch" gap={4}>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" gap={0.5}>
                        <Text fontSize="2xs" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                          Current Subscription
                        </Text>
                        <Heading size="md" fontWeight="900" color="app.text.primary" letterSpacing="tight">
                          {membership.plan_details?.name || "Active Plan"}
                        </Heading>
                      </VStack>
                      <Badge colorPalette="green" variant="solid" borderRadius="full" px={3} py={0.5} fontWeight="900" fontSize="2xs">
                        {membership.data.status}
                      </Badge>
                    </Flex>

                    <SimpleGrid columns={2} gap={4}>
                      <VStack align="start" gap={0.5}>
                        <Text fontSize="3xs" color={muted} fontWeight="850" textTransform="uppercase">Price</Text>
                        <Text fontSize="md" fontWeight="800" color="app.text.primary">
                          {fmtCurrency(membership.data.price || 0)}
                          <Text as="span" fontSize="xs" color={muted} fontWeight="600">
                            /{BILLING_LABEL[membership.data.billing_cycle] || "cycle"}
                          </Text>
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0.5}>
                        <Text fontSize="3xs" color={muted} fontWeight="850" textTransform="uppercase">Ends On</Text>
                        <Text fontSize="md" fontWeight="800" color="app.text.primary">
                          {fmtDate(membership.data.end_date)}
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </Box>

                {/* Days remaining badge notification */}
                {daysRemaining !== null && (
                  <Flex
                    p={3.5}
                    borderRadius="xl"
                    align="center"
                    gap={3}
                    bg={daysRemaining <= 7 ? "orange.500/10" : "blue.500/8"}
                    border="1px solid"
                    borderColor={daysRemaining <= 7 ? "orange.500/20" : "blue.500/15"}
                  >
                    <Icon as={AlertCircle} boxSize={4} color={daysRemaining <= 7 ? "orange.500" : "blue.500"} />
                    <Text fontSize="xs" fontWeight="700" color="app.text.primary">
                      {daysRemaining === 0 ? (
                        "Subscription expired today."
                      ) : daysRemaining <= 7 ? (
                        `Subscription ending soon: ${daysRemaining} days remaining.`
                      ) : (
                        `${daysRemaining} active days remaining on this plan.`
                      )}
                    </Text>
                  </Flex>
                )}

                {membership.data.invoice_number && (
                  <Flex
                    p={4}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)")}
                    bg={useColorModeValue("rgba(248,250,252,0.8)", "rgba(255,255,255,0.02)")}
                    align="center"
                    justify="space-between"
                    gap={4}
                    cursor="pointer"
                    onClick={() => onViewInvoice?.(membership.data.invoice_number)}
                    transition="all 0.2s"
                    _hover={{ borderColor: `${BRAND_HEX}35`, transform: "translateY(-2px)", bg: `${BRAND_HEX}06` }}
                  >
                    <HStack gap={3}>
                      <Circle size={10} style={{ background: `${BRAND_HEX}15`, color: BRAND_HEX }}>
                        <CreditCard size={16} />
                      </Circle>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="700" color="app.text.primary">{membership.data.invoice_number}</Text>
                        <Text fontSize="xs" color={muted}>Active invoice details</Text>
                      </VStack>
                    </HStack>
                    <HStack gap={2}>
                      <Text fontSize="xs" fontWeight="700" style={{ color: BRAND_HEX }}>View Invoice</Text>
                      <ChevronRight size={14} color={BRAND_HEX} />
                    </HStack>
                  </Flex>
                )}

                {/* Renew Plan button */}
                <Button
                  w="full"
                  h="42px"
                  borderRadius="xl"
                  fontWeight="900"
                  fontSize="sm"
                  style={{ background: BRAND_GRADIENT, color: "white" }}
                  boxShadow={`0 6px 18px ${BRAND_HEX}59`}
                  onClick={onAssignPlan}
                  _hover={{ transform: "translateY(-2px)", boxShadow: `0 12px 28px ${BRAND_HEX}80` }}
                  _active={{ transform: "scale(0.98)" }}
                  transition="all 0.25s"
                >
                  <Zap size={14} style={{ marginRight: "6px" }} />
                  Renew / Change Plan
                </Button>
              </VStack>
            ) : (
              <VStack align="stretch" gap={4}>
                {/* No Active Subscription State */}
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  p={8}
                  borderRadius="2xl"
                  border="2px dashed"
                  borderColor={useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)")}
                  bg={useColorModeValue("rgba(248,250,252,0.5)", "rgba(255,255,255,0.02)")}
                  gap={4}
                  textAlign="center"
                >
                  <Circle size="12" style={{ background: "rgba(255,181,71,0.12)", color: "#FFB547" }}>
                    <AlertCircle size={22} />
                  </Circle>
                  <VStack gap={1}>
                    <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                      No active subscription
                    </Text>
                    <Text fontSize="xs" color={muted} maxW="xs" fontWeight="600">
                      This member is currently not enrolled in any membership plan.
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    borderRadius="xl"
                    fontWeight="800"
                    px={5}
                    style={{ background: BRAND_GRADIENT, color: "white" }}
                    onClick={onAssignPlan}
                  >
                    Assign Membership Plan
                  </Button>
                </Flex>
              </VStack>
            )}
          </Box>
        )}

        {/* ─── TAB 2: ORDERS ─── */}
        {activeTab === "orders" && (
          <Box>
            {loadingOrders ? (
              <VStack align="stretch" gap={3.5}>
                <Skeleton height="38px" borderRadius="xl" />
                <Skeleton height="50px" borderRadius="xl" />
                <Skeleton height="50px" borderRadius="xl" />
              </VStack>
            ) : orders.length > 0 ? (
              <VStack align="stretch" gap={3}>
                {/* Column Headers */}
                <Grid
                  templateColumns={{ base: "1.2fr 1fr 0.5fr", md: "1.5fr 1fr 1fr 1fr 0.5fr" }}
                  gap={4}
                  px={4}
                  py={2}
                  display={{ base: "none", sm: "grid" }}
                  borderBottom="1px solid"
                  borderColor={border}
                >
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider">ORDER NO.</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "block" }}>PLAN</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider">AMOUNT</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "block" }}>STATUS</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" textAlign="right">ACTION</Text>
                </Grid>

                {/* Rows */}
                <VStack align="stretch" gap={2.5}>
                  {orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      paid: "green",
                      pending: "orange",
                      failed: "red",
                    };
                    const color = statusColors[order.status.toLowerCase()] || "gray";
                    return (
                      <Grid
                        key={order._id}
                        templateColumns={{ base: "1.2fr 1fr 0.5fr", md: "1.5fr 1fr 1fr 1fr 0.5fr" }}
                        gap={4}
                        p={3.5}
                        borderRadius="xl"
                        alignItems="center"
                        border="1px solid"
                        borderColor={useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)")}
                        bg={useColorModeValue("rgba(255,255,255,0.4)", "rgba(255,255,255,0.015)")}
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                          bg: useColorModeValue("rgba(255,255,255,0.85)", "rgba(255,255,255,0.035)"),
                          borderColor: `${BRAND_HEX}25`,
                          transform: "translateY(-1.5px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                        }}
                      >
                        <HStack gap={3.5}>
                          <Circle size={8} style={{ background: `${BRAND_HEX}12`, color: BRAND_HEX }} flexShrink={0}>
                            <ShoppingBag size={14} />
                          </Circle>
                          <VStack align="start" gap={0} minW={0}>
                            <HStack gap={1.5} flexWrap="wrap">
                              <Text fontSize="xs" fontWeight="800" color="app.text.primary" lineClamp={1}>
                                {order.order_number}
                              </Text>
                              <Box display={{ base: "inline-block", md: "none" }}>
                                <Badge colorPalette={color} variant="subtle" borderRadius="full" px={1.5} py={0} fontSize="4xs" fontWeight="900">
                                  {order.status}
                                </Badge>
                              </Box>
                            </HStack>
                            <Text fontSize="3xs" color={muted} fontWeight="650">{fmtDate(order.created_at)}</Text>
                          </VStack>
                        </HStack>

                        <Text fontSize="xs" fontWeight="700" color="app.text.primary" display={{ base: "none", md: "block" }}>
                          {order.planName || "Plan"}
                        </Text>

                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                          {fmtCurrency(order.total)}
                        </Text>

                        <Box display={{ base: "none", md: "block" }}>
                          <Badge colorPalette={color} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="3xs" fontWeight="900">
                            {order.status}
                          </Badge>
                        </Box>

                        <Flex justify="end">
                          <Button
                            variant="ghost"
                            h="26px"
                            px={3}
                            borderRadius="lg"
                            fontWeight="800"
                            fontSize="xs"
                            style={{ color: BRAND_HEX }}
                            _hover={{ bg: `${BRAND_HEX}0d` }}
                            onClick={() => onViewOrder?.(order.order_number)}
                          >
                            View
                          </Button>
                        </Flex>
                      </Grid>
                    );
                  })}
                </VStack>

                <Pagination
                  currentPage={orderPage}
                  totalPages={Math.ceil(orderTotal / orderPageSize)}
                  totalItems={orderTotal}
                  pageSize={orderPageSize}
                  onPageChange={setOrderPage}
                  onPageSizeChange={setOrderPageSize}
                />
              </VStack>
            ) : (
              <Flex align="center" justify="center" p={8} direction="column" gap={3}>
                <Circle size={10} style={{ background: "rgba(66,42,251,0.08)", color: BRAND_HEX }}>
                  <AlertCircle size={18} />
                </Circle>
                <Text fontSize="xs" fontWeight="750" color="app.text.muted">No orders recorded for this member.</Text>
              </Flex>
            )}
          </Box>
        )}

        {/* ─── TAB 3: INVOICES ─── */}
        {activeTab === "invoices" && (
          <Box>
            {loadingInvoices ? (
              <VStack align="stretch" gap={3.5}>
                <Skeleton height="38px" borderRadius="xl" />
                <Skeleton height="50px" borderRadius="xl" />
                <Skeleton height="50px" borderRadius="xl" />
              </VStack>
            ) : invoices.length > 0 ? (
              <VStack align="stretch" gap={3}>
                {/* Column Headers */}
                <Grid
                  templateColumns={{ base: "1.2fr 1fr 0.5fr", md: "1.5fr 1fr 1fr 1fr 0.5fr" }}
                  gap={4}
                  px={4}
                  py={2}
                  display={{ base: "none", sm: "grid" }}
                  borderBottom="1px solid"
                  borderColor={border}
                >
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider">INVOICE NO.</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "block" }}>PLAN</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider">AMOUNT</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "block" }}>STATUS</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" textAlign="right">ACTION</Text>
                </Grid>

                {/* Rows */}
                <VStack align="stretch" gap={2.5}>
                  {invoices.map((invoice) => {
                    const statusColors: Record<string, string> = {
                      paid: "green",
                      unpaid: "red",
                      overdue: "orange",
                    };
                    const color = statusColors[invoice.status.toLowerCase()] || "gray";
                    return (
                      <Grid
                        key={invoice._id}
                        templateColumns={{ base: "1.2fr 1fr 0.5fr", md: "1.5fr 1fr 1fr 1fr 0.5fr" }}
                        gap={4}
                        p={3.5}
                        borderRadius="xl"
                        alignItems="center"
                        border="1px solid"
                        borderColor={useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)")}
                        bg={useColorModeValue("rgba(255,255,255,0.4)", "rgba(255,255,255,0.015)")}
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                          bg: useColorModeValue("rgba(255,255,255,0.85)", "rgba(255,255,255,0.035)"),
                          borderColor: `${BRAND_HEX}25`,
                          transform: "translateY(-1.5px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                        }}
                      >
                        <HStack gap={3.5}>
                          <Circle size={8} style={{ background: `${BRAND_HEX}12`, color: BRAND_HEX }} flexShrink={0}>
                            <Receipt size={14} />
                          </Circle>
                          <VStack align="start" gap={0} minW={0}>
                            <HStack gap={1.5} flexWrap="wrap">
                              <Text fontSize="xs" fontWeight="800" color="app.text.primary" lineClamp={1}>
                                {invoice.invoice_number}
                              </Text>
                              <Box display={{ base: "inline-block", md: "none" }}>
                                <Badge colorPalette={color} variant="subtle" borderRadius="full" px={1.5} py={0} fontSize="4xs" fontWeight="900">
                                  {invoice.status}
                                </Badge>
                              </Box>
                            </HStack>
                            <Text fontSize="3xs" color={muted} fontWeight="650">{fmtDate(invoice.created_at)}</Text>
                          </VStack>
                        </HStack>

                        <Text fontSize="xs" fontWeight="700" color="app.text.primary" display={{ base: "none", md: "block" }}>
                          {invoice.planName || "Plan"}
                        </Text>

                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                          {fmtCurrency(invoice.total)}
                        </Text>

                        <Box display={{ base: "none", md: "block" }}>
                          <Badge colorPalette={color} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="3xs" fontWeight="900">
                            {invoice.status}
                          </Badge>
                        </Box>

                        <Flex justify="end">
                          <Button
                            variant="ghost"
                            h="26px"
                            px={3}
                            borderRadius="lg"
                            fontWeight="800"
                            fontSize="xs"
                            style={{ color: BRAND_HEX }}
                            _hover={{ bg: `${BRAND_HEX}0d` }}
                            onClick={() => onViewInvoice?.(invoice.invoice_number)}
                          >
                            View
                          </Button>
                        </Flex>
                      </Grid>
                    );
                  })}
                </VStack>

                <Pagination
                  currentPage={invoicePage}
                  totalPages={Math.ceil(invoiceTotal / invoicePageSize)}
                  totalItems={invoiceTotal}
                  pageSize={invoicePageSize}
                  onPageChange={setInvoicePage}
                  onPageSizeChange={setInvoicePageSize}
                />
              </VStack>
            ) : (
              <Flex align="center" justify="center" p={8} direction="column" gap={3}>
                <Circle size={10} style={{ background: "rgba(66,42,251,0.08)", color: BRAND_HEX }}>
                  <AlertCircle size={18} />
                </Circle>
                <Text fontSize="xs" fontWeight="750" color="app.text.muted">No invoices recorded for this member.</Text>
              </Flex>
            )}
          </Box>
        )}

        {/* ─── TAB 4: PAYMENTS ─── */}
        {activeTab === "payments" && (
          <Box>
            {loadingPayments ? (
              <VStack align="stretch" gap={3.5}>
                <Skeleton height="38px" borderRadius="xl" />
                <Skeleton height="50px" borderRadius="xl" />
                <Skeleton height="50px" borderRadius="xl" />
              </VStack>
            ) : payments.length > 0 ? (
              <VStack align="stretch" gap={3}>
                {/* Column Headers */}
                <Grid
                  templateColumns={{ base: "1.2fr 1fr 0.5fr", md: "1.5fr 1fr 1.2fr 0.8fr 0.5fr" }}
                  gap={4}
                  px={4}
                  py={2}
                  display={{ base: "none", sm: "grid" }}
                  borderBottom="1px solid"
                  borderColor={border}
                >
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider">TRANSACTION ID</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider">AMOUNT</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "block" }}>METHOD</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "block" }}>STATUS</Text>
                  <Text fontSize="2xs" fontWeight="850" color={muted} textTransform="uppercase" letterSpacing="wider" textAlign="right">ACTION</Text>
                </Grid>

                {/* Rows */}
                <VStack align="stretch" gap={2.5}>
                  {payments.map((payment) => {
                    const statusColors: Record<string, string> = {
                      success: "green",
                      pending: "orange",
                      failed: "red",
                    };
                    const color = statusColors[payment.status.toLowerCase()] || "gray";
                    return (
                      <Grid
                        key={payment._id}
                        templateColumns={{ base: "1.2fr 1fr 0.5fr", md: "1.5fr 1fr 1.2fr 0.8fr 0.5fr" }}
                        gap={4}
                        p={3.5}
                        borderRadius="xl"
                        alignItems="center"
                        border="1px solid"
                        borderColor={useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)")}
                        bg={useColorModeValue("rgba(255,255,255,0.4)", "rgba(255,255,255,0.015)")}
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                          bg: useColorModeValue("rgba(255,255,255,0.85)", "rgba(255,255,255,0.035)"),
                          borderColor: `${BRAND_HEX}25`,
                          transform: "translateY(-1.5px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                        }}
                      >
                        <HStack gap={3.5}>
                          <Circle size={8} style={{ background: `${BRAND_HEX}12`, color: BRAND_HEX }} flexShrink={0}>
                            <CreditCard size={14} />
                          </Circle>
                          <VStack align="start" gap={0} minW={0}>
                            <HStack gap={1.5} flexWrap="wrap">
                              <Text fontSize="xs" fontWeight="800" color="app.text.primary" lineClamp={1}>
                                {payment.transaction_id || "N/A"}
                              </Text>
                              <Box display={{ base: "inline-block", md: "none" }}>
                                <Badge colorPalette={color} variant="subtle" borderRadius="full" px={1.5} py={0} fontSize="4xs" fontWeight="900">
                                  {payment.status}
                                </Badge>
                              </Box>
                            </HStack>
                            <Text fontSize="3xs" color={muted} fontWeight="650">{fmtDate(payment.created_at)}</Text>
                          </VStack>
                        </HStack>

                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                          {fmtCurrency(payment.amount)}
                        </Text>

                        <VStack align="start" gap={0} display={{ base: "none", md: "flex" }}>
                          <Text fontSize="xs" fontWeight="700" color="app.text.primary" textTransform="capitalize">
                            {payment.method || "N/A"}
                          </Text>
                        </VStack>

                        <Box display={{ base: "none", md: "block" }}>
                          <Badge colorPalette={color} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="3xs" fontWeight="900">
                            {payment.status}
                          </Badge>
                        </Box>

                        <Flex justify="end">
                          <Button
                            variant="ghost"
                            h="26px"
                            px={3}
                            borderRadius="lg"
                            fontWeight="800"
                            fontSize="xs"
                            style={{ color: BRAND_HEX }}
                            _hover={{ bg: `${BRAND_HEX}0d` }}
                            onClick={() => onViewInvoice?.(payment.invoice_ref)}
                          >
                            View
                          </Button>
                        </Flex>
                      </Grid>
                    );
                  })}
                </VStack>

                <Pagination
                  currentPage={paymentPage}
                  totalPages={Math.ceil(paymentTotal / paymentPageSize)}
                  totalItems={paymentTotal}
                  pageSize={paymentPageSize}
                  onPageChange={setPaymentPage}
                  onPageSizeChange={setPaymentPageSize}
                />
              </VStack>
            ) : (
              <Flex align="center" justify="center" p={8} direction="column" gap={3}>
                <Circle size={10} style={{ background: "rgba(66,42,251,0.08)", color: BRAND_HEX }}>
                  <AlertCircle size={18} />
                </Circle>
                <Text fontSize="xs" fontWeight="750" color="app.text.muted">No payments recorded for this member.</Text>
              </Flex>
            )}
          </Box>
        )}
      </Box>
    </VStack>
  );
});

MemberMembershipAndBilling.displayName = "MemberMembershipAndBilling";
export default MemberMembershipAndBilling;
