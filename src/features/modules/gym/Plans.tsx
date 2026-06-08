/**
 * Plans.tsx
 *
 * Step 2 in the gym membership sales flow — premium redesign.
 * Route: /:org/workspace/app/gym/Plans/:memberId
 *
 * Design: Glassmorphism cards with gradient hero headers, animated
 *         selection ring, feature-icon lists, sticky comparison bar,
 *         and staggered entrance animations.
 *
 * Architecture note:
 *   NO backend call is made on "Continue". Plan selection is carried
 *   forward via URL query param (?planCode=GYM_PRO).
 *   The invoice is only created on the ReviewOrder page.
 */

import { memo, useState, useMemo, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  Heading,
  Input,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle,
  CheckCircle2,
  Crown,
  Dumbbell,
  Flame,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { PageHeader } from "@/core/components/PageHeader";
import { useGymMember } from "./hooks/useGymMember";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import type { SubscriptionPlanDocument } from "./types/Gym.types";
import {
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader,
  DialogFooter, DialogTitle, DialogBody, DialogCloseTrigger,
} from "@/components/ui/dialog";

const BRAND_HEX = "#422AFB";
const BRAND_ALT = "#7551FF";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

// ─── Design Constants ─────────────────────────────────────────────────────────

const CURRENCY_SYMBOL = "₹";

/** Hero gradient per accent color — used for the card's top banner */
const HERO_GRADIENT: Record<string, string> = {
  brand: "g_blue",
  blue: "linear-gradient(135deg, #3965FF 0%, #002DFF 100%)",
  green: "linear-gradient(135deg, #01B574 0%, #00875A 100%)",
  orange: "linear-gradient(135deg, #FFB547 0%, #E67E00 100%)",
  red: "linear-gradient(135deg, #EE5D50 0%, #C52A1D 100%)",
  purple: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
  pink: "linear-gradient(135deg, #EC4899 0%, #D946EF 100%)",
  cyan: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
  emerald: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
};

/** Solid accent hex for glows, rings, etc. */
const ACCENT_HEX: Record<string, string> = {
  brand: BRAND_HEX,
  blue: "#3965FF",
  green: "#01B574",
  orange: "#FFB547",
  red: "#EE5D50",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  emerald: "#10B981",
};

const BILLING_LABEL: Record<string, string> = {
  monthly: "month",
  quarterly: "quarter",
  yearly: "year",
  "half-yearly": "6 months",
};

/**
 * Picks a badge label for a plan based on simple heuristics.
 * "Most Popular" for mid-price, "Best Value" for yearly/high-price.
 */
const getBadgeLabel = (
  plan: SubscriptionPlanDocument,
  allPlans: SubscriptionPlanDocument[]
): string | null => {
  const prices = allPlans.map((p) => p.data.price).sort((a, b) => a - b);
  const rank = prices.indexOf(plan.data.price);
  const mid = Math.floor(prices.length / 2);
  if (plan.data.billing_cycle === "yearly") return "Best Value";
  if (rank === mid && allPlans.length >= 3) return "Most Popular";
  if (rank === prices.length - 1) return "Premium";
  return null;
};

const getGradient = (accent?: string): string =>
  HERO_GRADIENT[accent?.toLowerCase() ?? "brand"] ?? HERO_GRADIENT.brand;

const getAccentHex = (accent?: string): string =>
  ACCENT_HEX[accent?.toLowerCase() ?? "brand"] ?? ACCENT_HEX.brand;

// ─── Feature Icons ────────────────────────────────────────────────────────────

const FEATURE_ICONS = [Dumbbell, Zap, Shield, Users, Star, Award, TrendingUp, Flame];
const getFeatureIcon = (index: number) => FEATURE_ICONS[index % FEATURE_ICONS.length];

// ─── FeatureItem ─────────────────────────────────────────────────────────────

interface FeatureItemProps {
  text: string;
  accentHex: string;
  index: number;
  animationDelay: string;
}

const FeatureItem = memo(({ text, accentHex, index, animationDelay }: FeatureItemProps) => {
  const FeatureIcon = getFeatureIcon(index);
  return (
    <HStack
      gap={3}
      align="center"
      className="feature-slide-in"
      style={{ animationDelay }}
    >
      <Circle
        size={6}
        flexShrink={0}
        style={{ background: `${accentHex}22`, color: accentHex }}
      >
        <FeatureIcon size={11} strokeWidth={2.5} />
      </Circle>
      <Text fontSize="xs" fontWeight="600" color="app.text.primary" lineHeight="shorter">
        {text}
      </Text>
    </HStack>
  );
});
FeatureItem.displayName = "FeatureItem";

// ─── PlanCard ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: SubscriptionPlanDocument;
  isSelected: boolean;
  badgeLabel: string | null;
  onSelect: (plan: SubscriptionPlanDocument) => void;
  animationDelay: string;
}

const PlanCard = memo(({ plan, isSelected, badgeLabel, onSelect, animationDelay }: PlanCardProps) => {
  const cardBg = useColorModeValue("rgba(255,255,255,0.82)", "rgba(18, 22, 40, 0.75)");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const borderFallback = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)");

  const planData = plan.data;
  const accent = planData.accent_color || "brand";
  const gradient = useMemo(() => getGradient(accent), [accent]);
  const accentHex = useMemo(() => getAccentHex(accent), [accent]);
  const billingLabel = BILLING_LABEL[planData.billing_cycle] ?? planData.billing_cycle;
  const isPro = planData.code.toLowerCase().includes("pro");

  const handleClick = useCallback(() => onSelect(plan), [plan, onSelect]);

  return (
    <Box
      position="relative"
      borderRadius="28px"
      className="plan-card-enter"
      style={{ animationDelay }}
      /* Selection ring — 2-px gradient border via pseudo-box */
      _before={{
        content: '""',
        position: "absolute",
        inset: "-2px",
        borderRadius: "30px",
        background: isSelected ? gradient : "transparent",
        zIndex: 0,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        opacity: isSelected ? 1 : 0,
      }}
      boxShadow={isSelected ? `0 20px 60px -15px ${accentHex}55` : "none"}
      transition="box-shadow 0.4s ease"
    >
      <Box
        position="relative"
        zIndex={1}
        borderRadius="26px"
        overflow="hidden"
        bg={cardBg}
        backdropFilter="blur(28px) saturate(200%)"
        border="1px solid"
        borderColor={isSelected ? `${accentHex}50` : borderFallback}
        cursor="pointer"
        onClick={handleClick}
        h="full"
        transition="transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.3s"
        transform={isSelected ? "scale(1.02)" : "scale(1)"}
        _hover={{ transform: isSelected ? "scale(1.03)" : "translateY(-8px)" }}
        _active={{ transform: "scale(0.98)" }}
      >
        {/* ── Hero Gradient Header ── */}
        <Box
          position="relative"
          h="120px"
          bg={gradient}
          overflow="hidden"
        >
          {/* Decorative orbs */}
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="100px"
            h="100px"
            borderRadius="full"
            bg="whiteAlpha.200"
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-10px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="whiteAlpha.100"
          />

          {/* Badge (Most Popular / Best Value / Premium) */}
          {badgeLabel && (
            <Box
              position="absolute"
              top={3}
              right={3}
              bg="whiteAlpha.300"
              backdropFilter="blur(12px)"
              borderRadius="full"
              px={2.5}
              py={1}
              border="1px solid"
              borderColor="whiteAlpha.400"
            >
              <HStack gap={1}>
                <Crown size={10} color="white" strokeWidth={2.5} />
                <Text fontSize="9px" fontWeight="900" color="white" letterSpacing="wider">
                  {badgeLabel.toUpperCase()}
                </Text>
              </HStack>
            </Box>
          )}

          {/* Pro badge */}
          {isPro && (
            <Box position="absolute" top={3} left={3}>
              <HStack gap={1}>
                <Sparkles size={12} color="rgba(255,255,255,0.9)" />
                <Text fontSize="10px" fontWeight="800" color="whiteAlpha.900">PRO</Text>
              </HStack>
            </Box>
          )}

          {/* Plan name inside header */}
          <VStack
            position="absolute"
            bottom={4}
            left={5}
            align="start"
            gap={0}
          >
            <Text
              fontSize="xl"
              fontWeight="900"
              color="white"
              letterSpacing="tight"
              lineHeight="1"
              textShadow="0 2px 8px rgba(0,0,0,0.3)"
            >
              {planData.name}
            </Text>
            <Text fontSize="10px" color="whiteAlpha.800" fontWeight="600" mt={0.5}>
              {planData.code}
            </Text>
          </VStack>

          {/* Selection checkmark circle */}
          <Circle
            position="absolute"
            bottom={4}
            right={4}
            size={8}
            bg={isSelected ? "white" : "whiteAlpha.200"}
            border="2px solid"
            borderColor={isSelected ? "white" : "whiteAlpha.500"}
            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            boxShadow={isSelected ? `0 0 20px ${accentHex}80` : "none"}
          >
            {isSelected ? (
              <CheckCircle2 size={16} color={accentHex} strokeWidth={2.5} />
            ) : (
              <Box w="8px" h="8px" borderRadius="full" bg="whiteAlpha.600" />
            )}
          </Circle>
        </Box>

        {/* ── Card Body ── */}
        <VStack align="stretch" gap={5} p={5}>

          {/* Pricing block */}
          <Flex justify="space-between" align="end">
            <VStack align="start" gap={0.5}>
              <HStack align="baseline" gap={0.5}>
                <Text fontSize="xs" fontWeight="700" color={mutedText} mt={1}>
                  {CURRENCY_SYMBOL}
                </Text>
                <Text
                  fontSize="3xl"
                  fontWeight="950"
                  color="app.text.primary"
                  lineHeight="1"
                  letterSpacing="tight"
                >
                  {planData.price.toLocaleString("en-IN")}
                </Text>
              </HStack>
              <Text fontSize="10px" fontWeight="600" color={mutedText}>
                per {billingLabel}
              </Text>
            </VStack>

            <Badge
              borderRadius="lg"
              px={2.5}
              py={1}
              fontSize="9px"
              fontWeight="900"
              letterSpacing="wider"
              style={{
                background: `${accentHex}18`,
                color: accentHex,
                border: `1px solid ${accentHex}35`,
              }}
            >
              {planData.billing_cycle.toUpperCase()}
            </Badge>
          </Flex>

          {/* Description */}
          {planData.description && (
            <Text
              fontSize="xs"
              color={mutedText}
              fontWeight="500"
              lineHeight="tall"
              lineClamp={2}
            >
              {planData.description}
            </Text>
          )}

          <Separator opacity={0.06} />

          {/* Features */}
          <VStack align="stretch" gap={2.5} minH="100px">
            <Text fontSize="9px" fontWeight="800" color={mutedText} letterSpacing="wider" textTransform="uppercase">
              Includes
            </Text>
            {planData.features.slice(0, 5).map((feature, idx) => (
              <FeatureItem
                key={feature}
                text={feature}
                accentHex={accentHex}
                index={idx}
                animationDelay={`${idx * 0.06}s`}
              />
            ))}
            {planData.features.length > 5 && (
              <Text fontSize="10px" color={mutedText} fontWeight="700" pl={9}>
                +{planData.features.length - 5} more benefits
              </Text>
            )}
          </VStack>

          {/* CTA Button */}
          <Button
            w="full"
            size="lg"
            h="46px"
            borderRadius="2xl"
            fontWeight="900"
            fontSize="xs"
            letterSpacing="widest"
            textTransform="uppercase"
            onClick={handleClick}
            style={isSelected ? {
              background: gradient,
              color: "white",
              boxShadow: `0 8px 24px -6px ${accentHex}60`,
            } : {
              background: `${accentHex}12`,
              color: accentHex,
              border: `1px solid ${accentHex}30`,
            }}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: `0 12px 30px -8px ${accentHex}60`,
            }}
            _active={{ transform: "translateY(0) scale(0.98)" }}
            transition="all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          >
            <HStack gap={2}>
              <Text>{isSelected ? "Selected" : "Choose Plan"}</Text>
              {isSelected
                ? <Check size={13} strokeWidth={3} />
                : <ArrowRight size={13} />
              }
            </HStack>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
});
PlanCard.displayName = "PlanCard";

// ─── PlanCardSkeleton ─────────────────────────────────────────────────────────

const PlanCardSkeleton = memo(() => (
  <Box borderRadius="28px" overflow="hidden">
    <Skeleton height="120px" borderRadius="0" />
    <VStack align="stretch" gap={4} p={5}>
      <Skeleton height="40px" borderRadius="lg" />
      <Skeleton height="16px" borderRadius="md" />
      <Skeleton height="16px" borderRadius="md" width="80%" />
      <VStack gap={2} align="stretch">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height="20px" borderRadius="md" />
        ))}
      </VStack>
      <Skeleton height="46px" borderRadius="2xl" />
    </VStack>
  </Box>
));
PlanCardSkeleton.displayName = "PlanCardSkeleton";

// ─── EmptyPlansState ──────────────────────────────────────────────────────────

const EmptyPlansState = memo(() => {
  const { navigateTo } = useWorkspaceRouter();
  const handleCreate = useCallback(() => navigateTo("AddSubscriptionPlan"), [navigateTo]);
  const cardBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(18,22,40,0.6)");

  return (
    <Box
      p={16}
      borderRadius="28px"
      bg={cardBg}
      backdropFilter="blur(24px)"
      border="1px solid"
      borderColor={useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.07)")}
      textAlign="center"
    >
      <VStack gap={6} maxW="sm" mx="auto">
        <Box position="relative">
          <Circle size={20} bg="g_blue">
            <Crown size={32} color='white' />
          </Circle>
          <Circle
            size={8}
            bg="g_blue"
            color="white"
            position="absolute"
            bottom={-1}
            right={-1}
            border="3px solid"
            borderColor={useColorModeValue("white", "rgba(18,22,40,0.9)")}
          >
            <Sparkles size={14} />
          </Circle>
        </Box>
        <VStack gap={2}>
          <Heading size="lg" fontWeight="950" letterSpacing="tight">
            No Active Plans
          </Heading>
          <Text fontSize="sm" color="app.text.muted" fontWeight="500" lineHeight="tall">
            Create your first subscription plan template to start selling memberships to your members.
          </Text>
        </VStack>
        <Button
          h="52px"
          px={10}
          borderRadius="2xl"
          fontSize="sm"
          fontWeight="900"
          bg={"g_blue"}
          color="white"
          onClick={handleCreate}
          _hover={{
            transform: "translateY(-3px)",

          }}
          _active={{ transform: "translateY(-1px)" }}
          transition="all 0.3s"
        >
          Create Your First Plan
        </Button>
      </VStack>
    </Box>
  );
});
EmptyPlansState.displayName = "EmptyPlansState";

// ─── MemberContextBar ─────────────────────────────────────────────────────────

interface MemberContextBarProps {
  memberName: string;
  memberId: string | undefined;
  email?: string;
  phone?: string;
  currentPlan?: string;
  memberStatus?: string;
  onFindBestPlan: () => void;
  onViewMember: () => void;
}

const MemberContextBar = memo(({
  memberName, memberId, email, phone, currentPlan, memberStatus, onFindBestPlan, onViewMember
}: MemberContextBarProps) => {
  const cardBg = useColorModeValue("rgba(255,255,255,0.85)", "rgba(18,22,40,0.72)");
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)");
  const shadow = useColorModeValue("0 8px 32px rgba(0,0,0,0.04)", "0 8px 32px rgba(0,0,0,0.18)");
  const muted = useColorModeValue("gray.500", "gray.400");

  const statusMap: Record<string, { label: string; hex: string }> = {
    active: { label: "Active", hex: "#01B574" },
    attention: { label: "Needs Attention", hex: "#FFB547" },
    frozen: { label: "Frozen", hex: "#3965FF" },
  };
  const statusInfo = statusMap[memberStatus?.toLowerCase() || "frozen"] || statusMap.frozen;

  return (
    <Box
      p={{ base: 4, md: 5 }}
      borderRadius="24px"
      bg={cardBg}
      backdropFilter="blur(24px) saturate(190%)"
      border="1px solid"
      borderColor={border}
      boxShadow={shadow}
      position="relative"
      overflow="hidden"
      mb={6}
    >
      {/* Visual decorative brand bar on the left */}
      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={BRAND_GRADIENT} />

      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} pl={2}>
        {/* Left — Member identity info */}
        <HStack gap={4}>
          <Circle
            size="52px"
            bg={`linear-gradient(135deg, ${BRAND_HEX}22, ${BRAND_ALT}22)`}
            color={BRAND_HEX}
            fontWeight="900"
            fontSize="xl"
            border="2px solid"
            borderColor={`${BRAND_HEX}30`}
          >
            {memberName.slice(0, 1).toUpperCase() || "?"}
          </Circle>

          <VStack align="start" gap={1}>
            <HStack gap={3} flexWrap="wrap" align="center">
              <Text fontSize="md" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                {memberName}
              </Text>

              {/* Member status badge */}
              <Badge
                fontSize="9px"
                fontWeight="900"
                px={2.5}
                py={0.5}
                borderRadius="full"
                bg={`${statusInfo.hex}22`}
                color={statusInfo.hex}
                border={`1px solid ${statusInfo.hex}40`}
                boxShadow={`0 0 8px ${statusInfo.hex}15`}
              >
                {statusInfo.label.toUpperCase()}
              </Badge>

              {currentPlan && (
                <Badge
                  fontSize="9px"
                  fontWeight="900"
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  bg={`${BRAND_HEX}12`}
                  color={BRAND_HEX}
                  border={`1px solid ${BRAND_HEX}30`}
                >
                  {currentPlan.toUpperCase()}
                </Badge>
              )}
            </HStack>

            <HStack gap={2} fontSize="xs" fontWeight="700" color={muted}>
              <Text fontFamily="mono" fontSize="10px">{memberId}</Text>
              <Text>•</Text>
              <Text>Reviewing sales template options</Text>
            </HStack>
          </VStack>
        </HStack>

        {/* Right — Actions & Contact details */}
        <HStack gap={3} flexWrap="wrap">
          {/* View Profile Button */}
          <Button
            size="sm"
            h="40px"
            px={5}
            borderRadius="xl"
            fontWeight="900"
            fontSize="xs"
            variant="outline"
            borderColor={`${BRAND_HEX}30`}
            color={BRAND_HEX}
            onClick={onViewMember}
            _hover={{
              bg: `${BRAND_HEX}0d`,
              borderColor: `${BRAND_HEX}50`,
            }}
            _active={{ transform: "scale(0.97)" }}
            transition="all 0.25s"
          >
            <User size={13} style={{ marginRight: "6px" }} />
            View Profile
          </Button>

          {/* Find Best Plan Button */}
          <Button
            size="sm"
            h="40px"
            px={5}
            borderRadius="xl"
            fontWeight="900"
            fontSize="xs"
            onClick={onFindBestPlan}
            style={{ background: BRAND_GRADIENT, color: "white" }}
            boxShadow={`0 4px 15px ${BRAND_HEX}40`}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: `0 8px 24px ${BRAND_HEX}60`,
            }}
            _active={{ transform: "scale(0.97)" }}
            transition="all 0.25s"
          >
            <Sparkles size={13} style={{ marginRight: "6px" }} />
            Find Best Plan
          </Button>

          {email && (
            <Box
              px={4}
              py={2}
              borderRadius="xl"
              bg={useColorModeValue("rgba(248,250,252,0.9)", "rgba(255,255,255,0.03)")}
              border="1px solid"
              borderColor={border}
            >
              <VStack align="start" gap={0}>
                <Text fontSize="8px" color={muted} fontWeight="900" letterSpacing="wider">EMAIL ADDRESS</Text>
                <Text fontSize="xs" fontWeight="750" color="app.text.primary">{email}</Text>
              </VStack>
            </Box>
          )}
          {phone && (
            <Box
              px={4}
              py={2}
              borderRadius="xl"
              bg={useColorModeValue("rgba(248,250,252,0.9)", "rgba(255,255,255,0.03)")}
              border="1px solid"
              borderColor={border}
            >
              <VStack align="start" gap={0}>
                <Text fontSize="8px" color={muted} fontWeight="900" letterSpacing="wider">PHONE NUMBER</Text>
                <Text fontSize="xs" fontWeight="750" color="app.text.primary">{phone}</Text>
              </VStack>
            </Box>
          )}
        </HStack>
      </Flex>
    </Box>
  );
});
MemberContextBar.displayName = "MemberContextBar";

// ─── FloatingActionCard ───────────────────────────────────────────────────────
// Replaces the full-width fixed footer bar. Appears as a compact card
// anchored to the bottom-right corner only when a plan is selected.
// Does NOT overlap the app shell footer.

interface FloatingActionCardProps {
  plan: SubscriptionPlanDocument | null;
  onContinue: () => void;
  onQuickCheckout?: () => void;
}

const FloatingActionCard = memo(({ plan, onContinue, onQuickCheckout }: FloatingActionCardProps) => {
  const cardBg = useColorModeValue(
    "rgba(255,255,255,0.96)",
    "rgba(16,20,44,0.96)"
  );
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.10)");
  const muted = useColorModeValue("gray.500", "gray.400");

  const gradient = plan ? getGradient(plan.data.accent_color) : "";
  const accentHex = plan ? getAccentHex(plan.data.accent_color) : BRAND_HEX;

  // Only render when a plan is chosen — slides up from below
  if (!plan) return null;

  return (
    <Box
      position="fixed"
      bottom={6}
      right={6}
      zIndex={99}
      w={{ base: "calc(100vw - 48px)", sm: "360px" }}
      className="float-card-enter"
      pointerEvents="all"
    >
      <Box
        p={5}
        borderRadius="24px"
        bg={cardBg}
        backdropFilter="blur(28px) saturate(200%)"
        border="1px solid"
        borderColor={border}
        boxShadow="xl"
        overflow="hidden"
        position="relative"
      >
        {/* Gradient accent strip at top */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          bg={gradient}
          borderTopRadius="24px"
        />

        <VStack align="stretch" gap={3} pt={1}>
          {/* Plan identity */}
          <HStack gap={3}>
            <Circle
              size={10}
              flexShrink={0}
              style={{ background: gradient }}
              color="white"
              boxShadow={`0 4px 14px ${accentHex}50`}
            >
              <Check size={16} strokeWidth={3} />
            </Circle>

            <VStack align="start" gap={0} flex={1} minW={0}>
              <HStack gap={2}>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary" truncate>
                  {plan.data.name}
                </Text>
                <Badge
                  fontSize="8px"
                  fontWeight="900"
                  px={1.5}
                  py={0.5}
                  borderRadius="full"
                  style={{
                    background: `${accentHex}18`,
                    color: accentHex,
                    border: `1px solid ${accentHex}30`,
                  }}
                >
                  SELECTED
                </Badge>
              </HStack>
              <Text fontSize="xs" color={muted} fontWeight="600">
                {CURRENCY_SYMBOL}{plan.data.price.toLocaleString("en-IN")}
                {" / "}{BILLING_LABEL[plan.data.billing_cycle] ?? plan.data.billing_cycle}
              </Text>
            </VStack>
          </HStack>

          {/* Quick feature summary */}
          <Box
            px={3}
            py={2.5}
            borderRadius="xl"
            bg={`${accentHex}0a`}
            border="1px solid"
            borderColor={`${accentHex}18`}
          >
            <HStack gap={2} flexWrap="wrap">
              {plan.data.features.slice(0, 3).map((f) => (
                <HStack key={f} gap={1}>
                  <CheckCircle2 size={10} color={accentHex} strokeWidth={2.5} />
                  <Text fontSize="10px" fontWeight="600" color={muted}>{f}</Text>
                </HStack>
              ))}
              {plan.data.features.length > 3 && (
                <Text fontSize="10px" fontWeight="700" color={muted}>
                  +{plan.data.features.length - 3} more
                </Text>
              )}
            </HStack>
          </Box>

          {/* CTA Buttons */}
          <VStack gap={2}>
            {/* Quick Single-Page Checkout */}
            <Button
              w="full"
              h="40px"
              borderRadius="xl"
              fontWeight="900"
              fontSize="xs"
              variant="outline"
              borderColor={`${accentHex}40`}
              color={accentHex}
              onClick={onQuickCheckout}
              _hover={{
                bg: `${accentHex}0a`,
                borderColor: `${accentHex}60`,
              }}
              _active={{ transform: "scale(0.98)" }}
              transition="all 0.25s"
            >
              <HStack gap={1.5}>
                <CheckCircle size={13} />
                <Text>Quick Checkout (Single Page)</Text>
              </HStack>
            </Button>

            {/* Standard Continue Button */}
            <Button
              w="full"
              h="46px"
              borderRadius="xl"
              fontWeight="900"
              fontSize="sm"
              letterSpacing="wide"
              onClick={onContinue}
              style={{ background: gradient, color: "white" }}
              boxShadow={`0 8px 24px -6px ${accentHex}55`}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: `0 14px 32px -8px ${accentHex}65`,
              }}
              _active={{ transform: "translateY(0) scale(0.98)" }}
              transition="all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            >
              <HStack gap={2}>
                <Text>Continue to Review</Text>
                <ArrowRight size={15} />
              </HStack>
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
});
FloatingActionCard.displayName = "FloatingActionCard";

// ─── SearchBar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  totalCount: number;
  filteredCount: number;
}

const SearchBar = memo(({ value, onChange, onClear, totalCount, filteredCount }: SearchBarProps) => {
  const inputBg = useColorModeValue("rgba(255,255,255,0.9)", "rgba(18,22,40,0.65)");
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
  const muted = useColorModeValue("gray.400", "gray.500");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );

  return (
    <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} mb={6}>
      <VStack align="start" gap={0.5}>
        <Heading size="md" fontWeight="950" letterSpacing="tight" color="app.text.primary">
          Available Plans
        </Heading>
        <Text fontSize="xs" color={muted} fontWeight="500">
          {filteredCount} of {totalCount} plans · Select one to continue
        </Text>
      </VStack>

      {/* Search input */}
      <Box position="relative" w={{ base: "full", md: "300px" }}>
        <Box
          position="absolute"
          left={3.5}
          top="50%"
          transform="translateY(-50%)"
          color={muted}
          zIndex={1}
          pointerEvents="none"
        >
          <Search size={14} />
        </Box>
        <Input
          placeholder="Search by name, code, cycle..."
          value={value}
          onChange={handleChange}
          pl={10}
          pr={value ? 10 : 4}
          h="40px"
          fontSize="sm"
          fontWeight="500"
          borderRadius="xl"
          border="1px solid"
          borderColor={border}
          bg={inputBg}
          backdropFilter="blur(12px)"
          _placeholder={{ color: muted, fontWeight: "500" }}
          _focus={{
            borderColor: BRAND_HEX,
            boxShadow: `0 0 0 3px ${BRAND_HEX}26`,
            outline: "none",
          }}
          transition="border-color 0.2s, box-shadow 0.2s"
        />
        {value && (
          <Box
            position="absolute"
            right={3.5}
            top="50%"
            transform="translateY(-50%)"
            cursor="pointer"
            color={muted}
            onClick={onClear}
            _hover={{ color: "app.text.primary" }}
            zIndex={1}
          >
            <X size={13} />
          </Box>
        )}
      </Box>
    </Flex>
  );
});
SearchBar.displayName = "SearchBar";

// ─── BillingCycleFilter ───────────────────────────────────────────────────────

type BillingFilter = "all" | "monthly" | "quarterly" | "yearly";

interface BillingFilterProps {
  active: BillingFilter;
  onChange: (v: BillingFilter) => void;
}

const FILTER_OPTIONS: { label: string; value: BillingFilter }[] = [
  { label: "All", value: "all" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

const BillingCycleFilter = memo(({ active, onChange }: BillingFilterProps) => {
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
  const trackBg = useColorModeValue("rgba(226,232,240,0.5)", "rgba(255,255,255,0.04)");

  return (
    <HStack
      gap={1}
      bg={trackBg}
      p={1}
      borderRadius="xl"
      border="1px solid"
      borderColor={border}
      flexWrap="wrap"
      mb={6}
    >
      {FILTER_OPTIONS.map((opt) => {
        const isActive = active === opt.value;
        return (
          <Button
            key={opt.value}
            size="xs"
            h="32px"
            px={4}
            borderRadius="lg"
            fontWeight="700"
            fontSize="xs"
            onClick={() => onChange(opt.value)}
            bg={isActive ? "g_blue" : "transparent"}
            color={isActive ? "white" : "app.text.muted"}
            _hover={isActive ? {} : { bg: useColorModeValue("gray.100", "rgba(255,255,255,0.06)"), color: "app.text.primary" }}
            transition="all 0.2s"
            boxShadow={isActive ? `0 4px 12px g_blue66` : "none"}
          >
            {opt.label}
          </Button>
        );
      })}
    </HStack>
  );
});
BillingCycleFilter.displayName = "BillingCycleFilter";

// ─── RecommendationModal ──────────────────────────────────────────────────────

const RecommendationModal = memo(({
  open,
  onClose,
  memberName,
  fitnessGoals,
  recommendation,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  memberName: string;
  fitnessGoals?: string;
  recommendation: { plan: SubscriptionPlanDocument; reason: string } | null;
  onSelect: (plan: SubscriptionPlanDocument) => void;
}) => {
  const overlayBg = useColorModeValue("rgba(0,0,0,0.45)", "rgba(0,0,0,0.7)");
  const dialogBg = useColorModeValue("rgba(255,255,255,0.97)", "rgba(14,18,36,0.97)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
  const accentHex = recommendation ? getAccentHex(recommendation.plan.data.accent_color) : BRAND_HEX;
  const gradient = recommendation ? getGradient(recommendation.plan.data.accent_color) : BRAND_GRADIENT;
  const muted = useColorModeValue("gray.500", "gray.400");
  const quoteBg = useColorModeValue("rgba(248,250,252,0.9)", "rgba(255,255,255,0.03)");

  const handleApply = useCallback(() => {
    if (recommendation) {
      onSelect(recommendation.plan);
      toaster.create({
        title: "Plan Recommended",
        description: `Successfully pre-selected the ${recommendation.plan.data.name} plan.`,
        type: "success",
      });
    }
    onClose();
  }, [recommendation, onSelect, onClose]);

  const handleOpenChange = useCallback((e: { open: boolean }) => {
    if (!e.open) onClose();
  }, [onClose]);

  if (!recommendation) return null;

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange} size="md" placement="center">
      <DialogBackdrop bg={overlayBg} backdropFilter="blur(12px)" />
      <DialogContent
        bg={dialogBg}
        backdropFilter="blur(28px)"
        borderColor={borderColor}
        border="1px solid"
        borderRadius="24px"
        boxShadow="0 40px 80px rgba(0,0,0,0.4)"
        overflow="hidden"
      >
        <Box h="3px" bg={gradient} />

        <DialogHeader p={5}>
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Circle size={10} style={{ background: gradient }} color="white">
                <Sparkles size={16} />
              </Circle>
              <VStack align="start" gap={0}>
                <DialogTitle fontSize="md" fontWeight="950" color="app.text.primary">
                  Smart Plan Assistant
                </DialogTitle>
                <Text fontSize="xs" color={muted}>
                  Tailored template match for {memberName}
                </Text>
              </VStack>
            </HStack>
            <DialogCloseTrigger color="app.text.muted" borderRadius="lg" />
          </HStack>
        </DialogHeader>

        <DialogBody px={6} py={4}>
          <VStack align="stretch" gap={5}>
            {/* Member goals section */}
            <Box p={4} borderRadius="20px" bg={quoteBg} border="1px solid" borderColor={borderColor}>
              <Text fontSize="9px" fontWeight="900" color={muted} letterSpacing="wider" textTransform="uppercase" mb={1.5}>
                MEMBER'S FITNESS OBJECTIVES
              </Text>
              <Text fontSize="sm" fontWeight="600" color="app.text.primary" fontStyle={fitnessGoals ? "normal" : "italic"}>
                {fitnessGoals ? `"${fitnessGoals}"` : "No specific goals registered. Matching based on general admission."}
              </Text>
            </Box>

            {/* Recommendation badge & reasoning */}
            <VStack align="stretch" gap={3}>
              <Text fontSize="9px" fontWeight="900" color={muted} letterSpacing="wider" textTransform="uppercase">
                RECOMMENDED MEMBERSHIP PLAN
              </Text>

              <Flex
                p={4}
                borderRadius="20px"
                bg={`${accentHex}0f`}
                border="1px solid"
                borderColor={`${accentHex}30`}
                align="center"
                justify="space-between"
              >
                <HStack gap={3.5}>
                  <Circle size={10} style={{ background: gradient }} color="white" boxShadow={`0 4px 12px ${accentHex}40`}>
                    <Award size={18} />
                  </Circle>
                  <VStack align="start" gap={0}>
                    <Text fontSize="md" fontWeight="900" color="app.text.primary">
                      {recommendation.plan.data.name}
                    </Text>
                    <Text fontSize="xs" color={muted} fontWeight="600">
                      {recommendation.plan.data.code} · {CURRENCY_SYMBOL}{recommendation.plan.data.price.toLocaleString("en-IN")} / {BILLING_LABEL[recommendation.plan.data.billing_cycle] ?? recommendation.plan.data.billing_cycle}
                    </Text>
                  </VStack>
                </HStack>

                <Badge
                  fontSize="9px"
                  fontWeight="900"
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  style={{ background: gradient, color: "white" }}
                  boxShadow={`0 4px 10px ${accentHex}40`}
                >
                  RECOMMENDED
                </Badge>
              </Flex>

              <Text fontSize="xs" color="app.text.primary" fontWeight="600" lineHeight="relaxed">
                {recommendation.reason}
              </Text>
            </VStack>
          </VStack>
        </DialogBody>

        <DialogFooter p={5} borderTopWidth="1px" borderColor={borderColor}>
          <HStack w="full" justify="end" gap={3}>
            <Button
              variant="ghost"
              h="40px"
              px={5}
              borderRadius="xl"
              fontWeight="700"
              fontSize="xs"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              h="40px"
              px={6}
              borderRadius="xl"
              fontWeight="900"
              fontSize="xs"
              onClick={handleApply}
              style={{ background: gradient, color: "white" }}
              boxShadow={`0 6px 16px ${accentHex}40`}
              _hover={{ transform: "translateY(-1px)", boxShadow: `0 10px 24px ${accentHex}60` }}
              _active={{ transform: "scale(0.98)" }}
              transition="all 0.25s"
            >
              Select Recommended Plan
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
});
RecommendationModal.displayName = "RecommendationModal";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const Plans = memo(() => {
  const { params: memberId } = useParams();
  const navigate = useNavigate();
  const { organizationName, appCode, navigateTo } = useWorkspaceRouter();

  const { member, loading: memberLoading } = useGymMember(memberId);
  const { plans, loading: plansLoading } = useSubscriptionPlans({ activeOnly: true });

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");
  const [recommendOpen, setRecommendOpen] = useState(false);

  // ── Smart Recommendation matching based on fitnessGoals ──
  const recommendation = useMemo(() => {
    if (!member?.data || plans.length === 0) return null;
    const goals = (member.data.fitnessGoals || "").toLowerCase();

    let bestPlan = plans[0];
    let matchReason = "Based on general membership preferences for gym entries.";

    const proPlan = plans.find(p => p.data.code.toLowerCase().includes("pro") || p.data.name.toLowerCase().includes("pro") || p.data.name.toLowerCase().includes("premium") || p.data.name.toLowerCase().includes("elite"));
    const standardPlan = plans.find(p => p.data.code.toLowerCase().includes("standard") || p.data.name.toLowerCase().includes("standard") || p.data.name.toLowerCase().includes("plus"));
    const basicPlan = plans.find(p => p.data.code.toLowerCase().includes("basic") || p.data.name.toLowerCase().includes("basic") || p.data.name.toLowerCase().includes("starter"));

    if (goals.includes("personal trainer") || goals.includes("trainer") || goals.includes("custom") || goals.includes("coaching") || goals.includes("elite") || goals.includes("bodybuilding") || goals.includes("hypertrophy") || goals.includes("heavy")) {
      if (proPlan) {
        bestPlan = proPlan;
        matchReason = "Your objectives include specialized training or personal coaching. The Pro/Elite plan offers custom workout schedules and dedicated personal training sessions.";
      }
    } else if (goals.includes("weight loss") || goals.includes("burn") || goals.includes("fat") || goals.includes("cardio") || goals.includes("aerobic") || goals.includes("group") || goals.includes("classes")) {
      if (standardPlan) {
        bestPlan = standardPlan;
        matchReason = "For weight management and group exercises, the Standard Plan provides full access to group cardio classes and conditioning equipment.";
      } else if (proPlan) {
        bestPlan = proPlan;
        matchReason = "The Pro plan provides comprehensive fat-burning programs and unlimited class pass access.";
      }
    } else if (goals.includes("flexibility") || goals.includes("stretch") || goals.includes("yoga") || goals.includes("maintenance") || goals.includes("healthy")) {
      if (basicPlan) {
        bestPlan = basicPlan;
        matchReason = "For general maintenance, flexibility, and self-guided workouts, the Starter/Basic plan provides all essential gym floor access at the best price.";
      }
    } else {
      const sorted = [...plans].sort((a, b) => a.data.price - b.data.price);
      const midIndex = Math.floor(sorted.length / 2);
      bestPlan = sorted[midIndex];
      matchReason = "This mid-tier plan is recommended as it offers the most popular balance of class access and training amenities.";
    }

    return { plan: bestPlan, reason: matchReason };
  }, [member, plans]);

  const pageBg = useColorModeValue("rgba(248,250,252,1)", "bg.default");
  const accentOrb = useColorModeValue(`g_blue0f`, `g_blue17`);

  // Derived member display values
  const memberName = useMemo(() => {
    const d = member?.data;
    return `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || memberId || "Member";
  }, [member, memberId]);

  // Apply search + billing-cycle filter
  const filteredPlans = useMemo(() => {
    let result = plans;
    if (billingFilter !== "all") {
      result = result.filter((p) => p.data.billing_cycle === billingFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.data.name.toLowerCase().includes(q) ||
          p.data.code.toLowerCase().includes(q) ||
          p.data.billing_cycle.toLowerCase().includes(q) ||
          p.data.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [plans, searchQuery, billingFilter]);

  const handleSelectPlan = useCallback((plan: SubscriptionPlanDocument) => setSelectedPlan(plan), []);
  const handleBack = useCallback(() => navigate(-1), [navigate]);
  const handleClearSearch = useCallback(() => setSearchQuery(""), []);
  const handleViewMember = useCallback(() => {
    if (!memberId) return;
    navigateTo("member", memberId);
  }, [navigateTo, memberId]);

  const handleContinue = useCallback(() => {
    if (!selectedPlan) {
      toaster.create({
        title: "Select a Plan",
        description: "Please choose a membership plan to continue.",
        type: "warning",
      });
      return;
    }
    const reviewPath = `/${organizationName}/workspace/app/${appCode}/reviewOrder/${memberId}?planCode=${selectedPlan.data.code}`;
    navigate(reviewPath);
  }, [selectedPlan, memberId, organizationName, appCode, navigate]);

  const handleQuickCheckout = useCallback(() => {
    if (!selectedPlan) {
      toaster.create({
        title: "Select a Plan",
        description: "Please choose a membership plan to continue.",
        type: "warning",
      });
      return;
    }
    const checkoutPath = `/${organizationName}/workspace/app/${appCode}/checkout/${memberId}?planCode=${selectedPlan.data.code}`;
    navigate(checkoutPath);
  }, [selectedPlan, memberId, organizationName, appCode, navigate]);

  return (
    <Box
      w="full"
      minH="100vh"
      bg={pageBg}
      fontFamily="'Inter', sans-serif"
      position="relative"
      pb={8}
    >
      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes planCardEnter {
          0%  { opacity: 0; transform: translateY(24px) scale(0.96); }
          100%{ opacity: 1; transform: translateY(0) scale(1); }
        }
        .plan-card-enter {
          opacity: 0;
          animation: planCardEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes featureSlideIn {
          0%  { opacity: 0; transform: translateX(-8px); }
          100%{ opacity: 1; transform: translateX(0); }
        }
        .feature-slide-in {
          opacity: 0;
          animation: featureSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes floatCardEnter {
          0%  { opacity: 0; transform: translateY(32px) scale(0.94); }
          60% { transform: translateY(-6px) scale(1.01); }
          100%{ opacity: 1; transform: translateY(0) scale(1); }
        }
        .float-card-enter {
          animation: floatCardEnter 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* ── Ambient Background Orbs ── */}
      <Box
        position="fixed"
        top="-100px"
        right="-100px"
        w="500px"
        h="500px"
        borderRadius="full"
        bg={`g_blue14`}
        filter="blur(120px)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="fixed"
        bottom="-80px"
        left="-80px"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="rgba(57,101,255,0.06)"
        filter="blur(100px)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* ── Page Content ── */}
      <Box w="full" px={{ base: 4, md: 8 }} py={8} position="relative" zIndex={1}>

        {/* ── Page Header ── */}
        <PageHeader
          title="Select Membership Plan"
          subtitle={
            memberLoading
              ? "Loading member details..."
              : `Choose the right plan for ${memberName}`
          }
          icon={Crown}
          badge="Plan Selection"
          accentColor="blue"
        />

        {/* ── Member Context Bar ── */}
        {!memberLoading && member ? (
          <MemberContextBar
            memberName={memberName}
            memberId={member.data.member_id || memberId}
            email={member.data.email}
            phone={member.data.phone}
            currentPlan={member.data.plan}
            memberStatus={member.data.status}
            onFindBestPlan={() => setRecommendOpen(true)}
            onViewMember={handleViewMember}
          />
        ) : memberLoading ? (
          <Skeleton height="76px" borderRadius="20px" mb={6} />
        ) : null}

        {/* ── Billing Filter Tabs ── */}
        {!plansLoading && plans.length > 0 && (
          <BillingCycleFilter active={billingFilter} onChange={setBillingFilter} />
        )}

        {/* ── Search + Count Row ── */}
        {!plansLoading && plans.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={handleClearSearch}
            totalCount={plans.length}
            filteredCount={filteredPlans.length}
          />
        )}

        {/* ── Plan Grid ── */}
        {plansLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
            {[1, 2, 3, 4].map((i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </SimpleGrid>
        ) : filteredPlans.length === 0 ? (
          searchQuery || billingFilter !== "all" ? (
            /* No search / filter results */
            <Box
              p={14}
              borderRadius="28px"
              bg={useColorModeValue("rgba(255,255,255,0.8)", "rgba(18,22,40,0.6)")}
              backdropFilter="blur(24px)"
              border="1px solid"
              borderColor={useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.07)")}
              textAlign="center"
            >
              <VStack gap={5} maxW="sm" mx="auto">
                <Circle size={18} bg="rgba(107,114,128,0.1)" color="gray.400">
                  <Search size={28} />
                </Circle>
                <VStack gap={1}>
                  <Text fontWeight="800" color="app.text.primary" fontSize="md">
                    No matching plans
                  </Text>
                  <Text fontSize="sm" color="app.text.muted">
                    {searchQuery
                      ? `No plans match "${searchQuery}".`
                      : `No ${billingFilter} plans available.`}
                  </Text>
                </VStack>
                <HStack gap={3}>
                  {searchQuery && (
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="xl"
                      onClick={handleClearSearch}
                      fontWeight="700"
                    >
                      Clear Search
                    </Button>
                  )}
                  {billingFilter !== "all" && (
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="xl"
                      onClick={() => setBillingFilter("all")}
                      fontWeight="700"
                    >
                      Show All
                    </Button>
                  )}
                </HStack>
              </VStack>
            </Box>
          ) : (
            <EmptyPlansState />
          )
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6} alignItems="stretch">
            {filteredPlans.map((plan, idx) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                isSelected={selectedPlan?._id === plan._id}
                badgeLabel={getBadgeLabel(plan, filteredPlans)}
                onSelect={handleSelectPlan}
                animationDelay={`${idx * 0.07}s`}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* ── Floating Action Card (bottom-right, only when plan selected) ── */}
      <FloatingActionCard
        plan={selectedPlan}
        onContinue={handleContinue}
        onQuickCheckout={handleQuickCheckout}
      />

      {/* ── AI Recommendation Modal ── */}
      <RecommendationModal
        open={recommendOpen}
        onClose={() => setRecommendOpen(false)}
        memberName={memberName}
        fitnessGoals={member?.data?.fitnessGoals}
        recommendation={recommendation}
        onSelect={handleSelectPlan}
      />
    </Box>
  );
});

Plans.displayName = "Plans";
export default Plans;
