import { IconType } from "react-icons";
// import * as FaIcons from "react-icons/fa";
// import * as FiIcons from "react-icons/fi";
import * as FcIcons from "react-icons/fc";
// import * as IconsIcons from "@chakra-ui/icons";
const allIcons = {
  // ...FaIcons,
  // ...FiIcons,
  ...FcIcons,
  // ...IconsIcons
};

const DynamicIcon = (iconName: string): IconType => {
  const IconComponent = allIcons[iconName as keyof typeof allIcons] as IconType;
  if (!IconComponent) {
    // throw new Error(`Icon "${iconName}" not found in any library`);
    const FallbackIcon = allIcons[
      "FcHighPriority" as keyof typeof allIcons
    ] as IconType;
    return FallbackIcon

  }
  return IconComponent;
};

export default DynamicIcon;