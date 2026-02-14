import {
  Steps,
  Box,
  VStack,
  Heading,
  Stack,
  HStack,
  List,
  Button,
  Text,
  IconButton,
  Container,
  Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { FaCheckCircle } from "react-icons/fa";
import CustomModal from "../../../features/components/CustomModel/CostomModal";
import AddMember from "./AddMember";
import RevenuAnalytics from "./RevenuAnalytics";
import { useState } from "react";
import { LuSettings } from 'react-icons/lu';

const Subscription = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleSubmit = () => {
    console.log("Modal submitted");
    closeModal();
  };
  return (
    <Box py={12}>
      <IconButton
        variant={"solid"}
        aria-label="Settings"
        colorPalette="blue"
        position="fixed"
        // Center vertically
        top="30%"
        // Position from the right edge
        right="20px"
        // Adjust to perfectly center
        transform="translateY(-50%)"
        // Keep it on top of other elements
        zIndex="1000"
        // Size of the button
        size="lg"
        // Makes the button round
        borderRadius="12px"
        // bg={useColorModeValue("white", "gray.950")}
        onClick={() => console.log("Settings clicked!")}><Icon as={LuSettings} style={{ animation: "spin 2s linear infinite" }} /></IconButton>
      <CustomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        size="sm" // Set size here (e.g., 'sm', 'lg', etc.)
        title="Custom Modal Title"
        onSubmit={handleSubmit}
        children={<RevenuAnalytics />}
      ></CustomModal>
      <VStack gap={2} textAlign="center">
        <Heading as="h1" fontSize="4xl">
          Plans that fit your business
        </Heading>
        <Text fontSize="lg" color={"gray.500"}>
          Start with 14-day free trial. No credit card needed. Cancel at
          anytime.
        </Text>
      </VStack>
      <Stack
        direction={{ base: "column", md: "row" }}
        textAlign="center"
        justify={"center"}
        flexWrap={"wrap"}
        py={10}
      >
        <PriceWrapper>
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl">
              Hobby
            </Text>
            <HStack justifyContent="center">
              <Text fontSize="3xl" fontWeight="600">
                $
              </Text>
              <Text fontSize="5xl" fontWeight="900">
                79
              </Text>
              <Text fontSize="3xl" color="gray.500">
                /month
              </Text>
            </HStack>
          </Box>
          <VStack
            bg={useColorModeValue("gray.50", "gray.700")}
            py={4}
            borderBottomRadius={"xl"}
          >
            <List.Root gap={3} textAlign="start" px={12}>
              <List.Item>
                <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                unlimited build minutes
              </List.Item>
              <List.Item>
                <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                Lorem, ipsum dolor.
              </List.Item>
              <List.Item>
                <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                5TB Lorem, ipsum dolor.
              </List.Item>
            </List.Root>
            <Box w="80%" pt={7}>
              <Button w="full" colorPalette="red" variant="outline">
                Start trial
              </Button>
            </Box>
          </VStack>
        </PriceWrapper>

        <PriceWrapper>
          <Box position="relative">
            <Box
              position="absolute"
              top="-16px"
              left="50%"
              style={{ transform: "translate(-50%)" }}
            >
              <Text
                textTransform="uppercase"
                bg={useColorModeValue("red.300", "red.700")}
                px={3}
                py={1}
                color={useColorModeValue("gray.900", "gray.300")}
                fontSize="sm"
                fontWeight="600"
                rounded="xl"
              >
                Most Popular
              </Text>
            </Box>
            <Box py={4} px={12}>
              <Text fontWeight="500" fontSize="2xl">
                Growth
              </Text>
              <HStack justifyContent="center">
                <Text fontSize="3xl" fontWeight="600">
                  $
                </Text>
                <Text fontSize="5xl" fontWeight="900">
                  149
                </Text>
                <Text fontSize="3xl" color="gray.500">
                  /month
                </Text>
              </HStack>
            </Box>
            <VStack
              bg={useColorModeValue("gray.50", "gray.700")}
              py={4}
              borderBottomRadius={"xl"}
            >
              <List.Root gap={3} textAlign="start" px={12}>
                <List.Item>
                  <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                  unlimited build minutes
                </List.Item>
                <List.Item>
                  <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                  Lorem, ipsum dolor.
                </List.Item>
                <List.Item>
                  <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                  5TB Lorem, ipsum dolor.
                </List.Item>
                <List.Item>
                  <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                  5TB Lorem, ipsum dolor.
                </List.Item>
                <List.Item>
                  <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                  5TB Lorem, ipsum dolor.
                </List.Item>
              </List.Root>
              <Box w="80%" pt={7}>
                <Button w="full" colorPalette="red">
                  Start trial
                </Button>
              </Box>
            </VStack>
          </Box>
        </PriceWrapper>
        <PriceWrapper>
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl">
              Scale
            </Text>
            <HStack justifyContent="center">
              <Text fontSize="3xl" fontWeight="600">
                $
              </Text>
              <Text fontSize="5xl" fontWeight="900">
                349
              </Text>
              <Text fontSize="3xl" color="gray.500">
                /month
              </Text>
            </HStack>
          </Box>
          <VStack
            bg={useColorModeValue("gray.50", "gray.700")}
            py={4}
            borderBottomRadius={"xl"}
          >
            <List.Root gap={3} textAlign="start" px={12}>
              <List.Item>
                <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                unlimited build minutes
              </List.Item>
              <List.Item>
                <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                Lorem, ipsum dolor.
              </List.Item>
              <List.Item>
                <List.Indicator color="green.500" asChild><FaCheckCircle /></List.Indicator>
                5TB Lorem, ipsum dolor.
              </List.Item>
            </List.Root>
            <Box w="80%" pt={7}>
              <Button w="full" colorPalette="red" variant="outline">
                Start trial
              </Button>
            </Box>
          </VStack>
        </PriceWrapper>
      </Stack>
    </Box>
  );
};

interface Props {
  children: React.ReactNode;
}
function PriceWrapper(props: Props) {
  const { children } = props;

  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor={useColorModeValue("gray.200", "gray.500")}
      borderRadius={"xl"}
    >
      {children}
    </Box>
  );
}

export default Subscription;
