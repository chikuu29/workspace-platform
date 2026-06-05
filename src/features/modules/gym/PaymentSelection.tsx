/**
 * PaymentSelection.tsx
 *
 * Step 5 in the gym membership sales flow.
 * Route: /:org/workspace/app/gym/paymentSelect/:invoiceNumber
 *
 * Purpose:
 *   - Display 4 payment method cards: Cash, UPI, Card, Payment Link
 *   - Navigate to the appropriate dedicated payment screen
 *   - No API calls made here
 */

import { memo, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Circle,
  Flex,
  Grid,
  HStack,
  Heading,
  Icon,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CreditCard,
  Link2,
  QrCode,
  Shield,
} from "lucide-react";
import { PageLayout } from "@/core/components/PageLayout";
import { useInvoiceDetails } from "./hooks/useInvoiceDetails";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

// ─── Payment Method Card ─────────────────────────────────────────────

interface PaymentMethodProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  glowColor: string;
  onClick: () => void;
}

const PaymentMethodCard = memo(
  ({ icon, title, subtitle, gradient, glowColor, onClick }: PaymentMethodProps) => {
    const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(11, 20, 55, 0.45)");
    const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");

    return (
      <Box
        as="button"
        onClick={onClick}
        w="full"
        textAlign="left"
        bg={cardBg}
        backdropFilter="blur(20px) saturate(180%)"
        border="1px solid"
        borderColor={borderCol}
        borderRadius="2xl"
        p={6}
        cursor="pointer"
        transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        _hover={{
          transform: "translateY(-6px)",
          boxShadow: `0 20px 40px -15px ${glowColor}`,
          borderColor: `${glowColor}50`,
        }}
        _active={{ transform: "translateY(-3px)" }}
        role="button"
        aria-label={`Pay with ${title}`}
      >
        <Flex align="center" gap={5}>
          <Circle size={14} bg={gradient} boxShadow={`0 8px 20px -8px ${glowColor}`}>
            <Icon color="white" fontSize="xl">
              {icon}
            </Icon>
          </Circle>
          <VStack align="start" gap={0.5} flex={1} minW={0}>
            <Text fontSize="lg" fontWeight="900" color="app.text.primary" letterSpacing="tight">
              {title}
            </Text>
            <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} fontWeight="500">
              {subtitle}
            </Text>
          </VStack>
          <Box
            color={useColorModeValue("gray.300", "gray.600")}
            transition="all 0.3s"
            _groupHover={{ color: "app.text.primary", transform: "translateX(4px)" }}
          >
            <ArrowRight size={20} />
          </Box>
        </Flex>
      </Box>
    );
  }
);
PaymentMethodCard.displayName = "PaymentMethodCard";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const PaymentSelection = memo(() => {
  const { params: rawInvoiceNumber } = useParams();
  const invoiceNumber = rawInvoiceNumber ? decodeURIComponent(rawInvoiceNumber) : undefined;
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const { invoice, loading } = useInvoiceDetails(invoiceNumber);
  const muted = useColorModeValue("gray.500", "gray.400");

  const encoded = useMemo(
    () => (invoiceNumber ? encodeURIComponent(invoiceNumber) : ""),
    [invoiceNumber]
  );

  const base = useMemo(
    () => `/${organizationName}/workspace/app/${appCode}`,
    [organizationName, appCode]
  );

  const handleCash = useCallback(() => {
    navigate(`${base}/cashPayment/${encoded}`);
  }, [navigate, base, encoded]);

  const handleUPI = useCallback(() => {
    navigate(`${base}/onlinePayment/${encoded}?method=upi`);
  }, [navigate, base, encoded]);

  const handleCard = useCallback(() => {
    navigate(`${base}/onlinePayment/${encoded}?method=card`);
  }, [navigate, base, encoded]);

  const handlePaymentLink = useCallback(() => {
    navigate(`${base}/paymentLink/${encoded}`);
  }, [navigate, base, encoded]);

  const formatINR = useCallback(
    (amount: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount),
    []
  );

  return (
    <PageLayout
      title="Select Payment Method"
      subtitle={
        loading
          ? "Loading invoice..."
          : `Invoice ${invoiceNumber} · ${invoice ? formatINR(invoice.balance_due) : ""} due`
      }
    >
      {/* Breadcrumb */}
      <HStack gap={2} mb={8} color={muted} fontSize="xs" fontWeight="700">
        <Text>Select Plan</Text>
        <ArrowRight size={12} />
        <Text>Review Order</Text>
        <ArrowRight size={12} />
        <Text>Invoice</Text>
        <ArrowRight size={12} />
        <Text color="brand.500">Payment</Text>
      </HStack>

      <Box maxW="640px" mx="auto">
        {/* Amount due header */}
        {loading ? (
          <Skeleton height="80px" borderRadius="2xl" mb={8} />
        ) : invoice ? (
          <Box
            mb={8}
            p={6}
            bg={useColorModeValue("rgba(255,255,255,0.8)", "rgba(11, 20, 55, 0.55)")}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)")}
            borderRadius="2xl"
          >
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                  Amount Due
                </Text>
                <Text fontSize="3xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                  {formatINR(invoice.balance_due)}
                </Text>
                <Text fontSize="xs" color={muted} fontWeight="500">
                  {invoice.plan_name || invoice.plan_code || "Gym Membership"} ·{" "}
                  {invoice.billing_cycle}
                </Text>
              </VStack>
              <VStack align="end" gap={1}>
                <Text fontSize="xs" color={muted} fontWeight="600">
                  Invoice: {invoice.invoice_number}
                </Text>
                <Text fontSize="xs" color={muted} fontWeight="600">
                  For: {invoice.customer_ref.name || invoice.member_id}
                </Text>
              </VStack>
            </Flex>
          </Box>
        ) : null}

        {/* Payment method options */}
        <VStack gap={4} align="stretch">
          <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted} mb={1}>
            Choose a Method
          </Text>

          <PaymentMethodCard
            icon={<Banknote size={22} />}
            title="Cash"
            subtitle="Collect physical cash — print receipt immediately"
            gradient="linear-gradient(135deg, #01B574 0%, #00875A 100%)"
            glowColor="#01B574"
            onClick={handleCash}
          />

          <PaymentMethodCard
            icon={<QrCode size={22} />}
            title="UPI / QR Code"
            subtitle="Google Pay, PhonePe, Paytm or any UPI app"
            gradient="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
            glowColor="#7551FF"
            onClick={handleUPI}
          />

          <PaymentMethodCard
            icon={<CreditCard size={22} />}
            title="Card"
            subtitle="Debit or credit card — swipe or insert"
            gradient="linear-gradient(135deg, #3965FF 0%, #002DFF 100%)"
            glowColor="#3965FF"
            onClick={handleCard}
          />

          <PaymentMethodCard
            icon={<Link2 size={22} />}
            title="Payment Link"
            subtitle="Send link via email / SMS — customer pays later"
            gradient="linear-gradient(135deg, #FFB547 0%, #E67E00 100%)"
            glowColor="#FFB547"
            onClick={handlePaymentLink}
          />
        </VStack>

        {/* Security note */}
        <HStack gap={2} justify="center" mt={8} opacity={0.5}>
          <Shield size={12} />
          <Text fontSize="xs" fontWeight="600" color={muted}>
            All transactions are recorded and auditable
          </Text>
        </HStack>

        {/* Back */}
        <Flex justify="center" mt={4}>
          <Button
            variant="ghost"
            borderRadius="xl"
            fontSize="xs"
            fontWeight="600"
            color={muted}
            onClick={() => navigate(-1)}
            _hover={{ color: "app.text.primary" }}
          >
            <ArrowLeft size={13} />
            <Text ml={1}>Back to Invoice</Text>
          </Button>
        </Flex>
      </Box>
    </PageLayout>
  );
});
PaymentSelection.displayName = "PaymentSelection";

export default PaymentSelection;
