import React from "react";
import { Box, Heading, Text, Button, Container, VStack, Icon } from "@chakra-ui/react";
import { Link } from "react-router";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuGhost } from "react-icons/lu";

const NoPageFound = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const color = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("teal.500", "teal.300");

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bg={bg}
    >
      <Container maxW="container.md" textAlign="center">
        <VStack gap={6}>
          <Box position="relative">
            <Icon as={LuGhost} boxSize="150px" color="teal.100" />
            <Heading
              as="h1"
              fontSize="9xl"
              fontWeight="extrabold"
              color={headingColor}
              lineHeight="1"
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              opacity={0.8}
            >
              404
            </Heading>
          </Box>

          <VStack gap={3}>
            <Heading as="h2" size="xl" fontWeight="bold">
              Page Not Found
            </Heading>
            <Text fontSize="lg" color={color} maxW="md" mx="auto">
              Oops! It looks like you've stumbled into the unknown.
              The page you're looking for doesn't exist or has been moved.
            </Text>
          </VStack>

          <Button
            asChild
            size="lg"
            colorPalette="teal"
            variant="solid"
            fontWeight="bold"
            px={8}
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <Link to="/myApps">Take Me Home</Link>
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default NoPageFound;
