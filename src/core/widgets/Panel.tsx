import React, { useState } from "react";
import { Steps, Box, Button, Collapsible, Text, Flex } from "@chakra-ui/react";
import RunTimeWidgetRender from "./RunTimeWidget";

import PanelNavBarAction from "../../features/ui/components/navbar/NavbarActions";
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
interface PanelConfig {
  name: string;
  text: string;
  hidden: boolean;
  isOpen: boolean;
  widgets: any[];
  layout?: string[];
  styles?: any;
  [key: string]: any;
  additionalComponent?: React.ReactNode;
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
  ...rest
}) => {
  console.log("===CALLING PANEEL===", rest);

  const [open, setIsOpen] = useState(isOpen);

  const togglePanel = () => {
    setIsOpen((prev) => !prev);
  };
  if (hidden) return null;
  return (
    <Box borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
      <Button
        onClick={togglePanel}
        variant="ghost"
        width="100%"
        // bg="navy.400"
        // bg="whiteAlpha.200"
        color="white"
        _hover={{ bg: "navy.400" }}
        // Align text to start
        justifyContent="start">{isOpen ? <LuChevronUp /> : <LuChevronDown />}<Text>{text}</Text></Button>
      {open && (
        <Collapsible.Root open={open}>
          <Collapsible.Content>
            <Box p={2}>
              <Flex
                {...styles}
                justifyContent="flex-start"
                wrap="wrap"
                width="100%"
              >
                <RunTimeWidgetRender configs={widgets} {...styles} {...rest} />
              </Flex>
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </Box>
  );
};

export default CollapsiblePanel;
