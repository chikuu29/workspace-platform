import { createContext, useContext, ReactNode, forwardRef, useRef } from "react";
import { Box, BoxProps, IconButton } from "@chakra-ui/react";
import { Minimize2 } from "lucide-react";
import { useMaximize as useMaximizeHook, UseMaximizeOptions } from "../hooks/useMaximize";

interface MaximizeContextType {
  isMaximized: boolean;
  toggle: () => void;
}

const MaximizeContext = createContext<MaximizeContextType | undefined>(undefined);

/**
 * useMaximizeContext
 * Hook to retrieve maximization status and toggle function inside MaximizeContainer children.
 */
export const useMaximizeContext = () => {
  const context = useContext(MaximizeContext);
  return context || { isMaximized: false, toggle: () => { } };
};

// Aliased for backward compatibility if any legacy component looks for useMaximize in this file
export const useMaximize = useMaximizeContext;

export interface MaximizeContainerProps extends Omit<BoxProps, "children" | "maxW">, UseMaximizeOptions {
  children: ReactNode | ((props: { isMaximized: boolean; toggle: () => void }) => ReactNode);
  showCloseButton?: boolean;
}

/**
 * MaximizeContainer
 * A layout wrapper that enables maximizing any wrapped card/element to full-viewport size.
 * Uses the useMaximize hook under the hood to manage fullscreen APIs and fallback overlay styles.
 */
export const MaximizeContainer = forwardRef<HTMLDivElement, MaximizeContainerProps>(({
  children,
  controlledIsMaximized,
  onToggle,
  showCloseButton = false,
  maxW = "900px",
  centerContent = true,
  ...props
}, ref) => {
  const localRef = useRef<HTMLDivElement>(null);

  // Combine forwarded ref and local ref
  const setRefs = (node: HTMLDivElement | null) => {
    (localRef as any).current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as any).current = node;
    }
  };

  const { isMaximized, toggle, fullscreenProps, contentWrapperProps } = useMaximizeHook(localRef, {
    controlledIsMaximized,
    onToggle,
    maxW,
    centerContent,
  });

  const content = typeof children === "function" ? children({ isMaximized, toggle }) : children;

  return (
    <MaximizeContext.Provider value={{ isMaximized, toggle }}>
      <Box
        ref={setRefs}
        {...fullscreenProps}
        {...props}
      >
        {isMaximized && showCloseButton && (
          <IconButton
            position="absolute"
            top={4}
            right={4}
            onClick={toggle}
            variant="outline"
            size="sm"
            borderRadius="xl"
            aria-label="Exit fullscreen"
            zIndex={1410}
          >
            <Minimize2 size={16} />
          </IconButton>
        )}
        <Box {...contentWrapperProps}>
          {content}
        </Box>
      </Box>
    </MaximizeContext.Provider>
  );
});

MaximizeContainer.displayName = "MaximizeContainer";
