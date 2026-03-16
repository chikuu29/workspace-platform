import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

/**
 * Hook to check if the current user has specific permissions.
 * Supports exact matches and wildcard matches (e.g., 'SYSTEM.*' or '*').
 * 
 * @param requiredPermissions - A single permission string or an array of permission strings to check.
 * @param requireAll - If true, the user must have ALL the required permissions. If false, ANY required permission is sufficient. default: false.
 * @returns boolean indicating if the user is authorized.
 */
export function useAuthorization(
    requiredPermissions: string | string[],
    requireAll: boolean = false
): boolean {
    const permissions = useSelector((state: RootState) => state.rbac.permissions);

    return useMemo(() => {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;

        const reqPermsArray = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];

        // Ensure user permissions array exists
        const userPerms = permissions || [];

        // Global admin wildcard check
        if (userPerms.includes('*')) return true;

        const checkPermission = (reqPerm: string) => {
            return userPerms.some((userPerm: string) => {
                // Exact match
                if (userPerm === reqPerm) return true;

                // Wildcard match on user permission (e.g. user has 'SYSTEM.*', reqPerm is 'SYSTEM.ADD')
                if (userPerm.endsWith('.*')) {
                    const prefix = userPerm.slice(0, -2); // remove '.*'
                    return reqPerm.startsWith(prefix);
                }

                return false;
            });
        };

        if (requireAll) {
            return reqPermsArray.every(checkPermission);
        } else {
            return reqPermsArray.some(checkPermission);
        }
    }, [requiredPermissions, permissions, requireAll]);
}
