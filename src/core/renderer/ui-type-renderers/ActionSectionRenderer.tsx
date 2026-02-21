import React from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";
import type { SectionRendererProps } from "./types";

const ActionSectionRenderer: React.FC<SectionRendererProps> = ({ component, resolveActions }) => {
  const actions = resolveActions(component.actionRef, component.id);

  return (
    <Box {...(component.layout || {})}>
      {component.title && <Text fontSize="lg" fontWeight="800" mb={4}>{component.title}</Text>}
      <HStack justify="end" gap={3}>
        {actions.map((action) => (
          <Button key={`${component.id}-${action.label}`} colorPalette={action.colorPalette || "blue"} onClick={() => action.onClick({})}>
            {action.label}
          </Button>
        ))}
      </HStack>
    </Box>
  );
};

export default React.memo(ActionSectionRenderer);
