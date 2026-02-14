import {
  Steps,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Heading,
  Container,
  useBreakpointValue,
  Stack,
} from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { FaPlus, FaFilter, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { HSeparator } from "../separator/Separator";

function MyTable() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const data = [
    { id: 1, name: "John Doe", age: 28, occupation: "Developer" },
    { id: 2, name: "Jane Smith", age: 32, occupation: "Designer" },
    { id: 3, name: "Alice Johnson", age: 24, occupation: "Manager" },
    { id: 4, name: "Mark Davis", age: 45, occupation: "Director" },
  ];
  return (
    // <Box mt={3} mb={3}>
    <Box
      mt={3}
      borderWidth="2px"
      borderRadius="lg"
      borderBottom={"none"}
      // boxShadow="md"
      boxShadow={'2xl'}
      bg={useColorModeValue("white", "gray.950")}
    >
      <Flex padding={2} justify="space-between" align="center">
        <Heading fontSize={"sm"}>I'm a Heading</Heading>
        <Flex>
          <Input
            placeholder="Search by name or location..."
            // width="300px"
            me={2}
          />
          <IconButton aria-label="Filter" colorPalette="gray"><FaFilter /></IconButton>
        </Flex>
      </Flex>
      {!isMobile ? (
        <Table.ScrollArea
          p={0}
          minW="100%" // Full width
          borderBottomRadius="8px"
          border="1px solid #2b6cb0"
          mb={2}
          mt={3}
          maxH="100vh"
          // overflow="hidden"
          overflowY="auto"
          // overflowX="scroll" // Enable horizontal scrolling
        >
          <Table.Root>
            {/* Ensures the table is wide enough for horizontal scrolling */}
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader
                  color="white"
                  position="sticky"
                  top="0"
                  zIndex="1"
                  bg="blue.600"
                >
                  ID
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="white"
                  position="sticky"
                  top="0"
                  zIndex="1"
                  bg="blue.600"
                >
                  Name
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="white"
                  position="sticky"
                  top="0"
                  zIndex="1"
                  bg="blue.600"
                >
                  Start Date
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="white"
                  position="sticky"
                  top="0"
                  zIndex="1"
                  bg="blue.600"
                >
                  End Date
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="white"
                  position="sticky"
                  top="0"
                  zIndex="1"
                  bg="blue.600"
                >
                  Status
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>John Doe</Table.Cell>
                <Table.Cell>30</Table.Cell>
                <Table.Cell>New York</Table.Cell>
                <Table.Cell>30</Table.Cell>
                <Table.Cell>New York</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Jane Smith</Table.Cell>
                <Table.Cell>25</Table.Cell>
                <Table.Cell>Los Angeles</Table.Cell>
                <Table.Cell>30</Table.Cell>
                <Table.Cell>New York</Table.Cell>
              </Table.Row>
              {/* Other rows */}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      ) : (
        <Box p={2}>
          {data.map((item) => (
            <Box
              key={item.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              p={4}
              mb={4}
              // bg="white"
              shadow="md"
            >
              <Box>
                <strong>ID:</strong> {item.id}
              </Box>
              <Box>
                <strong>Name:</strong> {item.name}
              </Box>
              <Box>
                <strong>Age:</strong> {item.age}
              </Box>
              <Box>
                <strong>Occupation:</strong> {item.occupation}
              </Box>
              {/* Action Buttons Section */}
              <Stack direction="row" gap={4} mt={4}>
              {/* View Button */}
              <Button colorPalette="teal"><FaEye />View
                              </Button>

              {/* Edit Button */}
              <Button colorPalette="blue"><FaEdit />Edit
                              </Button>

              {/* Delete Button */}
              <Button colorPalette="red"><FaTrash />Delete
                              </Button>
            </Stack>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default MyTable;
