/**
 * PaymentLinkPage.tsx
 *
 * Step 6C in the gym membership sales flow.
 * Route: /:org/workspace/app/gym/paymentLink/:invoiceNumber
 *
 * Purpose:
 *   - Send payment link via Email, SMS, or Both
 *   - Calls POST /gym/invoices/:invoiceNumber/send-link
 *   - Shows the generated payment URL
 *   - NO subscription created here — created via webhook when customer pays
 */

import { memo, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  Icon,
  Input,
  Skeleton,
  Text,
  VStack,
  Badge,
  Separator,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Alert } from "@/components/ui/alert";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Copy,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { useInvoiceDetails } from "./hooks/useInvoiceDetails";
import { GymApiService } from "./services/gymApi.service";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

// ─── Helpers ─────────────────────────────────────────────────────────

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// ─── Channel Card ─────────────────────────────────────────────────────

interface ChannelCardProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  value: "email" | "sms";
  selected: boolean;
  onSelect: (v: "email" | "sms") => void;
}

const ChannelCard = memo(({ icon, label, desc, value, selected, onSelect }: ChannelCardProps) => {
  const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(11, 20, 55, 0.45)");
  const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
  const handleClick = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Box
      as="button"
      onClick={handleClick}
      flex={1}
      p={5}
      bg={selected ? "brand.500/10" : cardBg}
      backdropFilter="blur(20px)"
      border="2px solid"
      borderColor={selected ? "brand.500/60" : borderCol}
      borderRadius="2xl"
      cursor="pointer"
      transition="all 0.25s"
      _hover={{ borderColor: "brand.500/40", bg: "brand.500/06" }}
      textAlign="left"
    >
      <VStack align="start" gap={2}>
        <Circle
          size={9}
          bg={selected ? "brand.500" : "brand.500/10"}
          color={selected ? "white" : "brand.500"}
          transition="all 0.25s"
        >
          {icon}
        </Circle>
        <Text fontSize="sm" fontWeight="900" color="app.text.primary">{label}</Text>
        <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} fontWeight="500">
          {desc}
        </Text>
        {selected && (
          <Badge colorPalette="brand" variant="subtle" borderRadius="md" fontSize="9px" fontWeight="900">
            SELECTED
          </Badge>
        )}
      </VStack>
    </Box>
  );
});
ChannelCard.displayName = "ChannelCard";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const PaymentLinkPage = memo(() => {
  const { params: rawInvoiceNumber } = useParams();
  const invoiceNumber = rawInvoiceNumber ? decodeURIComponent(rawInvoiceNumber) : undefined;
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const { invoice, loading } = useInvoiceDetails(invoiceNumber);
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [isSending, setIsSending] = useState(false);
  const [sentResult, setSentResult] = useState<{
    paymentLinkUrl: string;
    sendVia: string;
    invoiceNumber: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const muted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(11, 20, 55, 0.55)");
  const borderCol = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");

  const handleSelectChannel = useCallback((v: "email" | "sms") => setChannel(v), []);

  const handleSend = useCallback(() => {
    if (!invoiceNumber) return;
    setIsSending(true);

    const sub = GymApiService.sendGymInvoiceLink(invoiceNumber, { send_via: channel }).subscribe({
      next: (res) => {
        setIsSending(false);
        if (res.success) {
          setSentResult({
            paymentLinkUrl: res.data.payment_link_url,
            sendVia: res.data.send_via,
            invoiceNumber: res.data.invoice_number,
          });
          toaster.create({
            title: "Link Sent!",
            description: `Payment link dispatched via ${res.data.send_via}.`,
            type: "success",
          });
        } else {
          toaster.create({ title: "Error", description: (res as any).message, type: "error" });
        }
      },
      error: (err) => {
        setIsSending(false);
        toaster.create({
          title: "Error",
          description: err?.response?.data?.message || "Failed to send payment link.",
          type: "error",
        });
      },
    });

    return () => sub.unsubscribe();
  }, [invoiceNumber, channel]);

  const handleCopyLink = useCallback(async () => {
    if (!sentResult?.paymentLinkUrl) return;
    await navigator.clipboard.writeText(sentResult.paymentLinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toaster.create({ title: "Copied!", type: "info" });
  }, [sentResult]);

  const handleDone = useCallback(() => {
    navigate(`/${organizationName}/workspace/app/${appCode}/membersList`);
  }, [navigate, organizationName, appCode]);

  if (loading) {
    return (
      <PageLayout title="Send Payment Link" subtitle="Loading...">
        <Skeleton height="400px" borderRadius="2xl" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Send Payment Link"
      subtitle={`Invoice ${invoiceNumber} · ${formatINR(invoice?.balance_due ?? 0)} due`}
    >
      {/* Breadcrumb */}
      <HStack gap={2} mb={8} color={muted} fontSize="xs" fontWeight="700">
        <Text>Invoice</Text>
        <ArrowRight size={12} />
        <Text>Select Method</Text>
        <ArrowRight size={12} />
        <Text color="orange.500">Payment Link</Text>
      </HStack>

      <Box maxW="640px" mx="auto">
        <VStack gap={5} align="stretch">
          {/* Invoice summary */}
          <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" overflow="hidden">
            <Box h="4px" bg="linear-gradient(135deg, #FFB547 0%, #E67E00 100%)" />
            <Box p={6}>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                    Invoice Amount
                  </Text>
                  <Text fontSize="3xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                    {formatINR(invoice?.balance_due ?? 0)}
                  </Text>
                  <Text fontSize="xs" color={muted} fontWeight="500">
                    {invoice?.plan_name} · {invoice?.billing_cycle}
                  </Text>
                </VStack>
                <VStack align="end" gap={1}>
                  <Text fontSize="xs" color={muted} fontWeight="600">
                    For: {invoice?.customer_ref.name || invoice?.member_id}
                  </Text>
                  <Text fontSize="xs" color={muted} fontWeight="600">
                    Email: {invoice?.customer_ref.email || "—"}
                  </Text>
                </VStack>
              </Flex>
            </Box>
          </Box>

          {/* Channel selection */}
          {!sentResult && (
            <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={6}>
              <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted} mb={4}>
                Send Via
              </Text>
              <Flex gap={4} flexDir={{ base: "column", sm: "row" }}>
                <ChannelCard
                  icon={<Mail size={16} />}
                  label="Email"
                  desc={invoice?.customer_ref.email ? `To: ${invoice.customer_ref.email}` : "Send to member's email"}
                  value="email"
                  selected={channel === "email"}
                  onSelect={handleSelectChannel}
                />
                <ChannelCard
                  icon={<MessageSquare size={16} />}
                  label="SMS"
                  desc={invoice?.customer_ref.phone ? `To: ${invoice.customer_ref.phone}` : "Send to member's phone"}
                  value="sms"
                  selected={channel === "sms"}
                  onSelect={handleSelectChannel}
                />
              </Flex>
            </Box>
          )}

          {/* Success state */}
          {sentResult ? (
            <VStack gap={4} align="stretch">
              <Alert status="success" borderRadius="2xl" title="Link Dispatched">
                Payment link dispatched via <strong>{sentResult.sendVia}</strong>. Membership will activate automatically when the customer pays.
              </Alert>

              {/* Link display */}
              <Box bg={cardBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderCol} borderRadius="2xl" p={5}>
                <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider" color={muted} mb={3}>
                  Payment Link
                </Text>
                <Flex gap={2} align="center">
                  <Input
                    value={sentResult.paymentLinkUrl}
                    readOnly
                    h="40px"
                    fontSize="xs"
                    fontFamily="mono"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderCol}
                    bg="transparent"
                    color={muted}
                  />
                  <Button
                    size="sm"
                    h="40px"
                    px={4}
                    borderRadius="xl"
                    colorPalette={copied ? "green" : "brand"}
                    variant={copied ? "solid" : "outline"}
                    onClick={handleCopyLink}
                    fontWeight="700"
                    flexShrink={0}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </Flex>
              </Box>

              {/* Info note */}
              <Box p={4} borderRadius="xl" bg={useColorModeValue("amber.50", "rgba(255, 181, 71, 0.08)")} border="1px solid" borderColor="orange.500/25">
                <HStack gap={2} mb={1}>
                  <Link2 size={13} color="var(--chakra-colors-orange-500)" />
                  <Text fontSize="xs" fontWeight="900" color="orange.500">Member Not Yet Active</Text>
                </HStack>
                <Text fontSize="xs" color={muted} lineHeight="relaxed">
                  The subscription will be created automatically when the customer completes payment via this link.
                </Text>
              </Box>

              <Button
                w="full"
                h="52px"
                borderRadius="xl"
                fontWeight="900"
                fontSize="sm"
                bg="linear-gradient(135deg, #FFB547 0%, #E67E00 100%)"
                color="white"
                onClick={handleDone}
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 12px 25px -8px #FFB547" }}
                transition="all 0.3s"
              >
                Done — Back to Members
              </Button>
            </VStack>
          ) : (
            <VStack gap={3} align="stretch">
              <Button
                w="full"
                h="52px"
                borderRadius="xl"
                fontWeight="900"
                fontSize="sm"
                bg="linear-gradient(135deg, #FFB547 0%, #E67E00 100%)"
                color="white"
                loading={isSending}
                loadingText="Sending..."
                onClick={handleSend}
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 12px 25px -8px #FFB547" }}
                transition="all 0.3s"
              >
                <HStack gap={2}>
                  {isSending ? <Loader2 size={16} /> : <Send size={16} />}
                  <Text>Send Payment Link</Text>
                </HStack>
              </Button>

              <Button
                w="full"
                h="38px"
                variant="ghost"
                borderRadius="xl"
                fontSize="xs"
                fontWeight="600"
                color={muted}
                onClick={handleGoBack}
                _hover={{ color: "app.text.primary" }}
              >
                <ArrowLeft size={13} />
                <Text ml={1}>Back</Text>
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>
    </PageLayout>
  );
});
PaymentLinkPage.displayName = "PaymentLinkPage";

export default PaymentLinkPage;
