import { ReactNode } from "react";

export type SortOrder = "asc" | "desc" | null;

export interface DataTableColumn<T> {
    label: string;
    key: keyof T | string;
    width?: string;
    isSortable?: boolean;
    textAlign?: "left" | "center" | "right";
    renderComponent?: (value: any, row: T) => ReactNode;
    isStatus?: boolean;
    isSearchable?: boolean;
}

export interface DataTableAction<T> {
    label: string;
    icon?: string;
    onClick: (row: T) => void;
    colorPalette?: string;
    isVisible?: (row: T) => boolean;
    isDanger?: boolean;
    requiresConfirm?: boolean;
    confirmMessage?: string;
}

export interface DataTableState {
    page: number;
    pageSize: number;
    searchQuery: string;
    sortBy: string | null;
    sortOrder: SortOrder;
    filters: Record<string, any>;
}

export interface DataTablePagination {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
