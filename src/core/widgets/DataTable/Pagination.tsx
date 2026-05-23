import React, { memo } from "react";
import { HStack, Text, Button, Box, Flex } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { DataTablePagination } from "./types";
import { useColorModeValue } from "@/components/ui/color-mode";

interface PaginationProps {
    pagination: DataTablePagination;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

/**
 * Pagination
 * Premium dynamic numeric paginator and rows per page selector.
 */
function PaginationComponent({ pagination, onPageChange, onPageSizeChange }: PaginationProps) {
    const { currentPage, totalPages, totalCount, pageSize } = pagination;
    const shellBorder = useColorModeValue("gray.100", "whiteAlpha.200");
    const infoColor = useColorModeValue("gray.500", "gray.400");
    const numberColor = useColorModeValue("blue.600", "blue.400");

    const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalCount);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);
            
            if (currentPage <= 3) {
                end = 5;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 4;
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", md: "row" }}
            gap={4}
            mt={5}
            w="full"
            px={{ base: 4, md: 5 }}
            py={4}
            borderRadius="2xl"
            bg={"app.card.bg"}
            border="1px solid"
            borderColor={shellBorder}
            // boxShadow="sm"
            wrap="wrap"
        >
            {/* Left: Telemetry Info & Page Size Switcher */}
            <Flex
                align={{ base: "start", sm: "center" }}
                direction={{ base: "column", sm: "row" }}
                gap={{ base: 3, sm: 5 }}
                w={{ base: "full", md: "auto" }}
                justify={{ base: "space-between", md: "flex-start" }}
            >
                <Text fontSize="xs" fontWeight="700" color={infoColor} textTransform="uppercase" letterSpacing="wider">
                    Showing <Text as="span" color={numberColor} fontWeight="900">{startRecord}-{endRecord}</Text> of {totalCount} Records
                </Text>

                <HStack gap={1.5} align="center">
                    <Text fontSize="10px" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                        Per Page:
                    </Text>
                    {[10, 25, 50].map((size) => {
                        const isCurrentSize = pageSize === size;
                        return (
                            <Button
                                key={size}
                                size="xs"
                                variant={isCurrentSize ? "solid" : "subtle"}
                                colorPalette={isCurrentSize ? "blue" : "gray"}
                                borderRadius="lg"
                                fontWeight="900"
                                fontSize="9px"
                                letterSpacing="wide"
                                h="24px"
                                px={2.5}
                                onClick={() => onPageSizeChange(size)}
                                _hover={{ transform: "translateY(-0.5px)" }}
                                transition="all 0.15s"
                            >
                                {size}
                            </Button>
                        );
                    })}
                </HStack>
            </Flex>

            {/* Right: Dynamic Numeric Navigation */}
            <HStack gap={1.5} w={{ base: "full", md: "auto" }} justify={{ base: "center", md: "flex-end" }}>
                <Button
                    size="sm"
                    variant="subtle"
                    colorPalette="gray"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || totalPages === 0}
                    borderRadius="lg"
                    w="32px"
                    minW="32px"
                    h="32px"
                    p={0}
                    _hover={{ bg: "blue.50", color: "blue.600", transform: "scale(1.05)" }}
                    transition="all 0.15s"
                >
                    <ChevronLeft size={15} />
                </Button>

                {/* Ellipsis Start Indicator */}
                {totalPages > 5 && currentPage > 3 && (
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPageChange(1)}
                            borderRadius="lg"
                            w="32px"
                            minW="32px"
                            h="32px"
                            p={0}
                            fontSize="xs"
                            fontWeight="800"
                            _hover={{ bg: "blue.50", color: "blue.600" }}
                        >
                            1
                        </Button>
                        <Box color="gray.400" px={1}>
                            <MoreHorizontal size={14} />
                        </Box>
                    </>
                )}

                {/* Dynamic Page Buttons */}
                {pageNumbers.map((page) => {
                    const isActive = page === currentPage;
                    return (
                        <Button
                            key={page}
                            size="sm"
                            variant={isActive ? "solid" : "ghost"}
                            colorPalette={isActive ? "blue" : "gray"}
                            onClick={() => onPageChange(page)}
                            borderRadius="lg"
                            w="32px"
                            minW="32px"
                            h="32px"
                            p={0}
                            fontSize="xs"
                            fontWeight="800"
                            _hover={!isActive ? { bg: "blue.50", color: "blue.600" } : {}}
                            transition="all 0.15s"
                        >
                            {page}
                        </Button>
                    );
                })}

                {/* Ellipsis End Indicator */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                        <Box color="gray.400" px={1}>
                            <MoreHorizontal size={14} />
                        </Box>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPageChange(totalPages)}
                            borderRadius="lg"
                            w="32px"
                            minW="32px"
                            h="32px"
                            p={0}
                            fontSize="xs"
                            fontWeight="800"
                            _hover={{ bg: "blue.50", color: "blue.600" }}
                        >
                            {totalPages}
                        </Button>
                    </>
                )}

                <Button
                    size="sm"
                    variant="subtle"
                    colorPalette="gray"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    borderRadius="lg"
                    w="32px"
                    minW="32px"
                    h="32px"
                    p={0}
                    _hover={{ bg: "blue.50", color: "blue.600", transform: "scale(1.05)" }}
                    transition="all 0.15s"
                >
                    <ChevronRight size={15} />
                </Button>
            </HStack>
        </Flex>
    );
}

export const Pagination = memo(PaginationComponent);
export default Pagination;
