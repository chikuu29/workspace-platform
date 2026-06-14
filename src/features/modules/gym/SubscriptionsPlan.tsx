/**
 * subscriptions.tsx
 *
 * Premium plan management page — glassmorphic cards, edit drawer, delete.
 * Fetches plans via useSubscriptionPlans hook.
 */

import { memo, useState, useCallback, useMemo, useEffect } from "react";
import {
  Box, Heading, Text, VStack, HStack, Button, Badge, IconButton, Input,
  Textarea, SimpleGrid, Spinner, Center, Separator, Flex, Circle, Icon,
  Grid,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import {
  DrawerRoot, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter,
  DrawerBackdrop, DrawerCloseTrigger,
} from "@/components/ui/drawer";
import { NativeSelectRoot, NativeSelectField } from "@/components/ui/native-select";
import { toaster } from "@/components/ui/toaster";
import {
  Plus, Pencil, Trash2, Check, ArrowRight,
  Activity, Timer, Coins, CreditCard, Filter, TrendingUp,
  RefreshCw, Search,
} from "lucide-react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { GymApiService } from "./services/gymApi.service";
import type { SubscriptionPlanDocument } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";

// ─── Helpers ────────────────────────────────────────────────────────

const fmtCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

type PlanFilter = "all" | "active" | "inactive";

const accentColorMap: Record<string, string> = {
  blue: "blue",
  green: "green",
  purple: "purple",
  orange: "orange",
  red: "red",
  teal: "teal",
  cyan: "cyan",
  pink: "pink",
};

// ─── Plan Card ──────────────────────────────────────────────────────

interface PlanCardProps {
  plan: SubscriptionPlanDocument;
  onEdit: (plan: SubscriptionPlanDocument) => void;
  onDelete: (plan: SubscriptionPlanDocument) => void;
}

const PlanCard = memo(({ plan, onEdit, onDelete }: PlanCardProps) => {
  const accent = plan.data.accent_color || "blue";
  const currency = plan.data.currency || "INR";
  const cardBorder = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  const handleEdit = useCallback(() => {
    onEdit(plan);
  }, [onEdit, plan]);

  const handleDelete = useCallback(() => {
    onDelete(plan);
  }, [onDelete, plan]);

  const accentPalette = accentColorMap[accent] || "blue";

  return (
    <Box
      role="group"
      p={6}
      borderRadius="3xl"
      bg={"app.card.bg"}
      border="1px solid"
      borderColor={cardBorder}
      boxShadow={useColorModeValue(
        "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
        "0 10px 30px -15px rgba(0, 0, 0, 0.5)"
      )}
      backdropFilter="blur(20px) saturate(160%)"
      position="relative"
      overflow="hidden"
      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        h: "4px",
        bgGradient: `to-r`,
        gradientFrom: `${accentPalette}.500`,
        gradientTo: `${accentPalette}.300`,
        opacity: plan.data.is_active ? 1 : 0.4,
      }}
      _hover={{
        transform: "translateY(-6px)",
        borderColor: `${accentPalette}.450`,
        boxShadow: useColorModeValue(
          `0 20px 40px -15px var(--chakra-colors-${accentPalette}-500)`,
          `0 20px 40px -15px var(--chakra-colors-${accentPalette}-800)`
        ),
      }}
    >
      {/* Background glow on hover */}
      <Box
        position="absolute"
        top="-40%"
        left="-40%"
        w="180%"
        h="180%"
        borderRadius="full"
        bgGradient="radial"
        gradientFrom={`${accentPalette}.500/0.05`}
        gradientTo="transparent"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.5s ease"
        pointerEvents="none"
      />

      <VStack align="stretch" gap={5} h="full" position="relative" zIndex={1}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack gap={2}>
            <Badge
              variant="subtle"
              colorPalette={plan.data.is_active ? accentPalette : "gray"}
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="900"
              fontSize="2xs"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {plan.data.is_active ? "Live" : "Inactive"}
            </Badge>
            {plan.data.max_members && (
              <Badge
                variant="outline"
                colorPalette="gray"
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontWeight="700"
                fontSize="3xs"
              >
                Cap: {plan.data.max_members}
              </Badge>
            )}
          </HStack>

          <HStack gap={1} opacity={0} _groupHover={{ opacity: 1 }} transition="all 0.2s ease">
            <IconButton
              aria-label="Edit Plan"
              variant="subtle"
              colorPalette="blue"
              size="xs"
              onClick={handleEdit}
              borderRadius="lg"
            >
              <Pencil size={13} />
            </IconButton>
            <IconButton
              aria-label="Delete Plan"
              variant="subtle"
              colorPalette="red"
              size="xs"
              onClick={handleDelete}
              borderRadius="lg"
            >
              <Trash2 size={13} />
            </IconButton>
          </HStack>
        </Flex>

        {/* Name + Code */}
        <VStack align="start" gap={0.5}>
          <Heading size="md" fontWeight="900" letterSpacing="tight" color="app.text.primary">
            {plan.data.name}
          </Heading>
          <Text fontSize="2xs" color={`${accentPalette}.500`} fontWeight="800" fontFamily="mono" textTransform="uppercase" letterSpacing="widest">
            {plan.data.code}
          </Text>
        </VStack>

        {/* Price */}
        <HStack align="baseline" gap={1}>
          <Text fontSize="3xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
            {fmtCurrency(plan.data.price, currency)}
          </Text>
          <Text fontSize="xs" color={muted} fontWeight="700" textTransform="lowercase">
            / {plan.data.billing_cycle}
          </Text>
        </HStack>

        {/* Description */}
        {plan.data.description ? (
          <Text fontSize="xs" color={muted} lineHeight="relaxed" minH="38px" lineClamp={2}>
            {plan.data.description}
          </Text>
        ) : (
          <Text fontSize="xs" color={muted} fontStyle="italic" minH="38px">
            No plan description provided.
          </Text>
        )}

        <Separator opacity={0.15} />

        {/* Features */}
        <VStack align="stretch" gap={2} flex="1">
          <Text fontSize="3xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color={muted}>
            Plan Features
          </Text>
          {plan.data.features && plan.data.features.length > 0 ? (
            plan.data.features.map((f, idx) => (
              <HStack key={`${f}-${idx}`} gap={2}>
                <Circle size="4" bg={`${accentPalette}.500/10`} color={`${accentPalette}.500`}>
                  <Check size={9} strokeWidth={3} />
                </Circle>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary" lineClamp={1}>
                  {f}
                </Text>
              </HStack>
            ))
          ) : (
            <HStack gap={2}>
              <Circle size="4" bg={`${accentPalette}.500/10`} color={`${accentPalette}.500`}>
                <Check size={9} strokeWidth={3} />
              </Circle>
              <Text fontSize="xs" fontWeight="600" color={muted}>
                Standard gym floor access
              </Text>
            </HStack>
          )}
        </VStack>

        {/* Action Button */}
        <Button
          variant="subtle"
          w="full"
          colorPalette={accentPalette}
          borderRadius="xl"
          fontWeight="900"
          fontSize="xs"
          h="40px"
          onClick={handleEdit}
          transition="all 0.2s"
          _hover={{ transform: "scale(1.01)" }}
        >
          <HStack gap={1} justify="center">
            <Text>Modify Plan</Text>
            <Icon as={ArrowRight} boxSize={3.5} />
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
});
PlanCard.displayName = "PlanCard";

// ─── Stat Tile ──────────────────────────────────────────────────────

interface StatTileProps {
  label: string;
  value: string | number;
  caption: string;
  icon: React.ElementType;
  accent: string;
}

const StatTile = memo(({ label, value, caption, icon, accent }: StatTileProps) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  const panelBg = useColorModeValue("rgba(255,255,255,0.75)", "rgba(15,23,42,0.6)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.12)");

  return (
    <Box
      p={{ base: 4, md: 5 }}
      borderRadius="2xl"
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(16px) saturate(150%)"
      boxShadow="0 4px 20px -10px rgba(0, 0, 0, 0.05)"
      transition="all 0.2s ease"
      _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 30px -10px rgba(0, 0, 0, 0.08)" }}
    >
      <HStack justify="space-between" align="start" gap={4}>
        <VStack align="start" gap={1}>
          <Text fontSize="xs" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">
            {label}
          </Text>
          <Heading size="xl" color="app.text.primary" letterSpacing="tight" fontWeight="900">
            {value}
          </Heading>
          <Text fontSize="2xs" color={muted} fontWeight="700">
            {caption}
          </Text>
        </VStack>
        <Circle size="10" bg={`${accent}/10`} color={accent}>
          <Icon as={icon} boxSize={4} />
        </Circle>
      </HStack>
    </Box>
  );
});
StatTile.displayName = "StatTile";

// ─── Main Component ─────────────────────────────────────────────────

const Subscriptions = memo(() => {
  const { plans, loading: isLoading, refetch } = useSubscriptionPlans();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDocument | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PlanFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { navigateTo } = useWorkspaceRouter();

  const muted = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(240,249,255,0.96), rgba(255,255,255,0.92) 48%, rgba(245,243,255,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.88) 52%, rgba(49,10,101,0.42))"
  );

  // ── Metrics ──
  const metrics = useMemo(() => {
    const active = plans.filter((p) => p.data.is_active).length;
    const totalRevenue = plans.reduce((a, p) => a + (p.data.is_active ? p.data.price : 0), 0);
    return { total: plans.length, active, inactive: plans.length - active, totalRevenue };
  }, [plans]);

  // ── Filtered ──
  const filteredPlans = useMemo(() => {
    let result = plans;

    if (activeFilter !== "all") {
      result = result.filter((p) => activeFilter === "active" ? p.data.is_active : !p.data.is_active);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        p.data.name.toLowerCase().includes(q) ||
        p.data.code.toLowerCase().includes(q)
      );
    }

    return result;
  }, [plans, activeFilter, searchQuery]);

  // ── Handlers ──
  const handleAddClick = useCallback(() => {
    navigateTo("AddSubscriptionPlan");
  }, [navigateTo]);

  const handleEditClick = useCallback((plan: SubscriptionPlanDocument) => {
    setSelectedPlan(plan);
    setIsOpen(true);
  }, []);

  const handleDelete = useCallback((plan: SubscriptionPlanDocument) => {
    if (!window.confirm(`Delete plan "${plan.data.name}"? This cannot be undone.`)) return;
    GymApiService.deletePlan(plan._meta.id).subscribe({
      next: (res) => {
        if (res.success) {
          toaster.create({ title: "Plan Removed", type: "success" });
          refetch();
        } else {
          toaster.create({ title: "Failed", description: (res as any).message, type: "error" });
        }
      },
      error: (err) => {
        toaster.create({ title: "Network Error", description: err?.message, type: "error" });
      },
    });
  }, [refetch]);

  const handleSave = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPlan) return;
    setIsSaving(true);
    const fd = new FormData(event.currentTarget);
    const payload = {
      code: fd.get("code") as string,
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      price: parseFloat(fd.get("price") as string) || 0,
      billing_cycle: fd.get("billing_cycle") as "monthly" | "quarterly" | "yearly",
      is_active: fd.get("is_active") === "on",
    };
    GymApiService.updatePlan(selectedPlan._meta.id, payload).subscribe({
      next: (res) => {
        setIsSaving(false);
        if (res.success) {
          toaster.create({ title: "Plan Updated", type: "success" });
          setIsOpen(false);
          refetch();
        } else {
          toaster.create({ title: "Update Failed", description: (res as any).message, type: "error" });
        }
      },
      error: (err) => {
        setIsSaving(false);
        toaster.create({ title: "Network Error", description: err?.message, type: "error" });
      },
    });
  }, [selectedPlan, refetch]);

  const handleDrawerOpenChange = useCallback((e: { open: boolean }) => setIsOpen(e.open), []);

  const handleFilterClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const filter = event.currentTarget.getAttribute("data-filter") as PlanFilter;
    if (filter) {
      setActiveFilter(filter);
    }
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    setNavActionConfig([
      {
        id: "refresh",
        icon: RefreshCw,
        bg: "gradient_cyan_purple",
        color: "white",
        ariaLabel: "Refresh plans",
        onClick: refetch,
        loading: isLoading,
        flexShrink: 0,
      },
      {
        id: "enroll",
        label: "New Plan",
        icon: Plus,
        bg: "gradient_purple",
        color: "white",
        onClick: handleAddClick,
      },
    ]);
    return () => clearActions();
  }, [setNavActionConfig, clearActions, refetch, isLoading, handleAddClick]);

  return (
    <>
      <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
        <VStack align="stretch" gap={6} pb={8}>
          {/* ── Hero Stats ──────────────────────────────── */}
          <Box
            p={{ base: 6, lg: 8 }}
            borderRadius="3xl"
            bg={"app.card.bg"}
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            position="relative"

          >
            {/* Background design elements */}
            <Box
              position="absolute"
              top="-20%"
              right="-10%"
              w="400px"
              h="400px"
              borderRadius="full"
              bgGradient="radial"
              gradientFrom="blue.500/0.05"
              gradientTo="transparent"
              pointerEvents="none"
            />
            <Grid templateColumns={{ base: "1fr", xl: "1.2fr 1.8fr" }} gap={8} alignItems="center">
              <VStack align="start" gap={4}>
                <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3} py={1} fontWeight="900" fontSize="2xs" letterSpacing="wider">
                  Plan Management
                </Badge>
                <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color="app.text.primary" fontWeight="950" lineHeight="1.1">
                  Configure your membership tiers.
                </Heading>
                <Text color={muted} fontSize="sm" maxW="500px" fontWeight="600" lineHeight="relaxed">
                  Create and manage pricing models, billing cycles, and plan features for your gym memberships.
                </Text>
              </VStack>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={4} w="full">
                <StatTile label="Total Plans" value={metrics.total} caption="All configured" icon={CreditCard} accent="blue.500" />
                <StatTile label="Active" value={metrics.active} caption="Accepting signups" icon={Activity} accent="green.500" />
                <StatTile label="Inactive" value={metrics.inactive} caption="Paused plans" icon={Timer} accent="orange.500" />
                <StatTile label="Plan Revenue" value={fmtCurrency(metrics.totalRevenue)} caption="Active plan total" icon={TrendingUp} accent="purple.500" />
              </SimpleGrid>
            </Grid>
          </Box>

          {/* ── Filter + Grid ──────────────────────────── */}
          <VStack align="stretch" gap={5}>
            <Flex
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
              direction={{ base: "column", md: "row" }}
              gap={4}
              p={4}
              borderRadius="2xl"
              bg={"app.card.bg"}
              border="1px solid"
              borderColor={borderColor}
              backdropFilter="blur(10px)"
            >
              <HStack gap={3} flex="1">
                <Circle size="9" bg="blue.500/10" color="blue.500">
                  <Filter size={16} />
                </Circle>
                <VStack align="start" gap={0} flex="1">
                  <Text fontWeight="900" color="app.text.primary" fontSize="sm">Membership Tiers</Text>
                  <Text fontSize="2xs" color={muted} fontWeight="700">Showing {filteredPlans.length} plans</Text>
                </VStack>
                {/* Search Input */}
                <Box maxW={{ base: "full", md: "280px" }} w="full" position="relative">
                  <Input
                    placeholder="Search name or code..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    size="sm"
                    borderRadius="xl"
                    pl={8}
                    bg={useColorModeValue("white", "gray.950")}
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.500" }}
                  />
                  <Box position="absolute" left={2.5} top="50%" transform="translateY(-50%)" color={muted} pointerEvents="none">
                    <Search size={14} />
                  </Box>
                </Box>
              </HStack>
              <HStack gap={1.5} flexWrap="wrap" justify={{ base: "start", md: "end" }}>
                {(["all", "active", "inactive"] as PlanFilter[]).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={activeFilter === f ? "solid" : "ghost"}
                    colorPalette={activeFilter === f ? "blue" : "gray"}
                    borderRadius="xl"
                    px={4}
                    fontWeight="800"
                    data-filter={f}
                    onClick={handleFilterClick}
                    textTransform="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </HStack>
            </Flex>

            {isLoading ? (
              <Center h="300px">
                <VStack gap={4}>
                  <Spinner size="xl" color="blue.500" />
                  <Text color={muted} fontWeight="600">Syncing plan data...</Text>
                </VStack>
              </Center>
            ) : filteredPlans.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={20}
                gap={4}
                borderRadius="2xl"
                bg={panelBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Circle size="16" bg="blue.500/10" color="blue.500">
                  <CreditCard size={30} />
                </Circle>
                <VStack gap={1}>
                  <Heading size="sm" fontWeight="900">No plans found</Heading>
                  <Text fontSize="sm" color={muted} fontWeight="600">Create your first plan or adjust filters.</Text>
                </VStack>
                <Button colorPalette="blue" borderRadius="xl" fontWeight="900" mt={2} onClick={handleAddClick}>
                  <HStack gap={1}>
                    <Plus size={16} />
                    <Text>Create Plan</Text>
                  </HStack>
                </Button>
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
                {filteredPlans.map((plan) => (
                  <PlanCard
                    key={plan._id}
                    plan={plan}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                  />
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* ── Edit Drawer ──────────────────────────────── */}
      <DrawerRoot open={isOpen} onOpenChange={handleDrawerOpenChange} size="md">
        <DrawerBackdrop backdropFilter="blur(8px)" bg="black/40" />
        <DrawerContent
          bg={useColorModeValue("white", "gray.900")}
          borderLeft="1px solid"
          borderColor={borderColor}
          boxShadow="-10px 0 30px rgba(0,0,0,0.15)"
        >
          <DrawerCloseTrigger top={4} right={4} />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} p={6}>
            <VStack align="start" gap={1}>
              <Badge colorPalette="blue" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="3xs" fontWeight="950" letterSpacing="widest" textTransform="uppercase">
                Configuration
              </Badge>
              <Heading size="xl" fontWeight="900" letterSpacing="tight">Edit Plan Details</Heading>
            </VStack>
          </DrawerHeader>

          <DrawerBody p={6}>
            <form id="gym-plan-form" onSubmit={handleSave}>
              <VStack gap={6} align="stretch">
                {/* Section 1: Identification */}
                <VStack align="stretch" gap={4}>
                  <HStack gap={2}>
                    <Circle size="6" bg="blue.500/10" color="blue.500">
                      <Timer size={12} />
                    </Circle>
                    <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="app.text.primary">
                      Identity & Code
                    </Text>
                  </HStack>
                  <SimpleGrid columns={2} gap={4}>
                    <Field label="Plan Code" helperText="Internal tracking code">
                      <Input name="code" defaultValue={selectedPlan?.data.code} borderRadius="xl" h="44px" fontSize="sm" />
                    </Field>
                    <Field label="Display Name" helperText="Customer-facing name">
                      <Input name="name" defaultValue={selectedPlan?.data.name} borderRadius="xl" h="44px" fontSize="sm" />
                    </Field>
                  </SimpleGrid>
                  <Field label="Description">
                    <Textarea name="description" defaultValue={selectedPlan?.data.description} borderRadius="xl" rows={3} fontSize="sm" />
                  </Field>
                </VStack>

                <Separator opacity={0.1} />

                {/* Section 2: Pricing */}
                <VStack align="stretch" gap={4}>
                  <HStack gap={2}>
                    <Circle size="6" bg="green.500/10" color="green.500">
                      <Coins size={12} />
                    </Circle>
                    <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="app.text.primary">
                      Pricing & Billing
                    </Text>
                  </HStack>
                  <SimpleGrid columns={2} gap={4}>
                    <Field label="Base Price">
                      <Input name="price" type="number" defaultValue={selectedPlan?.data.price} borderRadius="xl" h="44px" fontSize="sm" />
                    </Field>
                    <Field label="Billing Cycle">
                      <NativeSelectRoot>
                        <NativeSelectField
                          name="billing_cycle"
                          defaultValue={selectedPlan?.data.billing_cycle ?? "monthly"}
                          borderRadius="xl"
                          h="44px"
                          fontSize="sm"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </Field>
                  </SimpleGrid>
                </VStack>

                <Separator opacity={0.1} />

                {/* Section 3: Status */}
                <Flex justify="space-between" align="center" p={3} borderRadius="xl" bg={useColorModeValue("gray.50", "gray.850")} border="1px solid" borderColor={borderColor}>
                  <Box>
                    <Text fontWeight="800" fontSize="sm">Active Status</Text>
                    <Text fontSize="xs" color={muted} fontWeight="600">Available for new signups?</Text>
                  </Box>
                  <Switch name="is_active" defaultChecked={selectedPlan?.data.is_active ?? true} colorPalette="blue" size="md" />
                </Flex>
              </VStack>
            </form>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" borderColor={borderColor} p={6}>
            <Button
              type="submit"
              form="gym-plan-form"
              w="full"
              colorPalette="blue"
              size="lg"
              h="48px"
              borderRadius="xl"
              fontWeight="900"
              disabled={isSaving}
            >
              {isSaving ? (
                <HStack gap={2} justify="center">
                  <Spinner size="sm" />
                  <Text>Saving...</Text>
                </HStack>
              ) : (
                <HStack gap={1} justify="center">
                  <Text>Save Plan Changes</Text>
                  <Icon as={ArrowRight} boxSize={4} />
                </HStack>
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
});

Subscriptions.displayName = "Subscriptions";
export default Subscriptions;
