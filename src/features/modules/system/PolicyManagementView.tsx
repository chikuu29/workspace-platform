/**
 * PolicyManagementView — PBAC Policy Configuration UI
 *
 * Advanced admin interface for creating, viewing, editing, and deleting
 * policies with per-permission ALLOW/DENY selection grouped by application.
 *
 * Design System:
 *  - Follows PlatformView glassmorphic card language
 *  - Full-screen drawer editor for policy creation
 *  - Permissions grouped by app prefix with collapsible sections
 *  - Per-permission ALLOW/DENY toggle (tri-state: none / allow / deny)
 *  - Prominent search with instant filter
 *  - Semantic tokens for dark/light theme adaptation
 *  - Memoized sub-components for render performance
 */

import { memo, useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Badge,
  IconButton,
  Input,
  Textarea,
  Spinner,
  Center,
  Grid,
  Flex,
  Heading,
  GridItem,
} from "@chakra-ui/react";
import {
  DrawerRoot,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerBackdrop,
  DrawerCloseTrigger,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { Field } from "@/components/ui/field";
import UIPermissionGuard from "@/core/guards/UIPermissionGuard";
import {
  LuShieldCheck,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuSearch,
  LuSave,
  LuShieldAlert,
  LuShieldX,
  LuFileText,
  LuLock,
  LuGlobe,
  LuBuilding2,
  LuChevronDown,
  LuChevronRight,
  LuX,
  LuLayoutGrid,
} from "react-icons/lu";
import { GETAPI, POSTAPI, PUTAPI, DELETEAPI } from "@/app/api";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";
import { Subscription } from "rxjs";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GlobalPermission {
  id: string;
  code: string;
  name: string;
  app_id: string;
  app_name?: string;
  description?: string;
  is_active: boolean;
}

interface PolicyStatement {
  id: string;
  effect: "ALLOW" | "DENY";
  description?: string;
  permissions: GlobalPermission[];
}

interface Policy {
  id: string;
  name: string;
  description?: string;
  organization_id?: number | null;
  is_system_policy: boolean;
  is_active: boolean;
  statements: PolicyStatement[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Per-permission effect selection.
 * null = not selected, "ALLOW" = granted, "DENY" = explicitly denied
 */
type PermissionEffect = "ALLOW" | "DENY" | null;

/** Map of permission_id → effect for the policy builder */
type PermissionEffectMap = Record<string, PermissionEffect>;

/** Permissions grouped by app prefix for display */
interface AppGroup {
  appPrefix: string;
  appId: string;
  permissions: GlobalPermission[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const POLICY_GRADIENTS = {
  system: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  organization: "linear-gradient(135deg,#3b82f6,#06b6d4)",
  global: "linear-gradient(135deg,#f59e0b,#ef4444)",
};

const APP_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#3b82f6,#6366f1)",
  "linear-gradient(135deg,#10b981,#3b82f6)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
  "linear-gradient(135deg,#f97316,#f59e0b)",
  "linear-gradient(135deg,#ef4444,#f97316)",
];

const getAppGradient = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return APP_GRADIENTS[Math.abs(h) % APP_GRADIENTS.length];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts the app prefix from a permission code.
 * e.g. "SYSTEM_ADMINISTRATOR.PERMISSION.READ" → "SYSTEM_ADMINISTRATOR"
 *      "MYGYM.MEMBER.ADD" → "MYGYM"
 *      "APP_B2B54E.TEST.READ" → "APP_B2B54E"
 */
const getAppPrefix = (code: string): string => {
  const firstDot = code.indexOf(".");
  return firstDot > 0 ? code.substring(0, firstDot) : code;
};

/**
 * Groups permissions by their app prefix and sorts groups alphabetically.
 */
const groupPermissionsByApp = (perms: GlobalPermission[]): AppGroup[] => {
  const groups: Record<string, AppGroup> = {};

  for (const perm of perms) {
    const prefix = getAppPrefix(perm.code);
    if (!groups[prefix]) {
      groups[prefix] = { appPrefix: prefix, appId: perm.app_id, permissions: [] };
    }
    groups[prefix].permissions.push(perm);
  }

  return Object.values(groups).sort((a, b) => a.appPrefix.localeCompare(b.appPrefix));
};

/**
 * Extracts the resource + action part from a permission code.
 * e.g. "SYSTEM_ADMINISTRATOR.PERMISSION.READ" → "PERMISSION.READ"
 */
const getPermissionShortCode = (code: string): string => {
  const firstDot = code.indexOf(".");
  return firstDot > 0 ? code.substring(firstDot + 1) : code;
};


// ─── PermissionRow ───────────────────────────────────────────────────────────

interface PermissionRowProps {
  permission: GlobalPermission;
  effect: PermissionEffect;
  onEffectChange: (permId: string, effect: PermissionEffect) => void;
}

/**
 * A single permission row with tri-state ALLOW/DENY/None selection.
 * Shows the permission short code and an intuitive toggle bar.
 */
const PermissionRow = memo(({ permission, effect, onEffectChange }: PermissionRowProps) => {
  const handleAllow = useCallback(() => {
    onEffectChange(permission.id, effect === "ALLOW" ? null : "ALLOW");
  }, [permission.id, effect, onEffectChange]);

  const handleDeny = useCallback(() => {
    onEffectChange(permission.id, effect === "DENY" ? null : "DENY");
  }, [permission.id, effect, onEffectChange]);

  const shortCode = useMemo(() => getPermissionShortCode(permission.code), [permission.code]);

  return (
    <Flex
      align="center"
      gap={3}
      px={4}
      py={2.5}
      borderRadius="lg"
      transition="all 0.15s"
      bg={
        effect === "ALLOW"
          ? "green.500/6"
          : effect === "DENY"
            ? "red.500/6"
            : "transparent"
      }
      _hover={{ bg: effect === "ALLOW" ? "green.500/10" : effect === "DENY" ? "red.500/10" : "rgba(255,255,255,0.03)" }}
    >
      {/* ── Permission info ──────────────────────────────────── */}
      <VStack align="start" gap={0} flex={1} overflow="hidden">
        <Text fontSize="sm" fontWeight="600" color="app.text.primary" lineClamp={1}>
          {permission.name}
        </Text>
        <Text fontSize="2xs" color="app.text.muted" lineClamp={1} fontFamily="mono">
          {shortCode}
        </Text>
      </VStack>

      {/* ── ALLOW / DENY toggle buttons ─────────────────────── */}
      <HStack gap={1}>
        <Button
          size="xs"
          borderRadius="lg"
          variant={effect === "ALLOW" ? "solid" : "ghost"}
          colorPalette={effect === "ALLOW" ? "green" : "gray"}
          onClick={handleAllow}
          minW="70px"
          fontWeight="700"
          fontSize="2xs"
          letterSpacing="0.04em"
          _hover={
            effect === "ALLOW"
              ? { bg: "green.600" }
              : { bg: "green.500/10", color: "green.400" }
          }
        >
          <Icon as={LuShieldCheck} boxSize={3} mr={1} />
          ALLOW
        </Button>
        <Button
          size="xs"
          borderRadius="lg"
          variant={effect === "DENY" ? "solid" : "ghost"}
          colorPalette={effect === "DENY" ? "red" : "gray"}
          onClick={handleDeny}
          minW="70px"
          fontWeight="700"
          fontSize="2xs"
          letterSpacing="0.04em"
          _hover={
            effect === "DENY"
              ? { bg: "red.600" }
              : { bg: "red.500/10", color: "red.400" }
          }
        >
          <Icon as={LuShieldX} boxSize={3} mr={1} />
          DENY
        </Button>
      </HStack>
    </Flex>
  );
});

PermissionRow.displayName = "PermissionRow";

// ─── AppGroupSection ─────────────────────────────────────────────────────────

interface AppGroupSectionProps {
  group: AppGroup;
  permEffects: PermissionEffectMap;
  onEffectChange: (permId: string, effect: PermissionEffect) => void;
}

/**
 * Collapsible app group section showing all permissions under an app prefix.
 * Has a summary badge showing counts of ALLOW/DENY selections.
 */
const AppGroupSection = memo(({ group, permEffects, onEffectChange }: AppGroupSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  /* Count selections for this group */
  const { allowCount, denyCount } = useMemo(() => {
    let allow = 0;
    let deny = 0;
    for (const perm of group.permissions) {
      const e = permEffects[perm.id];
      if (e === "ALLOW") allow++;
      else if (e === "DENY") deny++;
    }
    return { allowCount: allow, denyCount: deny };
  }, [group.permissions, permEffects]);

  const gradient = useMemo(() => getAppGradient(group.appPrefix), [group.appPrefix]);

  /* Bulk actions for the entire group */
  const handleAllowAll = useCallback(() => {
    for (const perm of group.permissions) {
      onEffectChange(perm.id, "ALLOW");
    }
  }, [group.permissions, onEffectChange]);

  const handleDenyAll = useCallback(() => {
    for (const perm of group.permissions) {
      onEffectChange(perm.id, "DENY");
    }
  }, [group.permissions, onEffectChange]);

  const handleClearAll = useCallback(() => {
    for (const perm of group.permissions) {
      onEffectChange(perm.id, null);
    }
  }, [group.permissions, onEffectChange]);

  return (
    <Box
      border="1px solid"
      borderColor="app.card.border"
      borderRadius="xl"
      overflow="hidden"
      transition="all 0.2s"
    >
      {/* ── Group Header ─────────────────────────────────────── */}
      <Flex
        px={4}
        py={3}
        bg="app.card.bg"
        cursor="pointer"
        onClick={handleToggle}
        align="center"
        justify="space-between"
        _hover={{ bg: "rgba(255,255,255,0.03)" }}
        transition="all 0.15s"
        userSelect="none"
      >
        <HStack gap={3}>
          <Icon
            as={isExpanded ? LuChevronDown : LuChevronRight}
            boxSize={4}
            color="app.text.muted"
            transition="transform 0.2s"
          />
          <Center
            w="32px"
            h="32px"
            borderRadius="lg"
            bgGradient={gradient}
            flexShrink={0}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="1px"
              left="3px"
              right="3px"
              h="6px"
              borderRadius="full"
              bg="rgba(255,255,255,0.2)"
            />
            <Icon as={LuLayoutGrid} boxSize={3.5} color="white" zIndex={1} />
          </Center>
          <VStack align="start" gap={0}>
            <Text fontSize="sm" fontWeight="700" color="app.text.primary" letterSpacing="-0.2px">
              {group.appPrefix}
            </Text>
            <Text fontSize="2xs" color="app.text.muted">
              {group.permissions.length} permission{group.permissions.length !== 1 ? "s" : ""}
            </Text>
          </VStack>
        </HStack>

        <HStack gap={2}>
          {allowCount > 0 && (
            <Badge
              variant="subtle"
              colorPalette="green"
              borderRadius="full"
              px={2}
              py={0.5}
              fontSize="2xs"
              fontWeight="700"
            >
              {allowCount} Allow
            </Badge>
          )}
          {denyCount > 0 && (
            <Badge
              variant="subtle"
              colorPalette="red"
              borderRadius="full"
              px={2}
              py={0.5}
              fontSize="2xs"
              fontWeight="700"
            >
              {denyCount} Deny
            </Badge>
          )}
        </HStack>
      </Flex>

      {/* ── Expanded Content ──────────────────────────────────── */}
      {isExpanded && (
        <Box
          borderTop="1px solid"
          borderColor="app.card.border"
        >
          {/* Bulk actions bar */}
          <Flex
            px={4}
            py={2}
            bg="rgba(99,102,241,0.03)"
            borderBottom="1px solid"
            borderColor="app.card.border"
            gap={2}
            align="center"
          >
            <Text fontSize="2xs" color="app.text.muted" fontWeight="600" mr={1}>
              Quick:
            </Text>
            <Button
              size="xs"
              variant="ghost"
              borderRadius="lg"
              color="green.400"
              onClick={handleAllowAll}
              _hover={{ bg: "green.500/10" }}
              fontWeight="700"
              fontSize="2xs"
            >
              Allow All
            </Button>
            <Button
              size="xs"
              variant="ghost"
              borderRadius="lg"
              color="red.400"
              onClick={handleDenyAll}
              _hover={{ bg: "red.500/10" }}
              fontWeight="700"
              fontSize="2xs"
            >
              Deny All
            </Button>
            <Button
              size="xs"
              variant="ghost"
              borderRadius="lg"
              color="app.text.muted"
              onClick={handleClearAll}
              _hover={{ bg: "rgba(255,255,255,0.05)" }}
              fontWeight="600"
              fontSize="2xs"
            >
              Clear
            </Button>
          </Flex>

          {/* Permission rows */}
          <VStack gap={0} align="stretch" py={1}>
            {group.permissions.map((perm) => (
              <PermissionRow
                key={perm.id}
                permission={perm}
                effect={permEffects[perm.id] ?? null}
                onEffectChange={onEffectChange}
              />
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
});

AppGroupSection.displayName = "AppGroupSection";


// ─── PolicyCard (memoized) ──────────────────────────────────────────────────

interface PolicyCardProps {
  policy: Policy;
  onEdit: (policy: Policy) => void;
  onDelete: (policyId: string) => void;
}

const PolicyCard = memo(({ policy, onEdit, onDelete }: PolicyCardProps) => {
  const gradient = policy.is_system_policy
    ? POLICY_GRADIENTS.system
    : policy.organization_id
      ? POLICY_GRADIENTS.organization
      : POLICY_GRADIENTS.global;

  const allowCount = useMemo(
    () =>
      policy.statements.filter((s) => s.effect === "ALLOW").reduce((sum, s) => sum + s.permissions.length, 0),
    [policy.statements]
  );

  const denyCount = useMemo(
    () =>
      policy.statements.filter((s) => s.effect === "DENY").reduce((sum, s) => sum + s.permissions.length, 0),
    [policy.statements]
  );

  const handleEdit = useCallback(() => onEdit(policy), [onEdit, policy]);
  const handleDelete = useCallback(() => onDelete(policy.id), [onDelete, policy.id]);

  return (
    <Card p={0} _hover={{ transform: "translateY(-4px)", boxShadow: "0 20px 48px -8px rgba(99,102,241,0.22)" }}>
      {/* Gradient accent strip */}
      <Box h="4px" bgGradient={gradient} />

      <VStack gap={0} align="stretch" p={5}>
        {/* ── Header row ──────────────────────────────────────── */}
        <Flex justify="space-between" align="flex-start" mb={3}>
          <HStack gap={3} flex={1}>
            <Center
              w="40px"
              h="40px"
              borderRadius="xl"
              bgGradient={gradient}
              flexShrink={0}
              boxShadow="0 4px 12px -4px rgba(99,102,241,0.4)"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="2px"
                left="4px"
                right="4px"
                h="8px"
                borderRadius="full"
                bg="rgba(255,255,255,0.22)"
              />
              <Icon
                as={policy.is_system_policy ? LuLock : LuFileText}
                boxSize={4}
                color="white"
                zIndex={1}
              />
            </Center>

            <VStack align="start" gap={0} overflow="hidden">
              <Text
                fontWeight="700"
                fontSize="sm"
                color="app.text.primary"
                letterSpacing="-0.2px"
                lineClamp={1}
              >
                {policy.name}
              </Text>
              <HStack gap={1.5}>
                <Badge
                  size="sm"
                  variant="subtle"
                  borderRadius="full"
                  px={2}
                  colorPalette={policy.is_system_policy ? "purple" : "blue"}
                >
                  <Icon
                    as={policy.is_system_policy ? LuLock : policy.organization_id ? LuBuilding2 : LuGlobe}
                    boxSize={2.5}
                    mr={1}
                  />
                  {policy.is_system_policy ? "System" : policy.organization_id ? "Organization" : "Global"}
                </Badge>
              </HStack>
            </VStack>
          </HStack>

          <Badge
            colorPalette={policy.is_active ? "green" : "red"}
            variant="subtle"
            borderRadius="full"
            px={2.5}
            py={0.5}
            fontSize="2xs"
            fontWeight="700"
          >
            {policy.is_active ? "Active" : "Inactive"}
          </Badge>
        </Flex>

        {/* ── Description ──────────────────────────────────────── */}
        <Text fontSize="xs" color="app.text.muted" lineClamp={2} mb={3} minH="32px">
          {policy.description || "No description provided."}
        </Text>

        {/* ── Statement Summary Badges ─────────────────────────── */}
        <HStack gap={2} mb={4} flexWrap="wrap">
          <HStack
            gap={1.5}
            px={2.5}
            py={1}
            borderRadius="full"
            bg="green.500/8"
            border="1px solid"
            borderColor="green.500/20"
          >
            <Icon as={LuShieldCheck} boxSize={3} color="green.400" />
            <Text fontSize="2xs" fontWeight="700" color="green.400">
              {allowCount} Allow
            </Text>
          </HStack>
          {denyCount > 0 && (
            <HStack
              gap={1.5}
              px={2.5}
              py={1}
              borderRadius="full"
              bg="red.500/8"
              border="1px solid"
              borderColor="red.500/20"
            >
              <Icon as={LuShieldX} boxSize={3} color="red.400" />
              <Text fontSize="2xs" fontWeight="700" color="red.400">
                {denyCount} Deny
              </Text>
            </HStack>
          )}
          <Badge variant="outline" size="sm" borderRadius="full" px={2} borderColor="app.card.border">
            {policy.statements.length} Statement(s)
          </Badge>
        </HStack>

        {/* ── Footer actions ───────────────────────────────────── */}
        <HStack
          justify="space-between"
          align="center"
          pt={3}
          borderTop="1px solid"
          borderColor="app.divider"
          mt="auto"
        >
          <Text
            fontSize="2xs"
            color="app.text.muted"
            fontWeight="500"
          >
            {policy.updated_at
              ? `Updated ${new Date(policy.updated_at).toLocaleDateString()}`
              : ""}
          </Text>

          <HStack gap={2}>
            <UIPermissionGuard permissions={["ACCOUNT.POLICIES.EDIT"]}>
              <Button size="xs" variant="ghost" onClick={handleEdit}>
                <LuPencil /> Edit
              </Button>
            </UIPermissionGuard>
            {!policy.is_system_policy && (
              <UIPermissionGuard permissions={["ACCOUNT.POLICIES.DELETE"]}>
                <Button colorPalette="red" size="xs" variant="ghost" onClick={handleDelete}>
                  <LuTrash2 /> Delete
                </Button>
              </UIPermissionGuard>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Card>
  );
});

PolicyCard.displayName = "PolicyCard";

// ─── PolicyManagementView ───────────────────────────────────────────────────

const PolicyManagementView = memo(() => {
  // ── State ──────────────────────────────────────────────────────────────
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [permissions, setPermissions] = useState<GlobalPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  // Form state
  const [policyName, setPolicyName] = useState("");
  const [policyDescription, setPolicyDescription] = useState("");
  const [policyIsActive, setPolicyIsActive] = useState(true);
  const [isSystemPolicy, setIsSystemPolicy] = useState(false);
  const [permEffects, setPermEffects] = useState<PermissionEffectMap>({});
  const [isSaving, setIsSaving] = useState(false);
  const [permSearchQuery, setPermSearchQuery] = useState("");

  const subscriptionsRef = useRef<Subscription[]>([]);

  // ── Data Fetching ────────────────────────────────────────────────────

  const fetchData = useCallback(() => {
    setIsLoading(true);

    // Cleanup previous subscriptions to prevent memory leaks
    subscriptionsRef.current.forEach((s) => s.unsubscribe());
    subscriptionsRef.current = [];

    const policySub = GETAPI({
      path: "/account/policies",
      isPrivateApi: true,
    }).subscribe((res: any) => {
      if (res.success) {
        setPolicies(res.data || []);
      } else {
        toaster.create({
          title: "Error fetching policies",
          description: res.message,
          type: "error",
        });
      }
      setIsLoading(false);
    });

    const permSub = GETAPI({
      path: "/account/permissions",
      isPrivateApi: true,
    }).subscribe((res: any) => {
      if (res.success) {
        setPermissions(res.data || []);
      }
    });

    subscriptionsRef.current.push(policySub, permSub);
  }, []);

  useEffect(() => {
    fetchData();
    return () => {
      subscriptionsRef.current.forEach((s) => s.unsubscribe());
    };
  }, [fetchData]);

  // ── Form Handlers ────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setPolicyName("");
    setPolicyDescription("");
    setPolicyIsActive(true);
    setIsSystemPolicy(false);
    setPermEffects({});
    setEditingPolicy(null);
    setPermSearchQuery("");
  }, []);

  const handleAddClick = useCallback(() => {
    resetForm();
    setIsDrawerOpen(true);
  }, [resetForm]);

  const handleEditClick = useCallback((policy: Policy) => {
    setEditingPolicy(policy);
    setPolicyName(policy.name);
    setPolicyDescription(policy.description || "");
    setPolicyIsActive(policy.is_active);
    setIsSystemPolicy(policy.is_system_policy);

    // Reconstruct the permEffects map from existing statements
    const effects: PermissionEffectMap = {};
    for (const stmt of policy.statements) {
      for (const perm of stmt.permissions) {
        effects[perm.id] = stmt.effect;
      }
    }
    setPermEffects(effects);
    setIsDrawerOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (policyId: string) => {
      if (!window.confirm("Are you sure you want to delete this policy? This action cannot be undone.")) return;

      DELETEAPI({
        path: `/account/policies/${policyId}`,
        isPrivateApi: true,
      }).subscribe((res: any) => {
        if (res.success) {
          toaster.create({ title: "Policy Deleted", type: "success" });
          fetchData();
        } else {
          toaster.create({
            title: "Error",
            description: res.message,
            type: "error",
          });
        }
      });
    },
    [fetchData]
  );

  const handleEffectChange = useCallback((permId: string, effect: PermissionEffect) => {
    setPermEffects((prev) => {
      const next = { ...prev };
      if (effect === null) {
        delete next[permId];
      } else {
        next[permId] = effect;
      }
      return next;
    });
  }, []);

  /**
   * Converts the flat permEffects map into the statement-based format
   * the backend expects: one ALLOW statement + one DENY statement.
   */
  const buildStatements = useCallback(() => {
    const allowIds: string[] = [];
    const denyIds: string[] = [];

    for (const [permId, effect] of Object.entries(permEffects)) {
      if (effect === "ALLOW") allowIds.push(permId);
      else if (effect === "DENY") denyIds.push(permId);
    }

    const statements: Array<{ effect: "ALLOW" | "DENY"; permission_ids: string[]; description: string }> = [];

    if (allowIds.length > 0) {
      statements.push({
        effect: "ALLOW",
        permission_ids: allowIds,
        description: "Allowed permissions",
      });
    }

    if (denyIds.length > 0) {
      statements.push({
        effect: "DENY",
        permission_ids: denyIds,
        description: "Denied permissions",
      });
    }

    return statements;
  }, [permEffects]);

  const handleSave = useCallback(() => {
    // Validation
    if (!policyName.trim()) {
      toaster.create({ title: "Policy name is required", type: "warning" });
      return;
    }

    const stmts = buildStatements();
    if (stmts.length === 0) {
      toaster.create({
        title: "Select at least one permission to ALLOW or DENY",
        type: "warning",
      });
      return;
    }

    setIsSaving(true);

    if (editingPolicy) {
      // Update metadata first
      PUTAPI({
        path: `/account/policies/${editingPolicy.id}`,
        data: {
          name: policyName,
          description: policyDescription,
          is_active: policyIsActive,
          is_system_policy: isSystemPolicy,
        },
        isPrivateApi: true,
      }).subscribe((metaRes: any) => {
        if (!metaRes.success) {
          toaster.create({ title: "Error updating policy", description: metaRes.message, type: "error" });
          setIsSaving(false);
          return;
        }

        // Then replace statements
        PUTAPI({
          path: `/account/policies/${editingPolicy.id}/statements`,
          data: {
            statements: stmts,
            replace_all: true,
          },
          isPrivateApi: true,
        }).subscribe((stmtRes: any) => {
          setIsSaving(false);
          if (stmtRes.success) {
            toaster.create({ title: "Policy Updated", type: "success" });
            fetchData();
            setIsDrawerOpen(false);
          } else {
            toaster.create({ title: "Error updating statements", description: stmtRes.message, type: "error" });
          }
        });
      });
    } else {
      // Create new policy
      POSTAPI({
        path: "/account/policies",
        data: {
          name: policyName,
          description: policyDescription,
          is_active: policyIsActive,
          is_system_policy: isSystemPolicy,
          statements: stmts,
        },
        isPrivateApi: true,
      }).subscribe((res: any) => {
        setIsSaving(false);
        if (res.success) {
          toaster.create({ title: "Policy Created", type: "success" });
          fetchData();
          setIsDrawerOpen(false);
        } else {
          toaster.create({ title: "Error creating policy", description: res.message, type: "error" });
        }
      });
    }
  }, [policyName, policyDescription, policyIsActive, isSystemPolicy, buildStatements, editingPolicy, fetchData]);

  // ── Derived / Filtered Data ─────────────────────────────────────────

  const filteredPolicies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return policies;
    return policies.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [policies, searchQuery]);

  /** Permissions filtered by drawer search, then grouped by app */
  const filteredAppGroups = useMemo(() => {
    const q = permSearchQuery.toLowerCase().trim();
    const filtered = q
      ? permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          getAppPrefix(p.code).toLowerCase().includes(q)
      )
      : permissions;
    return groupPermissionsByApp(filtered);
  }, [permissions, permSearchQuery]);

  /** Group policies into categories for the main view */
  const categorizedPolicies = useMemo(() => {
    const groups: Record<string, Policy[]> = {};

    filteredPolicies.forEach((policy) => {
      const cat = policy.is_system_policy
        ? "System Policies"
        : policy.organization_id
          ? "Organization Policies"
          : "Global Templates";

      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(policy);
    });

    return groups;
  }, [filteredPolicies]);

  const categoryConfig: Record<string, { icon: typeof LuLock; gradient: string }> = useMemo(
    () => ({
      "System Policies": { icon: LuLock, gradient: POLICY_GRADIENTS.system },
      "Organization Policies": { icon: LuBuilding2, gradient: POLICY_GRADIENTS.organization },
      "Global Templates": { icon: LuGlobe, gradient: POLICY_GRADIENTS.global },
    }),
    []
  );

  /** Summary counts for the drawer footer */
  const selectionSummary = useMemo(() => {
    let allow = 0;
    let deny = 0;
    for (const effect of Object.values(permEffects)) {
      if (effect === "ALLOW") allow++;
      else if (effect === "DENY") deny++;
    }
    return { allow, deny, total: allow + deny };
  }, [permEffects]);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      <PageLayout
        title="Policy Management"
        subtitle="Configure access policies with fine-grained Allow and Deny rules."
        actions={
          <HStack gap={3}>
            <UIPermissionGuard permissions={["ACCOUNT.POLICIES.CREATE"]}>
              <Button
                colorPalette="purple"
                borderRadius="xl"
                size="md"
                onClick={handleAddClick}
                boxShadow="0 4px 12px rgba(139,92,246,0.3)"
              >
                <LuPlus style={{ marginRight: "8px" }} /> Create Policy
              </Button>
            </UIPermissionGuard>
          </HStack>
        }
        searchPlaceholder="Search policies by name or description..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchData}
        isRefreshing={isLoading}
      >
        {/* ── Content ───────────────────────────────────────────── */}
        {isLoading && policies.length === 0 ? (
          <Center py={20}>
            <VStack gap={4}>
              <Spinner size="xl" color="purple.500" borderWidth="3px" />
              <Text fontSize="sm" color="app.text.muted" fontWeight="500">
                Loading policies…
              </Text>
            </VStack>
          </Center>
        ) : filteredPolicies.length === 0 ? (
          <Center py={20}>
            <VStack gap={3}>
              <Box
                w={16}
                h={16}
                borderRadius="2xl"
                bg="rgba(99,102,241,0.08)"
                border="1px dashed"
                borderColor="app.card.border"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={LuShieldAlert} boxSize={7} color="app.text.muted" />
              </Box>
              <Text fontWeight="600" color="app.text.primary">
                {searchQuery ? "No policies match your search" : "No policies configured yet"}
              </Text>
              <Text fontSize="sm" color="app.text.muted">
                {searchQuery
                  ? "Try a different search term."
                  : "Create your first policy to define access control rules."}
              </Text>
              {!searchQuery && (
                <UIPermissionGuard permissions={["ACCOUNT.POLICIES.CREATE"]}>
                  <Button
                    mt={2}
                    size="sm"
                    colorPalette="purple"
                    borderRadius="xl"
                    onClick={handleAddClick}
                  >
                    <LuPlus style={{ marginRight: "6px" }} /> Create First Policy
                  </Button>
                </UIPermissionGuard>
              )}
            </VStack>
          </Center>
        ) : (
          <VStack align="stretch" gap={8} w="full">
            {Object.entries(categorizedPolicies).map(([category, catPolicies]) => {
              const config = categoryConfig[category] || {
                icon: LuFileText,
                gradient: POLICY_GRADIENTS.organization,
              };
              return (
                <Box key={category}>
                  {/* Category Header */}
                  <HStack mb={5} gap={4} align="center">
                    <HStack
                      px={3}
                      py={1.5}
                      borderRadius="full"
                      bg="app.card.bg"
                      border="1px solid"
                      borderColor="app.card.border"
                      boxShadow="sm"
                      gap={2}
                    >
                      <Center
                        w={5}
                        h={5}
                        borderRadius="md"
                        bgGradient={config.gradient}
                      >
                        <Icon as={config.icon} boxSize={3} color="white" />
                      </Center>
                      <Text
                        fontSize="xs"
                        fontWeight="800"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color="app.text.primary"
                      >
                        {category}
                      </Text>
                      <Badge
                        size="sm"
                        variant="subtle"
                        borderRadius="full"
                        colorPalette="gray"
                      >
                        {catPolicies.length}
                      </Badge>
                    </HStack>
                    <Box flex={1} h="1px" bg="app.divider" opacity={0.6} />
                  </HStack>

                  {/* Policy Cards Grid */}
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                      xl: "repeat(4, 1fr)",
                    }}
                    gap={4}
                  >
                    {catPolicies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        policy={policy}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </VStack>
        )}
      </PageLayout>

      {/* ── Full-Screen Policy Editor Drawer ────────────────────────────── */}
      <DrawerRoot
        open={isDrawerOpen}
        onOpenChange={(e) => setIsDrawerOpen(e.open)}
        size="full"
      >
        <DrawerBackdrop backdropFilter="blur(8px)" bg="rgba(0,0,0,0.5)" />
        <DrawerContent
          bg="app.bg.primary"
          display="flex"
          flexDirection="column"
          h="100dvh"
        >
          <DrawerCloseTrigger color="app.text.muted" />

          {/* ── Drawer Header ───────────────────────────────────── */}
          <DrawerHeader
            borderBottom="1px solid"
            borderColor="app.card.border"
            py={4}
            px={8}
          >
            <Flex justify="space-between" align="center" w="full">
              <HStack gap={4}>
                <Center
                  w={11}
                  h={11}
                  borderRadius="xl"
                  bgGradient={POLICY_GRADIENTS.system}
                  color="white"
                  boxShadow="0 4px 14px rgba(99,102,241,0.3)"
                >
                  <Icon as={editingPolicy ? LuPencil : LuPlus} boxSize={5} />
                </Center>
                <VStack align="start" gap={0}>
                  <Heading size="md" color="app.text.primary" letterSpacing="-0.3px">
                    {editingPolicy ? "Edit Policy" : "Create New Policy"}
                  </Heading>
                  <Text fontSize="xs" color="app.text.muted">
                    {editingPolicy
                      ? "Modify policy rules and permission effects"
                      : "Define access rules by selecting ALLOW or DENY for each permission"}
                  </Text>
                </VStack>
              </HStack>

              {/* Summary chips in header */}
              {selectionSummary.total > 0 && (
                <HStack gap={2}>
                  {selectionSummary.allow > 0 && (
                    <Badge
                      colorPalette="green"
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="xs"
                      fontWeight="700"
                    >
                      <Icon as={LuShieldCheck} boxSize={3.5} mr={1.5} />
                      {selectionSummary.allow} Allowed
                    </Badge>
                  )}
                  {selectionSummary.deny > 0 && (
                    <Badge
                      colorPalette="red"
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="xs"
                      fontWeight="700"
                    >
                      <Icon as={LuShieldX} boxSize={3.5} mr={1.5} />
                      {selectionSummary.deny} Denied
                    </Badge>
                  )}
                </HStack>
              )}
            </Flex>
          </DrawerHeader>

          {/* ── Drawer Body: Two-Column Layout ────────────────── */}
          <DrawerBody py={0} px={0} overflowY="hidden" flex="1">
            <Flex h="full">
              {/* ── LEFT PANEL: Policy Details ────────────────── */}
              <Box
                w="380px"
                minW="380px"
                borderRight="1px solid"
                borderColor="app.card.border"
                overflowY="auto"
                className="custom-scrollbar"
                p={6}
                bg="rgba(0,0,0,0.05)"
              >
                <VStack gap={6} align="stretch">
                  {/* Policy Meta Section */}
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color="app.text.accent"
                      mb={4}
                    >
                      Policy Details
                    </Text>

                    <VStack gap={5} align="stretch">
                      <Box>
                        <Text
                          mb={2}
                          color="app.text.secondary"
                          fontSize="xs"
                          fontWeight="700"
                          textTransform="uppercase"
                          letterSpacing="0.06em"
                        >
                          Policy Name *
                        </Text>
                        <Input
                          value={policyName}
                          onChange={(e) => setPolicyName(e.target.value)}
                          placeholder="e.g. CRM Manager Policy"
                          bg="app.bg.secondary"
                          borderColor="app.card.border"
                          borderRadius="xl"
                          _focus={{
                            borderColor: "rgba(99,102,241,0.5)",
                            boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
                          }}
                          color="app.text.primary"
                          fontSize="sm"
                        />
                      </Box>

                      <Box>
                        <Text
                          mb={2}
                          color="app.text.secondary"
                          fontSize="xs"
                          fontWeight="700"
                          textTransform="uppercase"
                          letterSpacing="0.06em"
                        >
                          Description
                        </Text>
                        <Textarea
                          value={policyDescription}
                          onChange={(e) => setPolicyDescription(e.target.value)}
                          placeholder="Describe this policy's purpose..."
                          bg="app.bg.secondary"
                          borderColor="app.card.border"
                          borderRadius="xl"
                          _focus={{
                            borderColor: "rgba(99,102,241,0.5)",
                            boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
                          }}
                          color="app.text.primary"
                          fontSize="sm"
                          rows={3}
                          resize="none"
                        />
                      </Box>

                      <Box
                        p={4}
                        borderRadius="xl"
                        bg="rgba(139,92,246,0.05)"
                        border="1px dashed"
                        borderColor="purple.500/30"
                      >
                        <HStack justify="space-between">
                          <VStack align="start" gap={0}>
                            <Text color="app.text.primary" fontSize="sm" fontWeight="600">
                              Active
                            </Text>
                            <Text color="app.text.muted" fontSize="2xs">
                              Inactive policies are ignored
                            </Text>
                          </VStack>
                          <Switch
                            checked={policyIsActive}
                            onCheckedChange={(e) => setPolicyIsActive(e.checked)}
                            colorPalette="purple"
                          />
                        </HStack>
                      </Box>

                      <Box
                        p={4}
                        borderRadius="xl"
                        bg="rgba(251,146,60,0.05)"
                        border="1px dashed"
                        borderColor="orange.500/30"
                      >
                        <HStack justify="space-between">
                          <VStack align="start" gap={0}>
                            <HStack gap={2}>
                              <Icon as={LuLock} color="orange.400" boxSize={4} />
                              <Text color="app.text.primary" fontSize="sm" fontWeight="600">
                                System Policy
                              </Text>
                            </HStack>
                            <Text color="app.text.muted" fontSize="2xs">
                              System policies cannot be modified or deleted by organization admins
                            </Text>
                          </VStack>
                          <Switch
                            checked={isSystemPolicy}
                            onCheckedChange={(e) => setIsSystemPolicy(e.checked)}
                            colorPalette="orange"
                          />
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>

                  {/* Selection Summary */}
                  <Box
                    p={5}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="app.card.border"
                    bg="app.card.bg"
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color="app.text.accent"
                      mb={4}
                    >
                      Selection Summary
                    </Text>

                    <VStack gap={3} align="stretch">
                      <Flex
                        align="center"
                        justify="space-between"
                        px={4}
                        py={3}
                        borderRadius="xl"
                        bg="green.500/6"
                        border="1px solid"
                        borderColor="green.500/15"
                      >
                        <HStack gap={2}>
                          <Icon as={LuShieldCheck} boxSize={4} color="green.400" />
                          <Text fontSize="sm" fontWeight="600" color="green.400">
                            Allowed
                          </Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="800" color="green.400">
                          {selectionSummary.allow}
                        </Text>
                      </Flex>

                      <Flex
                        align="center"
                        justify="space-between"
                        px={4}
                        py={3}
                        borderRadius="xl"
                        bg="red.500/6"
                        border="1px solid"
                        borderColor="red.500/15"
                      >
                        <HStack gap={2}>
                          <Icon as={LuShieldX} boxSize={4} color="red.400" />
                          <Text fontSize="sm" fontWeight="600" color="red.400">
                            Denied
                          </Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="800" color="red.400">
                          {selectionSummary.deny}
                        </Text>
                      </Flex>

                      <Box pt={2} borderTop="1px solid" borderColor="app.divider">
                        <Text fontSize="2xs" color="app.text.muted" lineHeight="1.6">
                          <strong>DENY overrides ALLOW</strong> — if a permission appears in both,
                          the DENY effect takes precedence during policy evaluation.
                        </Text>
                      </Box>
                    </VStack>
                  </Box>

                  {/* Info box */}
                  <Box
                    p={4}
                    borderRadius="xl"
                    bg="rgba(99,102,241,0.06)"
                    border="1px solid"
                    borderColor="rgba(99,102,241,0.15)"
                  >
                    <HStack gap={3} align="start">
                      <Icon as={LuFileText} boxSize={4} color="rgba(99,102,241,0.7)" mt={0.5} />
                      <Text fontSize="xs" color="app.text.muted" lineHeight="1.6">
                        Select permissions from the right panel. Use ALLOW to grant access,
                        DENY to explicitly block access. Unselected permissions are implicitly denied.
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </Box>

              {/* ── RIGHT PANEL: Permission Selection ─────────── */}
              <Box flex={1} overflowY="auto" className="custom-scrollbar">
                {/* Search bar sticky at top */}
                <Box
                  position="sticky"
                  top={0}
                  zIndex={10}
                  bg="app.bg.primary"
                  borderBottom="1px solid"
                  borderColor="app.card.border"
                  px={6}
                  py={3}
                >
                  <HStack gap={3}>
                    <HStack
                      flex={1}
                      gap={2}
                      px={4}
                      py={2.5}
                      borderRadius="xl"
                      bg="app.bg.secondary"
                      border="1px solid"
                      borderColor="app.card.border"
                      _focusWithin={{
                        borderColor: "rgba(99,102,241,0.5)",
                        boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
                      }}
                      transition="all 0.2s"
                    >
                      <Icon as={LuSearch} color="app.text.muted" boxSize={4} />
                      <Input
                        value={permSearchQuery}
                        onChange={(e) => setPermSearchQuery(e.target.value)}
                        placeholder="Search permissions by name, code, or app..."
                        variant="flushed"
                        border="none"
                        _focusVisible={{ outline: "none" }}
                        size="sm"
                        color="app.text.primary"
                        _placeholder={{ color: "app.text.muted" }}
                      />
                      {permSearchQuery && (
                        <IconButton
                          aria-label="Clear search"
                          variant="ghost"
                          size="xs"
                          borderRadius="full"
                          onClick={() => setPermSearchQuery("")}
                          color="app.text.muted"
                        >
                          <LuX />
                        </IconButton>
                      )}
                    </HStack>

                    <Badge
                      variant="outline"
                      borderRadius="full"
                      px={3}
                      py={1.5}
                      fontSize="xs"
                      borderColor="app.card.border"
                      color="app.text.muted"
                    >
                      {permissions.length} total
                    </Badge>
                  </HStack>
                </Box>

                {/* Permission groups */}
                <VStack gap={4} align="stretch" p={6}>
                  {filteredAppGroups.length === 0 ? (
                    <Center py={16}>
                      <VStack gap={3}>
                        <Icon as={LuSearch} boxSize={8} color="app.text.muted" />
                        <Text fontWeight="600" color="app.text.primary">
                          {permSearchQuery ? "No permissions match" : "No permissions available"}
                        </Text>
                        <Text fontSize="sm" color="app.text.muted">
                          {permSearchQuery
                            ? "Try adjusting your search query."
                            : "Create permissions first in the Permissions management page."}
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    filteredAppGroups.map((group) => (
                      <AppGroupSection
                        key={group.appPrefix}
                        group={group}
                        permEffects={permEffects}
                        onEffectChange={handleEffectChange}
                      />
                    ))
                  )}
                </VStack>
              </Box>
            </Flex>
          </DrawerBody>

          {/* ── Drawer Footer ───────────────────────────────────── */}
          <DrawerFooter
            borderTop="1px solid"
            borderColor="app.card.border"
            py={4}
            px={8}
          >
            <Flex w="full" justify="space-between" align="center">
              <HStack gap={3}>
                <Button
                  variant="ghost"
                  borderRadius="xl"
                  onClick={() => setIsDrawerOpen(false)}
                  color="app.text.secondary"
                >
                  Cancel
                </Button>
              </HStack>

              <HStack gap={4}>
                {selectionSummary.total > 0 && (
                  <HStack gap={2}>
                    <Badge colorPalette="green" borderRadius="full" px={2.5} fontSize="xs" fontWeight="700">
                      {selectionSummary.allow} Allow
                    </Badge>
                    <Badge colorPalette="red" borderRadius="full" px={2.5} fontSize="xs" fontWeight="700">
                      {selectionSummary.deny} Deny
                    </Badge>
                  </HStack>
                )}
                <Button
                  colorPalette="purple"
                  size="lg"
                  borderRadius="xl"
                  px={10}
                  boxShadow="0 8px 16px rgba(139,92,246,0.2)"
                  _active={{ transform: "scale(0.98)" }}
                  onClick={handleSave}
                  disabled={isSaving}
                  fontWeight="700"
                >
                  {isSaving ? (
                    <Spinner size="sm" mr={2} />
                  ) : (
                    <LuSave style={{ marginRight: "8px" }} />
                  )}
                  {editingPolicy ? "Update Policy" : "Create Policy"}
                </Button>
              </HStack>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
});

PolicyManagementView.displayName = "PolicyManagementView";
export default PolicyManagementView;
