import { IconType } from "react-icons";
import { type LucideIcon,Info } from "lucide-react";

/**
 * Common icon component type that covers both react-icons and lucide-react.
 * Both accept a `size` prop, so they are interchangeable at the render site.
 */
type AnyIconComponent = IconType | LucideIcon;

/**
 * Known react-icons library prefixes.
 * If the icon name starts with one of these, it's loaded from the
 * corresponding react-icons sub-package.
 */
const REACT_ICON_PREFIXES: ReadonlyArray<{ prefix: string; module: string }> = [
  { prefix: "Fc", module: "react-icons/fc" },
  { prefix: "Lu", module: "react-icons/lu" },
  { prefix: "Fi", module: "react-icons/fi" },
  { prefix: "Md", module: "react-icons/md" },
  { prefix: "Fa", module: "react-icons/fa" },
  { prefix: "Ri", module: "react-icons/ri" },
];

/**
 * Checks if an icon name belongs to a known react-icons library by prefix.
 */
const getReactIconsModule = (
  iconName: string,
): string | null => {
  for (const entry of REACT_ICON_PREFIXES) {
    if (iconName.startsWith(entry.prefix)) return entry.module;
  }
  return null;
};

/**
 * DynamicIcon — async icon loader supporting two icon libraries:
 *
 * 1. **lucide-react** (default) — bare PascalCase names like `Users`, `Dumbbell`
 * 2. **react-icons**  — prefixed names like `FcHome`, `LuUsers`, `FiCheck`
 *
 * Resolution order:
 *  - If name matches a known prefix → load from react-icons sub-package
 *  - Otherwise → try lucide-react (bare import)
 *  - If both fail → return fallback icon
 */
const DynamicIcon = async (iconName: string): Promise<AnyIconComponent> => {
  try {
    // ── Path 1: react-icons (prefix-based) ─────────────────────────
    const reactIconsModule = getReactIconsModule(iconName);
    if (reactIconsModule) {
      const mod = await import(/* @vite-ignore */ reactIconsModule);
      const Icon = mod[iconName as keyof typeof mod] as IconType | undefined;
      if (Icon) return Icon;
    }

    // ── Path 2: lucide-react (bare PascalCase name) ────────────────
    // Dynamic import of the entire module, then pick the named export.
    // Lucide tree-shakes well and Vite handles this via code-splitting.
    const lucideModule = await import("lucide-react");
    const LucideIcon = lucideModule[
      iconName as keyof typeof lucideModule
    ] as LucideIcon | undefined;
    if (LucideIcon) return LucideIcon;

    // ── Fallback: nothing matched ──────────────────────────────────
    const fallbackModule = await import("react-icons/fc");
    return fallbackModule.FcHighPriority as IconType;
  } catch {
    // Absolute fallback — even module import failed
    try {
      
      return Info as unknown as IconType;
    } catch {
      return (() => null) as unknown as IconType;
    }
  }
};

export default DynamicIcon;
