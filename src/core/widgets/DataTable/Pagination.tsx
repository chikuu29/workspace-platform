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
 * Premium controls for navigating large datasets.
 */
function PaginationComponent({ pagination, onPageChange }: PaginationProps) {
    const { currentPage, totalPages, totalCount } = pagination;
    const bg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

    return (
        <Flex justify="space-between" align="center" mt={6} w="full">
            <HStack gap={2}>
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Showing <Text as="span" color="blue.500">{Math.min(currentPage * (pagination.pageSize || 10), totalCount)}</Text> of {totalCount} Records
                </Text>
            </HStack>

            <HStack gap={3}>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    borderRadius="xl"
                    borderColor={borderColor}
                    bg={bg}
                    _hover={{ bg: "blue.50/50", borderColor: "blue.200", color: "blue.600" }}
                    transition="all 0.2s"
                >
                    <LuChevronLeft size="16px" />
                </Button>

                <Box px={4} py={1} borderRadius="full" bg="blue.50/50" border="1px solid" borderColor="blue.100">
                    <Text fontSize="xs" fontWeight="800" color="blue.600">
                        Page {currentPage} of {totalPages}
                    </Text>
                </Box>

                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    borderRadius="xl"
                    borderColor={borderColor}
                    bg={bg}
                    _hover={{ bg: "blue.50/50", borderColor: "blue.200", color: "blue.600" }}
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
