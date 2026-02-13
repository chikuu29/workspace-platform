import { Steps, Alert, Box, Button } from '@chakra-ui/react';


interface ErrorComponentProps {
    error?: string | null;
    errorMessage:string // The error message to display; can be `null` if no error
    retry?: () => void; // Function to retry the action that caused the error
  }
  
const ErrorComponent = ({ error, retry, errorMessage }:ErrorComponentProps) => {
//   if (!error) return null; // Do not render if there's no error

  return (
    <Box mt={4} px={4} py={2}>
      <Alert.Root
        status="error"
        variant='subtle'
        borderRadius="md"
        borderStartWidth='3px'
        borderStartColor='colorPalette.solid'>
        <Alert.Indicator />
        <Box flex="1">
          <Alert.Title>{errorMessage}</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Box>
        <Button colorPalette="red" size="sm" onClick={retry} ml="auto">
          Retry
        </Button>
      </Alert.Root>
    </Box>
  );
};

export default ErrorComponent;
