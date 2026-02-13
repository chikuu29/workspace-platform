import React from "react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import {
  Steps,
  Badge,
  Box,
  Flex,
  Icon,
  IconButton,
  Menu,
  Text,
  useDisclosure,
  Portal,
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
    <Menu.Root onOpen={onOpen} onClose={onClose}>
      <IconButton aria-label={"Notifications"} variant='outline' asChild><Box position="relative">
        <Icon boxSize={6} asChild><MdNotificationsNone /></Icon>
        {notificationsCount > 0 && (
          <Badge
            position="absolute"
            top="-19px"
            right="-1px"
            fontSize="0.7em"
            colorPalette="red"
            borderRadius="full"
            boxSize="1.25rem"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {notificationsCount}
          </Badge>
        )}
      </Box></IconButton>
      {/* Render MenuList only when isOpen is true */}
      {isOpen && (
        <Portal><Menu.Positioner><Menu.Content>
              <Flex justify="space-between" w="100%" mb="20px">
                <Text fontSize="md" fontWeight="600">
                  Notifications
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  // color="blue.500"
                  ms="auto"
                  cursor="pointer"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </Text>
              </Flex>
              <HSeparator mb="5px" />
              <Notifications></Notifications>
            </Menu.Content></Menu.Positioner></Portal>
      )}
    </Menu.Root>
  );
};

export default NotificationMenu;
