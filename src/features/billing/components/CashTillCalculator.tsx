/**
 * CashTillCalculator.tsx
 *
 * Cash register calculator for in-person cash collection.
 * Features:
 *   - Invoice total display
 *   - Cash received input with quick-cash buttons
 *   - Automatic change/balance due computation
 *   - Visual feedback for short/overpayment
 *
 * Usage:
 *   <CashTillCalculator
 *     invoiceTotal={5900}
 *     cashReceived={cashReceived}
 *     onCashReceivedChange={setCashReceived}
 *     currencySymbol="₹"
 *   />
 */
import React, { memo, useMemo, useCallback } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Input,
  Button,
  Badge,
  Flex,
  Separator,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Banknote, CircleCheck, AlertTriangle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

interface CashTillCalculatorProps {
  /** Server-computed invoice total (GST inclusive) */
  invoiceTotal: number;
  /** Current cash received string value */
  cashReceived: string;
  /** Update callback for cash received input */
  onCashReceivedChange: (value: string) => void;
  /** Currency symbol (default: ₹) */
  currencySymbol?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Format amount in Indian locale */
const formatINR = (amount: number, symbol: string = "₹"): string =>
  `${symbol}${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

// ── Component ────────────────────────────────────────────────────────

const CashTillCalculator = memo<CashTillCalculatorProps>(
  ({
    invoiceTotal,
    cashReceived,
    onCashReceivedChange,
    currencySymbol = "₹",
  }) => {
    const settingBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

    // Compute change due
    const cashValue = useMemo(() => {
      const parsed = parseFloat(cashReceived);
      return isNaN(parsed) ? 0 : parsed;
    }, [cashReceived]);

    const changeDue = useMemo(
      () => cashValue - invoiceTotal,
      [cashValue, invoiceTotal]
    );

    const isExactOrOver = changeDue >= 0;
    const hasInput = cashReceived.length > 0;

    // Stable handlers
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow only numbers and single decimal
        if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
          onCashReceivedChange(val);
        }
      },
      [onCashReceivedChange]
    );

    const handleQuickCash = useCallback(
      (amount: number) => {
        const current = parseFloat(cashReceived) || 0;
        onCashReceivedChange((current + amount).toString());
      },
      [cashReceived, onCashReceivedChange]
    );

    const handleExactAmount = useCallback(
      () => onCashReceivedChange(invoiceTotal.toString()),
      [invoiceTotal, onCashReceivedChange]
    );

    const handleClear = useCallback(
      () => onCashReceivedChange(""),
      [onCashReceivedChange]
    );

    // Quick cash button presets
    const quickCashAmounts = useMemo(() => [500, 1000, 2000, 5000], []);

    return (
      <VStack
        align="stretch"
        gap={4}
        p={5}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        bg={settingBg}
      >
        {/* Header */}
        <HStack justify="space-between">
          <HStack gap={2}>
            <Box
              p={1.5}
              borderRadius="lg"
              bg="green.500/10"
              color="green.500"
            >
              <Banknote size={14} />
            </Box>
            <Text
              fontSize="xs"
              fontWeight="950"
              color="green.500"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Cash Register
            </Text>
          </HStack>
          {hasInput && (
            <Badge
              colorPalette={isExactOrOver ? "green" : "orange"}
              variant="subtle"
              borderRadius="full"
              fontSize="8px"
              fontWeight="900"
            >
              {isExactOrOver ? "READY" : "SHORT"}
            </Badge>
          )}
        </HStack>

        <Separator opacity={0.08} />

        {/* Invoice total */}
        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color="fg.muted" fontWeight="800">
            INVOICE TOTAL
          </Text>
          <Text fontSize="sm" fontWeight="950" color="app.text.primary">
            {formatINR(invoiceTotal, currencySymbol)}
          </Text>
        </Flex>

        {/* Cash received input */}
        <HStack justify="space-between" align="center">
          <Text fontSize="xs" color="fg.muted" fontWeight="800">
            CASH RECEIVED
          </Text>
          <HStack maxW="140px">
            <Text fontSize="sm" fontWeight="900" color="app.text.primary">
              {currencySymbol}
            </Text>
            <Input
              placeholder={invoiceTotal.toFixed(0)}
              value={cashReceived}
              onChange={handleInputChange}
              h="38px"
              borderRadius="lg"
              bg={useColorModeValue("white", "whiteAlpha.100")}
              border="1.5px solid"
              borderColor={borderColor}
              fontWeight="800"
              fontSize="sm"
              textAlign="right"
              _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" }}
            />
          </HStack>
        </HStack>

        {/* Change due display */}
        <Flex
          justify="space-between"
          align="center"
          p={3}
          borderRadius="xl"
          bg={isExactOrOver ? "green.500/5" : "orange.500/5"}
          border="1px solid"
          borderColor={isExactOrOver ? "green.500/15" : "orange.500/15"}
          transition="all 0.2s"
        >
          <HStack gap={2}>
            {isExactOrOver ? (
              <CircleCheck size={14} color="var(--chakra-colors-green-500)" />
            ) : (
              <AlertTriangle size={14} color="var(--chakra-colors-orange-500)" />
            )}
            <Text fontSize="xs" fontWeight="900" color="app.text.primary">
              {isExactOrOver ? "CHANGE DUE" : "AMOUNT SHORT"}
            </Text>
          </HStack>
          <VStack align="end" gap={0}>
            <Text
              fontSize="lg"
              fontWeight="950"
              color={isExactOrOver ? "green.500" : "orange.500"}
              letterSpacing="tight"
            >
              {formatINR(Math.abs(changeDue), currencySymbol)}
            </Text>
          </VStack>
        </Flex>

        <Separator opacity={0.08} />

        {/* Quick cash buttons */}
        <VStack align="stretch" gap={2}>
          <Text
            fontSize="9px"
            fontWeight="900"
            color="fg.muted"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Quick Cash
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {quickCashAmounts.map((amount) => (
              <Button
                key={amount}
                size="xs"
                variant="outline"
                h="30px"
                borderRadius="lg"
                fontSize="10px"
                fontWeight="800"
                onClick={() => handleQuickCash(amount)}
              >
                + {currencySymbol}{amount.toLocaleString("en-IN")}
              </Button>
            ))}
            <Button
              size="xs"
              colorPalette="green"
              h="30px"
              borderRadius="lg"
              fontSize="10px"
              fontWeight="800"
              onClick={handleExactAmount}
            >
              Exact Amount
            </Button>
            {hasInput && (
              <Button
                size="xs"
                variant="ghost"
                colorPalette="red"
                h="30px"
                borderRadius="lg"
                fontSize="10px"
                fontWeight="800"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </Flex>
        </VStack>
      </VStack>
    );
  }
);

CashTillCalculator.displayName = "CashTillCalculator";
export default CashTillCalculator;
