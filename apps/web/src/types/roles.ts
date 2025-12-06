/**
 * Portal Role Constants
 * 
 * Defines roles and permissions for client/subcontractor portals.
 * These align with the project_members and roles tables in Postgres.
 */

// Role codes (should match roles.code in Postgres)
export const ROLES = {
    CLIENT: 'client',
    SUBCONTRACTOR: 'subcontractor',
    SITE_ENGINEER: 'site_engineer',
    QA_MANAGER: 'qa_manager',
    SUPERINTENDENT: 'superintendent',
    ADMIN: 'admin',
} as const;

export type RoleCode = typeof ROLES[keyof typeof ROLES];

// Permission codes
export const PERMISSIONS = {
    // ITP Template permissions
    ITP_VIEW: 'itp:view',
    ITP_APPROVE: 'itp:approve',
    ITP_EDIT: 'itp:edit',

    // Inspection Point permissions
    INSPECTION_CHECK_SUBCONTRACTOR: 'inspection:check:subcontractor',
    INSPECTION_CHECK_ENGINEER: 'inspection:check:engineer',
    INSPECTION_APPROVE_QA: 'inspection:approve:qa',
    INSPECTION_UPLOAD: 'inspection:upload',

    // Hold Point permissions
    HOLD_POINT_REQUEST: 'holdpoint:request',
    HOLD_POINT_RELEASE: 'holdpoint:release',

    // Witness Point permissions
    WITNESS_POINT_REQUEST: 'witnesspoint:request',
    WITNESS_POINT_NOTIFY: 'witnesspoint:notify',

    // Lot permissions
    LOT_VIEW: 'lot:view',
    LOT_EDIT: 'lot:edit',
    LOT_CREATE: 'lot:create',

    // Document permissions
    DOCUMENT_VIEW: 'document:view',
    DOCUMENT_UPLOAD: 'document:upload',

    // NCR permissions
    NCR_VIEW: 'ncr:view',
    NCR_CREATE: 'ncr:create',
    NCR_RESOLVE: 'ncr:resolve',

    // Approval permissions
    APPROVAL_VIEW: 'approval:view',
    APPROVAL_DECIDE: 'approval:decide',

    // Management Plan permissions
    PLAN_VIEW: 'plan:view',
    PLAN_APPROVE: 'plan:approve',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-to-Permission mapping
export const ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
    [ROLES.CLIENT]: [
        PERMISSIONS.ITP_VIEW,
        PERMISSIONS.ITP_APPROVE,
        PERMISSIONS.HOLD_POINT_RELEASE,
        PERMISSIONS.LOT_VIEW,
        PERMISSIONS.DOCUMENT_VIEW,
        PERMISSIONS.NCR_VIEW,
        PERMISSIONS.APPROVAL_VIEW,
        PERMISSIONS.APPROVAL_DECIDE,
        PERMISSIONS.PLAN_VIEW,
        PERMISSIONS.PLAN_APPROVE,
    ],

    [ROLES.SUBCONTRACTOR]: [
        PERMISSIONS.ITP_VIEW,
        PERMISSIONS.INSPECTION_CHECK_SUBCONTRACTOR,
        PERMISSIONS.INSPECTION_UPLOAD,
        PERMISSIONS.HOLD_POINT_REQUEST,
        PERMISSIONS.WITNESS_POINT_REQUEST,
        PERMISSIONS.LOT_VIEW,
        PERMISSIONS.LOT_EDIT,
        PERMISSIONS.DOCUMENT_VIEW,
        PERMISSIONS.DOCUMENT_UPLOAD,
        PERMISSIONS.NCR_VIEW,
    ],

    [ROLES.SITE_ENGINEER]: [
        PERMISSIONS.ITP_VIEW,
        PERMISSIONS.ITP_EDIT,
        PERMISSIONS.INSPECTION_CHECK_ENGINEER,
        PERMISSIONS.INSPECTION_UPLOAD,
        PERMISSIONS.HOLD_POINT_REQUEST,
        PERMISSIONS.WITNESS_POINT_REQUEST,
        PERMISSIONS.WITNESS_POINT_NOTIFY,
        PERMISSIONS.LOT_VIEW,
        PERMISSIONS.LOT_EDIT,
        PERMISSIONS.LOT_CREATE,
        PERMISSIONS.DOCUMENT_VIEW,
        PERMISSIONS.DOCUMENT_UPLOAD,
        PERMISSIONS.NCR_VIEW,
        PERMISSIONS.NCR_CREATE,
        PERMISSIONS.APPROVAL_VIEW,
        PERMISSIONS.PLAN_VIEW,
    ],

    [ROLES.QA_MANAGER]: [
        PERMISSIONS.ITP_VIEW,
        PERMISSIONS.ITP_EDIT,
        PERMISSIONS.ITP_APPROVE,
        PERMISSIONS.INSPECTION_CHECK_ENGINEER,
        PERMISSIONS.INSPECTION_APPROVE_QA,
        PERMISSIONS.INSPECTION_UPLOAD,
        PERMISSIONS.HOLD_POINT_REQUEST,
        PERMISSIONS.HOLD_POINT_RELEASE,
        PERMISSIONS.WITNESS_POINT_REQUEST,
        PERMISSIONS.WITNESS_POINT_NOTIFY,
        PERMISSIONS.LOT_VIEW,
        PERMISSIONS.LOT_EDIT,
        PERMISSIONS.LOT_CREATE,
        PERMISSIONS.DOCUMENT_VIEW,
        PERMISSIONS.DOCUMENT_UPLOAD,
        PERMISSIONS.NCR_VIEW,
        PERMISSIONS.NCR_CREATE,
        PERMISSIONS.NCR_RESOLVE,
        PERMISSIONS.APPROVAL_VIEW,
        PERMISSIONS.APPROVAL_DECIDE,
        PERMISSIONS.PLAN_VIEW,
        PERMISSIONS.PLAN_APPROVE,
    ],

    [ROLES.SUPERINTENDENT]: [
        PERMISSIONS.ITP_VIEW,
        PERMISSIONS.ITP_APPROVE,
        PERMISSIONS.HOLD_POINT_RELEASE,
        PERMISSIONS.LOT_VIEW,
        PERMISSIONS.DOCUMENT_VIEW,
        PERMISSIONS.NCR_VIEW,
        PERMISSIONS.APPROVAL_VIEW,
        PERMISSIONS.APPROVAL_DECIDE,
        PERMISSIONS.PLAN_VIEW,
        PERMISSIONS.PLAN_APPROVE,
    ],

    [ROLES.ADMIN]: Object.values(PERMISSIONS), // All permissions
};

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: RoleCode, permission: PermissionCode): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: RoleCode): PermissionCode[] {
    return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if any of the given roles have a specific permission
 */
export function hasPermission(roles: RoleCode[], permission: PermissionCode): boolean {
    return roles.some(role => roleHasPermission(role, permission));
}

// Portal type for routing
export type PortalType = 'client' | 'subcontractor' | 'main';

/**
 * Determine which portal a user should access based on their role
 */
export function getPortalForRole(role: RoleCode): PortalType {
    switch (role) {
        case ROLES.CLIENT:
            return 'client';
        case ROLES.SUBCONTRACTOR:
            return 'subcontractor';
        default:
            return 'main';
    }
}
