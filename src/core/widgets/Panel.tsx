import React, { useState } from "react";
import { Box, Collapsible, Text, HStack, Icon, SimpleGrid } from "@chakra-ui/react";
import RunTimeWidgetRender from "../renderer/RunTimeWidget";
import * as Icons from "react-icons/lu";

interface PanelConfig {
  name: string;
  text: string;
  hidden: boolean;
  isOpen: boolean;
  widgets: any[];
  layout?: string[];
  styles?: any;
  iconName?: string;
  columns?: number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
  rowGap?: number | string;
  [key: string]: any;
}

const CollapsiblePanel: React.FC<PanelConfig> = ({
  name,
  text,
  hidden,
  isOpen,
  layout,
  widget,
  styles,
  widgets,
  iconName,
  columns,
  gap,
  rowGap,
  ...rest
}) => {
  const [open, setIsOpen] = useState(isOpen ?? true);

  const togglePanel = () => {
    setIsOpen((prev: boolean) => !prev);
  };

  if (hidden) return null;

  const IconComponent = iconName ? (Icons as any)[iconName] : null;

  return (
    <Box w="full" mb={6}>
      <HStack
        onClick={togglePanel}
        cursor="pointer"
        gap={2}
        mb={4}
        userSelect="none"
        _hover={{ "& .panel-icon": { transform: "scale(1.2)" } }}
      >
        {IconComponent ? (
          <Icon as={IconComponent} color="cyan.400" size="md" className="panel-icon" transition="transform 0.2s" />
        ) : (
          <Box w="4px" h="14px" bg="cyan.400" borderRadius="full" />
        )}
        <Text
          fontSize="xs"
          fontWeight="800"
          textTransform="uppercase"
          letterSpacing="widest"
          color="cyan.400"
        >
          {text}
        </Text>
        <Box flex={1} h="1px" bg="rgba(6,182,212,0.1)" ml={2} />
      </HStack>

      <Collapsible.Root open={open}>
        <Collapsible.Content>
          <Box pl={IconComponent ? 6 : 0}>
            <SimpleGrid
              columns={columns || { base: 1, md: 2 }}
              gap={gap || 6}
              rowGap={rowGap}
              w="full"
            >
              <RunTimeWidgetRender configs={widgets} {...rest} />
            </SimpleGrid>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};

export default CollapsiblePanel;
