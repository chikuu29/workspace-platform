/**
 * Policy Management — TypeScript Interfaces
 *
 * Defines the shape of policy data structures used across the frontend
 * for the PBAC (Policy-Based Access Control) system.
 */

/** Global permission as returned by the backend */
export interface GlobalPermission {
  id: string;
  app_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
}

/** Summary of a permission within a statement */
export interface PermissionSummary {
  id: string;
  code: string;
  name: string;
}

/** A single Allow/Deny statement within a policy */
export interface PolicyStatement {
  id: string;
  policy_id: string;
  effect: "ALLOW" | "DENY";
  description?: string;
  permissions: GlobalPermission[];
  created_at?: string;
}

/** Full policy object with nested statements */
export interface Policy {
  id: string;
  name: string;
  description?: string;
  organization_id?: number | null;
  is_system_policy: boolean;
  is_active: boolean;
  created_by?: number | null;
  statements: PolicyStatement[];
  created_at?: string;
  updated_at?: string;
}

/** Summary of a policy (used in role assignments and Redux state) */
export interface PolicySummary {
  id: string;
  name: string;
}

/** Request payload for creating a policy statement */
export interface PolicyStatementCreatePayload {
  effect: "ALLOW" | "DENY";
  permission_ids: string[];
  description?: string;
}

/** Request payload for creating a policy */
export interface PolicyCreatePayload {
  name: string;
  description?: string;
  statements: PolicyStatementCreatePayload[];
  is_active?: boolean;
}

/** Request payload for updating a policy */
export interface PolicyUpdatePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}

/** Request payload for adding/replacing statements on a policy */
export interface PolicyStatementsUpdatePayload {
  statements: PolicyStatementCreatePayload[];
  replace_all: boolean;
}

/** Request payload for attaching policies to a role */
export interface RolePolicyAssignPayload {
  policy_ids: string[];
}

/** Standard API response wrapper */
export interface PolicyApiResponse<T = Policy[]> {
  success: boolean;
  message: string;
  data: T;
}
