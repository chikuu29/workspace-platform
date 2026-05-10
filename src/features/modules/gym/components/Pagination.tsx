/**
 * Pagination.tsx
 *
 * Modern, glassmorphic pagination bar for the member directory.
 * Supports page navigation, page-size selector, and info display.
 *
 * Features:
 *  - First/Prev/Next/Last navigation
 *  - Truncated page-number pills with ellipsis
 *  - Page-size selector (12 | 24 | 48)
 *  - "Showing X–Y of Z" info line
 */
import { memo, useCallback, useMemo } from "react";
import { Box, Button, Flex, HStack, Text, IconButton } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

// ── Types ────────────────────────────────────────────────────────────
export const PAGE_SIZES = [12, 24, 48] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

// ── Page pill builder ────────────────────────────────────────────────
// Returns an array of page numbers + "..." ellipsis markers.
// Keeps first, last, and ±1 around the current page visible.
const buildPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages: (number | "...")[] = [0];

  if (current > 3) pages.push("...");

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 4) pages.push("...");

  pages.push(total - 1);
  return pages;
};

// ── Component ────────────────────────────────────────────────────────

const Pagination = memo(({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");
  const activeBg = useColorModeValue("blue.500", "blue.400");

  const rangeStart = currentPage * pageSize + 1;
  const rangeEnd = Math.min((currentPage + 1) * pageSize, totalItems);
  const isFirst = currentPage === 0;
  const isLast = currentPage >= totalPages - 1;

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const goFirst = useCallback(() => onPageChange(0), [onPageChange]);
  const goPrev = useCallback(() => onPageChange(currentPage - 1), [onPageChange, currentPage]);
  const goNext = useCallback(() => onPageChange(currentPage + 1), [onPageChange, currentPage]);
  const goLast = useCallback(() => onPageChange(totalPages - 1), [onPageChange, totalPages]);

  if (totalItems === 0) return null;

  return (
    <Flex
      align="center"
      justify="space-between"
      direction={{ base: "column", md: "row" }}
      gap={3}
      p={4}
      borderRadius="2xl"
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(16px) saturate(140%)"
    >
      {/* Info */}
      <Text fontSize="xs" color={muted} fontWeight="700" whiteSpace="nowrap">
        Showing{" "}
        <Text as="span" color="app.text.primary" fontWeight="900">{rangeStart}–{rangeEnd}</Text>
        {" "}of{" "}
        <Text as="span" color="app.text.primary" fontWeight="900">{totalItems}</Text>
        {" "}members
      </Text>

      {/* Page pills */}
      <HStack gap={1}>
        <IconButton
          aria-label="First page"
          size="xs"
          variant="ghost"
          disabled={isFirst}
          onClick={goFirst}
          borderRadius="lg"
        >
          <LuChevronsLeft size={14} />
        </IconButton>
        <IconButton
          aria-label="Previous page"
          size="xs"
          variant="ghost"
          disabled={isFirst}
          onClick={goPrev}
          borderRadius="lg"
        >
          <LuChevronLeft size={14} />
        </IconButton>

        {pageNumbers.map((p, idx) =>
          p === "..." ? (
            <Text key={`ellipsis-${idx}`} fontSize="xs" color={muted} px={1} fontWeight="800">
              …
            </Text>
          ) : (
            <Button
              key={p}
              size="xs"
              variant={p === currentPage ? "solid" : "ghost"}
              bg={p === currentPage ? activeBg : undefined}
              color={p === currentPage ? "white" : undefined}
              borderRadius="lg"
              fontWeight="900"
              minW="32px"
              onClick={() => onPageChange(p)}
            >
              {p + 1}
            </Button>
          ),
        )}

        <IconButton
          aria-label="Next page"
          size="xs"
          variant="ghost"
          disabled={isLast}
          onClick={goNext}
          borderRadius="lg"
        >
          <LuChevronRight size={14} />
        </IconButton>
        <IconButton
          aria-label="Last page"
          size="xs"
          variant="ghost"
          disabled={isLast}
          onClick={goLast}
          borderRadius="lg"
        >
          <LuChevronsRight size={14} />
        </IconButton>
      </HStack>

      {/* Page size selector */}
      <HStack gap={1}>
        {PAGE_SIZES.map((size) => (
          <Button
            key={size}
            size="xs"
            variant={pageSize === size ? "solid" : "ghost"}
            colorPalette={pageSize === size ? "blue" : "gray"}
            borderRadius="lg"
            fontWeight="900"
            minW="36px"
            onClick={() => onPageSizeChange(size)}
          >
            {size}
          </Button>
        ))}
      </HStack>
    </Flex>
  );
});

Pagination.displayName = "Pagination";
export default Pagination;
