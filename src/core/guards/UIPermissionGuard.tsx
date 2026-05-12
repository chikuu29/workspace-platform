/**
 * UIPermissionGuard — Declarative permission-based UI visibility
 *
 * Conditionally renders children or a fallback UI based on the user's
 * current permissions. Evaluated by looking up the code in the rbacSlice.
 *
 * Example:
 *   <UIPermissionGuard permissions={["workspace.project.create"]}>
 *     <CreateProjectButton />
 *   </UIPermissionGuard>
 *
 *   <UIPermissionGuard permissions={["workspace.project.delete"]} fallback={<DisabledButton />}>
 *     <DeleteProjectButton />
 *   </UIPermissionGuard>
 */

import { ReactNode, memo, isValidElement, cloneElement } from "react";
import { useAuthorization } from "@/core/hooks/useAuthorization";

interface UIPermissionGuardProps {
    /** Permission code to check, e.g. "workspace.project.create" */
    
    permissions: string[];
    allowedRootUser?:boolean;
    /** Content to render when the user HAS the permission */
    children: ReactNode;
    /** Optional content to render when the user LACKS the permission */
    fallback?: ReactNode;
    /** Whether to completely hide the children or render them as disabled. Default is "hide". */
    behavior?: "hide" | "disable";
}

/**
 * Conditionally renders children based on a single permission check.
 * Platform users always see the children.
 */
const UIPermissionGuard = memo(
    ({ permissions, allowedRootUser, children, fallback = null, behavior = "hide" }: UIPermissionGuardProps) => {
        const hasPermission = useAuthorization(permissions, allowedRootUser);
        console.debug("UIPermissionGuard", { permissions, hasPermission });
        if (hasPermission) return children;

        if (behavior === "disable") {
            if (isValidElement(children)) {
                return cloneElement(children as React.ReactElement<any>, { disabled: true });
            }
        }

        return fallback;
    }
);

UIPermissionGuard.displayName = "UIPermissionGuard";
export default UIPermissionGuard;
