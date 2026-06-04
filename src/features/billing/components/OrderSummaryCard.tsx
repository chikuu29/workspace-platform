/**
 * OrderSummaryCard.tsx
 *
 * Reusable order summary for checkout flows.
 * Displays server-computed invoice totals including tax breakdown.
 * No client-side tax computation — all values come from the backend.
 *
 * Usage:
 *   <OrderSummaryCard
 *     planName="Pro Membership"
 *     billingCycle="monthly"
 *     memberName="John Doe"
 *     startDate="2026-06-04"
 *     subtotal={5000}
 *     taxBreakdown={{ total_tax: 900, cgst_amount: 450, sgst_amount: 450, ... }}
 *     total={5900}
 *     currency="₹"
 *   />
 */
import React, { memo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Separator,
  SimpleGrid,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Receipt } from "lucide-react";
import type { InvoiceTaxBreakdown } from "@/features/modules/gym/types/Gym.types";

// ── Types ────────────────────────────────────────────────────────────

interface OrderSummaryCardProps {
  /** Plan name for display */
  planName: string;
  /** Billing cycle badge */
  billingCycle: string;
  /** Member name */
  memberName: string;
  /** Subscription start date */
  startDate: string;
  /** Server-computed subtotal (before tax) */
  subtotal: number;
  /** Server-computed tax breakdown */
  taxBreakdown: InvoiceTaxBreakdown;
  /** Server-computed grand total (tax inclusive) */
  total: number;
  /** Currency symbol */
  currency?: string;
  /** Invoice number (shown after enrollment) */
  invoiceNumber?: string;
  /** Invoice status badge */
  invoiceStatus?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

const formatINR = (amount: number, symbol: string = "₹"): string =>
  `${symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

// ── Component ────────────────────────────────────────────────────────

const OrderSummaryCard = memo<OrderSummaryCardProps>(
  ({
    planName,
    billingCycle,
    memberName,
    startDate,
    subtotal,
    taxBreakdown,
    total,
    currency = "₹",
    invoiceNumber,
    invoiceStatus,
  }) => {
    const cardBg = useColorModeValue("brand.50", "brand.500/10");
    const cardBorder = useColorModeValue("brand.100", "brand.500/15");
    const muted = "fg.muted";

    return (
      <VStack align="stretch" gap={5}>
        {/* Header */}
        <HStack justify="space-between">
          <Text
            fontSize="sm"
            fontWeight="950"
            color="app.text.primary"
            letterSpacing="wider"
            textTransform="uppercase"
          >
            Checkout Summary
          </Text>
          <Receipt size={16} color="var(--chakra-colors-brand-500)" />
        </HStack>

        {/* Plan Details Card */}
        <Box
          p={4}
          borderRadius="2xl"
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
        >
          <VStack align="stretch" gap={3}>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                {planName}
              </Text>
              <Badge
                colorPalette="brand"
                borderRadius="md"
                fontSize="8px"
                fontWeight="900"
              >
                {billingCycle.toUpperCase()}
              </Badge>
            </Flex>

            <Separator opacity={0.06} />

            <SimpleGrid columns={2} gap={3}>
              <VStack align="start" gap={0}>
                <Text
                  fontSize="8px"
                  color={muted}
                  fontWeight="800"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Enrollee
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight="900"
                  color="app.text.primary"
                  truncate
                >
                  {memberName}
                </Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Text
                  fontSize="8px"
                  color={muted}
                  fontWeight="800"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Effective From
                </Text>
                <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                  {startDate}
                </Text>
              </VStack>
            </SimpleGrid>

            {invoiceNumber && (
              <Flex justify="space-between" align="center" pt={1}>
                <Text
                  fontSize="8px"
                  color={muted}
                  fontWeight="800"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Invoice
                </Text>
                <HStack gap={2}>
                  <Text fontSize="xs" fontWeight="900" color="brand.500">
                    {invoiceNumber}
                  </Text>
                  {invoiceStatus && (
                    <Badge
                      colorPalette={
                        invoiceStatus === "paid"
                          ? "green"
                          : invoiceStatus === "sent"
                          ? "blue"
                          : "orange"
                      }
                      variant="subtle"
                      borderRadius="md"
                      fontSize="7px"
                      fontWeight="900"
                    >
                      {invoiceStatus.toUpperCase()}
                    </Badge>
                  )}
                </HStack>
              </Flex>
            )}
          </VStack>
        </Box>

        {/* Financial Breakdown — all server-computed */}
        <VStack align="stretch" gap={3}>
          <Flex justify="space-between" align="center">
            <Text
              fontSize="10px"
              color={muted}
              fontWeight="800"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Subtotal
            </Text>
            <Text fontSize="xs" fontWeight="900" color="app.text.primary">
              {formatINR(subtotal, currency)}
            </Text>
          </Flex>

          {/* Tax details */}
          {taxBreakdown.cgst_amount > 0 && (
            <Flex justify="space-between" align="center">
              <Text
                fontSize="10px"
                color={muted}
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                CGST ({taxBreakdown.tax_rate ? (taxBreakdown.tax_rate / 2).toFixed(0) : "9"}%)
              </Text>
              <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                {formatINR(taxBreakdown.cgst_amount, currency)}
              </Text>
            </Flex>
          )}

          {taxBreakdown.sgst_amount > 0 && (
            <Flex justify="space-between" align="center">
              <Text
                fontSize="10px"
                color={muted}
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                SGST ({taxBreakdown.tax_rate ? (taxBreakdown.tax_rate / 2).toFixed(0) : "9"}%)
              </Text>
              <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                {formatINR(taxBreakdown.sgst_amount, currency)}
              </Text>
            </Flex>
          )}

          {taxBreakdown.igst_amount > 0 && (
            <Flex justify="space-between" align="center">
              <Text
                fontSize="10px"
                color={muted}
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                IGST ({taxBreakdown.tax_rate?.toFixed(0) || "18"}%)
              </Text>
              <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                {formatINR(taxBreakdown.igst_amount, currency)}
              </Text>
            </Flex>
          )}

          {/* Fallback: show total tax if no CGST/SGST/IGST breakdown */}
          {taxBreakdown.cgst_amount === 0 &&
            taxBreakdown.sgst_amount === 0 &&
            taxBreakdown.igst_amount === 0 &&
            taxBreakdown.total_tax > 0 && (
              <Flex justify="space-between" align="center">
                <Text
                  fontSize="10px"
                  color={muted}
                  fontWeight="800"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Tax ({taxBreakdown.tax_rate?.toFixed(0) || "18"}%)
                </Text>
                <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                  {formatINR(taxBreakdown.total_tax, currency)}
                </Text>
              </Flex>
            )}

          <Separator opacity={0.06} />

          {/* Grand Total */}
          <Flex justify="space-between" align="baseline" pt={1}>
            <Text
              fontSize="xs"
              fontWeight="950"
              color="app.text.primary"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Grand Total
            </Text>
            <Text
              fontSize="xl"
              fontWeight="950"
              color="brand.500"
              letterSpacing="tight"
            >
              {formatINR(total, currency)}
            </Text>
          </Flex>
        </VStack>
      </VStack>
    );
  }
);

OrderSummaryCard.displayName = "OrderSummaryCard";
export default OrderSummaryCard;
