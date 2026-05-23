import React, { memo } from "react";
import { Stack, Input, Box } from "@chakra-ui/react";
import { Radar, Search, X } from "lucide-react";
import { InputGroup } from "@/components/ui/input-group";
import { useColorModeValue } from "@/components/ui/color-mode";

interface FilterPanelProps {
    searchQuery: string;
    onSearch: (query: string) => void;
    onClear: () => void;
    placeholder?: string;
}

const FilterPanelComponent: React.FC<FilterPanelProps> = ({
    searchQuery,
    onSearch,
    onClear,
    placeholder = "Search across all records..."
}) => {
    const bg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

    return (
        <Stack
            direction={{ base: "column", md: "row" }}
            gap={3}
            w="full"
            mb={3}
        >
            <InputGroup
                flex="1"
                startElement={<Radar  size={16} color="blue" />}
                endElement={
                    searchQuery ? (
                        <Box
                            cursor="pointer"
                            onClick={onClear}
                            p={1}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            _hover={{
                                color: "red.500",
                                bg: "red.50"
                            }}
                            transition="all 0.2s"
                        >
                            <X size={14} />
                        </Box>
                    ) : null
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
                    pr="40px"
                    _focus={{
                        borderColor: "blue.500",
                        boxShadow:
                            "0 0 0 1px var(--chakra-colors-blue-500)",
                        bg: useColorModeValue(
                            "white",
                            "whiteAlpha.100"
                        )
                    }}
                    transition="all 0.2s"
                />
            </InputGroup>
        </Stack>
    );
};

const FilterPanel = memo(FilterPanelComponent);

export default FilterPanel;