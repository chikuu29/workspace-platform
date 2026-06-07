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
  SimpleGrid, Text, VStack, Badge, Table, IconButton, Grid,
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
  onAssignPlan: () => void;
  onViewInvoice?: (invoiceNumber: string) => void;
  onViewOrder?: (orderNumber: string) => void;
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

  // ── Fetch Membership ──
  const fetchMembership = useCallback(() => {
    if (!memberId) return;
    setLoadingMembership(true);
    const sub = GymApiService.getMemberMembership(memberId).subscribe({
      next: (data) => {
        setMembership(data);
        setLoadingMembership(false);
      },
      error: () => {
        setMembership(null);
        setLoadingMembership(false);
      },
    });
    return () => sub.unsubscribe();
  }, [memberId]);

  // ── Fetch Orders ──
  const fetchOrders = useCallback(() => {
    if (!memberId || activeTab !== "orders") return;
    setLoadingOrders(true);
    const sub = GymApiService.getMemberOrders(memberId, orderPage + 1, orderPageSize).subscribe({
      next: (res) => {
        if (res.success) {
          setOrders(res.data || []);
          setOrderTotal(res.pagination?.total || 0);
        }
        setLoadingOrders(false);
      },
      error: () => {
        setOrders([]);
        setLoadingOrders(false);
      },
    });
    return () => sub.unsubscribe();
  }, [memberId, activeTab, orderPage, orderPageSize]);

  // ── Fetch Invoices ──
  const fetchInvoices = useCallback(() => {
    if (!memberId || activeTab !== "invoices") return;
    setLoadingInvoices(true);
    const sub = GymApiService.getMemberInvoices(memberId, invoicePage + 1, invoicePageSize).subscribe({
      next: (res) => {
        if (res.success) {
          setInvoices(res.data || []);
          setInvoiceTotal(res.pagination?.total || 0);
        }
        setLoadingInvoices(false);
      },
      error: () => {
        setInvoices([]);
        setLoadingInvoices(false);
      },
    });
    return () => sub.unsubscribe();
  }, [memberId, activeTab, invoicePage, invoicePageSize]);

  // ── Fetch Payments ──
  const fetchPayments = useCallback(() => {
    if (!memberId || activeTab !== "payments") return;
    setLoadingPayments(true);
    const sub = GymApiService.getMemberPayments(memberId, paymentPage + 1, paymentPageSize).subscribe({
      next: (res) => {
        if (res.success) {
          setPayments(res.data || []);
          setPaymentTotal(res.pagination?.total || 0);
        }
        setLoadingPayments(false);
      },
      error: () => {
        setPayments([]);
        setLoadingPayments(false);
      },
    });
    return () => sub.unsubscribe();
  }, [memberId, activeTab, paymentPage, paymentPageSize]);

  // Trigger fetches
  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const daysRemaining = useMemo(() => {
    if (!membership?.data?.end_date) return null;
    const end = new Date(membership.data.end_date);
    if (Number.isNaN(end.getTime())) return null;
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [membership]);

  const tabList = useMemo(() => [
    { key: "membership", label: "Membership", icon: Sparkles },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "invoices", label: "Invoices", icon: Receipt },
    { key: "payments", label: "Payments", icon: CreditCard },
  ] as const, []);

  // UI styling helpers
  const activeTabColor = useColorModeValue("white", "gray.900");
  const tabBg = useColorModeValue("gray.100", "rgba(255,255,255,0.04)");

  return (
    <VStack align="stretch" gap={5}>
      {/* Tab Navigation header */}
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={3} pb={2} borderBottom="1px solid" borderColor={border}>
        <SectionHeading>Membership & Billing</SectionHeading>
        
        <HStack gap={1} bg={tabBg} p={1} borderRadius="xl" overflow="hidden">
          {tabList.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                size="sm"
                h="32px"
                px={3}
                borderRadius="lg"
                variant={isActive ? "solid" : "ghost"}
                bg={isActive ? BRAND_HEX : "transparent"}
                color={isActive ? "white" : "app.text.muted"}
                fontWeight="800"
                fontSize="xs"
                onClick={() => setActiveTab(tab.key)}
                _hover={isActive ? {} : { bg: useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.05)") }}
                transition="all 0.2s"
              >
                <Icon as={tab.icon} boxSize={3} mr={1.5} />
                {tab.label}
              </Button>
            );
          })}
        </HStack>
      </Flex>

      {/* ─── TAB 1: MEMBERSHIP ─── */}
      {activeTab === "membership" && (
        <Box>
          {loadingMembership ? (
            <VStack align="stretch" gap={4}>
              <Skeleton h="100px" borderRadius="18px" />
              <SimpleGrid columns={3} gap={3}>
                <Skeleton h="60px" borderRadius="14px" />
                <Skeleton h="60px" borderRadius="14px" />
                <Skeleton h="60px" borderRadius="14px" />
              </SimpleGrid>
            </VStack>
          ) : membership ? (
            <VStack align="stretch" gap={4}>
              {/* Plan Hero display */}
              <Box
                p={5}
                borderRadius="18px"
                position="relative"
                overflow="hidden"
                style={{ background: BRAND_GRADIENT }}
              >
                <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" borderRadius="full" bg="whiteAlpha.200" />
                <Box position="absolute" bottom="-30px" left="-10px" w="70px" h="70px" borderRadius="full" bg="whiteAlpha.100" />

                <Flex justify="space-between" align="start" position="relative">
                  <VStack align="start" gap={1}>
                    <Text fontSize="9px" fontWeight="900" color="whiteAlpha.700" letterSpacing="wider">CURRENT ACTIVE PLAN</Text>
                    <Text fontSize="xl" fontWeight="950" color="white" letterSpacing="tight">{membership.data.plan_name}</Text>
                    <HStack gap={2} mt={0.5}>
                      <Badge bg="whiteAlpha.300" color="white" px={2} py={0.5} borderRadius="full" fontSize="9px" fontWeight="900" border="1px solid" borderColor="whiteAlpha.400">
                        {membership.data.billing_cycle?.toUpperCase() ?? "MONTHLY"}
                      </Badge>
                      <Badge
                        bg={membership.data.is_paid ? "rgba(1,181,116,0.3)" : "rgba(255,181,71,0.3)"}
                        color="white"
                        px={2} py={0.5} borderRadius="full" fontSize="9px" fontWeight="900"
                        border="1px solid"
                        borderColor={membership.data.is_paid ? "rgba(1,181,116,0.5)" : "rgba(255,181,71,0.5)"}
                      >
                        {membership.data.is_paid ? "PAID" : "UNPAID"}
                      </Badge>
                    </HStack>
                  </VStack>

                  <VStack align="end" gap={0.5}>
                    <Text fontSize="9px" fontWeight="900" color="whiteAlpha.700" letterSpacing="wider">AMOUNT</Text>
                    <Text fontSize="2xl" fontWeight="950" color="white" letterSpacing="tight">
                      {fmtCurrency(membership.data.price, membership.data.currency)}
                    </Text>
                    <Text fontSize="10px" color="whiteAlpha.700" fontWeight="600">
                      per {BILLING_LABEL[membership.data.billing_cycle] ?? membership.data.billing_cycle}
                    </Text>
                  </VStack>
                </Flex>
              </Box>

              {/* Coverage details */}
              <SimpleGrid columns={3} gap={3}>
                {[
                  { label: "Start Date", value: fmtDate(membership.data.start_date), icon: CalendarDays, color: BRAND_HEX },
                  { label: "End Date", value: fmtDate(membership.data.end_date), icon: CalendarDays, color: daysRemaining !== null && daysRemaining <= 7 ? "#FFB547" : "#01B574" },
                  { label: "Days Left", value: daysRemaining !== null ? `${daysRemaining}d` : "N/A", icon: Clock, color: daysRemaining !== null && daysRemaining <= 7 ? "#FFB547" : BRAND_HEX },
                ].map(({ label, value, icon: RowIcon, color }) => {
                  const cellBg = useColorModeValue("rgba(248,250,252,0.9)", "rgba(255,255,255,0.03)");
                  const cellBorder = useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)");
                  return (
                    <Box key={label} p={3} borderRadius="14px" bg={cellBg} border="1px solid" borderColor={cellBorder}>
                      <Text fontSize="9px" fontWeight="800" color="app.text.muted" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        {label}
                      </Text>
                      <HStack gap={1.5}>
                        <RowIcon size={12} color={color} />
                        <Text fontSize="sm" fontWeight="800" color="app.text.primary">{value}</Text>
                      </HStack>
                    </Box>
                  );
                })}
              </SimpleGrid>

              {/* Payment Invoice Row Link */}
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
              <Box
                p={8}
                borderRadius="18px"
                textAlign="center"
                border="2px dashed"
                borderColor={useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)")}
                bg={useColorModeValue("rgba(248,250,252,0.5)", "rgba(255,255,255,0.02)")}
              >
                <VStack gap={4}>
                  <Circle size={16} style={{ background: `${BRAND_HEX}12` }} color={BRAND_HEX}>
                    <Sparkles size={24} />
                  </Circle>
                  <VStack gap={1}>
                    <Text fontSize="md" fontWeight="900" color="app.text.primary">
                      No Active Membership
                    </Text>
                    <Text fontSize="sm" color={muted} fontWeight="500" maxW="xs" mx="auto">
                      This member doesn't have an active plan. Assign a membership plan to activate their account.
                    </Text>
                  </VStack>
                  <Button
                    h="46px"
                    px={8}
                    borderRadius="xl"
                    fontWeight="900"
                    fontSize="sm"
                    style={{ background: BRAND_GRADIENT, color: "white" }}
                    boxShadow={`0 8px 24px ${BRAND_HEX}66`}
                    onClick={onAssignPlan}
                    _hover={{ transform: "translateY(-2px)", boxShadow: `0 14px 32px ${BRAND_HEX}8c` }}
                    _active={{ transform: "scale(0.98)" }}
                    transition="all 0.25s"
                  >
                    <Zap size={15} style={{ marginRight: "6px" }} />
                    Assign Membership Plan
                  </Button>
                </VStack>
              </Box>
            </VStack>
          )}
        </Box>
      )}

      {/* ─── TAB 2: ORDERS ─── */}
      {activeTab === "orders" && (
        <Box>
          {loadingOrders ? (
            <VStack gap={3}>
              <Skeleton h="40px" borderRadius="lg" />
              <Skeleton h="40px" borderRadius="lg" />
              <Skeleton h="40px" borderRadius="lg" />
            </VStack>
          ) : orders.length > 0 ? (
            <VStack align="stretch" gap={4}>
              <VStack align="stretch" gap={2.5}>
                {/* Header Row */}
                <Grid templateColumns="2fr 1fr 1.5fr 1.5fr 1fr" px={4} py={2} display={{ base: "none", md: "grid" }}>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">ORDER NUMBER</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">STATUS</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">TOTAL</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">CREATED DATE</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider" textAlign="right">ACTION</Text>
                </Grid>

                {/* Data Rows */}
                {orders.map((order) => {
                  const isCompleted = order.status === "completed";
                  const statusColor = isCompleted ? "#01B574" : order.status === "pending" ? "#FFB547" : "#a0aec0";
                  const rowBg = useColorModeValue("rgba(248,250,252,0.6)", "rgba(255,255,255,0.01)");
                  
                  return (
                    <Grid
                      key={order.order_number}
                      templateColumns={{ base: "1fr 1fr", md: "2fr 1fr 1.5fr 1.5fr 1fr" }}
                      gap={{ base: 2, md: 4 }}
                      p={4}
                      alignItems="center"
                      borderRadius="xl"
                      bg={rowBg}
                      border="1px solid"
                      borderColor={border}
                      position="relative"
                      pl={5}
                      overflow="hidden"
                      transition="all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)"
                      _hover={{
                        transform: "translateY(-2px)",
                        borderColor: `${BRAND_HEX}35`,
                        bg: useColorModeValue("white", "rgba(255,255,255,0.04)"),
                        boxShadow: useColorModeValue("0 8px 24px rgba(66,42,251,0.06)", "0 8px 24px rgba(0,0,0,0.2)")
                      }}
                    >
                      {/* Left Accent indicator */}
                      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={statusColor} />

                      {/* Columns */}
                      <VStack align="start" gap={0} gridColumn={{ base: "1 / span 2", md: "auto" }}>
                        <Text fontSize="xs" fontWeight="800" color="app.text.primary">{order.order_number}</Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Order Number</Text>
                      </VStack>

                      <Box>
                        <Badge colorPalette={isCompleted ? "green" : order.status === "pending" ? "orange" : "gray"} variant="subtle" size="xs" borderRadius="full">
                          {order.status}
                        </Badge>
                      </Box>

                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                          {fmtCurrency(order.total, order.currency)}
                        </Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Total Amount</Text>
                      </VStack>

                      <VStack align={{ base: "start", md: "start" }} gap={0}>
                        <Text fontSize="xs" fontWeight="700" color="app.text.muted">
                          {fmtDate(order.created_at)}
                        </Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Created Date</Text>
                      </VStack>

                      <Flex justify="end" gridColumn={{ base: "2", md: "auto" }}>
                        <Button
                          size="xs"
                          variant="ghost"
                          h="28px"
                          px={3}
                          borderRadius="lg"
                          fontWeight="800"
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
            <Flex align="center" justify="center" p={8} direction="column" gap={2}>
              <AlertCircle size={24} color={BRAND_HEX} />
              <Text fontSize="xs" fontWeight="700" color="app.text.muted">No orders found for this member.</Text>
            </Flex>
          )}
        </Box>
      )}

      {/* ─── TAB 3: INVOICES ─── */}
      {activeTab === "invoices" && (
        <Box>
          {loadingInvoices ? (
            <VStack gap={3}>
              <Skeleton h="40px" borderRadius="lg" />
              <Skeleton h="40px" borderRadius="lg" />
              <Skeleton h="40px" borderRadius="lg" />
            </VStack>
          ) : invoices.length > 0 ? (
            <VStack align="stretch" gap={4}>
              <VStack align="stretch" gap={2.5}>
                {/* Header Row */}
                <Grid templateColumns="2fr 1fr 1.2fr 1.3fr 1fr" px={4} py={2} display={{ base: "none", md: "grid" }}>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">INVOICE NUMBER</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">STATUS</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">TOTAL</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">DUE DATE</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider" textAlign="right">ACTION</Text>
                </Grid>

                {/* Data Rows */}
                {invoices.map((invoice) => {
                  const isPaid = invoice.status === "paid";
                  const statusColor = isPaid ? "#01B574" : invoice.status === "sent" ? "#3965FF" : "#FFB547";
                  const rowBg = useColorModeValue("rgba(248,250,252,0.6)", "rgba(255,255,255,0.01)");
                  
                  return (
                    <Grid
                      key={invoice.invoice_number}
                      templateColumns={{ base: "1fr 1fr", md: "2fr 1fr 1.2fr 1.3fr 1fr" }}
                      gap={{ base: 2, md: 4 }}
                      p={4}
                      alignItems="center"
                      borderRadius="xl"
                      bg={rowBg}
                      border="1px solid"
                      borderColor={border}
                      position="relative"
                      pl={5}
                      overflow="hidden"
                      transition="all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)"
                      _hover={{
                        transform: "translateY(-2px)",
                        borderColor: `${BRAND_HEX}35`,
                        bg: useColorModeValue("white", "rgba(255,255,255,0.04)"),
                        boxShadow: useColorModeValue("0 8px 24px rgba(66,42,251,0.06)", "0 8px 24px rgba(0,0,0,0.2)")
                      }}
                    >
                      {/* Left Accent indicator */}
                      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={statusColor} />

                      <VStack align="start" gap={0} gridColumn={{ base: "1 / span 2", md: "auto" }}>
                        <Text fontSize="xs" fontWeight="800" color="app.text.primary">{invoice.invoice_number}</Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Invoice Number</Text>
                      </VStack>

                      <Box>
                        <Badge colorPalette={isPaid ? "green" : invoice.status === "sent" ? "blue" : "orange"} variant="subtle" size="xs" borderRadius="full">
                          {invoice.status}
                        </Badge>
                      </Box>

                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                          {fmtCurrency(invoice.total, invoice.currency)}
                        </Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Total Amount</Text>
                      </VStack>

                      <VStack align={{ base: "start", md: "start" }} gap={0}>
                        <Text fontSize="xs" fontWeight="700" color="app.text.muted">
                          {fmtDate(invoice.due_date)}
                        </Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Due Date</Text>
                      </VStack>

                      <Flex justify="end" gridColumn={{ base: "2", md: "auto" }}>
                        <Button
                          size="xs"
                          variant="ghost"
                          h="28px"
                          px={3}
                          borderRadius="lg"
                          fontWeight="800"
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
            <Flex align="center" justify="center" p={8} direction="column" gap={2}>
              <AlertCircle size={24} color={BRAND_HEX} />
              <Text fontSize="xs" fontWeight="700" color="app.text.muted">No invoices found for this member.</Text>
            </Flex>
          )}
        </Box>
      )}

      {/* ─── TAB 4: PAYMENTS ─── */}
      {activeTab === "payments" && (
        <Box>
          {loadingPayments ? (
            <VStack gap={3}>
              <Skeleton h="40px" borderRadius="lg" />
              <Skeleton h="40px" borderRadius="lg" />
              <Skeleton h="40px" borderRadius="lg" />
            </VStack>
          ) : payments.length > 0 ? (
            <VStack align="stretch" gap={4}>
              <VStack align="stretch" gap={2.5}>
                {/* Header Row */}
                <Grid templateColumns="1.8fr 1.5fr 1fr 1fr 1.2fr 1.5fr 1fr" px={4} py={2} display={{ base: "none", md: "grid" }}>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">PAYMENT NUMBER</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">INVOICE</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">METHOD</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">STATUS</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">AMOUNT</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider">PAYMENT DATE</Text>
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted" letterSpacing="wider" textAlign="right">ACTION</Text>
                </Grid>

                {/* Data Rows */}
                {payments.map((payment) => {
                  const methodUpper = payment.method?.toUpperCase() || "CASH";
                  const isSucceeded = payment.status === "succeeded" || payment.status === "completed" || payment.status === "paid" || payment.status === "captured";
                  const statusPalette = isSucceeded ? "green" : payment.status === "failed" ? "red" : "orange";
                  const accentColor = isSucceeded ? "#01B574" : payment.status === "failed" ? "#EE5D50" : "#FFB547";
                  const rowBg = useColorModeValue("rgba(248,250,252,0.6)", "rgba(255,255,255,0.01)");
                  
                  return (
                    <Grid
                      key={payment.payment_number}
                      templateColumns={{ base: "1fr 1fr", md: "1.8fr 1.5fr 1fr 1fr 1.2fr 1.5fr 1fr" }}
                      gap={{ base: 2, md: 4 }}
                      p={4}
                      alignItems="center"
                      borderRadius="xl"
                      bg={rowBg}
                      border="1px solid"
                      borderColor={border}
                      position="relative"
                      pl={5}
                      overflow="hidden"
                      transition="all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)"
                      _hover={{
                        transform: "translateY(-2px)",
                        borderColor: `${BRAND_HEX}35`,
                        bg: useColorModeValue("white", "rgba(255,255,255,0.04)"),
                        boxShadow: useColorModeValue("0 8px 24px rgba(66,42,251,0.06)", "0 8px 24px rgba(0,0,0,0.2)")
                      }}
                    >
                      {/* Left Accent indicator */}
                      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={accentColor} />

                      <VStack align="start" gap={0} gridColumn={{ base: "1 / span 2", md: "auto" }}>
                        <Text fontSize="xs" fontWeight="800" color="app.text.primary">{payment.payment_number}</Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Payment Number</Text>
                      </VStack>

                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="700" color="app.text.secondary">{payment.invoice_ref}</Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Invoice Reference</Text>
                      </VStack>

                      <Box>
                        <Badge variant="outline" size="xs" borderRadius="full">
                          {methodUpper}
                        </Badge>
                      </Box>

                      <Box>
                        <Badge colorPalette={statusPalette} variant="subtle" size="xs" borderRadius="full">
                          {payment.status || "succeeded"}
                        </Badge>
                      </Box>

                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                          {fmtCurrency(payment.amount, payment.currency)}
                        </Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Amount Paid</Text>
                      </VStack>

                      <VStack align={{ base: "start", md: "start" }} gap={0}>
                        <Text fontSize="xs" fontWeight="700" color="app.text.muted">
                          {fmtDate(payment.payment_date)}
                        </Text>
                        <Text fontSize="9px" color="app.text.muted" display={{ base: "block", md: "none" }}>Payment Date</Text>
                      </VStack>

                      <Flex justify="end" gridColumn={{ base: "2", md: "auto" }}>
                        <Button
                          size="xs"
                          variant="ghost"
                          h="28px"
                          px={3}
                          borderRadius="lg"
                          fontWeight="800"
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
            <Flex align="center" justify="center" p={8} direction="column" gap={2}>
              <AlertCircle size={24} color={BRAND_HEX} />
              <Text fontSize="xs" fontWeight="700" color="app.text.muted">No payments recorded for this member.</Text>
            </Flex>
          )}
        </Box>
      )}
    </VStack>
  );
});

MemberMembershipAndBilling.displayName = "MemberMembershipAndBilling";
export default MemberMembershipAndBilling;
