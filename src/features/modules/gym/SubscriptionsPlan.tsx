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
  Grid, GridItem,
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
  Activity, Timer, Coins, CreditCard, Filter, Users, TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/core/components/PageHeader";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { GymApiService } from "./services/gymApi.service";
import type { SubscriptionPlanDocument } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";

// ─── Helpers ────────────────────────────────────────────────────────

const fmtCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

type PlanFilter = "all" | "active" | "inactive";

// ─── Plan Card ──────────────────────────────────────────────────────

const PlanCard = memo(({
  plan, onEdit, onDelete,
}: {
  plan: SubscriptionPlanDocument;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const accent = plan.data.accent_color || "blue";
  const currency = plan.data.currency || "INR";
  const cardBg = useColorModeValue("rgba(255,255,255,0.86)", "rgba(15,23,42,0.7)");
  const cardBorder = useColorModeValue("rgba(226,232,240,0.78)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      role="group" p={6} borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={cardBorder}
      boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}
      backdropFilter="blur(18px) saturate(150%)"
      position="relative" overflow="hidden" transition="all 0.24s cubic-bezier(0.4,0,0.2,1)"
      _before={{
        content: '""', position: "absolute", top: 0, left: 0, right: 0, h: "3px",
        bg: plan.data.is_active ? `${accent}.400` : "gray.400",
      }}
      _hover={{
        transform: "translateY(-5px)", borderColor: `${accent}.400`,
        boxShadow: useColorModeValue("0 12px 24px rgba(0,0,0,0.08)", "0 8px 24px rgba(0,0,0,0.2)"),
      }}
    >
      <VStack align="stretch" gap={5} h="full">
        {/* Header */}
        <Flex justify="space-between" align="start">
          <Badge variant="subtle" colorPalette={plan.data.is_active ? accent : "gray"}
            px={3} py={1} borderRadius="full" fontWeight="900" fontSize="xs">
            {plan.data.is_active ? "Live" : "Inactive"}
          </Badge>
          <HStack gap={1} opacity={0.6} _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
            <IconButton aria-label="Edit" variant="ghost" size="sm" onClick={onEdit}
              _hover={{ bg: "blue.500/10", color: "blue.500" }}>
              <Pencil size={15} />
            </IconButton>
            <IconButton aria-label="Delete" variant="ghost" size="sm" colorPalette="red" onClick={onDelete}>
              <Trash2 size={15} />
            </IconButton>
          </HStack>
        </Flex>

        {/* Name + Code */}
        <VStack align="start" gap={0.5}>
          <Heading size="lg" fontWeight="900" letterSpacing="tight" color="app.text.primary">
            {plan.data.name}
          </Heading>
          <Text fontSize="xs" color={`${accent}.500`} fontWeight="800" fontFamily="mono" textTransform="uppercase">
            {plan.data.code}
          </Text>
        </VStack>

        {/* Price */}
        <HStack align="baseline" gap={1}>
          <Text fontSize="3xl" fontWeight="900" color="app.text.primary">
            {fmtCurrency(plan.data.price, currency)}
          </Text>
          <Text fontSize="sm" color={muted} fontWeight="600">/ {plan.data.billing_cycle}</Text>
        </HStack>

        {/* Description */}
        {plan.data.description && (
          <Text fontSize="sm" color={muted} lineHeight="tall" minH="40px">
            {plan.data.description}
          </Text>
        )}

        <Separator opacity={0.2} />

        {/* Features */}
        <VStack align="stretch" gap={2.5} flex="1">
          <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color={muted}>
            Features
          </Text>
          {plan.data.features.length > 0 ? plan.data.features.map((f) => (
            <HStack key={f} gap={2.5}>
              <Circle size="5" bg={`${accent}.500/12`} color={`${accent}.500`}>
                <Check size={10} />
              </Circle>
              <Text fontSize="sm" fontWeight="700">{f}</Text>
            </HStack>
          )) : (
            <Text fontSize="sm" color={muted} fontWeight="600" fontStyle="italic">No features listed</Text>
          )}
        </VStack>

        {/* Actions */}
        <Button variant="outline" w="full" borderRadius="xl" fontWeight="900" h="44px"
          borderColor={`${accent}.500/30`} color={`${accent}.500`}
          _hover={{ bg: `${accent}.500/10` }} onClick={onEdit}>
          Modify Plan <ArrowRight size={16} style={{ marginLeft: "6px" }} />
        </Button>
      </VStack>
    </Box>
  );
});
PlanCard.displayName = "PlanCard";

// ─── Main Component ─────────────────────────────────────────────────

const Subscriptions = memo(() => {
  const { plans, loading: isLoading, refetch } = useSubscriptionPlans();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDocument | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PlanFilter>("all");

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
    if (activeFilter === "all") return plans;
    return plans.filter((p) => activeFilter === "active" ? p.data.is_active : !p.data.is_active);
  }, [plans, activeFilter]);

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
        if (res.success) { toaster.create({ title: "Plan Removed", type: "success" }); refetch(); }
        else { toaster.create({ title: "Failed", description: (res as any).message, type: "error" }); }
      },
      error: (err) => { toaster.create({ title: "Network Error", description: err?.message, type: "error" }); },
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
        if (res.success) { toaster.create({ title: "Plan Updated", type: "success" }); setIsOpen(false); refetch(); }
        else { toaster.create({ title: "Update Failed", description: (res as any).message, type: "error" }); }
      },
      error: (err) => { setIsSaving(false); toaster.create({ title: "Network Error", description: err?.message, type: "error" }); },
    });
  }, [selectedPlan, refetch]);

  const handleDrawerOpenChange = useCallback((e: { open: boolean }) => setIsOpen(e.open), []);

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

  // ── Stable handlers for cards ──
  const createEditHandler = useCallback((plan: SubscriptionPlanDocument) => () => handleEditClick(plan), [handleEditClick]);
  const createDeleteHandler = useCallback((plan: SubscriptionPlanDocument) => () => handleDelete(plan), [handleDelete]);

  // ── Stat Tile ──
  const StatTile = useMemo(() => {
    const Tile = memo(({ label, value, caption, icon, accent }: {
      label: string; value: string | number; caption: string; icon: React.ElementType; accent: string;
    }) => (
      <Box p={{ base: 4, md: 5 }} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}
        backdropFilter="blur(18px) saturate(160%)" boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}>
        <HStack justify="space-between" align="start" gap={4}>
          <VStack align="start" gap={1}>
            <Text fontSize="xs" color={muted} fontWeight="800" textTransform="uppercase">{label}</Text>
            <Heading size="xl" color="app.text.primary" letterSpacing="tight">{value}</Heading>
            <Text fontSize="xs" color={muted} fontWeight="600">{caption}</Text>
          </VStack>
          <Circle size="11" bg={`${accent}/12`} color={accent}><Icon as={icon} boxSize={5} /></Circle>
        </HStack>
      </Box>
    ));
    Tile.displayName = "StatTile";
    return Tile;
  }, [panelBg, borderColor, muted]);

  return (
    <>
      <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
        <PageHeader
          title="Subscription Plans"
          subtitle={`${metrics.total} plans configured — ${metrics.active} active`}
          icon={CreditCard}
          badge="Plan Management"
          accentColor="blue"
        />

        <VStack align="stretch" gap={6} pb={8}>
          {/* ── Hero Stats ──────────────────────────────── */}
          <Box p={{ base: 5, lg: 7 }} borderRadius="2xl" bg={heroBg} border="1px solid"
            borderColor={borderColor} overflow="hidden" position="relative"
            boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}>
            <Grid templateColumns={{ base: "1fr", xl: "1.1fr 1.6fr" }} gap={6} alignItems="stretch">
              <VStack align="start" gap={3}>
                <VStack align="start" gap={3}>
                  <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3} py={1} fontWeight="900">
                    Plan Management
                  </Badge>
                  <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color="app.text.primary">
                    Configure your membership tiers.
                  </Heading>
                  <Text color={muted} fontSize="sm" maxW="560px" fontWeight="600">
                    Create and manage pricing models, billing cycles, and plan features for your gym memberships.
                  </Text>
                </VStack>
              </VStack>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
                <StatTile label="Total Plans" value={metrics.total} caption="All configured" icon={CreditCard} accent="blue.500" />
                <StatTile label="Active" value={metrics.active} caption="Accepting signups" icon={Activity} accent="green.500" />
                <StatTile label="Inactive" value={metrics.inactive} caption="Paused plans" icon={Timer} accent="orange.500" />
                <StatTile label="Plan Revenue" value={fmtCurrency(metrics.totalRevenue)} caption="Active plan total" icon={TrendingUp} accent="purple.500" />
              </SimpleGrid>
            </Grid>
          </Box>

          {/* ── Filter + Grid ──────────────────────────── */}
          <VStack align="stretch" gap={5}>
            <Flex align={{ base: "start", md: "center" }} justify="space-between"
              direction={{ base: "column", md: "row" }} gap={4} p={4} borderRadius="2xl"
              bg={panelBg} border="1px solid" borderColor={borderColor}>
              <HStack gap={2}>
                <Circle size="9" bg="blue.500/10" color="blue.500"><Filter size={16} /></Circle>
                <VStack align="start" gap={0}>
                  <Text fontWeight="900" color="app.text.primary">Plans</Text>
                  <Text fontSize="xs" color={muted} fontWeight="700">Showing {filteredPlans.length} plans</Text>
                </VStack>
              </HStack>
              <HStack gap={2} flexWrap="wrap">
                {(["all", "active", "inactive"] as PlanFilter[]).map((f) => (
                  <Button key={f} size="sm" variant={activeFilter === f ? "solid" : "ghost"}
                    colorPalette={activeFilter === f ? "blue" : "gray"} borderRadius="xl" px={4}
                    fontWeight="800" onClick={() => setActiveFilter(f)} textTransform="capitalize">
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
              <Flex direction="column" align="center" justify="center" py={20} gap={4}
                borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <Circle size="16" bg="blue.500/10" color="blue.500"><CreditCard size={30} /></Circle>
                <VStack gap={1}>
                  <Heading size="sm" fontWeight="900">No plans found</Heading>
                  <Text fontSize="sm" color={muted} fontWeight="600">Create your first plan or adjust filters.</Text>
                </VStack>
                <Button colorPalette="blue" borderRadius="xl" fontWeight="900" mt={2} onClick={handleAddClick}>
                  <Plus size={16} style={{ marginRight: "6px" }} /> Create Plan
                </Button>
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan._id} plan={plan}
                    onEdit={createEditHandler(plan)} onDelete={createDeleteHandler(plan)} />
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* ── Edit Drawer ──────────────────────────────── */}
      <DrawerRoot open={isOpen} onOpenChange={handleDrawerOpenChange} size="md">
        <DrawerBackdrop backdropFilter="blur(8px)" bg="black/40" />
        <DrawerContent bg={useColorModeValue("white", "gray.900")} borderLeft="1px solid" borderColor={borderColor}>
          <DrawerCloseTrigger top={4} right={4} />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} p={8}>
            <VStack align="start" gap={1}>
              <Text fontSize="xs" fontWeight="900" color="blue.500" letterSpacing="widest" textTransform="uppercase">
                Configuration
              </Text>
              <Heading size="xl" fontWeight="900">Edit Plan Details</Heading>
            </VStack>
          </DrawerHeader>

          <DrawerBody p={8}>
            <form id="gym-plan-form" onSubmit={handleSave}>
              <VStack gap={8} align="stretch">
                <VStack align="stretch" gap={4}>
                  <HStack gap={2} mb={2}>
                    <Timer color="blue" />
                    <Text fontSize="sm" fontWeight="bold">Identity & Identification</Text>
                  </HStack>
                  <SimpleGrid columns={2} gap={4}>
                    <Field label="Plan Code" helperText="Internal tracking">
                      <Input name="code" defaultValue={selectedPlan?.data.code} borderRadius="xl" h="48px" />
                    </Field>
                    <Field label="Display Name" helperText="What members see">
                      <Input name="name" defaultValue={selectedPlan?.data.name} borderRadius="xl" h="48px" />
                    </Field>
                  </SimpleGrid>
                  <Field label="Description">
                    <Textarea name="description" defaultValue={selectedPlan?.data.description} borderRadius="xl" rows={3} />
                  </Field>
                </VStack>

                <Separator opacity={0.1} />

                <VStack align="stretch" gap={4}>
                  <HStack gap={2} mb={2}>
                    <Coins color="blue" />
                    <Text fontSize="sm" fontWeight="bold">Pricing Model</Text>
                  </HStack>
                  <SimpleGrid columns={2} gap={4}>
                    <Field label="Base Price">
                      <Input name="price" type="number" defaultValue={selectedPlan?.data.price} borderRadius="xl" h="48px" />
                    </Field>
                    <Field label="Billing Cycle">
                      <NativeSelectRoot>
                        <NativeSelectField name="billing_cycle" defaultValue={selectedPlan?.data.billing_cycle ?? "monthly"}
                          borderRadius="xl" h="48px">
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </Field>
                  </SimpleGrid>
                </VStack>

                <Separator opacity={0.1} />

                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="800" fontSize="sm">Active Status</Text>
                    <Text fontSize="xs" color={muted}>Available for new signups?</Text>
                  </Box>
                  <Switch name="is_active" defaultChecked={selectedPlan?.data.is_active ?? true}
                    colorPalette="blue" size="lg" />
                </Flex>
              </VStack>
            </form>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" borderColor={borderColor} p={8}>
            <Button type="submit" form="gym-plan-form" w="full" colorPalette="blue" size="xl"
              h="56px" borderRadius="2xl" fontWeight="900" disabled={isSaving}>
              {isSaving ? (
                <HStack gap={2}><Spinner size="sm" /><Text>Saving...</Text></HStack>
              ) : (
                <>Save Plan Changes <ArrowRight style={{ marginLeft: "8px" }} /></>
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
