import { IconType } from "react-icons";

// Create a function to dynamically import icons based on the prefix of the icon name
const DynamicIcon = async (iconName: string): Promise<IconType> => {
  try {
    // Check for Flat Color icons
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

    // Check for Remix icons
    if (iconName.startsWith("Ri")) {
      const iconModule = await import("react-icons/ri");
      const Icon = iconModule[iconName as keyof typeof iconModule] as IconType;
      if (Icon) return Icon;
    }

    // Fallback icon if the requested one is not found or module fails to load
    const fallbackModule = await import("react-icons/fc");
    return fallbackModule.FcHighPriority as IconType;

  } catch (error) {
    console.error("Failed to load icon:", error, "Requested:", iconName);
    // Return fallback icon in case of any error
    try {
      const fallbackModule = await import("react-icons/fc");
      return fallbackModule.FcHighPriority as IconType;
    } catch (e) {
      // Return a very basic component as an absolute fallback
      return (() => null) as unknown as IconType;
    }
  }
};

export default DynamicIcon;
