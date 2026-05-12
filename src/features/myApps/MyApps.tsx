import {
  Box,
  Flex,
  Image,
  Input,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  Heading,
  Center,
} from "@chakra-ui/react";
import { memo, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Search, ChevronRight, LayoutGrid } from "lucide-react";
import * as dynamicFunctions from "../../script/myAppsScript";
import { InputGroup } from "@/components/ui/input-group";
import { useColorModeValue } from "@/components/ui/color-mode";
// useAuthorization is a React hook — never call hooks inside useMemo/filter callbacks.
// Instead we read raw RBAC slices at the top level and use a pure helper below.
// (RootState is already imported on line 17)

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_GRADIENTS = [
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
  return APP_GRADIENTS[Math.abs(h) % APP_GRADIENTS.length];
};

// ─── AppCard ─────────────────────────────────────────────────────────────────

interface AppCardProps {
  appConfig: any;
  handleNavigate: (e: React.MouseEvent, appConfig: any) => void;
}

const AppCard: React.FC<AppCardProps> = memo(
  ({ appConfig, handleNavigate }) => {
    const { name, logo } = appConfig;
    const gradient = useMemo(() => getGradient(name), [name]);

    if (appConfig?.hidden) return null;

    return (
      <Box
        borderRadius="2xl"
        border="1px solid"
        borderColor="app.card.border"
        bg="app.card.bg"
        backdropFilter="blur(16px)"
        boxShadow="app.shadow.glass-glow"
        overflow="hidden"
        cursor="pointer"
        transition="all 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
        onClick={(e) => handleNavigate(e, appConfig)}
        role="button"
        aria-label={`Open ${name}`}
        _hover={{
          transform: "translateY(-4px)",
          boxShadow: "0 20px 48px -8px rgba(99,102,241,0.22)",
          borderColor: "rgba(99,102,241,0.4)",
        }}
      >
        {/* ── Gradient accent strip ─────────────────────────────────────────── */}
        <Box h="4px" bgGradient={gradient} />

        <VStack gap={0} align="stretch" p={5}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box
              w="48px"
              h="48px"
              borderRadius="xl"
              bg={useColorModeValue("white", "whiteAlpha.100")}
              p={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 12px rgba(0,0,0,0.08)"
              overflow="hidden"
            >
              {logo?.ShowSvg ? (
                <Box
                  w="full"
                  h="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={logo?.iconColor || "brand.500"}
                  dangerouslySetInnerHTML={{ __html: logo.svgIcon }}
                  css={{
                    "& svg": {
                      width: "26px",
                      height: "26px",
                      stroke: "currentColor",
                      fill: "none",
                    },
                  }}
                />
              ) : (
                <Image
                  src={logo?.url}
                  alt={`${name} logo`}
                  objectFit="contain"
                  maxH="100%"
                  maxW="100%"
                />
              )}
            </Box>
            <Icon as={ChevronRight} color="app.text.muted" opacity={0.4} />
          </Flex>

          <VStack align="start" gap={1}>
            <Text
              fontSize="sm"
              fontWeight="700"
              color="app.text.primary"
              letterSpacing="-0.01em"
            >
              {name}
            </Text>
            <Text fontSize="xs" color="app.text.muted" lineClamp={1}>
              {appConfig.description || "Launch application"}
            </Text>
          </VStack>

          <Box borderTop="1px solid" borderColor="app.divider" mt={4} pt={3}>
            <Text
              fontSize="2xs"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="app.text.accent"
            >
              Launch App
            </Text>
          </Box>
        </VStack>
      </Box>
    );
  },
);

AppCard.displayName = "AppCard";

// ─── main MyApps ─────────────────────────────────────────────────────────────

function MyApps() {
  const appConfig = useSelector((state: RootState) => state.app.appConfig);
  const error = useSelector((state: RootState) => state.app.error);
  const auth = useSelector((state: RootState) => state.auth);
  const organizations = useSelector((state: RootState) => state.organizations);
  const user_type = useSelector((state: RootState) => state.rbac.user_type);
  // Read raw RBAC state at hook-level so it can be safely closed-over inside useMemo.
  const rbacPermissions = useSelector((state: RootState) => state.rbac.permissions);
  const is_root_user = useSelector((state: RootState) => state.rbac.is_root_user);
  const is_superuser = useSelector((state: RootState) => state.rbac.is_superuser);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const appList = useMemo(() => appConfig?.config?.appList ?? [], [appConfig]);
  const subscribed_apps = useMemo(
    () => organizations?.organization?.subscribed_apps || [],
    [organizations?.organization?.subscribed_apps],
  );

  const filteredApps = useMemo(() => {
    // Inline permission check — rbacPermissions/is_root_user/is_superuser are closed-over
    // from the top-level selectors above, so no hook is called inside this callback.
    const userPerms: string[] = rbacPermissions || [];
    const isPrivileged = is_root_user || is_superuser;

    return appList.filter((app: any) => {
      const app_slug = app.app_slug || app.id;

      // Subscription gate — SYSTEM users bypass it.
      if (!subscribed_apps.includes(app_slug)) {
        if (user_type !== "SYSTEM") return false;
      } else {
        // Permission gate — inline logic, mirrors useAuthorization without calling a hook.
        const required: string[] = app.required_permissions || [];
        if (required.length > 0 && !isPrivileged) {
          const hasAll = required.every((reqPerm) =>
            userPerms.some((p) =>
              p === reqPerm || (p.endsWith(".*") && reqPerm.startsWith(p.slice(0, -2))) || p === "*"
            )
          );
          if (!hasAll) return false;
        }
      }

      return app.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, appList, subscribed_apps, user_type, rbacPermissions, is_root_user, is_superuser]);

  const handleDefaultNavigate = useCallback(
    (e: React.MouseEvent, cfg: any) => {
      e.preventDefault();
      if (!auth?.isAuthenticated) return;

      const organizationName = organizations?.organization?.name ?? "GHOST_ORG";

      const action = cfg.actions?.["onClick"];
      if (action && action in dynamicFunctions) {
        (dynamicFunctions as any)[action](e, cfg);
        return;
      }
      if (cfg.target) {
        navigate(`/${organizationName}${cfg.target}`);
      }
    },
    [auth?.isAuthenticated, organizations?.organization?.name, navigate],
  );

  return (
    <Box p="2">
      <VStack gap={6} align="stretch">
        {/* Header Section */}

        <Box
          // borderRadius={20}
          position="sticky"
          top="-1px"
          zIndex={100}
          bg={"app.card.bg"}
          backdropFilter="blur(12px)"
          borderBottom="1px solid"
          borderColor={useColorModeValue("gray.200", "whiteAlpha.100")}
          py={3}
          px={2}
          boxShadow="sm"
          borderRadius="md"
        >
          {/* <Container maxW="7xl"> */}
          <Flex justify="space-between" align="center" gap={4} wrap="wrap">
            <Flex align="center" gap={3}>
              <Center p={2} bg="brand.500" borderRadius="lg" color="white">
                <Icon as={LayoutGrid} boxSize={5} />
              </Center>
              <VStack align="start" gap={0}>
                <Text fontSize="lg" fontWeight="bold" lineHeight="1.2">
                  My Applications
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Launch your workspace applications
                </Text>
              </VStack>
            </Flex>

            <Box>
              <InputGroup
                flex="1"
                startElement={<Icon as={Search} color="gray.400" />}
              >
                <Input
                  placeholder="Search apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // bg={searchBg}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                  _focus={{
                    borderColor: "brand.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                  }}
                />
              </InputGroup>
            </Box>
          </Flex>
          {/* </Container> */}
        </Box>

        {/* Search Bar */}
        {/* <Box
          position="sticky"
          top="100px"
          zIndex={10}
          bg="app.navbar.bg"
          backdropFilter="blur(16px)"
          borderRadius="full"
          border="1px solid"
          borderColor="app.navbar.border"
          boxShadow="app.shadow.glass-glow"
          px={4}
          py={1.5}
          width="full"
        >
          <InputGroup
            startElement={<FiSearch color="var(--chakra-colors-app-text-accent)" size={18} />}
            width="full"
          >
            <Input
              placeholder="Search your apps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              border="none"
              outline="none"
              px={2}
              fontSize="sm"
              fontWeight="500"
              color="app.text.primary"
              _focus={{ boxShadow: "none", border: "none", outline: "none" }}
              _active={{ border: "none", outline: "none" }}
              _placeholder={{ color: "app.text.muted" }}
            />
          </InputGroup>
        </Box> */}

        {/* Grid Section */}
        {!error && (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} gap={4}>
            {filteredApps.map((app: any, index: number) => (
              <AppCard
                key={index}
                appConfig={app}
                handleNavigate={handleDefaultNavigate}
              />
            ))}
          </SimpleGrid>
        )}

        {filteredApps.length === 0 && !error && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={20}
            opacity={0.6}
          >
            <Icon as={Search} boxSize={10} mb={4} color="app.text.muted" />
            <Text fontWeight="600" color="app.text.primary">
              No apps found
            </Text>
            <Text fontSize="sm" color="app.text.muted">
              Try a different search term
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
}

export default memo(MyApps);
