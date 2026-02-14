import { Flex, Text, Box, Image, Input, SimpleGrid } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import * as dynamicFunctions from "../../script/myAppsScript";

import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

import { useEffect, useState } from "react";
import { InputGroup } from "@/components/ui/input-group";
import { useColorModeValue } from "@/components/ui/color-mode";
export default function MyApps() {
  console.log("===MyApps===");

  const appConfig = useSelector((state: RootState) => state.app.appConfig);
  // const loading = useSelector((state: RootState) => state.app.loading);
  const error = useSelector((state: RootState) => state.app.error);
  const navigate = useNavigate(); // Move useNavigate here
  const [searchTerm, setSearchTerm] = useState("");
  const appList = appConfig?.config?.appList || [];
  const [filteredApps, setFilteredApps] = useState([]);
  const auth = useSelector((state: RootState) => state.auth);
  // Filter appList based on search input
  useEffect(() => {
    const filtered = appList.filter(
      (app: any) => app.name.toLowerCase().includes(searchTerm.toLowerCase()) // Ensure app has 'name'
    );
    setFilteredApps(filtered);
  }, [searchTerm, appList]); // Dependencies
  // console.log("error in loadinf app ", error);

  // Handler function for navigation
  const handleDefaultNavigate = (e: React.MouseEvent, appConfig: any) => {
    e.preventDefault();
    console.log("On Click handleNavigate", e);
    if (!auth?.isAuthenticated) return;

    const tenant_name = auth?.loginInfo
      ? auth.loginInfo["tenant_name"]
      : "GHOST_TENANT";

    if (Object.keys(appConfig.actions || {}).length > 0) {
      if (appConfig.actions["onClick"] && appConfig.actions["onClick"] !== "") {
        // Handle onClick action if necessary
        const actionName = appConfig.actions["onClick"];
        if (actionName in dynamicFunctions) {
          // Call the dynamic function
          (dynamicFunctions as any)[actionName](e, appConfig); // Cast to any to access the function
        } else {
          console.log("====CHECK YOUR METHOD NAME NOT FOUND====");
        }
      } else {
        console.log(auth);

        if (appConfig.target && appConfig.target !== "") {
          console.log("app", appConfig);
          // navigate('')
          // navigate(`/GymView?app=myGym`);
          // console.log("/GymView?app=myGym");
          navigate(`/${tenant_name}/workspace${appConfig.target}`);
        }
      }
    } else {
      // Handle cases where actions are empty or undefined
      if (appConfig.target && appConfig.target !== "") {
        navigate(`/${tenant_name}/workspace${appConfig.target}`);
      }
    }
  };
  const bgColor = useColorModeValue("#FFFFFF", "gray.950");

  // if (loading === "loading") return <Loader loaderText="Loading App Configuration..."/>;
  return (
    <Box p="4">
      <Box
        // position="sticky"
        position="sticky"
        top={["7.3rem", "64px", "3.8rem"]}
        w="100%"
        bg={bgColor}
        zIndex={999}
        p={2}
        borderRadius={"md"}
        boxShadow={"md"}
      >
        <Input
          placeholder="Search Apps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          border={"none"}
        />
      </Box>
      {/* {error && <ErrorComponent errorMessage={error}></ErrorComponent>} */}

      <Box mt={["7.3rem", "64px", "0.8rem"]}>
        {!error && (
          <AppList apps={filteredApps} handleNavigate={handleDefaultNavigate} />
        )}
      </Box>
    </Box>
  );
}

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
  if (appConfig && appConfig.hidden) return null;
  return (
    <Box
      // w={{ base: "50%", md: "200px" }}
      // h="250px"
      // maxW={'200px'}
      bg={useColorModeValue("white", "gray.950")}
      p="4"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      // boxShadow={"2xl"}
      // m="2"
      transition="all 0.3s ease"
      _hover={{
        transform: "scale(1.02)",
        boxShadow: "xl",
      }}
      onClick={(e) => handleNavigate(e, appConfig)} // Pass the handler
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        // h="full"
        cursor={"pointer"}
      >
        <Image
          {...logoConfig.style}
          src={logoConfig.url}
          alt={`${name} logo`}
        />
        <Text fontSize="sm" fontWeight="bold">
          {name}
        </Text>
      </Flex>
    </Box>
  );
};

interface AppListProps {
  apps: {
    logo: any;
    name: string;
    actions?: any;
    target?: string;
  }[];
  handleNavigate: (e: React.MouseEvent, appConfig: any) => void;
}

const AppList: React.FC<AppListProps> = ({ apps, handleNavigate }) => (
  <SimpleGrid columns={[1, 2, 3, 4]} gap={3} alignItems={'center'}>
    {apps.map((app, index) => (
      <AppItem
        key={index}
        appConfig={app}
        logoConfig={app.logo}
        name={app.name}
        handleNavigate={handleNavigate} // Pass the handler
      />
    ))}
  </SimpleGrid>
);
