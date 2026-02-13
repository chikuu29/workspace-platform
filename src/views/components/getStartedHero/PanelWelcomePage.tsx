
import { Steps, Container, Heading, Text, Button } from '@chakra-ui/react';

const WelcomePage = () => {
  return (
    <Container maxW="container.lg" textAlign="center" mt={20}>
      <Heading as="h1" size="2xl" mb={6}>Welcome to Our Platform</Heading>
      <Text fontSize="xl" mb={8}>We're excited to have you on board! Discover what awaits you.</Text>
      <Button colorPalette="blue" size="lg">Get Started</Button>
    </Container>
  );
};

export default WelcomePage;
