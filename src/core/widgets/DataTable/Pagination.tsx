import React, { memo } from "react";
import { HStack, Text, Button, Box, Flex } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { DataTablePagination } from "./types";
import { useColorModeValue } from "@/components/ui/color-mode";

interface PaginationProps {
    pagination: DataTablePagination;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

/**
 * Pagination
 * Compact and responsive paginator for desktop and mobile.
 */
function PaginationComponent({ pagination, onPageChange, onPageSizeChange: _onPageSizeChange }: PaginationProps) {
    const { currentPage, totalPages, totalCount, pageSize } = pagination;
    const shellBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const shellBorder = useColorModeValue("gray.100", "whiteAlpha.200");
    const infoColor = useColorModeValue("gray.600", "gray.300");
    const numberColor = useColorModeValue("blue.600", "blue.300");
    const navBg = useColorModeValue("white", "blackAlpha.300");
    const navBorder = useColorModeValue("gray.200", "whiteAlpha.300");
    const indicatorBg = useColorModeValue("linear-gradient(135deg, #EBF4FF 0%, #E6FFFA 100%)", "whiteAlpha.100");
    const indicatorBorder = useColorModeValue("blue.200", "whiteAlpha.300");

    const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalCount);

    return (
        <Flex
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
            mt={5}
            w="full"
            px={{ base: 3, md: 4 }}
            py={3}
            borderRadius="xl"
            bg={shellBg}
            border="1px solid"
            borderColor={shellBorder}
        >
            <Text fontSize="xs" fontWeight="700" color={infoColor} textTransform="uppercase" letterSpacing="wider">
                Showing <Text as="span" color={numberColor}>{startRecord}-{endRecord}</Text> of {totalCount} Records
            </Text>

            <HStack gap={2} justify={{ base: "space-between", md: "flex-end" }}>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || totalPages === 0}
                    borderRadius="full"
                    borderColor={navBorder}
                    bg={navBg}
                    w="36px"
                    minW="36px"
                    h="36px"
                    p={0}
                    _hover={{ bg: "blue.50", borderColor: "blue.300", color: "blue.600", transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                >
                    <LuChevronLeft size="16px" />
                </Button>

                <Box
                    px={4}
                    py={1.5}
                    borderRadius="full"
                    bg={indicatorBg}
                    border="1px solid"
                    borderColor={indicatorBorder}
                    boxShadow={useColorModeValue("0 6px 16px -12px rgba(37, 99, 235, 0.7)", "none")}
                >
                    <Text fontSize="xs" fontWeight="800" color="blue.600">
                        Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
                    </Text>
                </Box>

                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    borderRadius="full"
                    borderColor={navBorder}
                    bg={navBg}
                    w="36px"
                    minW="36px"
                    h="36px"
                    p={0}
                    _hover={{ bg: "blue.50", borderColor: "blue.300", color: "blue.600", transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                >
                    <LuChevronRight size="16px" />
                </Button>
            </HStack>
        </Flex>
    );
}

const Pagination = memo(PaginationComponent);
export default Pagination;
