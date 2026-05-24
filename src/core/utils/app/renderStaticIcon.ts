import { type LucideIcon, Info, icons } from "lucide-react";

/**
 * Normalizes icon names from various react-icons formats to Lucide format.
 * Strips common prefixes like Lu, Fi, Md, Fa, etc.
 */
const normalizeIconName = (name: string): string => {
  if (!name) return "";
  
  // List of prefixes to strip
  const prefixes = ["Lu", "Fi", "Md", "Fa", "Io", "Ai", "Tb", "Ci", "Ri", "Gr", "Ti", "Hi", "Bs", "Vsc", "Fc"];
  
  for (const prefix of prefixes) {
    if (name.startsWith(prefix) && name.length > prefix.length) {
      const potentialName = name.substring(prefix.length);
      if (icons[potentialName as keyof typeof icons]) {
        return potentialName;
      }
    }
  }

  // Handle specific manual mappings
  const manualMap: Record<string, string> = {
    "FcHighPriority": "AlertTriangle",
    "FcHome": "Home",
  };

  return manualMap[name] || name;
};

/**
 * Synchronous icon resolver for core components.
 * Provides backwards compatibility for legacy icon names.
 */
const DynamicIcon = (iconName: string): LucideIcon => {
  const normalizedName = normalizeIconName(iconName);
  const IconComponent = icons[normalizedName as keyof typeof icons];
  
  if (!IconComponent) {
    // Try PascalCase fallback
    const pascalName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
    const FallbackIcon = icons[pascalName as keyof typeof icons];
    return FallbackIcon || Info;
  }
  
  return IconComponent;
};

export default DynamicIcon;