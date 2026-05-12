import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Card,
  Grid,
  GridItem,
  Icon,
  Badge,
  Flex,
  Separator
} from "@chakra-ui/react";
import { Mail, User, Briefcase, Shield, MapPin, Calendar, Pencil } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useColorModeValue } from "@/components/ui/color-mode";

const ProfilePage = () => {
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const organizationName = useSelector(
    (state: RootState) => state.organizations.organization?.name
  );
  const roles = useSelector((state: RootState) => state.rbac.roles);

  const bg = useColorModeValue("white", "app.navbar.bg");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "app.navbar.bg");
  const borderColor = useColorModeValue("gray.100", "app.navbar.border");
  const textMuted = useColorModeValue("gray.500", "app.text.muted");
  const blockBg = useColorModeValue("gray.50", "app.card.border");

  const fullName = userProfile?.full_name || userProfile?.first_name || "Guest User";
  const avatarUrl = userProfile?.profile?.avatar_url || "";
  const email = userProfile?.email || "No email provided";

  return (
    <Box p={{ base: 4, md: 8 }} w="full">
      <Container maxW="container.xl" p={0}>
        <VStack gap={8} align="stretch" w="full">
          {/* Page Header */}
          <Box>
            <Heading size="xl" mb={2} fontWeight="800" letterSpacing="tight">User Profile</Heading>
            <Text color={textMuted} fontSize="md">Manage your personal information, security, and preferences.</Text>
          </Box>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 2.5fr" }} gap={8} w="full">
            {/* Left Column - Identity Card */}
            <GridItem>
              <Card.Root
                bg="app.card.bg"
                borderColor={borderColor}
                borderWidth="1px"
                shadow="md"
                borderRadius="2xl"
                overflow="hidden"
              >
                {/* Banner */}
                <Box
                  h="160px"
                  w="full"
                  bgGradient="to-r"
                  gradientFrom="brand.500"
                  gradientTo="blue.600"
                  position="relative"
                >
                  <Box
                    position="absolute"
                    inset={0}
                    bg="url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtbmgydi0yaDF2Mmgydi0yaDJ2Mmgydi0ySDM2em0wLTh2LTJoMnYtMmgtdjJoMnYtMmgtdjJINzZ6bTAtOHYtMmgydi0yaDF2Mmgydi0yaDJ2MmgtNHYtOEgzNnoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')"
                    opacity={0.5}
                  />
                </Box>

                <Card.Body pt={0} position="relative" zIndex={1}>
                  <Flex direction="column" align="center" mt="-64px" mb={6}>
                    <Box
                      p={1}
                      bg={bg}
                      borderRadius="full"
                      boxShadow="xl"
                      mb={4}
                    >
                      <Avatar.Root size="2xl" boxSize="120px" borderWidth="4px" borderColor={bg}>
                        <Avatar.Fallback name={fullName} colorPalette="brand" fontSize="4xl" fontWeight="bold" />
                        <Avatar.Image src={avatarUrl} />
                      </Avatar.Root>
                    </Box>

                    <VStack gap={1} textAlign="center" w="full">
                      <Heading size="lg" fontWeight="800" letterSpacing="tight">{fullName}</Heading>
                      <Text color={textMuted} fontSize="sm" fontWeight="500">{email}</Text>

                      {roles && roles.length > 0 && (
                        <HStack mt={4} flexWrap="wrap" justify="center" gap={2}>
                          {roles.map((role: string) => (
                            <Badge
                              key={role}
                              colorPalette="brand"
                              variant="subtle"
                              borderRadius="full"
                              px={4}
                              py={1}
                              fontSize="xs"
                              fontWeight="700"
                              textTransform="uppercase"
                              letterSpacing="wider"
                            >
                              {role}
                            </Badge>
                          ))}
                        </HStack>
                      )}
                    </VStack>
                  </Flex>

                  <Separator mb={6} borderColor={borderColor} />

                  <VStack gap={4} align="stretch" w="full">
                    <HStack color={textMuted} fontSize="sm" justify="space-between">
                      <HStack gap={3}><Icon as={MapPin} /><Text>Location</Text></HStack>
                      <Text fontWeight="600" color="inherit">United States</Text>
                    </HStack>
                    <HStack color={textMuted} fontSize="sm" justify="space-between">
                      <HStack gap={3}><Icon as={Briefcase} /><Text>Organization</Text></HStack>
                      <Text fontWeight="600" color="inherit" lineClamp={1} maxW="120px" textAlign="right">{organizationName || "N/A"}</Text>
                    </HStack>
                    <HStack color={textMuted} fontSize="sm" justify="space-between">
                      <HStack gap={3}><Icon as={Calendar} /><Text>Joined</Text></HStack>
                      <Text fontWeight="600" color="inherit">Sep 2023</Text>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </GridItem>

            {/* Right Column - Details & Activity */}
            <GridItem>
              <VStack gap={6} align="stretch" w="full" h="full">

                {/* Personal Information */}
                <Card.Root bg="app.card.bg" borderColor={borderColor} borderWidth="1px" shadow="sm" borderRadius="2xl" flex="1">
                  <Card.Header pb={0} pt={6} px={6}>
                    <Flex justify="space-between" align="center" w="full">
                      <Box>
                        <Heading size="md" fontWeight="800">Personal Information</Heading>
                        <Text color={textMuted} fontSize="sm" mt={1}>Basic info, like your name and photo, that you use on our platform.</Text>
                      </Box>
                      <Box p={2} bg={blockBg} borderRadius="lg" color="brand.500" cursor="pointer" _hover={{ bg: "brand.50" }} transition="all 0.2s">
                        <Icon as={Pencil} boxSize={4} />
                      </Box>
                    </Flex>
                  </Card.Header>
                  <Card.Body px={6} py={6}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <Box p={4} bg={blockBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                        <HStack gap={4} mb={2}>
                          <Box p={2} bg={bg} borderRadius="md" shadow="sm"><Icon as={User} boxSize={4} color="brand.500" /></Box>
                          <Text fontSize="xs" color={textMuted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">Full Name</Text>
                        </HStack>
                        <Text fontWeight="700" fontSize="md" pl={12}>{fullName}</Text>
                      </Box>

                      <Box p={4} bg={blockBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                        <HStack gap={4} mb={2}>
                          <Box p={2} bg={bg} borderRadius="md" shadow="sm"><Icon as={Mail} boxSize={4} color="brand.500" /></Box>
                          <Text fontSize="xs" color={textMuted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">Email Address</Text>
                        </HStack>
                        <Text fontWeight="700" fontSize="md" pl={12}>{email}</Text>
                      </Box>

                      <Box p={4} bg={blockBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                        <HStack gap={4} mb={2}>
                          <Box p={2} bg={bg} borderRadius="md" shadow="sm"><Icon as={Briefcase} boxSize={4} color="brand.500" /></Box>
                          <Text fontSize="xs" color={textMuted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">Organization</Text>
                        </HStack>
                        <Text fontWeight="700" fontSize="md" pl={12}>{organizationName || "N/A"}</Text>
                      </Box>

                      <Box p={4} bg={blockBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                        <HStack gap={4} mb={2}>
                          <Box p={2} bg={bg} borderRadius="md" shadow="sm"><Icon as={Shield} boxSize={4} color="brand.500" /></Box>
                          <Text fontSize="xs" color={textMuted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">Primary Role</Text>
                        </HStack>
                        <Text fontWeight="700" fontSize="md" pl={12} textTransform="capitalize">{roles?.[0] || "User"}</Text>
                      </Box>
                    </Grid>
                  </Card.Body>
                </Card.Root>

              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default ProfilePage;
