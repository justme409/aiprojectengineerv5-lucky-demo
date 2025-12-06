'use client';

import { ReactNode } from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import { PermissionCode, RoleCode } from '@/types/roles';

interface PermissionGateProps {
    /** Single permission required */
    permission?: PermissionCode;
    /** Multiple permissions - requires ANY of these */
    anyPermission?: PermissionCode[];
    /** Multiple permissions - requires ALL of these */
    allPermissions?: PermissionCode[];
    /** Specific role required */
    role?: RoleCode;
    /** Any of these roles required */
    anyRole?: RoleCode[];
    /** Project ID for role lookup */
    projectId?: string;
    /** Content to show when user has permission */
    children: ReactNode;
    /** Content to show when user lacks permission */
    fallback?: ReactNode;
    /** If true, show children while loading */
    showWhileLoading?: boolean;
}

/**
 * Component to conditionally render children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission={PERMISSIONS.ITP_APPROVE} projectId={projectId}>
 *   <ApproveButton />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGate anyPermission={[PERMISSIONS.ITP_EDIT, PERMISSIONS.ITP_APPROVE]} projectId={projectId}>
 *   <EditSection />
 * </PermissionGate>
 * 
 * @example
 * // Role-based
 * <PermissionGate role={ROLES.CLIENT} projectId={projectId}>
 *   <ClientOnlyView />
 * </PermissionGate>
 */
export function PermissionGate({
    permission,
    anyPermission,
    allPermissions,
    role,
    anyRole,
    projectId,
    children,
    fallback = null,
    showWhileLoading = false,
}: PermissionGateProps) {
    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        loading,
        role: userRole,
    } = useUserRole({ projectId });

    // While loading, optionally show children or nothing
    if (loading) {
        return showWhileLoading ? <>{children}</> : null;
    }

    // Check permissions
    let hasAccess = true;

    if (permission) {
        hasAccess = hasAccess && hasPermission(permission);
    }

    if (anyPermission && anyPermission.length > 0) {
        hasAccess = hasAccess && hasAnyPermission(anyPermission);
    }

    if (allPermissions && allPermissions.length > 0) {
        hasAccess = hasAccess && hasAllPermissions(allPermissions);
    }

    if (role) {
        hasAccess = hasAccess && hasRole(role);
    }

    if (anyRole && anyRole.length > 0) {
        hasAccess = hasAccess && anyRole.some(r => hasRole(r));
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * HOC to wrap a component with permission requirements
 */
export function withPermission<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    permissionOrOptions: PermissionCode | {
        permission?: PermissionCode;
        anyPermission?: PermissionCode[];
        role?: RoleCode;
    }
) {
    const options = typeof permissionOrOptions === 'string'
        ? { permission: permissionOrOptions }
        : permissionOrOptions;

    return function PermissionWrappedComponent(props: P & { projectId?: string }) {
        return (
            <PermissionGate {...options} projectId={props.projectId}>
                <WrappedComponent {...props} />
            </PermissionGate>
        );
    };
}

export default PermissionGate;
