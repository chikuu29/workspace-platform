import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate } from "react-router";
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
  Input,
  InputGroup,
} from "@chakra-ui/react";
import { memo, useState } from "react";
import {
  Edit3,
  Search,
  Trash2,
  Calendar,
  Clock,
  Star,
  Bot,
  ChevronDown,
  ChevronRight,
  Filter,
  History,
  X,
  MoreVertical,
  Pin,
  PanelLeft,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

interface AIChatSideBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

interface ChatItem {
  id: number;
  title: string;
  timestamp: string;
  isPinned?: boolean;
  isStarred?: boolean;
  preview?: string;
}

interface ChatGroup {
  [key: string]: ChatItem[];
}

const AIChatSideBar = ({
  isSidebarOpen,
  onToggleSidebar,
}: AIChatSideBarProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Today", "Yesterday"]));
  
  const bgColor = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(15, 23, 42, 0.8)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const hoverBg = useColorModeValue("rgba(241, 245, 249, 0.5)", "rgba(30, 41, 59, 0.5)");
  const textColor = useColorModeValue("slate.900", "white");
  const subtextColor = useColorModeValue("slate.500", "slate.400");
  const activeBg = useColorModeValue("blue.50", "whiteAlpha.100");

  // Organized chat history with better structure
  const chatHistory: ChatGroup = {
    "Pinned": [
      { 
        id: 101, 
        title: "Important Project Discussion", 
        timestamp: "2 hours ago",
        isPinned: true,
        preview: "Let's discuss the Q4 roadmap and key deliverables..."
      },
      { 
        id: 102, 
        title: "Code Review Session", 
        timestamp: "1 day ago",
        isPinned: true,
        preview: "Need to review the authentication module changes..."
      }
    ],
    "Today": [
      { 
        id: 1, 
        title: "Database Optimization Query", 
        timestamp: "1 hour ago",
        preview: "How can I optimize my PostgreSQL queries for better performance?"
      },
      { 
        id: 2, 
        title: "React Component Design", 
        timestamp: "3 hours ago",
        isStarred: true,
        preview: "Best practices for creating reusable React components..."
      },
      { 
        id: 3, 
        title: "API Integration Help", 
        timestamp: "5 hours ago",
        preview: "Need help integrating third-party payment API..."
      }
    ],
    "Yesterday": [
      { 
        id: 4, 
        title: "Docker Container Setup", 
        timestamp: "1 day ago",
        preview: "Steps to containerize my Node.js application..."
      },
      { 
        id: 5, 
        title: "CSS Grid Layout", 
        timestamp: "1 day ago",
        preview: "Creating responsive layouts with CSS Grid..."
      }
    ],
    "This Week": [
      { 
        id: 6, 
        title: "Machine Learning Basics", 
        timestamp: "3 days ago",
        preview: "Introduction to neural networks and deep learning..."
      },
      { 
        id: 7, 
        title: "Security Best Practices", 
        timestamp: "4 days ago",
        preview: "Implementing security measures in web applications..."
      },
      { 
        id: 8, 
        title: "Performance Monitoring", 
        timestamp: "5 days ago",
        preview: "Tools and techniques for application performance monitoring..."
      }
    ],
    "Last Week": [
      { 
        id: 9, 
        title: "GraphQL vs REST API", 
        timestamp: "1 week ago",
        preview: "Comparing GraphQL and REST API architectures..."
      },
      { 
        id: 10, 
        title: "Cloud Deployment Guide", 
        timestamp: "1 week ago",
        preview: "Deploying applications to AWS, Azure, and GCP..."
      }
    ]
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredHistory = Object.entries(chatHistory).reduce((acc, [group, chats]) => {
    const filtered = chats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {} as ChatGroup);
  return (
    <Box
      w="320px"
      bg={bgColor}
      backdropFilter="blur(20px)"
      borderRight="1px solid"
      borderColor={borderColor}
      h="100vh"
      position="absolute"
      left="0"
      top="0"
      transform={isSidebarOpen ? "translateX(0)" : "translateX(-100%)"}
      transition="transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow="2xl"
      zIndex={1000}
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <Flex alignItems="center" justify="space-between" mb={6}>
          <HStack gap={3}>
            <Box 
              p={2.5} 
              borderRadius="xl" 
              bg="blue.500/10"
              color="blue.500"
              boxShadow="inner"
            >
              <Bot size={22} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="md" fontWeight="800" color={textColor} letterSpacing="tight">
                AI CO-PILOT
              </Text>
              <Text fontSize="10px" fontWeight="bold" color="blue.400" letterSpacing="0.1em">
                PRO VERSION
              </Text>
            </VStack>
          </HStack>
          
          <IconButton
            aria-label="Close sidebar"
            onClick={onToggleSidebar}
            variant="ghost"
            size="xs"
            color={subtextColor}
            _hover={{ bg: hoverBg, color: textColor }}
          >
            <X size={16} />
          </IconButton>
        </Flex>

        {/* New Chat Button */}
        <Button
          w="100%"
          bg="blue.600"
          _hover={{ bg: "blue.700", transform: "translateY(-1px)", boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)" }}
          size="md"
          borderRadius="xl"
          fontWeight="600"
          fontSize="sm"
          onClick={() => navigate("c")}
          transition="all 0.2s"
          color="white"
        >
          <Edit3 size={18} />
          New Conversation
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
        <InputGroup>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="lg"
            // leftElement={<CiSearch color={subtextColor} />}
          />
        </InputGroup>
      </Box>

      {/* Chat History */}
      <Box flex="1" overflowY="auto">
        <VStack align="stretch" gap={0} p={2}>
          {Object.entries(filteredHistory).map(([groupName, chats]) => (
            <Box key={groupName} w="100%">
              {/* Group Header */}
              <Button
                variant="ghost"
                size="sm"
                w="100%"
                justifyContent="space-between"
                onClick={() => toggleGroup(groupName)}
                py={3}
                px={3}
                borderRadius="lg"
                _hover={{ bg: hoverBg }}
              >
                <HStack gap={2}>
                  <Text fontSize="sm" fontWeight="semibold" color={subtextColor}>
                    {groupName}
                  </Text>
                  <Badge size="sm" variant="subtle">
                    {chats.length}
                  </Badge>
                </HStack>
                {expandedGroups.has(groupName) ? 
                  <ChevronDown size={12} /> : 
                  <ChevronRight size={12} />
                }
              </Button>

              {/* Chat Items */}
              <AnimatePresence>
                {expandedGroups.has(groupName) && (
                  <VStack align="stretch" gap={3} p={3} mt={1}>
                    {chats.map((chat) => (
                      <MotionBox
                        key={chat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        p={4}
                        borderRadius="xl"
                        cursor="pointer"
                        bg={activeBg}
                        border="1px solid"
                        borderColor={borderColor}
                        transition={{ duration: 0.2 }}
                        position="relative"
                        overflow="hidden"
                        role="group"
                        _hover={{ 
                          bg: hoverBg,
                          borderColor: "blue.500/50",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 24px -8px rgba(0,0,0,0.2)"
                        }}
                      >
                        {/* Active/Hover Glow */}
                        <Box 
                          position="absolute"
                          left="0"
                          top="0"
                          bottom="0"
                          w="3px"
                          bg="blue.500"
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                        />

                        <Flex justify="space-between" align="start" mb={2}>
                          <HStack gap={2} flex={1} minW={0}>
                            {chat.isPinned && (
                              <Pin size={12} color="orange" />
                            )}
                            {chat.isStarred && (
                              <Star size={12} color="gold" />
                            )}
                            <Text 
                              fontSize="sm" 
                              fontWeight="600" 
                              color={textColor}
                              flex={1}
                              letterSpacing="tight"
                            >
                              {chat.title}
                            </Text>
                          </HStack>
                          
                          <IconButton
                            aria-label="More options"
                            size="xs"
                            variant="ghost"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            color={subtextColor}
                          >
                            <MoreVertical size={14} />
                          </IconButton>
                        </Flex>
                        
                        {chat.preview && (
                          <Text 
                            fontSize="xs" 
                            color={subtextColor}
                            lineHeight="tall"
                            mb={3}
                            opacity={0.8}
                          >
                            {chat.preview}
                          </Text>
                        )}
                        
                        <HStack justify="space-between" align="center">
                          <HStack gap={2}>
                            <Box 
                              p={1} 
                              borderRadius="md" 
                              bg="whiteAlpha.100"
                              color={subtextColor}
                            >
                              <Clock size={10} />
                            </Box>
                            <Text fontSize="10px" fontWeight="bold" color={subtextColor} textTransform="uppercase">
                              {chat.timestamp}
                            </Text>
                          </HStack>
                          {chat.isStarred && (
                            <Badge variant="subtle" colorPalette="orange" size="sm" borderRadius="md" px={1.5} fontSize="9px">
                              PRIORITY
                            </Badge>
                          )}
                        </HStack>
                      </MotionBox>
                    ))}
                  </VStack>
                )}
              </AnimatePresence>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Footer */}
      <Box p={4} borderTop="1px solid" borderColor={borderColor}>
        <HStack justify="space-between">
          <Text fontSize="xs" color={subtextColor}>
            {Object.values(chatHistory).flat().length} conversations
          </Text>
          <HStack gap={1}>
            <IconButton
              aria-label="Settings"
              size="xs"
              variant="ghost"
              color={subtextColor}
            >
              <Filter size={14} />
            </IconButton>
            <IconButton
              aria-label="Clear history"
              size="xs"
              variant="ghost"
              color={subtextColor}
            >
              <Trash2 size={14} />
            </IconButton>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default memo(AIChatSideBar);