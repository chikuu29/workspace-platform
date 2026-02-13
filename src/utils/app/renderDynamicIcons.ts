import { IconType } from "react-icons";

// Create a function to dynamically import icons based on the prefix of the icon name
const DynamicIcon = async (iconName: string): Promise<IconType> => {
  try {
    // Check for Font Awesome icons
    if (iconName.startsWith("Fc")) {
      const iconModule = await import("react-icons/fc");
      const Icon = iconModule[iconName as keyof typeof iconModule] as IconType;
      if (Icon) return Icon;
    }

    // Check for Feather icons
    if (iconName.startsWith("Fi")) {
      const iconModule = await import("react-icons/fi");
      const Icon = iconModule[iconName as keyof typeof iconModule] as IconType;
      if (Icon) return Icon;
    }

    // Check for Chakra UI icons
    if (iconName.startsWith("Icons")) {
      const iconModule = await import("@chakra-ui/icons");
      const Icon = iconModule[iconName as keyof typeof iconModule] as IconType;
      if (Icon) return Icon;
    }

    // Fallback icon if the requested one is not found
    const fallbackModule = await import("react-icons/fc");
    return fallbackModule.FcHighPriority as IconType;

  } catch (error) {
    console.error("Failed to load icon:", error);
    // Return fallback icon in case of any error
    const fallbackModule = await import("react-icons/fc");
    return fallbackModule.FcHighPriority as IconType;
  }
};

export default DynamicIcon;
