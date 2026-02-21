import React, { memo } from "react";
import { Stack, Input, Box, Button } from "@chakra-ui/react";
import { LuSearch, LuX } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import { useColorModeValue } from "@/components/ui/color-mode";

interface FilterPanelProps {
    searchQuery: string;
    onSearch: (query: string) => void;
    onClear: () => void;
    placeholder?: string;
}

/**
 * FilterPanel
 * Responsive search/filter bar used by DataTable.
 */
const FilterPanelComponent: React.FC<FilterPanelProps> = ({
    searchQuery,
    onSearch,
    onClear,
    placeholder = "Search across all records..."
}) => {
    const bg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

    return (
        <Stack direction={{ base: "column", md: "row" }} gap={3} w="full" mb={6}>
            <InputGroup
                flex="1"
                startElement={<LuSearch color="gray.400" />}
                endElement={
                    searchQuery ? (
                        <Box
                            cursor="pointer"
                            onClick={onClear}
                            p={1}
                            borderRadius="full"
                            _hover={{ color: "red.500", bg: "red.50" }}
                            transition="all 0.2s"
                        >
                            <LuX size="14px" />
                        </Box>
                    ) : undefined
                }
            >
                <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    borderRadius="xl"
                    bg={bg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    h="44px"
                    fontSize="sm"
                    fontWeight="600"
                    _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                        bg: useColorModeValue("white", "whiteAlpha.100")
                    }}
                    transition="all 0.2s"
                />
            </InputGroup>

            <Button
                variant="subtle"
                size="sm"
                onClick={onClear}
                disabled={!searchQuery}
                colorPalette="blue"
                borderRadius="xl"
                fontWeight="700"
                px={5}
                h="44px"
                w={{ base: "full", md: "auto" }}
            >
                Clear Filters
            </Button>
        </Stack>
    );
};

const FilterPanel = memo(FilterPanelComponent);
export default FilterPanel;
