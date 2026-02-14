import { Steps, Flex, Text, Box, Image, Breadcrumb } from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "../../components/ui/color-mode";
import { useNavigate } from "react-router-dom";
import * as dynamicFunctions from "../../script/myAppsScript";

import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import ErrorComponent from "../../features/components/Error/ErrorComponent";
// import Loader from "../../ui/components/Loader/Loader";

export default function MyApps() {
  console.log("=====MYAPPS====");

  const appConfig = useSelector((state: RootState) => state.app.appConfig);
  // const loading = useSelector((state: RootState) => state.app.loading);
  const error = useSelector((state: RootState) => state.app.error);
  const navigate = useNavigate(); // Move useNavigate here
  const appList = appConfig?.config?.appList || [];
  const auth = useSelector((state: RootState) => state.auth);
  // console.log("error in loadinf app ", error);

  // Handler function for navigation
  const handleDefaultNavigate = (e: React.MouseEvent, appConfig: any) => {
    e.preventDefault();
    console.log("On Click handleNavigate", e);
    console.log("app", appConfig);
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
        if (appConfig.target && appConfig.target !== "") {
          navigate(`/${tenant_name}${appConfig.target}`);

          // navigate('')
          // navigate(`/GymView?app=myGym`);
          // console.log("/GymView?app=myGym");
          // navigate(appConfig.target);
        }
      }
    } else {
      // Handle cases where actions are empty or undefined
      if (appConfig.target && appConfig.target !== "") {
        navigate(`/${tenant_name}${appConfig.target}`);
      }
    }
  };

  // if (loading === "loading") return <Loader loaderText="Loading App Configuration..."/>;
  return (
    <Box p="4">
      <Breadcrumb.Root fontWeight={"bold"}>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator /><Breadcrumb.Item>
            <Breadcrumb.Link href="#">myApps</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      {error && <ErrorComponent errorMessage={error}></ErrorComponent>}
      {!error && (
        <AppList apps={appList} handleNavigate={handleDefaultNavigate} />
      )}
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
      w={{ base: "45%", md: "200px" }}
      // h="250px"
      bg={useColorModeValue("white", "gray.950")}
      p="4"
      borderWidth="1px"
      borderRadius="lg"
      // boxShadow="md"
      boxShadow={"2xl"}
      m="2"
      transition="all 0.3s ease"
      _hover={{
        transform: "scale(1.05)",
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
  <Flex wrap="wrap" justify="center">
    {apps.map((app) => (
      <AppItem
        key={app.name}
        appConfig={app}
        logoConfig={app.logo}
        name={app.name}
        handleNavigate={handleNavigate} // Pass the handler
      />
    ))}
  </Flex>
);
