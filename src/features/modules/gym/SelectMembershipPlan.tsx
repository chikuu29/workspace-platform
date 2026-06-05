/**
 * SelectMembershipPlan.tsx
 *
 * Step 2 in the gym membership sales flow.
 * Route: /:org/workspace/app/gym/selectMembershipPlan/:memberId
 *
 * Purpose:
 *   - Display all active membership plan cards
 *   - Search and filter plans
 *   - Select a plan (local state only — no API call)
 *   - "Continue" navigates to ReviewOrder with planCode as query param
 *
 * Architecture note:
 *   NO backend call is made on "Continue". The plan selection is
 *   carried forward via URL query param (?planCode=GYM_PRO).
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
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  Icon,
  Separator,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { Card } from "@/core/components/Card";
import { PageLayout } from "@/core/components/PageLayout";
import { useGymMember } from "./hooks/useGymMember";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import type { SubscriptionPlanDocument } from "./types/Gym.types";

// ─── Constants ──────────────────────────────────────────────────────

const CURRENCY_SYMBOL = "₹";

const GRADIENT_MAP: Record<string, string> = {
  brand: "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)",
  blue: "linear-gradient(135deg, #3965FF 0%, #002DFF 100%)",
  green: "linear-gradient(135deg, #01B574 0%, #00875A 100%)",
  orange: "linear-gradient(135deg, #FFB547 0%, #E67E00 100%)",
  red: "linear-gradient(135deg, #EE5D50 0%, #C52A1D 100%)",
  purple: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
  pink: "linear-gradient(135deg, #EC4899 0%, #D946EF 100%)",
  cyan: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
  emerald: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
};

const getGradient = (accent?: string) => {
  const key = accent?.toLowerCase() || "brand";
  return GRADIENT_MAP[key] || GRADIENT_MAP.brand;
};

const BILLING_CYCLE_LABEL: Record<string, string> = {
  monthly: "mo",
  quarterly: "qtr",
  yearly: "yr",
  "half-yearly": "6mo",
};

// ─── Feature Item ────────────────────────────────────────────────────

interface FeatureItemProps {
  text: string;
  accent: string;
}

const FeatureItem = memo(({ text, accent }: FeatureItemProps) => {
  const accentColor = useMemo(() => `${accent}.500`, [accent]);
  const bgAccent = useMemo(() => `${accent}.500/10`, [accent]);

  return (
    <HStack gap={2.5} align="start">
      <Circle size={5} bg={bgAccent} color={accentColor} mt="1px" flexShrink={0}>
        <Check size={10} strokeWidth={3} />
      </Circle>
      <Text fontSize="xs" fontWeight="600" color="app.text.primary" lineHeight="shorter">
        {text}
      </Text>
    </HStack>
  );
});
FeatureItem.displayName = "FeatureItem";

// ─── Plan Card ───────────────────────────────────────────────────────

interface PlanCardProps {
  plan: SubscriptionPlanDocument;
  isSelected: boolean;
  onSelect: (plan: SubscriptionPlanDocument) => void;
}

const PlanCard = memo(({ plan, isSelected, onSelect }: PlanCardProps) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.75)", "rgba(11, 20, 55, 0.45)");
  const borderColor = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");

  const planData = plan.data;
  const accent = planData.accent_color || "brand";
  const gradient = useMemo(() => getGradient(accent), [accent]);
  const billingLabel = BILLING_CYCLE_LABEL[planData.billing_cycle] ?? planData.billing_cycle;

  const handleClick = useCallback(() => onSelect(plan), [plan, onSelect]);

  return (
    <Box
      position="relative"
      p="1.5px"
      borderRadius="3xl"
      bg={isSelected ? gradient : "transparent"}
      boxShadow={isSelected ? `0 15px 35px -10px var(--chakra-colors-${accent}-500)` : "none"}
      transition="all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      transform={isSelected ? "scale(1.025)" : "scale(1)"}
      _hover={{ transform: isSelected ? "scale(1.03)" : "translateY(-6px)" }}
    >
      <Card
        p={0}
        bg={cardBg}
        backdropFilter="blur(24px) saturate(190%)"
        border="1px solid"
        borderColor={isSelected ? "whiteAlpha.400" : borderColor}
        borderRadius="3xl"
        cursor="pointer"
        overflow="hidden"
        gap={0}
        h="full"
        onClick={handleClick}
        transition="all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        boxShadow="none"
      >
        {/* Selected glow bar */}
        {isSelected && <Box h="4px" bg={gradient} w="full" />}

        <VStack align="stretch" gap={5} p={6}>
          {/* Header */}
          <Flex justify="space-between" align="start">
            <VStack align="start" gap={1} flex={1} minW={0}>
              <HStack gap={2} flexWrap="wrap">
                <Text
                  fontSize="lg"
                  fontWeight="900"
                  color="app.text.primary"
                  letterSpacing="tight"
                  truncate
                >
                  {planData.name}
                </Text>
                {planData.code.toLowerCase().includes("pro") && (
                  <Icon color={`${accent}.500`} size="sm">
                    <Sparkles />
                  </Icon>
                )}
              </HStack>
              <Text fontSize="xs" color={muted} fontWeight="500" lineClamp={2} minH="32px">
                {planData.description || `Premium access for fitness seekers`}
              </Text>
            </VStack>

            <Circle
              size={8}
              bg={isSelected ? `${accent}.500` : "transparent"}
              color={isSelected ? "white" : muted}
              border="2px solid"
              borderColor={isSelected ? `${accent}.500` : borderColor}
              boxShadow={isSelected ? `0 0 15px var(--chakra-colors-${accent}-500)` : "none"}
              ml={3}
              flexShrink={0}
              transition="all 0.3s"
            >
              {isSelected && <Check size={14} strokeWidth={3} />}
            </Circle>
          </Flex>

          {/* Pricing */}
          <VStack align="start" gap={1}>
            <HStack align="baseline" gap={1}>
              <Text
                fontSize="3xl"
                fontWeight="950"
                color="app.text.primary"
                lineHeight="1"
                letterSpacing="tight"
              >
                {CURRENCY_SYMBOL}{planData.price.toLocaleString("en-IN")}
              </Text>
              <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase">
                /{billingLabel}
              </Text>
            </HStack>
            <Badge
              variant="subtle"
              colorPalette={accent}
              borderRadius="md"
              px={2}
              fontSize="9px"
              fontWeight="900"
              letterSpacing="wider"
            >
              {planData.billing_cycle.toUpperCase()}
            </Badge>
          </VStack>

          <Separator opacity={0.06} />

          {/* Features */}
          <VStack align="stretch" gap={2.5} minH="80px">
            {planData.features.slice(0, 5).map((f) => (
              <FeatureItem key={f} text={f} accent={accent} />
            ))}
          </VStack>

          {/* CTA */}
          <Button
            w="full"
            size="lg"
            h="48px"
            borderRadius="2xl"
            fontWeight="900"
            fontSize="xs"
            letterSpacing="widest"
            textTransform="uppercase"
            colorPalette={accent}
            variant={isSelected ? "solid" : "outline"}
            bg={isSelected ? gradient : "transparent"}
            borderColor={isSelected ? "transparent" : `${accent}.500/35`}
            color={isSelected ? "white" : `${accent}.500`}
            _hover={{
              transform: "translateY(-3px)",
              boxShadow: isSelected
                ? `0 12px 25px -8px var(--chakra-colors-${accent}-500)`
                : `0 8px 15px -5px var(--chakra-colors-${accent}-500)`,
            }}
            _active={{ transform: "translateY(-1px)" }}
            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          >
            <HStack gap={2}>
              <Text>{isSelected ? "Selected" : "Choose Plan"}</Text>
              {isSelected ? <Check size={13} strokeWidth={3} /> : <ArrowRight size={13} />}
            </HStack>
          </Button>
        </VStack>
      </Card>
    </Box>
  );
});
PlanCard.displayName = "PlanCard";

// ─── Empty State ─────────────────────────────────────────────────────

const EmptyPlansState = memo(() => {
  const muted = useColorModeValue("gray.500", "gray.400");
  const { navigateTo } = useWorkspaceRouter();
  const handleCreate = useCallback(() => navigateTo("AddSubscriptionPlan"), [navigateTo]);

  return (
    <Card
      p={12}
      borderRadius="3xl"
      bg={useColorModeValue("white", "rgba(11, 20, 55, 0.45)")}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
    >
      <VStack gap={6} textAlign="center" maxW="md" mx="auto">
        <Circle size={20} bg="brand.500/10" color="brand.500">
          <Crown size={32} />
        </Circle>
        <VStack gap={2}>
          <Heading size="lg" fontWeight="950" letterSpacing="tight">
            No Active Plans
          </Heading>
          <Text fontSize="sm" color={muted} fontWeight="500">
            Create your first subscription plan template to start selling memberships.
          </Text>
        </VStack>
        <Button
          colorPalette="brand"
          borderRadius="2xl"
          size="xl"
          h="52px"
          px={10}
          fontSize="sm"
          fontWeight="900"
          onClick={handleCreate}
          bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
          _hover={{ transform: "translateY(-3px)", boxShadow: "0 15px 30px -10px var(--chakra-colors-brand-500)" }}
          transition="all 0.3s"
        >
          Create Your First Plan
        </Button>
      </VStack>
    </Card>
  );
});
EmptyPlansState.displayName = "EmptyPlansState";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const SelectMembershipPlan = memo(() => {
  const { params: memberId } = useParams();
  const navigate = useNavigate();
  const { buildPath, organizationName, appCode } = useWorkspaceRouter();

  const { member, loading: memberLoading } = useGymMember(memberId);
  const { plans, loading: plansLoading } = useSubscriptionPlans({ activeOnly: true });

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const muted = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // Derived member display name
  const memberName = useMemo(() => {
    const d = member?.data;
    return `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || memberId || "Member";
  }, [member, memberId]);

  // Filter plans by search query
  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return plans;
    const q = searchQuery.toLowerCase();
    return plans.filter(
      (p) =>
        p.data.name.toLowerCase().includes(q) ||
        p.data.code.toLowerCase().includes(q) ||
        p.data.billing_cycle.toLowerCase().includes(q) ||
        p.data.description?.toLowerCase().includes(q)
    );
  }, [plans, searchQuery]);

  const handleSelectPlan = useCallback((plan: SubscriptionPlanDocument) => {
    setSelectedPlan(plan);
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Navigate to ReviewOrder, passing planCode as a query parameter.
  // No API call is made here — invoice is created on the next page.
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

  return (
    <PageLayout
      title="Select Membership Plan"
      subtitle={memberLoading ? "Loading..." : `Choose a plan for ${memberName}`}
    >
      {/* Ambient background */}
      <Box
        position="absolute"
        top="-80px"
        right="-80px"
        w="400px"
        h="400px"
        bg="brand.500"
        filter="blur(140px)"
        opacity={0.08}
        zIndex={0}
        pointerEvents="none"
      />

      {/* Member context bar */}
      {!memberLoading && member && (
        <Card
          p={4}
          borderRadius="2xl"
          bg="app.card.bg"
          borderColor="app.card.border"
          backdropFilter="blur(20px)"
          mb={6}
          zIndex={1}
          position="relative"
        >
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <HStack gap={3}>
              <Circle
                size={9}
                bg="brand.500/10"
                color="brand.500"
                border="1px solid"
                borderColor="brand.500/25"
              >
                <Icon>
                  <Check size={16} />
                </Icon>
              </Circle>
              <VStack align="start" gap={0}>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                  {memberName}
                </Text>
                <Text fontSize="10px" color={muted} fontWeight="600">
                  ID: {member?.data?.member_id || memberId}
                </Text>
              </VStack>
            </HStack>
            <HStack gap={4}>
              <VStack align="start" gap={0}>
                <Text fontSize="8px" color={muted} fontWeight="800" letterSpacing="wider">
                  EMAIL
                </Text>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary">
                  {member?.data?.email || "N/A"}
                </Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Text fontSize="8px" color={muted} fontWeight="800" letterSpacing="wider">
                  PHONE
                </Text>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary">
                  {member?.data?.phone || "N/A"}
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </Card>
      )}

      {/* Header row */}
      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={4}
        mb={6}
        zIndex={1}
        position="relative"
      >
        <VStack align="start" gap={1}>
          <Heading size="md" fontWeight="950" letterSpacing="tight" color="app.text.primary">
            Available Plans
          </Heading>
          {!plansLoading && plans.length > 0 && (
            <Text fontSize="xs" color={muted} fontWeight="500">
              {filteredPlans.length} of {plans.length} plans shown
            </Text>
          )}
        </VStack>

        {/* Search */}
        <Box position="relative" w={{ base: "full", md: "280px" }}>
          <Box
            position="absolute"
            left={3}
            top="50%"
            transform="translateY(-50%)"
            color={muted}
            zIndex={1}
            pointerEvents="none"
          >
            <Search size={14} />
          </Box>
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            pl={9}
            pr={searchQuery ? 9 : 4}
            h="38px"
            fontSize="sm"
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            bg={useColorModeValue("white", "rgba(11, 20, 55, 0.4)")}
            _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
          />
          {searchQuery && (
            <Box
              position="absolute"
              right={3}
              top="50%"
              transform="translateY(-50%)"
              cursor="pointer"
              color={muted}
              onClick={handleClearSearch}
              _hover={{ color: "app.text.primary" }}
            >
              <X size={13} />
            </Box>
          )}
        </Box>
      </Flex>

      {/* Plan grid */}
      <Box zIndex={1} position="relative" pb={32}>
        {plansLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="380px" borderRadius="3xl" />
            ))}
          </SimpleGrid>
        ) : filteredPlans.length === 0 ? (
          searchQuery ? (
            <Card
              p={12}
              borderRadius="3xl"
              textAlign="center"
              bg={useColorModeValue("white", "rgba(11, 20, 55, 0.45)")}
            >
              <VStack gap={4}>
                <Circle size={16} bg="gray.500/10" color={muted}>
                  <Search size={28} />
                </Circle>
                <VStack gap={1}>
                  <Text fontWeight="800" color="app.text.primary">
                    No plans match "{searchQuery}"
                  </Text>
                  <Text fontSize="sm" color={muted}>
                    Try a different keyword or clear the search.
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="xl"
                  onClick={handleClearSearch}
                >
                  Clear Search
                </Button>
              </VStack>
            </Card>
          ) : (
            <EmptyPlansState />
          )
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                isSelected={selectedPlan?._id === plan._id}
                onSelect={handleSelectPlan}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Sticky action bar */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={100}
        p={4}
        bg={useColorModeValue(
          "rgba(255, 255, 255, 0.85)",
          "rgba(10, 14, 40, 0.90)"
        )}
        backdropFilter="blur(20px)"
        borderTop="1px solid"
        borderColor={borderColor}
      >
        <Flex
          maxW="1400px"
          mx="auto"
          justify="space-between"
          align="center"
          gap={4}
          flexWrap="wrap"
        >
          {/* Selected summary */}
          <HStack gap={4}>
            {selectedPlan ? (
              <>
                <Circle
                  size={9}
                  bg={getGradient(selectedPlan.data.accent_color)}
                  color="white"
                >
                  <Check size={15} strokeWidth={3} />
                </Circle>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                    {selectedPlan.data.name}
                  </Text>
                  <Text fontSize="xs" color={muted} fontWeight="600">
                    ₹{selectedPlan.data.price.toLocaleString("en-IN")} /{" "}
                    {selectedPlan.data.billing_cycle}
                  </Text>
                </VStack>
              </>
            ) : (
              <Text fontSize="sm" color={muted} fontWeight="600">
                No plan selected — choose one above
              </Text>
            )}
          </HStack>

          {/* Actions */}
          <HStack gap={3}>
            <Button
              variant="outline"
              borderRadius="xl"
              onClick={handleBack}
              fontWeight="700"
              fontSize="sm"
              h="44px"
              px={6}
              borderColor={borderColor}
              _hover={{ bg: "rgba(255,255,255,0.05)" }}
            >
              <ArrowLeft size={16} />
              <Text ml={2}>Back</Text>
            </Button>

            <Button
              h="44px"
              px={8}
              borderRadius="xl"
              fontWeight="900"
              fontSize="sm"
              letterSpacing="wide"
              bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
              color="white"
              isDisabled={!selectedPlan}
              onClick={handleContinue}
              _hover={{
                transform: selectedPlan ? "translateY(-2px)" : "none",
                boxShadow: selectedPlan
                  ? "0 12px 25px -8px var(--chakra-colors-brand-500)"
                  : "none",
              }}
              _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
              transition="all 0.3s"
            >
              <Text mr={2}>Continue</Text>
              <ArrowRight size={16} />
            </Button>
          </HStack>
        </Flex>
      </Box>
    </PageLayout>
  );
});
SelectMembershipPlan.displayName = "SelectMembershipPlan";

export default SelectMembershipPlan;
