import { Steps, Box, HStack, VStack, Text } from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { Link, NavLink } from "react-router-dom";
// import DashBoard from "@/features/dashboard/DashBoard";
import * as dynamicFunctions from "@/script/myAppsScript";
// import { IconType } from 'react-icons';
// import * as Icons from 'react-icons/fi';

// import DynamicIcon from "@/utils/app/renderDynamicIcons";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface actions {
  onClick?: any;
  onHover?: any;
}
interface Menu {
  key: string;
  label: string;
  icon: any;
  path: string;
  target?: string;
  actions?: actions;
  // component: any;
}

interface MenuLinkInterFace {
  menuConfig: Menu;
  showFullSideBarMenu: boolean;
}

export default function MenuLink(props: MenuLinkInterFace) {
  const { menuConfig, showFullSideBarMenu } = props;
  const { colorMode } = useColorMode();
  const activeBg = useColorModeValue("#F4F7FE", "#171717");
  const hoverBg = useColorModeValue("secondaryGray.400", "whiteAlpha.200");
  const auth = useSelector((state: RootState) => state.auth);

  const tenant_name = auth?.loginInfo
    ? auth.loginInfo["tenant_name"]
    : "GHOST_TENANT";
  console.log("===TENANT NAME===", tenant_name);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (menuConfig?.actions?.onClick && menuConfig?.actions?.onClick !== "") {
        if (typeof menuConfig.actions["onClick"] == "function") {
          menuConfig.actions["onClick"]();
        } else {
          const actionName = menuConfig.actions["onClick"];
          if (actionName in dynamicFunctions) {
            // Call the dynamic function
            (dynamicFunctions as any)[actionName](e, menuConfig); // Cast to any to access the function
          } else {
            console.log(
              `%c===CHECK YOUR METHOD ${menuConfig.actions["onClick"]}() NOT FOUND IN 'script/myAppsScript'===`,
              "color:red"
            );
          }
        }
      }
    } catch (error) {
      console.log("%c===ERROR===", error);
    }
  };

  const commonProps = {
    align: "center",
    cursor: "pointer",
    w: "full",
    p: 2,
    borderRadius: "md",
    _hover: {
      bg: hoverBg,
    },
  };

  const content = showFullSideBarMenu ? (
    <HStack {...commonProps}>
      {/* <Box as={AsyncLoadIcon(menuConfig.icon)} size="24px" /> */}
      <AsyncLoadIcon iconName={menuConfig.icon} />
      {/* <Box boxSize={"24px"} p={"0px"}><AsyncLoadIcon iconName={menuConfig.icon}/></Box> */}
      <Text fontSize="0.8rem" fontWeight="600" truncate w="full">
        {menuConfig.label}
      </Text>
    </HStack>
  ) : (
    <VStack {...commonProps}>
      {/* <Box as={AsyncLoadIcon(menuConfig.icon)} size="24px" /> */}
      <AsyncLoadIcon iconName={menuConfig.icon} />
      <Text fontSize="0.5rem" fontWeight="600" textAlign="center">
        {menuConfig.label}
      </Text>
    </VStack>
  );
  return menuConfig.path ? (
    menuConfig.target && menuConfig.target !== "" ? (
      <a
        href={`${tenant_name}/${menuConfig.target}`}
        style={{ width: "100%" }}
        target={`${tenant_name}/${menuConfig.target}`}
        rel="noopener noreferrer" // Security recommendation
      >
        {content}
      </a>
    ) : (
      // <Link to={menuConfig.path} style={{ width: "100%" }}>
      //   {content}
      // </Link>

      (<NavLink
        to={`/${tenant_name}${menuConfig.path}`}
        style={({ isActive }) => ({
          background: isActive ? activeBg : "unset",
          borderRadius: "8px",
          // border:isActive?"1px solid #FEEFEE":'unset',
          // color: isActive ? "red" : "black",
          textDecoration: "none", // Optional: to remove underline
        })}
      >
        {content}
      </NavLink>)
    )
  ) : (
    <div style={{ width: "100%" }} onClick={handleClick}>
      {content}
    </div>
  );
}
