import { memo, useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  Badge,
  Center,
  Spinner,
} from "@chakra-ui/react";
import {
  Building2,
  ShieldCheck,
  Shield,
  Users,
  ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { RootState } from "@/app/store";
import { GETAPI } from "@/app/api";
import { Tooltip } from "@/components/ui/tooltip";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_DISPLAY_ROLES = 4;

// Deterministic gradient per organization name — mirrors UserCard avatar gradient logic
const ORGANIZATION_GRADIENTS = [
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
  return ORGANIZATION_GRADIENTS[Math.abs(h) % ORGANIZATION_GRADIENTS.length];
};

// ─── OrganizationCard ───────────────────────────────────────────────────────────────

interface OrganizationCardProps {
  organization: any;
  onNavigate: (organization: any) => void;
}

/**
 * OrganizationCard — matches the UserCard / AdminModuleCard design language:
 * - 4px gradient accent strip at top
 * - Glassmorphic surface with `app.*` semantic tokens
 * - Hover: translateY(-4px) + indigo glow
 */
const OrganizationCard = memo(({ organization, onNavigate }: OrganizationCardProps) => {
  const gradient = getGradient(organization.name ?? String(organization.organization_id));

  const handleClick = useCallback(() => {
    onNavigate(organization);
  }, [onNavigate, organization]);

  const visibleRoles: string[] = organization.roles?.slice(0, MAX_DISPLAY_ROLES) ?? [];
  const extraCount = (organization.roles?.length ?? 0) - MAX_DISPLAY_ROLES;

  return (
    <Card
      boxShadow="app.shadow.glass-glow"
      cursor="pointer"
      onClick={handleClick}
      role="button"
      aria-label={`Manage roles for ${organization.name}`}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "0 20px 48px -8px rgba(99,102,241,0.22)",
        borderColor: "rgba(99,102,241,0.4)",
      }}
      p={0} // Override default padding as it's applied to VStack
    >
      {/* ── Gradient strip ───────────────────────────────────────────── */}
      <Box h="4px" bgGradient={gradient} />

      <VStack gap={0} align="stretch" p={5}>
        {/* ── Header: icon + name + status ─────────────────────────── */}
        <Flex justify="space-between" align="flex-start" mb={4}>
          {/* Organization icon badge */}
          <HStack gap={3} flex={1} overflow="hidden">
            <Box
              w="40px"
              h="40px"
              borderRadius="xl"
              bgGradient={gradient}
              display="flex"
              alignItems="center"
              justifyContent="center"
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
              <Icon as={Building2} boxSize={4} color="white" zIndex={1} />
            </Box>

            <Text
              fontWeight="700"
              fontSize="sm"
              color="app.text.primary"
              letterSpacing="-0.2px"
              lineClamp={1}
              title={organization.name}
            >
              {organization.name}
            </Text>
          </HStack>

          {/* Active status badge */}
          <Badge
            colorPalette={organization.isActive ? "green" : "red"}
            variant="subtle"
            borderRadius="full"
            px={2.5}
            py={0.5}
            fontSize="2xs"
            fontWeight="700"
            flexShrink={0}
            ml={2}
          >
            {organization.isActive ? "Active" : "Inactive"}
          </Badge>
        </Flex>

        {/* ── Role badges ──────────────────────────────────────────── */}
        <Box mb={4}>
          <Text
            fontSize="2xs"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="0.08em"
            color="app.text.muted"
            mb={2}
          >
            Roles
          </Text>
          <HStack wrap="wrap" gap={1.5}>
            {visibleRoles.map((role: string) => (
              <Badge
                key={role}
                variant="subtle"
                colorPalette="purple"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="2xs"
                fontWeight="600"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={Shield} boxSize={3} />
                {role}
              </Badge>
            ))}
            {extraCount > 0 && (
              <Tooltip content={organization.roles.slice(MAX_DISPLAY_ROLES).join(", ")}>
                <Badge
                  variant="subtle"
                  colorPalette="gray"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="2xs"
                  fontWeight="600"
                  cursor="default"
                >
                  +{extraCount} more
                </Badge>
              </Tooltip>
            )}
          </HStack>
        </Box>

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
            <ChevronRight size={14} color="var(--chakra-colors-app-text-accent)" />
          </Flex>
        </Box>
      </VStack>
    </Card>
  );
});

OrganizationCard.displayName = "OrganizationCard";

// ─── AccessControlView ────────────────────────────────────────────────────────

const AccessControlView = memo(() => {
  const [organizationsWithRoles, setOrganizationsWithRoles] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  const auth = useSelector((state: RootState) => state.auth);
  const organizations = useSelector((state: RootState) => state.organizations);
  const navigate = useNavigate();
  const { view } = useParams();
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || "Default";

  const fetchData = useCallback(() => {
    setLoading(true);
    GETAPI({ path: "/account/organizations-with-roles", isPrivateApi: true }).subscribe(
      (res: any) => {
        setOrganizationsWithRoles(Array.isArray(res) ? res : []);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNavigate = useCallback(
    (organization: any) => {
      if (!auth?.isAuthenticated) return;
      const organizationName = organizations?.organization?.name ?? "admin";
      navigate(`/${organizationName}/${view}/PolicyManagement/${organization.organization_id}?app=${appName}`);
    },
    [auth, view, appName, navigate]
  );

  return (
    <PageLayout
      title="Access Control"
      subtitle="Manage roles and policies for each organization."
      onRefresh={fetchData}
      isRefreshing={isLoading}
    >

      {/* ── Loading ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <Center py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color="app.text.accent" borderWidth="3px" />
            <Text fontSize="sm" color="app.text.muted" fontWeight="500">Loading organizations…</Text>
          </VStack>
        </Center>
      ) : organizationsWithRoles.length === 0 ? (
        <Center py={20}>
          <VStack gap={3}>
            <Box
              w={16} h={16} borderRadius="2xl"
              bg="rgba(99,102,241,0.08)" border="1px dashed" borderColor="app.card.border"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Icon as={Users} boxSize={7} color="app.text.muted" />
            </Box>
            <Text fontWeight="600" color="app.text.primary">No organizations found</Text>
            <Text fontSize="sm" color="app.text.muted">No organizations with roles have been configured yet.</Text>
          </VStack>
        </Center>
      ) : (
        /* ── Organization grid ─────────────────────────────────────────────── */
        <Grid
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
          gap={4}
        >
          {organizationsWithRoles.map((organization) => (
            <GridItem key={organization.organization_id}>
              <OrganizationCard organization={organization} onNavigate={handleNavigate} />
            </GridItem>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
});

AccessControlView.displayName = "AccessControlView";
export default AccessControlView;
