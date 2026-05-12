import React, { memo } from "react";
import {
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuTrigger
} from "@/components/ui/menu";
import { IconButton, Icon } from "@chakra-ui/react";
import { MoreVertical } from "lucide-react";
import { DataTableAction } from "./types";
import LoadIcon from "../../../utils/hooks/LoadIcon";

interface ActionMenuProps<T> {
    row: T;
    actions: DataTableAction<T>[];
}

/**
 * ActionMenu
 * A dropdown menu for row-level operations.
 * Evaluates 'isVisible' per row to handle role-based or state-based visibility.
 */
function ActionMenu<T>({ row, actions }: ActionMenuProps<T>) {
    const visibleActions = actions.filter(a => !a.isVisible || a.isVisible(row));

    if (visibleActions.length === 0) return null;

    return (
        <MenuRoot positioning={{ placement: "bottom-end" }}>
            <MenuTrigger asChild>
                <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Actions"
                    borderRadius="lg"
                    _hover={{ bg: "whiteAlpha.100", color: "blue.500" }}
                >
                    <MoreVertical size={18} />
                </IconButton>
            </MenuTrigger>
            <MenuContent minW="160px" borderRadius="xl" boxShadow="xl" p={1}>
                {visibleActions.map((action, i) => (
                    <MenuItem
                        key={i}
                        value={action.label}
                        onClick={() => {
                            if (action.requiresConfirm) {
                                if (window.confirm(action.confirmMessage || "Are you sure?")) {
                                    action.onClick(row);
                                }
                            } else {
                                action.onClick(row);
                            }
                        }}
                        color={action.isDanger ? "red.500" : "inherit"}
                        cursor="pointer"
                        borderRadius="lg"
                        gap={3}
                        _hover={{ bg: action.isDanger ? "red.50" : "blue.50/50", color: action.isDanger ? "red.600" : "blue.600" }}
                    >
                        {action.icon && <LoadIcon iconName={action.icon} size="14px" />}
                        {action.label}
                    </MenuItem>
                ))}
            </MenuContent>
        </MenuRoot>
    );
}

export default memo(ActionMenu) as typeof ActionMenu;
