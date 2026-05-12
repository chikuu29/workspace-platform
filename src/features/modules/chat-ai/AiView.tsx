import { RootState } from "@/app/store";
import {
  Box,
  Text,
  Flex,
  Container,
  IconButton,
  VStack,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router";
import MessageInput from "./MessageInput";
import { User, Bot, ChevronsDown, MessageSquare } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Avatar } from "@/components/ui/avatar";

import { POSTAPI } from "@/app/api";
import { motion, AnimatePresence } from "framer-motion";
import { API_SERVICES } from "@/config/api.config";
import { log } from "console";

// Simplified types
interface Message {
  message?: string; // Added optional message field
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status: "complete" | "thinking" | "streaming";
  thinkingContent?: string;
}

interface StreamData {
  v: any;
  p: string;
  o: string;
}

// Premium animation variants
const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.3, 
      ease: [0.23, 1, 0.32, 1] as any 
    } 
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const MotionHStack = motion.create(HStack);

export default function AIView(params: any) {
  console.log("===CALLING AI VIEW===", params);
  // All useColorModeValue calls at the top
  const scrollTrackColor = useColorModeValue("gray.100", "gray.700");
  const scrollThumbColor = useColorModeValue("gray.300", "gray.600");
  const scrollThumbHoverColor = useColorModeValue("gray.400", "gray.500");
  const userMsgBgColor = useColorModeValue("white", "rgba(30, 41, 59, 0.5)");
  const userMsgTextColor = useColorModeValue("slate.900", "white");
  const assistantMsgTextColor = useColorModeValue("slate.900", "slate.50");
  const inputBorderColor = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(51, 65, 85, 0.5)");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.7)", "rgba(15, 23, 42, 0.7)");
  const glassBorder = useColorModeValue("gray.200", "whiteAlpha.200");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Simplified state - single source of truth
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate unique message ID
  const generateMessageId = () =>
    `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Clear chat function
  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setIsProcessing(false);
  }, []);

  // Main send function
  const send = async (userInput: string, selectedTools: any) => {
    if (isProcessing) {
      console.log("Already processing, ignoring new request");
      return;
    }

    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      message: userInput,
      content: userInput,
      timestamp: new Date().toISOString(),
      status: "complete",
    };

    // Add assistant message in thinking state
    const assistantMessageId = generateMessageId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      status: "thinking",
      thinkingContent: "",
    };

    // Add both messages at once
    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        "http://localhost/ai-api/chat/conversation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userMessage),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        handleStreamChunk(chunk, assistantMessageId);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error during streaming:", error);

        // Update the assistant message with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `❌ Error: ${error.message}`,
                  status: "complete" as const,
                }
              : msg
          )
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle streaming chunks
  const handleStreamChunk = (chunk: string, messageId: string): void => {
    const lines = chunk.split("\n");

    lines.forEach((line) => {
      if (line.startsWith("data: ")) {
        try {
          const data: StreamData = JSON.parse(line.slice(6));
          if (data.p && data.v !== undefined && data.o) {
            handlePathUpdate(data, messageId);
          }
        } catch (e) {
          console.log("Raw data:", line);
        }
      }
    });
  };

  // Handle path updates
  const handlePathUpdate = (data: StreamData, messageId: string): void => {
    const { v: value, p: path, o: operation } = data;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        if (path === "response.thinking_content") {
          const newThinkingContent =
            operation === "APPEND"
              ? (msg.thinkingContent || "") + String(value)
              : String(value);

          return {
            ...msg,
            thinkingContent: newThinkingContent,
            status: "thinking" as const,
          };
        }

        if (path === "response.content") {
          const newContent = msg.content + String(value);

          return {
            ...msg,
            content: newContent,
            status: "streaming" as const,
            thinkingContent: undefined, // Clear thinking content when streaming starts
          };
        }

        return msg;
      })
    );

    // Mark as complete when streaming finishes (you might need to detect this differently)
    // This is a simplified approach - you might want to handle this based on your stream end signal
  };

  // Mark streaming as complete (call this when you detect stream end)
  const markStreamComplete = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status: "complete" as const } : msg
      )
    );
  };

  // Get current status for display
  const getCurrentStatus = () => {
    const processingMessage = messages.find(
      (msg) =>
        msg.role === "assistant" &&
        (msg.status === "thinking" || msg.status === "streaming")
    );

    if (!processingMessage) return null;

    if (processingMessage.status === "thinking") {
      return {
        type: "thinking",
        content: processingMessage.thinkingContent || "AI is thinking...",
      };
    }

    if (processingMessage.status === "streaming") {
      return {
        type: "streaming",
        content: "AI is responding...",
      };
    }

    return null;
  };

  const currentStatus = getCurrentStatus();

  

  return (
    <Flex direction="column" height="100vh" bg={useColorModeValue("gray.50/50", "transparent")}>
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        zIndex={-1} 
        overflow="hidden"
        pointerEvents="none"
      >
        <Box 
          position="absolute" 
          top="-10%" 
          right="-5%" 
          w="40%" 
          h="40%" 
          bg="blue.500/10" 
          filter="blur(120px)" 
          borderRadius="full" 
        />
        <Box 
          position="absolute" 
          bottom="10%" 
          left="-5%" 
          w="30%" 
          h="30%" 
          bg="purple.500/10" 
          filter="blur(100px)" 
          borderRadius="full" 
        />
      </Box>

      {/* Messages Container */}
      <Box
        ref={messagesContainerRef}
        flex="1"
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": {
            width: "8px",
            background: scrollTrackColor,
          },
          "&::-webkit-scrollbar-thumb": {
            background: scrollThumbColor,
            borderRadius: "24px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: scrollThumbHoverColor,
          },
        }}
        // position="relative"
      >
        {/* Status Indicator */}
        <AnimatePresence>
          {currentStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ position: "sticky", top: 12, zIndex: 10, display: "flex", justifyContent: "center" }}
            >
              <HStack
                px={4}
                py={2}
                bg={glassBg}
                backdropFilter="blur(12px)"
                border="1px solid"
                borderColor={glassBorder}
                borderRadius="full"
                boxShadow="xl"
                gap={3}
              >
                <Spinner size="xs" color="blue.400" />
                <Text fontSize="xs" fontWeight="600" letterSpacing="tight" color="blue.400" textTransform="uppercase">
                  {currentStatus.content}
                </Text>
              </HStack>
            </motion.div>
          )}
        </AnimatePresence>

        <Container maxW="4xl" p={4}>
          <VStack align="stretch" gap={8} py={10}>
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => {
                const isAssistant = msg.role === "assistant";

                if (isAssistant && !msg.content && msg.status === "thinking" && !msg.thinkingContent) {
                  return null;
                }

                return (
                  <MotionHStack
                    key={msg.id}
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    align="flex-start"
                    justify={isAssistant ? "flex-start" : "flex-end"}
                    gap={4}
                    w="full"
                  >
                    {isAssistant && (
                      <Box position="relative">
                        <Avatar
                          borderRadius="xl"
                          p={1}
                          size="md"
                          icon={<Bot size={20} />}
                          bg="blue.500"
                          color="white"
                          boxShadow="0 0 20px rgba(59, 130, 246, 0.3)"
                        />
                        {msg.status !== "complete" && (
                          <Box 
                            position="absolute" 
                            inset="-2px" 
                            borderRadius="xl" 
                            border="2px solid" 
                            borderColor="blue.400" 
                            opacity={0.6}
                          />
                        )}
                      </Box>
                    )}

                    <Box
                      bg={!isAssistant ? "blue.600" : glassBg}
                      backdropFilter={isAssistant ? "blur(12px)" : "none"}
                      color={!isAssistant ? "white" : assistantMsgTextColor}
                      px={6}
                      py={4}
                      borderRadius="2xl"
                      borderBottomRightRadius={!isAssistant ? "4px" : "2xl"}
                      borderBottomLeftRadius={isAssistant ? "4px" : "2xl"}
                      maxW="80%"
                      boxShadow={!isAssistant ? "lg" : "sm"}
                      border="1px solid"
                      borderColor={!isAssistant ? "blue.500" : glassBorder}
                      position="relative"
                    >
                      <Text
                        fontSize="md"
                        lineHeight="tall"
                        fontWeight="500"
                      >
                        {msg.status === "thinking" && msg.thinkingContent && (
                          <Text as="span" display="flex" alignItems="center" gap={2} mb={2} color="blue.400" fontSize="xs" fontWeight="bold">
                            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                              🤔 THINKING
                            </motion.span>
                          </Text>
                        )}
                        {msg.thinkingContent || msg.content}
                      </Text>
                      
                      <Text 
                        position="absolute" 
                        bottom="-20px" 
                        right={!isAssistant ? "0" : "auto"}
                        left={isAssistant ? "0" : "auto"}
                        fontSize="10px" 
                        fontWeight="bold" 
                        color="whiteAlpha.400"
                        textTransform="uppercase"
                        letterSpacing="widest"
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Box>

                    {!isAssistant && (
                      <Avatar
                        size="md"
                        borderRadius="xl"
                        bg="purple.500"
                        icon={<User size={18} />}
                        boxShadow="0 0 20px rgba(168, 85, 247, 0.2)"
                      />
                    )}
                  </MotionHStack>
                );
              })}
            </AnimatePresence>

            {/* New Chat Button */}
            {messages.length > 5 && (
              
                <Box textAlign="center" py={4} mb={8}>
                  <IconButton
                    aria-label="New Chat"
                    colorPalette="blue"
                    variant="solid"
                    size="sm"
                    borderRadius="full"
                    px={4}
                    py={2}
                    onClick={clearChat}
                  >
                    <MessageSquare />
                    New Chat
                  </IconButton>
                </Box>
              
            )}
            

            <div ref={messagesEndRef} style={{ height: "20px" }} />
          </VStack>
        </Container>
      </Box>

     
      <Box
        position="sticky"
        bottom={0}
        width="100%"
        display="flex"
        justifyContent="center"
        padding={4}
        borderTop="1px"
        borderColor={inputBorderColor}
        zIndex={10}
      >
        <MessageInput onSend={send} isLoading={isProcessing} messagesContainerRef={messagesContainerRef} />
      </Box>

      {/* Add blink animation for cursor */}
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </Flex>
  );
}
