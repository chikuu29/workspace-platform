import { useNavigate } from "react-router";
import { Box, Button, Heading } from "@chakra-ui/react";

const AuthorizePage = () => {
  const navigate = useNavigate();

  const handleAuthorize = () => {
    // Generate a fake authorization code
    const authCode = "xyz123";

    // Redirect to callback with authCode
    // navigate(`/callback?code=${authCode}`);s
  };

  return (
    <Box textAlign="center" mt="10">
      <Heading>Authorize Access</Heading>
      <Button colorScheme="green" mt="4" onClick={handleAuthorize}>
        Authorize
      </Button>
    </Box>
  );
};

export default AuthorizePage;
