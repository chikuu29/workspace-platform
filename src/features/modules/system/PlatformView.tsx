import { memo, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { RootState } from "@/app/store";
import { PageLayout } from "@/core/components/PageLayout";
import {
  ShieldCheck,
  Users,
  Building2,
  KeyRound,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  CreditCard,
  Database,
  Settings,
} from "lucide-react";

import { NavigationAction } from "@/core/action-engine/types";
import { useModalStore } from "@/core/store/useModalStore";
import { ActionEngine } from "@/core/action-engine/ActionEngine";
import UIPermissionGuard from "@/core/guards/UIPermissionGuard";
import { useAuthorization } from "@/core/hooks/useAuthorization";

// ─── Module definitions ───────────────────────────────────────────────────────

interface AdminModule {
  id: number;
  name: string;
  description: string;
  action: NavigationAction;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  category: string;
  permissions?: string[];
}

// Stable constant — no re-creation per render
const ADMIN_MODULES: AdminModule[] = [
  {
    id: 1,
    name: "OAuth Applications",
    description: "Manage client credentials and authorization flows",
    action: { type: "route", path: "app/system/ApplicationClients" } as NavigationAction,
    icon: KeyRound,
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    accentColor: "purple",
    category: "Access & Security",
    permissions: ["SYSTEM.ADMINISTRATOR.*"],
  },
  {
    id: 2,
    name: "Organizations",
    description: "Create and configure multi-organization workspaces",
    action: { type: "route", path: "app/system/Organizations" } as NavigationAction,
    icon: Building2,
    gradient: "linear-gradient(135deg,#3b82f6,#6366f1)",
    accentColor: "blue",
    category: "Platform Settings",
    permissions: ["SYSTEM.ADMINISTRATOR.*"],
  },
  {
    id: 3,
    name: "Auth Users",
    description: "Manage user accounts, roles and access",
    action: { type: "route", path: "app/system/AuthUsers" } as NavigationAction,
    icon: Users,
    gradient: "linear-gradient(135deg,#10b981,#3b82f6)",
    accentColor: "green",
    category: "Access & Security",
  },
  {
    id: 4,
    name: "Access Control",
    description: "Configure permissions and policy rules",
    action: { type: "route", path: "app/system/accesscontrol" } as NavigationAction,
    icon: ShieldCheck,
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
    accentColor: "orange",
    category: "Access & Security",
  },
  {
    id: 5,
    name: "SaaS Applications",
    description: "Define and manage platform applications and pricing",
    action: { type: "route", path: "app/system/SaasApps" } as NavigationAction,
    icon: LayoutGrid,
    gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
    accentColor: "cyan",
    category: "Products & Billing",
    permissions: ["SYSTEM.ADMINISTRATOR.*"],
  },
  {
    id: 6,
    name: "Features",
    description: "Manage feature flags and addon capabilities",
    action: { type: "route", path: "app/system/Features" } as NavigationAction,
    icon: Sparkles,
    gradient: "linear-gradient(135deg,#a855f7,#ec4899)",
    accentColor: "pink",
    category: "Products & Billing",
    permissions: ["SYSTEM.ADMINISTRATOR.*"],
  },
  {
    id: 7,
    name: "Subscription Plans",
    description: "Create and version subscription plans with limits",
    action: { type: "route", path: "app/system/SubscriptionPlans" } as NavigationAction,
    icon: CreditCard,
    gradient: "linear-gradient(135deg,#14b8a6,#22c55e)",
    accentColor: "teal",
    category: "Products & Billing",
    permissions: ["SYSTEM.ADMINISTRATOR.*"],
  },
  {
    id: 8,
    name: "Database Statistics",
    description: "Monitor database health, tables and connections",
    action: { type: "route", path: "app/system/DatabaseStatistics" } as NavigationAction,
    icon: Database,
    gradient: "linear-gradient(135deg,#64748b,#475569)",
    accentColor: "gray",
    category: "Platform Settings",
    permissions: ["SYSTEM.ADMINISTRATOR.*"],
  },
  {
    id: 9,
    name: "Global Permissions",
    description: "Definition registry for system and feature access codes",
    action: { type: "route", path: "app/system/Permissions" } as NavigationAction,
    icon: ShieldCheck,
    gradient: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    accentColor: "purple",
    category: "Access & Security",
    permissions: ["SYSTEM.ADMINISTRATOR.*"],
  },
  {
    id: 10,
    name: "Policy Management",
    description: "Configure IAM-style access policies with Allow and Deny rules",
    action: { type: "route", path: "app/system/PolicyManagement" } as NavigationAction,
    icon: ShieldCheck,
    gradient: "linear-gradient(135deg,#06b6d4,#6366f1)",
    accentColor: "cyan",
    category: "Access & Security",
  },
  // ── Organization Admin Modules ──────────────────────────────────────────
  {
    id: 101,
    name: "Team Management",
    description: "Manage your team members and their assigned roles",
    action: { type: "route", path: "app/system/OrganizationUsers" } as NavigationAction,
    icon: Users,
    gradient: "linear-gradient(135deg,#10b981,#3b82f6)",
    accentColor: "green",
    category: "Workspace Organization",
  },
  {
    id: 102,
    name: "Roles Management",
    description: "Configure custom roles and assign policies",
    action: { type: "route", path: "app/system/OrganizationRoles" } as NavigationAction,
    icon: ShieldCheck,
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
    accentColor: "orange",
    category: "Workspace Organization",
  },
  {
    id: 103,
    name: "Organization Access",
    description: "Premium multi-role management and user security control",
    action: { type: "route", path: "app/system/OrganizationAccess" } as NavigationAction,
    icon: Users,
    gradient: "linear-gradient(135deg,#6366f1,#a855f7)",
    accentColor: "purple",
    category: "Workspace Organization",
  },
];

// ─── AdminModuleCard ──────────────────────────────────────────────────────────

interface AdminModuleCardProps {
  module: AdminModule;
  onNavigate: (action: NavigationAction) => void;
}

/**
 * AdminModuleCard — mirrors the UserCard glass design language:
 * - 4px gradient accent strip at top
 * - Glassmorphic `app.navbar.bg` surface with `app.card.border`
 * - `app.shadow.glass-glow` + translate-Y hover lift
 * - Semantic tokens throughout — adapts to dark/light automatically
 */
const AdminModuleCard = memo(({ module, onNavigate }: AdminModuleCardProps) => {
  const handleClick = useCallback(() => {
    onNavigate(module.action);
  }, [module.action, onNavigate]);
  console.log("module", module);

  return (
    <Box
      borderRadius="2xl"
      border="1px solid"
      borderColor="app.card.border"
      bg="app.navbar.bg"
      backdropFilter="blur(16px)"
      boxShadow="app.shadow.glass-glow"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.22s ease"
      onClick={handleClick}
      role="button"
      aria-label={`Open ${module.name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "0 20px 48px -8px rgba(99,102,241,0.22)",
        borderColor: "rgba(99,102,241,0.4)",
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "app.text.accent",
        outlineOffset: "2px",
      }}
    >
      {/* ── Gradient accent strip — matches UserCard ───────────────── */}
      <Box h="4px" bgGradient={module.gradient} />

      <VStack gap={0} align="stretch" p={5}>
        {/* ── Icon + arrow row ────────────────────────────────────── */}
        <Flex justify="space-between" align="flex-start" mb={4}>
          {/* Icon badge */}
          <Box
            w="44px"
            h="44px"
            borderRadius="xl"
            bgGradient={module.gradient}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow={`0 6px 16px -4px rgba(99,102,241,0.4)`}
            flexShrink={0}
            position="relative"
            overflow="hidden"
          >
            {/* Inner highlight */}
            <Box
              position="absolute"
              top="2px"
              left="4px"
              right="4px"
              h="10px"
              borderRadius="full"
              bg="rgba(255,255,255,0.22)"
            />
            <Icon as={module.icon} boxSize={5} color="white" zIndex={1} />
          </Box>

          {/* Chevron hint — indicates navigability */}
          <Box
            color="app.text.muted"
            opacity={0.4}
            mt={1}
            transition="all 0.2s"
            _groupHover={{ opacity: 1, transform: "translateX(3px)" }}
          >
            <ChevronRight size={16} />
          </Box>
        </Flex>

        {/* ── Name ─────────────────────────────────────────────────── */}
        <Text
          fontSize="sm"
          fontWeight="700"
          color="app.text.primary"
          letterSpacing="-0.2px"
          lineHeight="1.2"
          mb={1}
        >
          {module.name}
        </Text>

        {/* ── Description ──────────────────────────────────────────── */}
        <Text
          fontSize="xs"
          color="app.text.muted"
          lineHeight="1.5"
          lineClamp={2}
        >
          {module.description}
        </Text>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <Box borderTop="1px solid" borderColor="app.divider" mt={4} pt={3}>
          <Text
            fontSize="2xs"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.08em"
            color="app.text.accent"
            opacity={0.8}
          >
            Open Module →
          </Text>
        </Box>
      </VStack>
    </Box>
  );
});

AdminModuleCard.displayName = "AdminModuleCard";

// ─── AdminView ────────────────────────────────────────────────────────────────

/**
 * PlatformView — dashboard overview of all platform modules.
 * Renders a responsive card grid matching the UserCard design language.
 */
export default memo(function PlatformView() {
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const organizations = useSelector((state: RootState) => state.organizations);
  const rbac = useSelector((state: RootState) => state.rbac);

  // Group modules by category (using master list)
  const categorizedModules = useMemo(() => {
    const groups: Record<string, AdminModule[]> = {};
    ADMIN_MODULES.forEach((module) => {
      const cat = module.category || "Other";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(module);
    });
    return groups;
  }, []);

  const organizationName = organizations?.organization?.name ?? "admin";
  const openModal = useModalStore((s) => s.openModal);

  // Context required by ActionEngine
  const actionContext = useMemo(
    () => ({
      navigate,
      openModal,
      organizationName,
      menuConfig: {},
    }),
    [navigate, openModal, organizationName]
  );

  // Execute standard NavigationActions
  const handleNavigate = useCallback(
    (action: NavigationAction) => {
      if (!auth?.isAuthenticated) return;
      ActionEngine.execute(action, actionContext);
    },
    [auth?.isAuthenticated, actionContext]
  );

  return (
    <PageLayout
      title="Admin Console"
      subtitle="Select a module to manage your platform settings"
      icon={Settings}
    >

      {/* ── Module grid by category ──────────────────────────────────────────────── */}
      <VStack align="stretch" gap={10} w="full">
        {Object.entries(categorizedModules).map(([category, modules]) => (
          <CategorySection
            key={category}
            category={category}
            modules={modules}
            onNavigate={handleNavigate}
          />
        ))}
      </VStack>
    </PageLayout>
  );
});

// ─── CategorySection ──────────────────────────────────────────────────────────

interface CategorySectionProps {
  category: string;
  modules: AdminModule[];
  onNavigate: (action: NavigationAction) => void;
}

/**
 * Renders a category group if at least one module inside it is authorized.
 * Uses the existing useAuthorization hook to track overall visibility.
 */
const CategorySection = memo(({ category, modules, onNavigate }: CategorySectionProps) => {
  // Aggregate all permissions in this category
  // If ANY module matches, the category is visible
  const allCategoryPermissions = useMemo(() => {
    // If ANY module in the category has NO permissions, it's a public module
    // and the category should always show.
    const hasPublicModule = modules.some(m => !m.permissions || m.permissions.length === 0);
    if (hasPublicModule) return []; // Returning [] makes useAuthorization return true

    return modules.flatMap(m => m.permissions || []);
  }, [modules]);

  const isVisible = useAuthorization(allCategoryPermissions, false);

  if (!isVisible) return null;

  return (
    <Box>
      <HStack mb={5} gap={4} align="center">
        <Box
          px={3}
          py={1}
          borderRadius="full"
          bg="app.card.bg"
          border="1px solid"
          borderColor="app.card.border"
          boxShadow="sm"
        >
          <Text
            fontSize="xs"
            fontWeight="800"
            textTransform="uppercase"
            letterSpacing="wider"
            color="app.text.primary"
          >
            {category}
          </Text>
        </Box>
        <Box flex={1} h="1px" bg="app.divider" opacity={0.6} />
      </HStack>

      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={4}
      >
        {modules.map((module) => (
          <UIPermissionGuard
            key={module.id}
            permissions={module.permissions || []}
            behavior="hide"
          >
            <GridItem>
              <AdminModuleCard module={module} onNavigate={onNavigate} />
            </GridItem>
          </UIPermissionGuard>
        ))}
      </Grid>
    </Box>
  );
});

CategorySection.displayName = "CategorySection";
