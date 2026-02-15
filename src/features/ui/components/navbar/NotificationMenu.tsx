import React from "react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  Badge,
  Box,
  Flex,
  Icon,
  IconButton,
  Text,
  useDisclosure,
  Portal,
  Menu,
} from "@chakra-ui/react";
import { MdNotificationsNone } from "react-icons/md";
import { HSeparator } from "../separator/Separator";
import Notifications from "../Notifications/Notifications";

const NotificationMenu: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const notificationsCount = 100;
  let bg = useColorModeValue("white", "gray.950");
  const handleMarkAllRead = () => {
    console.log("Mark all as read");
    // Here you could set notifications to an empty array or any logic you'd like
  };
  return (
    <Menu.Root
      open={open}
      onOpenChange={(e) => (e.open ? onOpen() : onClose())}
    >
      <Menu.Trigger asChild>
        <IconButton aria-label="Notifications" variant="brand" >
          <Box position="relative">
            <Icon boxSize={6} asChild>
              <MdNotificationsNone />
            </Icon>
            {notificationsCount > 0 && (
              <Badge
                position="absolute"
                top="-1rem"
                right="-0.5rem"
                fontSize="xs"
                colorPalette="red"
                borderRadius="full"
                minW="1.25rem"
                h="1.25rem"
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={1}
              >
                {notificationsCount}
              </Badge>
            )}
          </Box>
        </IconButton>
      </Menu.Trigger>
      {open && (
        <Portal>
          <Menu.Positioner>
            <Menu.Content p={4} minW="xs">
              <Flex justify="space-between" align="center" w="100%" mb="4">
                <Text fontSize="md" fontWeight="600">
                  Notifications
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color="brand.500"
                  cursor="pointer"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </Text>
              </Flex>
              <HSeparator mb="2" />
              <Notifications />
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      )}
    </Menu.Root>
  );
};

export default NotificationMenu;
