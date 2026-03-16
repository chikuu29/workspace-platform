
import {
  Box,
  Container,
  Heading,
  Text,

  Icon,
  Input,
  Card,
  Grid,
  GridItem,
  Button,

} from "@chakra-ui/react";
import { FiSearch, FiBookOpen, FiLifeBuoy, FiMessageCircle, FiArrowRight } from "react-icons/fi";
import { useColorModeValue } from "@/components/ui/color-mode";

const HelpCenterPage = () => {

  const borderColor = useColorModeValue("gray.100", "app.card.border");
  const textMuted = useColorModeValue("gray.500", "app.text.muted");

  const supportCards = [
    {
      title: "Knowledge Base",
      description: "Read detailed guides, tutorials, and API documentation to get the most out of our platform.",
      icon: FiBookOpen,
      color: "blue"
    },
    {
      title: "Developer Community",
      description: "Connect with other developers, share solutions, and ask questions in our active forums.",
      icon: FiMessageCircle,
      color: "purple"
    },
    {
      title: "Technical Support",
      description: "Open a support ticket with our engineering team for specialized assistance with your workspace.",
      icon: FiLifeBuoy,
      color: "teal"
    },
  ];

  return (
    <Box w="full" pb={12}>

      {/* Hero Header */}
      <Box
        bgGradient="to-br"
        gradientFrom="brand.600"
        gradientVia="blue.500"
        gradientTo="purple.600"
        color="white"
        py={20}
        px={6}
        position="relative"
        overflow="hidden"
        borderRadius="0 0 40px 40px"
        mb={12}
      >
        <Box
          position="absolute"
          inset={0}
          bg="url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')"
        />
        <Container maxW="container.md" position="relative" zIndex={1} textAlign="center">
          <Heading size="3xl" mb={4} fontWeight="900" letterSpacing="tight">
            How can we help you today?
          </Heading>
          <Text fontSize="xl" opacity={0.9} mb={10} fontWeight="500">
            Search our knowledge base or get in touch with our support channels.
          </Text>

          <Box maxW="lg" mx="auto" position="relative">
            <Box position="absolute" left="20px" top="50%" transform="translateY(-50%)" zIndex={2}>
              <Icon as={FiSearch} color="gray.400" boxSize={6} />
            </Box>
            <Input
              placeholder="Search for articles, guides, or topics..."
              size="xl"
              height="64px"
              pl={16}
              bg="rgba(255, 255, 255, 0.9)"
              color="app.text.primary"
              borderRadius="2xl"
              boxShadow="2xl"
              borderWidth="0"
              fontSize="lg"
              fontWeight="500"
              _placeholder={{ color: "app.text.muted" }}
              _focus={{ ring: 4, ringColor: "brand.300", bg: "white", color: "gray.800" }}
              transition="all 0.2s"
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content Grid */}
      <Container maxW="container.xl" px={6}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
          {supportCards.map((card, idx) => (
            <GridItem key={idx}>
              <Card.Root
                bg="app.card.bg"
                borderColor={borderColor}
                borderWidth="1px"
                shadow="md"
                borderRadius="3xl"
                height="100%"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: "translateY(-8px)",
                  shadow: "xl",
                  borderColor: `${card.color}.200`
                }}
                overflow="hidden"
                display="flex"
                flexDirection="column"
              >
                <Card.Body p={8} flex="1">
                  <Box
                    display="inline-flex"
                    p={4}
                    bg={useColorModeValue(`${card.color}.50`, `rgba(var(--chakra-colors-${card.color}-500), 0.15)`)}
                    color={`${card.color}.500`}
                    borderRadius="2xl"
                    mb={6}
                  >
                    <Icon as={card.icon} boxSize={8} />
                  </Box>
                  <Heading size="lg" mb={3} fontWeight="800" letterSpacing="tight">{card.title}</Heading>
                  <Text color={textMuted} fontSize="md" fontWeight="500" lineHeight="tall" mb={6}>
                    {card.description}
                  </Text>
                </Card.Body>
                <Card.Footer p={8} pt={0}>
                  <Button variant="ghost" colorPalette={card.color as any} alignSelf="flex-start" px={0} _hover={{ bg: "transparent", transform: "translateX(4px)" }} transition="all 0.2s">
                    Learn more <FiArrowRight />
                  </Button>
                </Card.Footer>
              </Card.Root>
            </GridItem>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HelpCenterPage;
