import { useState, useMemo, useCallback, useEffect } from "react";
import { SortOrder, DataTableState, DataTablePagination } from "../types";
import { useDebounce } from "./useDebounce";

interface UseDataTableProps<T> {
    data: T[];
    initialState?: Partial<DataTableState>;
    onStateChange?: (state: DataTableState) => void;
}

/**
 * useDataTable
 * A headless hook that manages the complex state of an enterprise data table.
 */
export function useDataTable<T extends Record<string, any>>({
    data,
    initialState,
    onStateChange
}: UseDataTableProps<T>) {
    // 1. Core State
    const [state, setState] = useState<DataTableState>({
        page: 1,
        pageSize: 10,
        searchQuery: "",
        sortBy: null,
        sortOrder: null,
        filters: {},
        ...initialState
    });

    const debouncedSearch = useDebounce(state.searchQuery, 300);

    // 2. Handlers (Stable via useCallback)
    const handleSort = useCallback((key: string) => {
        setState(prev => {
            let nextOrder: SortOrder = "asc";
            if (prev.sortBy === key) {
                if (prev.sortOrder === "asc") nextOrder = "desc";
                else if (prev.sortOrder === "desc") nextOrder = null;
            }
            return {
                ...prev,
                sortBy: nextOrder ? key : null,
                sortOrder: nextOrder,
                page: 1 // Reset to page 1 on sort
            };
        });
    }, []);

    const handleSearch = useCallback((query: string) => {
        setState(prev => ({ ...prev, searchQuery: query, page: 1 }));
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setState(prev => ({ ...prev, page }));
    }, []);

    const handlePageSizeChange = useCallback((pageSize: number) => {
        setState(prev => ({ ...prev, pageSize, page: 1 }));
    }, []);

    const handleFilterChange = useCallback((key: string, value: any) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
            page: 1
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setState(prev => ({ ...prev, filters: {}, searchQuery: "", page: 1 }));
    }, []);

    // 3. Derived Data (Performance-optimized via useMemo)
    const processedData = useMemo(() => {
        let result = [...data];

        // Global Search
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            result = result.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(query)
                )
            );
        }

        // Filtering
        Object.entries(state.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                result = result.filter(item => String(item[key]) === String(value));
            }
        });

        // Sorting
        if (state.sortBy && state.sortOrder) {
            const { sortBy, sortOrder } = state;
            result.sort((a, b) => {
                const valA = a[sortBy];
                const valB = b[sortBy];

                if (valA === valB) return 0;

                const multiplier = sortOrder === "asc" ? 1 : -1;
                return valA > valB ? multiplier : -multiplier;
            });
        }

        return result;
    }, [data, debouncedSearch, state.filters, state.sortBy, state.sortOrder]);

    const paginatedData = useMemo(() => {
        const start = (state.page - 1) * state.pageSize;
        return processedData.slice(start, start + state.pageSize);
    }, [processedData, state.page, state.pageSize]);

    const pagination: DataTablePagination = useMemo(() => ({
        totalCount: processedData.length,
        totalPages: Math.ceil(processedData.length / state.pageSize),
        currentPage: state.page,
        pageSize: state.pageSize
    }), [processedData.length, state.page, state.pageSize]);

    // 4. Persistence Effect
    useEffect(() => {
        onStateChange?.(state);
    }, [state, onStateChange]);

    return {
        state,
        processedData: paginatedData,
        pagination,
        handlers: {
            handleSort,
            handleSearch,
            handlePageChange,
            handlePageSizeChange,
            handleFilterChange,
            clearFilters
        }
    };
}
