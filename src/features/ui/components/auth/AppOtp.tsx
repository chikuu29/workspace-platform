import {
  Steps,
  Center,
  Box,
  Heading,
  Stack,
  Input,
  Button,
  Text,
  PinInput,
  HStack,
  Flex,
} from "@chakra-ui/react";

import { useColorModeValue } from "@/components/ui/color-mode";

const AppOtp = () => {
  //   const bgColor = useColorModeValue("gray.100", "gray.800");
  //   const boxBg = useColorModeValue("white", "gray.700");
  let bgColor = useColorModeValue("white", "gray.950");
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      zIndex="9999"
      bg="rgba(0, 0, 0, 0.8)"
    >
      <Center height="100vh">
        <Box
          bg={bgColor}
          w={"100%"}
          p={8}
          borderRadius="8px"
          boxShadow="lg"
          width="full"
          maxW="sm"
          textAlign="center"
        >
          <Heading mb={4} fontSize="2xl">
            Enter OTP
          </Heading>
          <Text mb={6} color="gray.500">
            We’ve sent an OTP to your registered email.
          </Text>
          <Stack gap={4}>
            <HStack>
              <PinInput.Root size="lg"><PinInput.HiddenInput />






                <PinInput.Control><PinInput.Input index={0} /><PinInput.Input index={1} /><PinInput.Input index={2} /><PinInput.Input index={3} /><PinInput.Input index={4} /><PinInput.Input index={5} /></PinInput.Control></PinInput.Root>
            </HStack>

            {/* <PinInput mask/> */}
            <Button colorPalette="teal" size="lg" variant={'outline'}>
              Verify
            </Button>
          </Stack>
        </Box>
      </Center>
    </Box>
  );
};

export default AppOtp;
