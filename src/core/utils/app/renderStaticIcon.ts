import { iconRegistry, type LucideIcon } from "./iconRegistry";
import { normalizeLucideIconName } from "./iconName";

/**
 * Synchronous icon resolver for core components.
 * Provides backwards compatibility for legacy icon names.
 */
const DynamicIcon = (iconName: string): LucideIcon => {
  const normalizedName = normalizeLucideIconName(iconName);
  return iconRegistry[normalizedName] || iconRegistry.info;
};

export default DynamicIcon;
