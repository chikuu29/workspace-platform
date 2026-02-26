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
import { useEffect, useState } from "react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuSearch, LuLayoutGrid } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import React from "react";

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
                Access your workspace tools
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
        {!error && (
          <>
            {filteredApps.length > 0 ? (

              <AppList apps={filteredApps} handleNavigate={handleDefaultNavigate} />
            ) : (
              <Center flexDir="column" py={20} gap={4}>
                <Icon as={LuSearch} boxSize={12} color="gray.300" />
                <Text color="gray.500" fontWeight="medium">No applications found matching "{searchTerm}"</Text>
              </Center>
            )}
          </>
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
