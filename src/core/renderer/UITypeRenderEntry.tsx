import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { UITypeRegistry } from "@/core/registry/UITypeRegistry";
import type { SectionRendererProps } from "@/core/renderer/ui-type-renderers/types";

const UITypeRenderEntry: React.FC<SectionRendererProps> = (props) => {
  console.log("UITypeRenderEntry==",props);
  
  const Renderer = UITypeRegistry.resolve(props.component.UI_TYPE);

  if (!Renderer) {
    return (
      <Box p={6} border="1px dashed" borderColor="red.200" borderRadius="xl">
        <Text fontWeight="700" color="red.500">Unregistered UI_TYPE: {props.component.UI_TYPE}</Text>
      </Box>
    );
  }

  return <Renderer {...props} />;
};

export default React.memo(UITypeRenderEntry);
