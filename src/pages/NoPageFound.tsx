// NotFound.js
import React from "react";
import { Steps, Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
// import { useHistory } from 'react-router-dom';

const NoPageFound = () => {
  // const history = useHistory();

  // const handleGoHome = () => {
  //     history.push('/'); // Change this to your home route
  // };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
    >
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, teal.400, teal.600)"
        backgroundClip="text"
      >
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Page Not Found
      </Text>
      <Text color={"gray.500"} mb={6}>
        The page you&apos;re looking for does not seem to exist
      </Text>
      <Button
        colorPalette="teal"
        bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
        color="white"
        variant="solid"
        asChild><Link to={'/myApps'}>Go to Home
              </Link></Button>
    </Box>
  );
};

export default NoPageFound;
