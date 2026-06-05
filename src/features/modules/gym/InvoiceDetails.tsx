/**
 * InvoiceDetails.tsx
 *
 * Step 4 in the gym membership sales flow.
 * Route: /:org/workspace/app/myGym/invoiceView/:invoiceNumber
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
  Alert,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
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
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { useInvoiceDetails } from "./hooks/useInvoiceDetails";
import { GymApiService } from "./services/gymApi.service";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

// ─── Helpers ────────────────────────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const InvoiceDetails = memo(() => {
  const { params: rawInvoiceNumber } = useParams();
  const invoiceNumber = rawInvoiceNumber ? decodeURIComponent(rawInvoiceNumber) : undefined;
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const { invoice, loading, error, refetch } = useInvoiceDetails(invoiceNumber);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);

  const muted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(11, 20, 55, 0.55)");
  const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
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
        <Alert status="error" borderRadius="2xl">
          <AlertTitle>Invoice Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          mt={4}
          variant="outline"
          borderRadius="xl"
          onClick={() => navigate(-1)}
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
      title="Invoice"
      subtitle={invoice?.invoice_number || ""}
    >
      {/* Breadcrumb */}
      <HStack gap={2} mb={6} color={muted} fontSize="xs" fontWeight="700">
        <Text>Select Plan</Text>
        <ArrowRight size={12} />
        <Text>Review Order</Text>
        <ArrowRight size={12} />
        <Text color="brand.500">Invoice</Text>
        <ArrowRight size={12} />
        <Text>Payment</Text>
      </HStack>

      {/* Cancelled banner */}
      {isCancelled && (
        <Alert status="warning" borderRadius="2xl" mb={6}>
          <AlertTitle>Invoice Cancelled</AlertTitle>
          <AlertDescription>
            This invoice was cancelled. No membership has been created. Go back to start a new enrollment.
          </AlertDescription>
        </Alert>
      )}

      <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={6} alignItems="start">

        {/* ── Left: Invoice Document ── */}
        <VStack gap={5} align="stretch">

          {/* Invoice Header Card */}
          <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" overflow="hidden">
            {/* Color bar */}
            <Box h="4px" bg="linear-gradient(90deg, #7551FF 0%, #422AFB 50%, #3965FF 100%)" />
            <Box p={6}>
              <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
                <VStack align="start" gap={2}>
                  <HStack gap={3}>
                    <Circle size={10} bg="brand.500/10" color="brand.500">
                      <ReceiptText size={18} />
                    </Circle>
                    <VStack align="start" gap={0}>
                      <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                        Invoice Number
                      </Text>
                      <Text fontSize="xl" fontWeight="950" color="app.text.primary" fontFamily="mono">
                        {invoice?.invoice_number}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
                <VStack align="end" gap={2}>
                  <Badge
                    colorPalette={statusColor}
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="900"
                    letterSpacing="wider"
                  >
                    {invoice?.status?.toUpperCase()}
                  </Badge>
                  <Text fontSize="xs" color={muted} fontWeight="600">
                    Issued: {fmtDate(invoice?.issue_date)}
                  </Text>
                  <Text fontSize="xs" color={muted} fontWeight="600">
                    Due: {fmtDate(invoice?.due_date)}
                  </Text>
                </VStack>
              </Flex>
            </Box>
          </Box>

          {/* Parties — Bill From / Bill To */}
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
            <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={5}>
              <HStack gap={2} mb={3}>
                <Circle size={6} bg="purple.500/10" color="purple.500">
                  <Building size={12} />
                </Circle>
                <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted}>
                  Bill From
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                Your Gym Organization
              </Text>
              <Text fontSize="xs" color={muted} fontWeight="500" mt={1}>
                Tax Invoiced by your registered entity
              </Text>
            </Box>

            <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={5}>
              <HStack gap={2} mb={3}>
                <Circle size={6} bg="blue.500/10" color="blue.500">
                  <User size={12} />
                </Circle>
                <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted}>
                  Bill To
                </Text>
              </HStack>
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
            </Box>
          </Grid>

          {/* Line Items Table */}
          <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" overflow="hidden">
            <Box px={6} py={4} borderBottom="1px solid" borderColor={borderCol} bg={useColorModeValue("rgba(249,250,251,0.8)", "rgba(255,255,255,0.02)")}>
              <HStack gap={2}>
                <Circle size={7} bg="brand.500/10" color="brand.500">
                  <FileText size={12} />
                </Circle>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary" letterSpacing="tight">
                  Line Items
                </Text>
              </HStack>
            </Box>

            <Box overflowX="auto">
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
                              colorPalette="brand"
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
            <Box px={6} py={4} borderTop="1px solid" borderColor={borderCol}>
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
                  <Text fontSize="2xl" fontWeight="950" color={canPay ? "brand.500" : "green.500"} letterSpacing="tight">
                    {formatINR(invoice?.balance_due ?? 0)}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          </Box>
        </VStack>

        {/* ── Right: Action Panel ── */}
        <Box position={{ base: "static", lg: "sticky" }} top="24px">
          <VStack gap={4} align="stretch">
            {/* Quick Summary */}
            <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={5}>
              <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted} mb={3}>
                Quick Summary
              </Text>
              <FieldRow label="Plan" value={invoice?.plan_name || invoice?.plan_code || "—"} />
              <FieldRow label="Member" value={invoice?.customer_ref.name || invoice?.member_id || "—"} />
              <FieldRow label="Period" value={invoice?.start_date ? `${fmtDate(invoice.start_date)} – ${fmtDate(invoice.end_date)}` : "—"} />
              <FieldRow label="Total" value={formatINR(invoice?.total ?? 0)} bold />
            </Box>

            {/* Actions */}
            <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={5}>
              <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted} mb={4}>
                Actions
              </Text>
              <VStack gap={3} align="stretch">
                {canPay && (
                  <Button
                    w="full"
                    h="52px"
                    borderRadius="xl"
                    fontWeight="900"
                    fontSize="sm"
                    letterSpacing="wide"
                    bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
                    color="white"
                    onClick={handlePayNow}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "0 15px 30px -10px var(--chakra-colors-brand-500)",
                    }}
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
                    isDisabled
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
                  onClick={() => navigate(-1)}
                  _hover={{ color: "app.text.primary", bg: "rgba(255,255,255,0.03)" }}
                >
                  <ArrowLeft size={13} />
                  <Text ml={1}>Back to Review</Text>
                </Button>

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
            </Box>

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
