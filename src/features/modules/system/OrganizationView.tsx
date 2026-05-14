import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  Badge,
  Grid,
  GridItem,
  Spinner,
  Center,
  Input,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { Building2, ChevronRight, Plus, RefreshCw, Search, Mail, Server, Calendar } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { GETAPI } from "@/app/api";
import { InputGroup } from "@/components/ui/input-group";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";

// ─── Constants ────────────────────────────────────────────────────────────────

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
  onNavigate?: (organization: any) => void;
}

const OrganizationCard = memo(({ organization, onNavigate }: OrganizationCardProps) => {
  const gradient = useMemo(() => getGradient(organization.organization_name || String(organization.id)), [organization.organization_name, organization.id]);

  const handleClick = useCallback(() => {
    if (onNavigate) onNavigate(organization);
  }, [onNavigate, organization]);

  return (
    <Card
      boxShadow="app.shadow.glass-glow"
      cursor="pointer"
      onClick={handleClick}
      role="button"
      aria-label={`View organization ${organization.name}`}
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "0 20px 48px -8px rgba(99,102,241,0.22)",
        borderColor: "rgba(99,102,241,0.4)",
      }}
      p={0} // Override default padding as it's applied to VStack
    >
      {/* Gradient accent strip */}
      <Box h="4px" bgGradient={gradient} />

      <VStack gap={0} align="stretch" p={5}>
        <Flex justify="space-between" align="flex-start" mb={4}>
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

            <VStack align="start" gap={0} overflow="hidden">
              <Text
                fontWeight="700"
                fontSize="sm"
                color="app.text.primary"
                letterSpacing="-0.2px"
                lineClamp={1}
              >
                {organization.organization_name}
              </Text>
              <Text fontSize="2xs" color="app.text.muted" lineClamp={1}>
                ID: {organization.organization_uuid}
              </Text>
            </VStack>
          </HStack>

          <Badge
            colorPalette={organization.is_active ?? true ? "green" : "red"}
            variant="subtle"
            borderRadius="full"
            px={2.5}
            py={0.5}
            fontSize="2xs"
            fontWeight="700"
          >
            {organization.is_active ?? true ? "Active" : "Inactive"}
          </Badge>
        </Flex>

        <VStack align="start" gap={3} mb={5}>
          <HStack gap={2}>
            <Icon as={Mail} boxSize={3.5} color="app.text.accent" />
            <Text fontSize="xs" color="app.text.primary" fontWeight="500" lineClamp={1}>
              {organization.organization_email || "N/A"}
            </Text>
          </HStack>

          <HStack gap={2}>
            <Icon as={Server} boxSize={3.5} color="app.text.accent" />
            <Badge size="sm" variant="outline" borderRadius="full" textTransform="capitalize" px={2} border="1px solid" borderColor="app.navbar.border">
              {organization.deployment_type || "Shared"}
            </Badge>
          </HStack>

          <HStack gap={2}>
            <Icon as={Calendar} boxSize={3.5} color="app.text.muted" />
            <Text fontSize="2xs" color="app.text.muted" fontWeight="500">
              Created: {organization.created_at ? new Date(organization.created_at).toLocaleDateString() : "N/A"}
            </Text>
          </HStack>
        </VStack>

        <Box borderTop="1px solid" borderColor="app.divider" pt={3}>
          <Flex align="center" justify="space-between">
            <Text
              fontSize="2xs"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="app.text.accent"
            >
              View Details
            </Text>
            <ChevronRight size={14} color="var(--chakra-colors-app-text-accent)" />
          </Flex>
        </Box>
      </VStack>
    </Card>
  );
});

OrganizationCard.displayName = "OrganizationCard";

// ─── OrganizationView ───────────────────────────────────────────────────────────────

const OrganizationView = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrganizations = useCallback(() => {
    setLoading(true);
    GETAPI({
      path: "/account/organizations",
      isPrivateApi: true,
      serverName: 'identity'
    }).subscribe((res: any) => {
      if (res.success) {
        setOrganizations(res.data || []);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((t) =>
      t.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organization_uuid?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  return (
    <PageLayout
      title="Organizations"
      subtitle="Manage your customers and workspaces."
      actions={
        <HStack gap={2}>
          <Button
            colorPalette="purple"
            borderRadius="xl"
            size="md"
            gap={2}
            bg="linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)"
            color="white"
            h="44px"
            px={6}
            fontWeight="700"
            boxShadow="0 4px 20px rgba(139,92,246,0.35)"
            transition="all 0.25s cubic-bezier(0.4,0,0.2,1)"
            _hover={{
              transform: "translateY(-2px) scale(1.02)",
              boxShadow: "0 8px 28px rgba(139,92,246,0.5)",
            }}
            _active={{ transform: "translateY(0) scale(1)", boxShadow: "none" }}
          >
            <Plus size={18} strokeWidth={3} />
            New Organization
          </Button>
        </HStack>
      }
      searchPlaceholder="Search by name or ID..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={fetchOrganizations}
      isRefreshing={isLoading}
      icon={Building2}
    >

      {/* Grid Content */}
      {isLoading ? (
        <Center py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color="app.text.accent" borderWidth="3px" />
            <Text fontSize="sm" color="app.text.muted" fontWeight="500">Loading organizations…</Text>
          </VStack>
        </Center>
      ) : filteredOrganizations.length === 0 ? (
        <Center py={20}>
          <VStack gap={3}>
            <Box
              w={16} h={16} borderRadius="2xl"
              bg="rgba(99,102,241,0.08)" border="1px dashed" borderColor="app.card.border"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Icon as={Building2} boxSize={7} color="app.text.muted" />
            </Box>
            <Text fontWeight="600" color="app.text.primary">No organizations found</Text>
            <Text fontSize="sm" color="app.text.muted">Try a different search term or add a new organization.</Text>
          </VStack>
        </Center>
      ) : (
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
          }}
          gap={4}
        >
          {filteredOrganizations.map((organization) => (
            <GridItem key={organization.organization_uuid || organization.id}>
              <OrganizationCard organization={organization} />
            </GridItem>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
};

export default memo(OrganizationView);
