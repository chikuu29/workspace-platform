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
  Check,
} from "lucide-react";
import { PageLayout } from "@/core/components/PageLayout";
import { useInvoiceDetails } from "./hooks/useInvoiceDetails";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

const BRAND_HEX = "#422AFB";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

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

interface ProgressStepperProps {
  currentStep: number;
  accentHex: string;
  onStepClick?: (stepIndex: number) => void;
}

const ProgressStepper = memo(({ currentStep, accentHex, onStepClick }: ProgressStepperProps) => {
  const steps = [
    { label: "Select Plan", index: 1 },
    { label: "Review Order", index: 2 },
    { label: "Invoice Details", index: 3 },
    { label: "Collect Payment", index: 4 },
  ];

  const muted = useColorModeValue("gray.500", "gray.400");
  const borderCol = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.02)");

  return (
    <Box
      w="100%"
      mb={8}
      p={4}
      px={6}
      bg={cardBg}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={borderCol}
      borderRadius="24px"
      position="relative"
      zIndex={1}
      boxShadow={useColorModeValue("0 2px 10px rgba(0,0,0,0.01)", "none")}
    >
      <Flex justify="space-between" align="center" position="relative" maxW="900px" mx="auto">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.index;
          const isActive = currentStep === step.index;
          const isClickable = isCompleted && !!onStepClick;

          const handleStepClick = () => {
            if (isClickable && onStepClick) {
              onStepClick(step.index);
            }
          };

          return (
            <HStack key={step.index} gap={3} align="center" flex={idx === steps.length - 1 ? "none" : 1}>
              <HStack
                gap={2}
                align="center"
                cursor={isClickable ? "pointer" : "default"}
                onClick={handleStepClick}
                role={isClickable ? "button" : undefined}
                _hover={isClickable ? { opacity: 0.85 } : undefined}
                transition="opacity 0.2s"
              >
                <Circle
                  size={7}
                  bg={isCompleted ? "green.500" : isActive ? accentHex : "transparent"}
                  border="2px solid"
                  borderColor={isCompleted ? "green.500" : isActive ? accentHex : useColorModeValue("gray.300", "gray.600")}
                  color={isCompleted || isActive ? "white" : muted}
                  fontWeight="800"
                  fontSize="xs"
                  boxShadow={isActive ? `0 0 12px ${accentHex}50` : "none"}
                  transition="all 0.3s"
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : step.index}
                </Circle>
                <Text
                  fontSize="xs"
                  fontWeight={isActive ? "900" : "700"}
                  color={isActive ? "app.text.primary" : muted}
                  letterSpacing="tight"
                >
                  {step.label}
                </Text>
              </HStack>

              {idx < steps.length - 1 && (
                <Box
                  h="2px"
                  flex={1}
                  mx={4}
                  bg={isCompleted ? "green.500" : useColorModeValue("gray.200", "whiteAlpha.100")}
                  transition="all 0.3s"
                />
              )}
            </HStack>
          );
        })}
      </Flex>
    </Box>
  );
});
ProgressStepper.displayName = "ProgressStepper";

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

  const handleStepClick = useCallback((stepIdx: number) => {
    if (!invoice) return;
    if (stepIdx === 1) {
      navigate(`/${organizationName}/workspace/app/${appCode}/plans/${invoice.member_id}`);
    } else if (stepIdx === 2) {
      navigate(`/${organizationName}/workspace/app/${appCode}/reviewOrder/${invoice.member_id}?planCode=${invoice.plan_code}`);
    } else if (stepIdx === 3) {
      navigate(`/${organizationName}/workspace/app/${appCode}/invoiceView/${encodeURIComponent(invoice.invoice_number)}`);
    }
  }, [navigate, organizationName, appCode, invoice]);

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
      <ProgressStepper currentStep={4} accentHex={BRAND_HEX} onStepClick={handleStepClick} />

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
            gradient={BRAND_GRADIENT}
            glowColor={BRAND_HEX}
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
