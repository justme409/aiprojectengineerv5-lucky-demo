'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    RoleCode,
    PermissionCode,
    ROLES,
    roleHasPermission,
    getPermissionsForRole,
    getPortalForRole,
    PortalType
} from '@/types/roles';

interface UserRoleState {
    role: RoleCode | null;
    roles: RoleCode[];
    permissions: PermissionCode[];
    loading: boolean;
    error: string | null;
    portalType: PortalType;
}

interface UseUserRoleOptions {
    projectId?: string;
}

/**
 * Hook to fetch and manage user role for a project
 * Returns the user's role, permissions, and helper functions
 */
export function useUserRole(options: UseUserRoleOptions = {}) {
    const { projectId } = options;

    const [state, setState] = useState<UserRoleState>({
        role: null,
        roles: [],
        permissions: [],
        loading: true,
        error: null,
        portalType: 'main',
    });

    const fetchUserRole = useCallback(async () => {
        if (!projectId) {
            setState(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            // Fetch user's role for this project from the project members API
            const response = await fetch(`/api/v1/projects/${projectId}/member/role`, {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Not authenticated'
                    }));
                    return;
                }
                throw new Error('Failed to fetch user role');
            }

            const data = await response.json();
            const role = data.role as RoleCode || ROLES.SITE_ENGINEER; // Default role
            const permissions = getPermissionsForRole(role);
            const portalType = getPortalForRole(role);

            setState({
                role,
                roles: [role],
                permissions,
                loading: false,
                error: null,
                portalType,
            });
        } catch (error) {
            console.error('Error fetching user role:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }));
        }
    }, [projectId]);

    useEffect(() => {
        fetchUserRole();
    }, [fetchUserRole]);

    /**
     * Check if current user has a specific permission
     */
    const hasPermission = useCallback((permission: PermissionCode): boolean => {
        if (!state.role) return false;
        return roleHasPermission(state.role, permission);
    }, [state.role]);

    /**
     * Check if current user has any of the specified permissions
     */
    const hasAnyPermission = useCallback((permissions: PermissionCode[]): boolean => {
        return permissions.some(p => hasPermission(p));
    }, [hasPermission]);

    /**
     * Check if current user has all of the specified permissions
     */
    const hasAllPermissions = useCallback((permissions: PermissionCode[]): boolean => {
        return permissions.every(p => hasPermission(p));
    }, [hasPermission]);

    /**
     * Check if current user has a specific role
     */
    const hasRole = useCallback((role: RoleCode): boolean => {
        return state.role === role;
    }, [state.role]);

    /**
     * Check if user is a client
     */
    const isClient = useCallback((): boolean => {
        return state.role === ROLES.CLIENT;
    }, [state.role]);

    /**
     * Check if user is a subcontractor
     */
    const isSubcontractor = useCallback((): boolean => {
        return state.role === ROLES.SUBCONTRACTOR;
    }, [state.role]);

    /**
     * Check if user is internal staff (engineer, QA, superintendent)
     */
    const isInternalStaff = useCallback((): boolean => {
        return state.role !== null &&
            state.role !== ROLES.CLIENT &&
            state.role !== ROLES.SUBCONTRACTOR;
    }, [state.role]);

    return {
        ...state,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        isClient,
        isSubcontractor,
        isInternalStaff,
        refetch: fetchUserRole,
    };
}

export default useUserRole;
