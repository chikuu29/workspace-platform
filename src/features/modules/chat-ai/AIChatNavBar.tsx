import { useColorModeValue } from "@/components/ui/color-mode";
import { Tooltip } from "@/components/ui/tooltip";
import PanelNavBarAction from "@/features/ui/components/navbar/NavbarActions";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Badge,
  VStack,
  Text,
  HStack,
  Button,
  Separator,
} from "@chakra-ui/react";
import { memo, useState, useEffect } from "react";
import {
  MessageSquare,
  Bot,
  Edit3,
  Share,
  Bookmark,
  BookmarkPlus,
  Settings,
  Download,
  Copy,
  MoreHorizontal,
  MoreVertical,
  PanelLeft,
  History,
  Sparkles,
  Home
} from "lucide-react";
import { useNavigate } from "react-router";

interface AIChatNavBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  chatTitle?: string;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
  onNewChat?: () => void;
}

const AIChatNavBar = ({
  isSidebarOpen,
  onToggleSidebar,
  chatTitle = "New Conversation",
  isBookmarked = false,
  onBookmark,
  onShare,
  onNewChat,
}: AIChatNavBarProps) => {
  // All hooks must be called at the top level, before any conditional logic
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  // Move all useColorModeValue calls to the top level
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const hoverBg = useColorModeValue("gray.50", "gray.800");
  const blueBg = useColorModeValue("blue.50", "blue.900");
  const grayBg = useColorModeValue("gray.50", "gray.800");
  
  const navigate = useNavigate();
  
  // Debug hook order - this should always run
  useEffect(() => {
    // This effect ensures consistent hook ordering
    console.log("AIChatNavBar mounted with props:", { isSidebarOpen, chatTitle, isBookmarked });
  }, [isSidebarOpen, chatTitle, isBookmarked]);
  
  // Additional debug effect to ensure hooks are called in order
  useEffect(() => {
    console.log("AIChatNavBar hooks initialized successfully");
  }, []);
  
  return (
    <Box
      bg={bgColor}
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Flex align="center" justify="space-between" px={4} py={3} maxW="100%">
        {/* Left Section */}
        <HStack gap={3}>
          {/* Sidebar Toggle - only show when sidebar is closed */}
          {!isSidebarOpen && (
            <Tooltip content="Open sidebar">
              <IconButton
                aria-label="Toggle sidebar"
                onClick={onToggleSidebar}
                variant="outline"
                size="sm"
                bg="blue.600/10"
                borderColor="blue.500/30"
                color="blue.500"
                _hover={{ 
                  bg: "blue.500", 
                  color: "white",
                  transform: "translateY(-1px)", 
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)" 
                }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="lg"
              >
                <PanelLeft size={18} />
              </IconButton>
            </Tooltip>
          )}

          {/* New Chat Button - only show when sidebar is closed */}
          {!isSidebarOpen && (
            <>
              <Tooltip content="Start new chat">
                <IconButton
                  aria-label="New chat"
                  onClick={onNewChat}
                  variant="outline"
                  size="sm"
                  bg={useColorModeValue("blue.50", "whiteAlpha.100")}
                  borderColor={useColorModeValue("blue.200", borderColor)}
                  color="blue.500"
                  _hover={{ 
                    bg: "blue.50", 
                    color: "blue.600",
                    borderColor: "blue.200",
                    transform: "translateY(-1px)",
                    boxShadow: "sm"
                  }}
                  borderRadius="lg"
                  transition="all 0.2s"
                >
                  <Edit3 size={20} />
                </IconButton>
              </Tooltip>

              {/* Chat Info */}
              <Box display={{ base: "none", sm: "none", xl: "block" }}>
                <HStack gap={4} flex={1} minW={0}>
                  <Box
                    p={2}
                    borderRadius="xl"
                    bg="blue.500/10"
                    color="blue.500"
                    boxShadow="inner"
                  >
                    <Bot size={18} />
                  </Box>
                  <VStack align="start" gap={0} minW={0}>
                    <Text
                      fontSize="sm"
                      fontWeight="700"
                      color={textColor}
                      letterSpacing="tight"
                      maxW="300px"
                    >
                      {chatTitle}
                    </Text>
                    <HStack gap={1.5} align="center">
                      <Box w={1.5} h={1.5} borderRadius="full" bg="green.400" boxShadow="0 0 8px rgba(72, 187, 120, 0.6)" />
                      <Text fontSize="10px" fontWeight="bold" color={subtextColor} textTransform="uppercase" letterSpacing="widest">
                        Claude 3.5 Sonnet • Stable
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            </>
          )}
        </HStack>

        {/* Right Section */}
        <HStack gap={2}>
          {/* Bookmark Button */}
          <Tooltip content={"Go To Application Home Page"}>
            <IconButton
              aria-label="Go To Application Home Page"
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              // _hover={{ bg: "orange.100" }}
              borderRadius="lg"
              // color={isBookmarked ? "yellow.500" : subtextColor}
              colorPalette={"orange"}
            >
              <Home size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip content={isBookmarked ? "Remove bookmark" : "Bookmark chat"}>
            <IconButton
              aria-label="Bookmark"
              onClick={onBookmark}
              variant="ghost"
              size="sm"
              _hover={{ bg: hoverBg }}
              borderRadius="lg"
              color={isBookmarked ? "yellow.500" : subtextColor}
            >
              {isBookmarked ? (
                <Bookmark size={18} />
              ) : (
                <BookmarkPlus size={18} />
              )}
            </IconButton>
          </Tooltip>

          {/* Share Button */}
          <Tooltip content="Share conversation">
            <Button
              onClick={onShare}
              variant="solid"
              size="sm"
              borderRadius="xl"
              bg="blue.600"
              color="white"
              _hover={{
                bg: "blue.700",
                transform: "translateY(-1px)",
                boxShadow: "0 8px 16px -4px rgba(37, 99, 235, 0.4)",
              }}
              transition="all 0.2s"
              fontWeight="600"
            >
              Share
            </Button>
          </Tooltip>

          <Separator orientation="vertical" height="24px" />

          {/* More Options */}
          <Tooltip content="More options">
            <IconButton
              aria-label="More options"
              variant="ghost"
              size="sm"
              _hover={{ bg: hoverBg }}
              borderRadius="lg"
            >
              <MoreVertical size={18} />
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <PanelNavBarAction />
        </HStack>
      </Flex>

      {/* Optional: Secondary toolbar for additional actions */}
      {/* <Box
        px={4}
        py={2}
        borderTop="1px solid"
        borderColor={borderColor}
        bg={grayBg}
      >
        <HStack gap={2} justify="center">
          <Tooltip content="Download conversation">
            <IconButton
              aria-label="Download"
              variant="ghost"
              size="xs"
              color={subtextColor}
              _hover={{ color: textColor }}
            >
              <FaDownload size={12} />
            </IconButton>
          </Tooltip>

          <Tooltip content="Copy conversation">
            <IconButton
              aria-label="Copy"
              variant="ghost"
              size="xs"
              color={subtextColor}
              _hover={{ color: textColor }}
            >
              <FaCopy size={12} />
            </IconButton>
          </Tooltip>

          <Separator orientation="vertical" height="16px" />

          <Text fontSize="xs" color={subtextColor}>
            Last updated: 2 minutes ago
          </Text>

          <Separator orientation="vertical" height="16px" />

          <Badge size="sm" colorPalette="green" variant="subtle">
            Auto-save enabled
          </Badge>
        </HStack>
      </Box> */}
    </Box>
  );
};

export default memo(AIChatNavBar);
