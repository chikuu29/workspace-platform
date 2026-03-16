import React, { ReactNode } from 'react';
import { useAuthorization } from '@/core/hooks/useAuthorization';

interface RequireAccessProps {
    /** 
     * The permission(s) required to view the children. 
     * Can be a single string or an array of strings. 
     */
    permissions: string | string[];
    
    /** 
     * Whether the user must have ALL provided permissions or just ANY of them. 
     * Default is false (ANY).
     */
    requireAll?: boolean;
    
    /** 
     * The React Node to render if the user does NOT have the required permissions.
     * Default is null (renders nothing).
     */
    fallback?: ReactNode;
    
    /** 
     * The content to render if the user has the required permissions. 
     */
    children: ReactNode;
}

/**
 * A generic UI guard component to conditionally render children based on the user's permissions.
 * Integrates with Redux `rbacSlice` via `useAuthorization` hook.
 */
export const RequireAccess: React.FC<RequireAccessProps> = ({
    permissions,
    requireAll = false,
    fallback = null,
    children
}) => {
    const isAuthorized = useAuthorization(permissions, requireAll);

    if (!isAuthorized) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default RequireAccess;
