import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  Badge,
  Button,
  Center,
  Spinner,
} from "@chakra-ui/react";
import {
  LuPlus,
  LuRefreshCw,
  LuShield,
  LuShieldCheck,
  LuChevronRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { GETAPI, POSTAPI } from "@/app/api";
import { toaster } from "@/components/ui/toaster";
import RoleModal from "./components/RoleModal";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";

// ─── Gradient palette — same helper used across all card views ────────────────

const ROLE_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#3b82f6,#6366f1)",
  "linear-gradient(135deg,#10b981,#3b82f6)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
];

const getGradient = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return ROLE_GRADIENTS[Math.abs(h) % ROLE_GRADIENTS.length];
};

// ─── RoleCard ─────────────────────────────────────────────────────────────────

interface RoleCardProps {
  role: string;
  description: string;
  is_active?: boolean;
}

/**
 * RoleCard — full card variant matching AdminModuleCard / OrganizationCard exactly:
 * - 4px gradient accent strip at top
 * - Icon badge with gradient + inner highlight
 * - Glass surface with `app.*` semantic tokens
 * - Hover: translateY(-4px) + glow
 */
const RoleCard = memo(({ role, description, is_active = true }: RoleCardProps) => {
  const gradient = getGradient(role);

  return (
    <Card
      boxShadow="app.shadow.glass-glow"
      overflow="hidden"
      transition="all 0.22s ease"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "0 20px 48px -8px rgba(99,102,241,0.22)",
        borderColor: "rgba(99,102,241,0.4)",
      }}
      p={0} // Override default padding as it's applied to VStack
    >
      {/* ── Gradient strip ─────────────────────────────────────────── */}
      <Box h="4px" bgGradient={is_active ? gradient : "linear-gradient(135deg,#94a3b8,#64748b)"} />

      <VStack gap={0} align="stretch" p={5}>
        {/* ── Header: icon + role badge + status ───────────────────── */}
        <Flex justify="space-between" align="flex-start" mb={4}>
          {/* Role icon badge */}
          <Box
            w="44px"
            h="44px"
            borderRadius="xl"
            bgGradient={is_active ? gradient : "linear-gradient(135deg,#94a3b8,#64748b)"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            boxShadow="0 6px 16px -4px rgba(99,102,241,0.35)"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="2px"
              left="4px"
              right="4px"
              h="10px"
              borderRadius="full"
              bg="rgba(255,255,255,0.22)"
            />
            <Icon
              as={is_active ? LuShieldCheck : LuShield}
              boxSize={5}
              color="white"
              zIndex={1}
            />
          </Box>

          {/* Status badge */}
          <Badge
            colorPalette={is_active ? "green" : "gray"}
            variant="subtle"
            borderRadius="full"
            px={2.5}
            py={0.5}
            fontSize="2xs"
            fontWeight="700"
          >
            {is_active ? "Active" : "Inactive"}
          </Badge>
        </Flex>

        {/* ── Role name ────────────────────────────────────────────── */}
        <Badge
          colorPalette={is_active ? "purple" : "gray"}
          variant="subtle"
          borderRadius="full"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.05em"
          mb={3}
          alignSelf="flex-start"
        >
          {role}
        </Badge>

        {/* ── Description ──────────────────────────────────────────── */}
        <Text
          fontSize="xs"
          color="app.text.muted"
          lineHeight="1.6"
          lineClamp={3}
          mb={4}
          minH="54px"
        >
          {description || "No description provided for this role."}
        </Text>

        {/* ── Footer CTA ───────────────────────────────────────────── */}
        <Box borderTop="1px solid" borderColor="app.divider" pt={3}>
          <Flex align="center" justify="space-between">
            <Text
              fontSize="2xs"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="app.text.accent"
              opacity={0.8}
            >
              Manage Permissions
            </Text>
            <LuChevronRight size={14} color="var(--chakra-colors-app-text-accent)" />
          </Flex>
        </Box>
      </VStack>
    </Card>
  );
});

RoleCard.displayName = "RoleCard";

// ─── RolePermissionView ───────────────────────────────────────────────────────

const RolePermissionView = memo(() => {
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);

  const organizations = useSelector((state: RootState) => state.organizations);
  const organizationName = organizations?.organization?.name || "";

  const fetchRoles = useCallback(() => {
    setLoading(true);
    GETAPI({ path: "/account/organization/roles", isPrivateApi: true }).subscribe({
      next: (res: any) => {
        if (res.success) {
          setRoles(res.data || []);
        } else {
          toaster.create({ title: "Error", description: res.message || "Failed to fetch roles", type: "error" });
        }
        setLoading(false);
      },
      error: (err: any) => {
        console.error("Fetch roles error:", err);
        setLoading(false);
      },
    });
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleCreateRole = useCallback(
    (roleData: any) => {
      setSubmitting(true);
      POSTAPI({ path: "/account/organization/roles", data: roleData, isPrivateApi: true }).subscribe({
        next: (res: any) => {
          if (res.success) {
            toaster.create({ title: "Role Created", description: "Role created successfully", type: "success" });
            setModalOpen(false);
            fetchRoles();
          } else {
            toaster.create({ title: "Error", description: res.message || "Failed to create role", type: "error" });
          }
          setSubmitting(false);
        },
      });
    },
    [fetchRoles]
  );

  return (
    <PageLayout
      title="Roles & Permissions"
      subtitle={
        <>
          Define access levels and security policies for{" "}
          <Text as="span" fontWeight="700" color="app.text.accent">{organizationName}</Text>
        </>
      }
      actions={
        <HStack gap={2}>
          <IconButton
            aria-label="Refresh roles"
            size="sm"
            variant="outline"
            borderRadius="full"
            onClick={fetchRoles}
            loading={isLoading}
          >
            <LuRefreshCw />
          </IconButton>
          <Button
            size="sm"
            borderRadius="full"
            px={5}
            fontWeight="600"
            bg="app.gradient.premium"
            color="white"
            _hover={{ filter: "brightness(1.1)", transform: "translateY(-1px)" }}
            boxShadow="0 6px 16px -4px rgba(99,102,241,0.4)"
            transition="all 0.2s"
            onClick={() => setModalOpen(true)}
          >
            <LuPlus style={{ marginRight: "6px" }} />
            Create Role
          </Button>
        </HStack>
      }
    >

      {/* ── Content ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <Center py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color="app.text.accent" borderWidth="3px" />
            <Text fontSize="sm" color="app.text.muted" fontWeight="500">Loading roles…</Text>
          </VStack>
        </Center>
      ) : roles.length === 0 ? (
        <Center py={20}>
          <VStack gap={3}>
            <Box
              w={16} h={16} borderRadius="2xl"
              bg="rgba(99,102,241,0.08)" border="1px dashed" borderColor="app.card.border"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Icon as={LuShield} boxSize={7} color="app.text.muted" />
            </Box>
            <Text fontWeight="600" color="app.text.primary">No roles yet</Text>
            <Text fontSize="sm" color="app.text.muted">Create your first role to manage permissions.</Text>
          </VStack>
        </Center>
      ) : (
        <Grid
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
          gap={4}
        >
          {roles.map((role) => (
            <GridItem key={role.id}>
              <RoleCard
                role={role.role_name}
                description={role.description}
                is_active={role.is_active}
              />
            </GridItem>
          ))}
        </Grid>
      )}

      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateRole}
        isLoading={isSubmitting}
      />
    </PageLayout>
  );
});

RolePermissionView.displayName = "RolePermissionView";
export default RolePermissionView;
