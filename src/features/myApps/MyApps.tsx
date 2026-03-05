import {
  Box,
  SimpleGrid,
  Text,
  Input,
  Image,
  Flex,
  Icon,
  VStack,
  Center,
  Container
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import * as dynamicFunctions from "../../script/myAppsScript";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { memo, useEffect, useMemo, useState } from "react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuSearch, LuLayoutGrid, LuChevronRight } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import React from "react";
import { FiSearch } from "react-icons/fi";

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

const AppCard: React.FC<AppCardProps> = memo(({ appConfig, handleNavigate }) => {
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
            bg="white"
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 12px rgba(0,0,0,0.08)"
            overflow="hidden"
          >
            <Image
              src={logo?.url}
              alt={`${name} logo`}
              objectFit="contain"
              maxH="100%"
              maxW="100%"
            />
          </Box>
          <Icon as={LuChevronRight} color="app.text.muted" opacity={0.4} />
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
});

AppCard.displayName = "AppCard";

// ─── main MyApps ─────────────────────────────────────────────────────────────

export default function MyApps() {
  const appConfig = useSelector((state: RootState) => state.app.appConfig);
  const error = useSelector((state: RootState) => state.app.error);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const appList = appConfig?.config?.appList || [];
  const [filteredApps, setFilteredApps] = useState<any[]>([]);
  const auth = useSelector((state: RootState) => state.auth);

  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgHeader = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(23, 25, 35, 0.8)");
  const searchBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const filtered = appList.filter(
      (app: any) => app.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApps(filtered);
  }, [searchTerm, appList]);

  const handleDefaultNavigate = (e: React.MouseEvent, appConfig: any) => {
    e.preventDefault();
    if (!auth?.isAuthenticated) return;

    const tenant_name = auth?.loginInfo?.["tenant_name"] || "GHOST_TENANT";

    if (Object.keys(appConfig.actions || {}).length > 0) {
      if (appConfig.actions["onClick"]) {
        const actionName = appConfig.actions["onClick"];
        if (actionName in dynamicFunctions) {
          (dynamicFunctions as any)[actionName](e, appConfig);
        } else {
          console.error(`Method ${actionName} not found`);
        }
      } else if (appConfig.target) {
        navigate(`/${tenant_name}/workspace${appConfig.target}`);
      }
    } else if (appConfig.target) {
      navigate(`/${tenant_name}/workspace${appConfig.target}`);
    }
  };

  return (
    <Box borderRadius={[20, 20, 20, 20]}>
      {/* Sticky Header Section */}
      <Box
        borderRadius={20}
        position="sticky"
        top="-1px"
        zIndex={100}
        // bg={bgHeader}
        backdropFilter="blur(12px)"
        borderBottom="1px solid"
        borderColor={useColorModeValue("gray.200", "whiteAlpha.100")}
        py={1}
        px={6}
        boxShadow="sm"
      >
        {/* <Container maxW="7xl"> */}
        <Flex justify="space-between" align="center" gap={4} wrap="wrap">
          <Flex align="center" gap={3}>
            <Center p={2} bg="brand.500" borderRadius="lg" color="white">
              <Icon as={LuLayoutGrid} boxSize={5} />
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
            <InputGroup flex="1" startElement={<Icon as={LuSearch} color="gray.400" />}>
              <Input
                placeholder="Search apps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={searchBg}
                borderRadius="full"
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)"
                }}
              />
            </InputGroup>
          </Box>
        </Flex>
        {/* </Container> */}
      </Box>

      {/* Main Content */}
      <Box py={4} px={6}>
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
          <Flex direction="column" align="center" justify="center" py={20} opacity={0.6}>
            <Icon as={FiSearch} boxSize={10} mb={4} color="app.text.muted" />
            <Text fontWeight="600" color="app.text.primary">No apps found</Text>
            <Text fontSize="sm" color="app.text.muted">Try a different search term</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}

// Sub-components

interface AppItemProps {
  appConfig: any;
  logoConfig: any;
  name: string;
  handleNavigate: (e: React.MouseEvent, appConfig: any) => void;
}

const AppItem: React.FC<AppItemProps> = ({
  appConfig,
  logoConfig,
  name,
  handleNavigate,
}) => {
  if (appConfig?.hidden) return null;


  // const bgCard = useColorModeValue("rgba(255,255,255,0.95)", "rgba(255,255,255,0.04)");

  // // const bgCard = useColorModeValue("#fff", "transparent");
  // const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  // const hoverBorderColor = useColorModeValue("rgba(99,102,241,0.12)", "rgba(255,255,255,0.08)")
  const cardBg = useColorModeValue("rgba(255,255,255,0.95)", "rgba(255,255,255,0.04)");
  const cardBorder = useColorModeValue("rgba(99,102,241,0.12)", "rgba(255,255,255,0.08)");


  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={cardBorder}
      borderRadius="2xl"
      p={5}
      cursor="pointer"
      transition="all 0.22s cubic-bezier(0.4,0,0.2,1)"
      backdropFilter="blur(8px)"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      _hover={{
        transform: "translateY(-3px)",
        boxShadow: "0 12px 32px rgba(99,102,241,0.18)",
        borderColor: "app.text.accent",
      }}
      onClick={(e) => handleNavigate(e, appConfig)}
    >
      <Flex direction="column" align="center" justify="center" gap={3}>
        <Image
          {...logoConfig?.style}
          src={logoConfig?.url}
          alt={`${name} logo`}
          borderRadius="xl"
        />
        <Text
          fontSize="sm"
          fontWeight={600}
          color="app.text.primary"
          textAlign="center"
          letterSpacing="0.01em"
        >
          {name}
        </Text>
      </Flex>
    </Box>
  );
};

interface AppListProps {
  apps: any[];
  handleNavigate: (e: React.MouseEvent, appConfig: any) => void;
}

const AppList: React.FC<AppListProps> = ({ apps, handleNavigate }) => (
  <SimpleGrid columns={[1, 2, 3, 4]} gap={4}>
    {apps.map((app, index) => (
      <AppItem
        key={index}
        appConfig={app}
        logoConfig={app.logo}
        name={app.name}
        handleNavigate={handleNavigate}
      />
    ))}
  </SimpleGrid>
);
