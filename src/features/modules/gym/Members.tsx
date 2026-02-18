import { Steps, Box, Flex, Avatar, Icon, Heading, HStack, Button, Text, Stack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { FaArrowRight, FaEye, FaUserAlt, FaUserCircle } from "react-icons/fa";
import DynamicIcon from "@/utils/app/renderStaticIcon";
import LoadIcon from "@/utils/hooks/LoadIcon";
import { MdOutlineArrowOutward } from "react-icons/md";

const Members = () => {
  return (
    <>
      <Flex direction="column" align="center" mt={10}>
        <Heading as="h1" size="xl">
          Members
        </Heading>
        <Flex mt={10} flexWrap="wrap" justify="center">
          {Array.from({ length: 10 }).map((_, index) => (
            <MemberCard
              name="Jackson, Hollie"
              membership="3 Month Membership"
              visits="5"
              image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0CCdsYDdVP1OPcaxLih0hYxAgp9TD5XVw-g&s"
              id={1}
            />
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export default Members;

const MemberCard = ({ name, membership, visits, image, id }: any) => (
  // const hoverBgColor = useColorModeValue("gray.200", "gray.600"); // Light mode: gray.200, Dark mode: gray.600

  (<Box
    borderWidth="1px"
    borderRadius="14px"
    p={4}
    m={2}
    textAlign="left"
    w="250px"
    position="relative" // Set position to relative to position the icon absolutely
  >
    <Flex align="center" justify="space-between">
      <Flex align="center">
        <Avatar.Root size="sm"><Avatar.Fallback>{<Icon asChild><FaUserCircle /></Icon>}</Avatar.Fallback><Avatar.Image src={image} /></Avatar.Root>
        <Heading size="sm" ml={2}>
          {name}
        </Heading>
      </Flex>
      {/* View icon positioned at the top right */}

      <Box
        cursor="pointer"
        borderWidth="1px"
        borderRadius="50%" // Makes the box circular
        position="absolute"
        top={2}
        right={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="30px" // Set width for the circular box
        h="30px" // Set height for the circular box
        _hover={{ bg: useColorModeValue("gray.200", "gray.600"), transform: "scale(1.1)" }}
        transition="background 0.2s, transform 0.2s"
      >
        <Icon asChild><MdOutlineArrowOutward /></Icon>
      </Box>
    </Flex>
    <Stack gap={1} flex="1">
      <Text fontWeight="bold" fontSize="sm" color="gray.700">
        {"member.date"} at {"member.time"}
      </Text>
      <Text fontWeight="bold" fontSize="lg" color="gray.900">
        {"member.name"}
      </Text>
      <Text fontSize="sm" color="gray.500">
        {"member.membership"}
      </Text>
      <Stack direction="row" align="center" gap={1} mt={1}>
        <Icon color="gray.500" w={3} h={3}><FaUserAlt /></Icon>
        <Text fontSize="xs" color="gray.500">
          {visits} Visits
        </Text>
      </Stack>
      <Text fontSize="xs" color="gray.400">
        {"member.memberId"}
      </Text>
    </Stack>
  </Box>)
);
