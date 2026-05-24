import { iconRegistry, type LucideIcon } from "./iconRegistry";
import { normalizeLucideIconName } from "./iconName";

/**
 * Common icon component type. We've migrated to lucide-react.
 */
export type AnyIconComponent = LucideIcon;

/**
 * Curated resolver for Lucide Icons.
 * Provides backwards compatibility for react-icons names used in database configs.
 */
const DynamicIcon = async (iconName: string): Promise<AnyIconComponent> => {
  if (!iconName) return iconRegistry.info;

  try {
    const normalizedName = normalizeLucideIconName(iconName);
    return iconRegistry[normalizedName] || iconRegistry.info;
  } catch (error) {
    console.error(`Failed to resolve icon: ${iconName}`, error);
    return iconRegistry.info;
  }
};

export default DynamicIcon;
