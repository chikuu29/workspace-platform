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
import { Bell } from "lucide-react";
import { HSeparator } from "../separator/Separator";
import Notifications from "../Notifications/Notifications";

const NotificationMenu: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const notificationsCount = 100;
  const actionBg = useColorModeValue(
    "rgba(255, 255, 255, 0.74)",
    "rgba(15, 23, 42, 0.56)"
  );
  const actionBorder = useColorModeValue(
    "rgba(255, 255, 255, 0.82)",
    "rgba(255, 255, 255, 0.14)"
  );
  const actionShadow = useColorModeValue(
    "0 16px 34px -22px rgba(15, 23, 42, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.72)",
    "0 18px 38px -22px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
  );
  const actionHoverBg = useColorModeValue(
    "rgba(255, 255, 255, 0.92)",
    "rgba(30, 41, 59, 0.72)"
  );
  const actionHoverShadow = useColorModeValue(
    "0 22px 44px -24px rgba(79, 70, 229, 0.58), 0 0 0 1px rgba(99, 102, 241, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    "0 24px 48px -24px rgba(99, 102, 241, 0.42), 0 0 0 1px rgba(129, 140, 248, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.14)"
  );
  const navActionButton = React.useMemo(
    () => ({
      h: { base: "8", sm: "9", md: "12" },
      minW: { base: "8", sm: "9", md: "12" },
      px: 0,
      borderRadius: { base: "lg", sm: "xl", md: "2xl" },
      color: "app.text.primary",
      bg: actionBg,
      border: "1px solid",
      borderColor: actionBorder,
      boxShadow: actionShadow,
      backdropFilter: "blur(18px) saturate(160%)",
      transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        bg: actionHoverBg,
        borderColor: "brand.300",
        transform: "translateY(-2px) scale(1.02)",
        boxShadow: actionHoverShadow,
      },
      _active: {
        transform: "translateY(0) scale(0.98)",
        boxShadow: actionShadow,
      },
      _focusVisible: {
        outline: "2px solid",
        outlineColor: "brand.300",
        outlineOffset: "3px",
      },
    }),
    [actionBg, actionBorder, actionHoverBg, actionHoverShadow, actionShadow]
  );
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
        <IconButton aria-label="Notifications" variant="ghost" size="md" {...navActionButton}>
          <Box position="relative">
            <Icon boxSize={{ base: 5, md: 6 }} as={Bell} />
            {notificationsCount > 0 && (
              <Badge
                position="absolute"
                top={{ base: "-0.75rem", md: "-0.95rem" }}
                right={{ base: "-0.65rem", md: "-0.75rem" }}
                fontSize={{ base: "9px", md: "xs" }}
                colorPalette="red"
                borderRadius="full"
                minW={{ base: "1rem", md: "1.25rem" }}
                h={{ base: "1rem", md: "1.25rem" }}
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

export default React.memo(NotificationMenu);
