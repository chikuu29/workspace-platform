/**
 * Policy Management — API Service
 *
 * Provides typed API methods for policy CRUD operations.
 * Uses the existing RxJS-based API infrastructure (GETAPI, POSTAPI, etc).
 */

import { GETAPI, PUTAPI, POSTAPI, DELETEAPI } from "@/app/api";
import type {
  PolicyCreatePayload,
  PolicyUpdatePayload,
  PolicyStatementsUpdatePayload,
  RolePolicyAssignPayload,
} from "../types/policy.types";

/** Base path for organization-level policy endpoints */
const POLICY_BASE = "/account/policies";

/** Base path for platform-level policy endpoints */
const PLATFORM_POLICY_BASE = "/platform/policies";

// ── Organization Policy CRUD ────────────────────────────────────────────────

/** Fetch all policies for the current organization (includes global templates) */
export const fetchPolicies = () =>
  GETAPI({ path: POLICY_BASE, isPrivateApi: true });

/** Get a single policy with full statement details */
export const fetchPolicyById = (policyId: string) =>
  GETAPI({ path: `${POLICY_BASE}/${policyId}`, isPrivateApi: true });

/** Create a new policy for the organization */
export const createPolicy = (data: PolicyCreatePayload) =>
  POSTAPI({ path: POLICY_BASE, data, isPrivateApi: true });

/** Update a policy's metadata (name, description, is_active) */
export const updatePolicy = (policyId: string, data: PolicyUpdatePayload) =>
  PUTAPI({ path: `${POLICY_BASE}/${policyId}`, data, isPrivateApi: true });

/** Delete a policy */
export const deletePolicy = (policyId: string) =>
  DELETEAPI({ path: `${POLICY_BASE}/${policyId}`, isPrivateApi: true });

// ── Statement Management ────────────────────────────────────────────────────

/** Add or replace statements on a policy */
export const updatePolicyStatements = (policyId: string, data: PolicyStatementsUpdatePayload) =>
  PUTAPI({ path: `${POLICY_BASE}/${policyId}/statements`, data, isPrivateApi: true });

// ── Role ↔ Policy Attachment ────────────────────────────────────────────────

/** Get all policies attached to a role */
export const fetchRolePolicies = (roleId: number) =>
  GETAPI({ path: `/account/roles/${roleId}/policies`, isPrivateApi: true });

/** Attach policies to a role (replaces existing) */
export const assignPoliciesToRole = (roleId: number, data: RolePolicyAssignPayload) =>
  PUTAPI({ path: `/account/roles/${roleId}/policies`, data, isPrivateApi: true });

// ── Platform Policy Management ──────────────────────────────────────────────

/** Fetch all policies (platform admin view) */
export const fetchPlatformPolicies = (organizationId?: number) =>
  GETAPI({
    path: PLATFORM_POLICY_BASE,
    params: organizationId ? { organization_id: organizationId } : {},
    isPrivateApi: true,
  });

/** Create a global policy template (platform admin) */
export const createPlatformPolicy = (data: PolicyCreatePayload) =>
  POSTAPI({ path: PLATFORM_POLICY_BASE, data, isPrivateApi: true });

/** Update any policy (platform admin) */
export const updatePlatformPolicy = (policyId: string, data: PolicyUpdatePayload) =>
  PUTAPI({ path: `${PLATFORM_POLICY_BASE}/${policyId}`, data, isPrivateApi: true });

/** Delete any policy (platform admin) */
export const deletePlatformPolicy = (policyId: string) =>
  DELETEAPI({ path: `${PLATFORM_POLICY_BASE}/${policyId}`, isPrivateApi: true });

/** Attach policies to an org's role (platform admin, cross-org) */
export const assignPoliciesToOrgRole = (
  organizationId: number,
  roleId: number,
  data: RolePolicyAssignPayload
) =>
  PUTAPI({
    path: `/platform/organizations/${organizationId}/roles/${roleId}/policies`,
    data,
    isPrivateApi: true,
  });
