import { IconType } from "react-icons";
import { type LucideIcon, Info } from "lucide-react";

/**
 * Common icon component type that covers both react-icons and lucide-react.
 */
export type AnyIconComponent = IconType | LucideIcon;

/**
 * Optimized Dynamic Loader for Vite.
 * Explicit imports are required for Vite to trace and bundle modules.
 */
const DynamicIcon = async (iconName: string): Promise<AnyIconComponent> => {
  if (!iconName) return Info as AnyIconComponent;

  try {
    // ── Path 1: react-icons (prefixed names) ─────────────────────────
    const prefix = iconName.substring(0, 2);

    switch (prefix) {
      case "Lu": {
        const mod = await import("react-icons/lu");
        return mod[iconName as keyof typeof mod] as IconType;
      }
      case "Fc": {
        const mod = await import("react-icons/fc");
        return mod[iconName as keyof typeof mod] as IconType;
      }
      case "Fi": {
        const mod = await import("react-icons/fi");
        return mod[iconName as keyof typeof mod] as IconType;
      }
      case "Md": {
        const mod = await import("react-icons/md");
        return mod[iconName as keyof typeof mod] as IconType;
      }
      case "Fa": {
        const mod = await import("react-icons/fa");
        return mod[iconName as keyof typeof mod] as IconType;
      }
      case "Ri": {
        const mod = await import("react-icons/ri");
        return mod[iconName as keyof typeof mod] as IconType;
      }
    }

    // ── Path 2: lucide-react (bare names / fallback) ────────────────
    // We import the whole lucide-react module dynamically. 
    // Vite handles this efficiently via tree-shaking and chunks.
    const lucideMod = await import("lucide-react");
    const LucideIcon = lucideMod[iconName as keyof typeof lucideMod] as LucideIcon;

    if (LucideIcon) return LucideIcon;

    return Info as AnyIconComponent;
  } catch (error) {
    console.error(`Failed to load icon: ${iconName}`, error);
    return Info as AnyIconComponent;
  }
};

export default DynamicIcon;
