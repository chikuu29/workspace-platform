import { type LucideIcon, Info, icons } from "lucide-react";

/**
 * Common icon component type. We've migrated to lucide-react.
 */
export type AnyIconComponent = LucideIcon;

/**
 * Normalizes icon names from various react-icons formats to Lucide format.
 * Strips common prefixes like Lu, Fi, Md, Fa, etc.
 * Example: "LuUsers" -> "Users", "FiSearch" -> "Search"
 */
const normalizeIconName = (name: string): string => {
  if (!name) return "";
  
  // List of prefixes to strip (ordered by length descending)
  const prefixes = ["Lu", "Fi", "Md", "Fa", "Io", "Ai", "Tb", "Ci", "Ri", "Gr", "Ti", "Hi", "Bs", "Vsc"];
  
  for (const prefix of prefixes) {
    if (name.startsWith(prefix) && name.length > prefix.length) {
      const potentialName = name.substring(prefix.length);
      // Check if the stripped name exists in Lucide
      if (icons[potentialName as keyof typeof icons]) {
        return potentialName;
      }
    }
  }

  // Handle some manual mappings if necessary
  const manualMap: Record<string, string> = {
    "FaPlus": "Plus",
    "FaFilter": "Filter",
    "FaEdit": "Pencil",
    "FaEye": "Eye",
    "FaTrash": "Trash2",
    "MdNotificationsNone": "Bell",
    "IoShieldCheckmarkOutline": "ShieldCheck",
    "AiTwotoneCloseCircle": "CircleX",
    "TbLockAccess": "Lock",
    "SiAuthelia": "ShieldCheck", // Brand fallback
    "FcHome": "Home",
    "FcHighPriority": "AlertTriangle",
  };

  if (manualMap[name]) return manualMap[name];

  return name;
};

/**
 * Optimized Dynamic Loader for Lucide Icons.
 * Provides backwards compatibility for react-icons names used in database configs.
 */
const DynamicIcon = async (iconName: string): Promise<AnyIconComponent> => {
  if (!iconName) return Info;

  try {
    const normalizedName = normalizeIconName(iconName);
    const LucideIcon = icons[normalizedName as keyof typeof icons];

    if (LucideIcon) return LucideIcon;

    // Fallback for names that might already be in Lucide format but didn't match case
    // (Lucide uses PascalCase)
    const pascalName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
    const FallbackIcon = icons[pascalName as keyof typeof icons];
    
    if (FallbackIcon) return FallbackIcon;

    return Info;
  } catch (error) {
    console.error(`Failed to resolve icon: ${iconName}`, error);
    return Info;
  }
};

export default DynamicIcon;
