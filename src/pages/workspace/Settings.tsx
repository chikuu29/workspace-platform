import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Card,
  Grid,
  GridItem,
  Switch,
  Flex,
  Separator,
  Button
} from "@chakra-ui/react";
import { Bell, Lock, Globe, Smartphone, ShieldCheck, Key } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";

const SettingsPage = () => {
  const bg = useColorModeValue("white", "app.navbar.bg");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.6)", "app.navbar.bg");
  const borderColor = useColorModeValue("gray.100", "app.card.border");
  const textMuted = useColorModeValue("gray.500", "app.text.muted");
  const blockBg = useColorModeValue("gray.50", "app.card.border");

  const securityOptions = [
    {
      title: "Two-Factor Authentication",
      description: "Require a secure code in addition to your password.",
      icon: ShieldCheck,
      toggled: true,
      color: "teal"
    },
    {
      title: "Active Sessions",
      description: "Manage devices where you are currently signed in.",
      icon: Smartphone,
      toggled: false,
      color: "blue"
    },
    {
      title: "Password Rotation",
      description: "Require password changes every 90 days.",
      icon: Key,
      toggled: false,
      color: "purple"
    }
  ];

  const preferenceOptions = [
    {
      title: "Push Notifications",
      description: "Receive alerts for incoming messages and updates.",
      icon: Bell,
      toggled: true,
      color: "orange"
    },
    {
      title: "Language & Region",
      description: "Change language, timezone, and regional formatting.",
      icon: Globe,
      toggled: true,
      color: "green"
    }
  ];

  return (
    <Box p={{ base: 4, md: 8 }} w="full">
      <Container maxW="container.lg" p={0}>
        <VStack gap={10} align="stretch" w="full">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2} fontWeight="800" letterSpacing="tight">Settings</Heading>
            <Text color={textMuted} fontSize="md">Configure your personal application preferences and security boundaries.</Text>
          </Box>

          {/* Security & Privacy */}
          <Box>
            <Heading size="md" fontWeight="800" mb={4}>Security & Privacy</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={4}>
              {securityOptions.map((option, index) => (
                <Card.Root
                  key={index}
                  bg="app.card.bg"
                  backdropFilter="blur(10px)"
                  borderColor={borderColor}
                  borderWidth="1px"
                  shadow="sm"
                  borderRadius="2xl"
                  variant="outline"
                  transition="all 0.2s"
                  _hover={{ shadow: "md", borderColor: useColorModeValue("gray.200", "whiteAlpha.300") }}
                >
                  <Card.Body p={5}>
                    <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={4}>
                      <HStack gap={5}>
                        <Box
                          p={3.5}
                          bg={useColorModeValue(`${option.color}.50`, `rgba(var(--chakra-colors-${option.color}-500), 0.15)`)}
                          color={`${option.color}.500`}
                          borderRadius="xl"
                        >
                          <Icon as={option.icon} boxSize={6} />
                        </Box>
                        <Box>
                          <Heading size="sm" mb={1} fontWeight="700">{option.title}</Heading>
                          <Text fontSize="sm" color={textMuted} fontWeight="500">{option.description}</Text>
                        </Box>
                      </HStack>
                      <Switch.Root defaultChecked={option.toggled} colorPalette={option.color as any} size="lg">
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </Flex>
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
          </Box>

          <Separator borderColor={borderColor} />

          {/* User Preferences */}
          <Box>
            <Heading size="md" fontWeight="800" mb={4}>User Preferences</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={4}>
              {preferenceOptions.map((option, index) => (
                <Card.Root
                  key={index}
                  bg="app.card.bg"
                  backdropFilter="blur(10px)"
                  borderColor={borderColor}
                  borderWidth="1px"
                  shadow="sm"
                  borderRadius="2xl"
                  variant="outline"
                  transition="all 0.2s"
                  _hover={{ shadow: "md", borderColor: useColorModeValue("gray.200", "whiteAlpha.300") }}
                >
                  <Card.Body p={5}>
                    <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={4}>
                      <HStack gap={5}>
                        <Box
                          p={3.5}
                          bg={useColorModeValue(`${option.color}.50`, `rgba(var(--chakra-colors-${option.color}-500), 0.15)`)}
                          color={`${option.color}.500`}
                          borderRadius="xl"
                        >
                          <Icon as={option.icon} boxSize={6} />
                        </Box>
                        <Box>
                          <Heading size="sm" mb={1} fontWeight="700">{option.title}</Heading>
                          <Text fontSize="sm" color={textMuted} fontWeight="500">{option.description}</Text>
                        </Box>
                      </HStack>
                      <Switch.Root defaultChecked={option.toggled} colorPalette={option.color as any} size="lg">
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </Flex>
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
          </Box>

          {/* Global Actions */}
          <Flex justify="flex-end" pt={4}>
            <Button size="lg" colorPalette="brand" borderRadius="xl" px={8} fontWeight="bold" shadow="md">
              Save Changes
            </Button>
          </Flex>

        </VStack>
      </Container>
    </Box>
  );
};

export default SettingsPage;
