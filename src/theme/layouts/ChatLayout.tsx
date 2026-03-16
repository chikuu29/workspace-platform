import { Box, Flex } from "@chakra-ui/react";
import { memo, useState, useMemo } from "react";
import { Outlet } from "react-router";

import AIChatSideBar from "@/features/modules/chat-ai/AIChatSideBar";
import AIChatNavBar from "@/features/modules/chat-ai/AIChatNavBar";

const SIDEBAR_WIDTH = "320px";

const ChatLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const contentMargin = useMemo(
    () => (isSidebarOpen ? SIDEBAR_WIDTH : "0"),
    [isSidebarOpen]
  );
  // console.log(contentMargin);

  return (
    <Box h="100vh" w="100vw" overflow="hidden">
      <Flex h="calc(100vh - 64px)" position="relative">
        <AIChatSideBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <Box
          flex="1"
          // color="darkblue"
          ml={contentMargin}
          transition="margin-left 0.3s ease-in-out"
        >
          <AIChatNavBar
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default memo(ChatLayout);
