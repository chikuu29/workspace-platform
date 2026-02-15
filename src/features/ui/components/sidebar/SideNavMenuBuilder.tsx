import { VStack, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import React from "react";
import MenuLink from "./components/MenuLink";
import { HSeparator } from "../separator/Separator";

import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
// import { APP_STATE } from "../../../types/appConfigInterface";

interface SideNavPropsType {
  showFullSideBarMenu: boolean;
}
export default function SideNavMenuBuilder(props: SideNavPropsType) {
  console.log("%c ==== EXECUTE SIDENAVMENU BUILDER ====", "color:green");
  const { showFullSideBarMenu } = props;
  let textColor = useColorModeValue("secondaryGray.500", "white");
  const { FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );
  if (FEATURE.length == 0) {
    console.log("NO FEATURE AVAILBLE");
    return null;
  }
  return (
    <VStack
      gap={3}
      w="full"
      align={showFullSideBarMenu ? "stretch" : "center"}
    >
      {FEATURE.map((menu: any, index: number) => (
        <React.Fragment key={index}>
          {menu.isMaster ? (
            <MenuLink
              menuConfig={menu}
              showFullSideBarMenu={props.showFullSideBarMenu}
            />
          ) : (
            <>
              {props.showFullSideBarMenu && (
                <>
                  <Text fontSize="0.8rem" pl={3} color={textColor}>
                    {menu.label}
                  </Text>
                  <HSeparator mb="5px" />
                </>
              )}

              {menu.menu && menu.menu.map((subMenu: any, index: number) => (
                <React.Fragment key={index}>
                  <MenuLink
                    menuConfig={subMenu}
                    showFullSideBarMenu={props.showFullSideBarMenu}
                  />
                </React.Fragment>
              ))}
            </>
          )}
        </React.Fragment>
      ))}
    </VStack>
  );
}
