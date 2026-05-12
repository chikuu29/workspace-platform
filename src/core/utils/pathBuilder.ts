/**
 * pathBuilder.ts
 *
 * Shared pure-function utilities for building workspace-scoped URLs.
 * Extracted from ActionEngine to be reusable across:
 *  - ActionEngine (config-driven route actions)
 *  - useWorkspaceRouter (React hook for component navigation)
 *  - MenuLink (sidebar navigation path resolution)
 *
 * Zero dependencies — tree-shakeable, no React imports.
 *
 * @module core/utils/pathBuilder
 */

// ─── Platform-Level Route Prefixes ──────────────────────────────────────────
// Routes that live OUTSIDE the /{org}/workspace/ scope.
// Kept as a Set for O(1) lookups and single-source-of-truth maintenance.
const PLATFORM_ROUTES = new Set(["myApps", "profile", "settings"]);

/**
 * Builds an organization-scoped workspace path from a relative path segment.
 *
 * Handles edge cases:
 *  - Leading slashes are stripped to prevent double-slash URLs
 *  - Duplicate "workspace/" prefix is de-duplicated
 *  - Platform-level views (myApps, profile, settings) bypass org scoping
 *
 * @param path - Relative path segment (e.g. "app/myGym/members")
 * @param organizationName - Current organization slug from route params
 * @returns Fully qualified absolute path
 *
 * @example
 * buildWorkspacePath("app/myGym/members", "acme")
 * // => "/acme/workspace/app/myGym/members"
 *
 * buildWorkspacePath("myApps", "acme")
 * // => "/myApps"
 */
export const buildWorkspacePath = (
  path: string,
  organizationName: string,
): string => {
  let cleanPath = path.startsWith("/") ? path.substring(1) : path;

  // Prevent duplicate "/workspace/workspace/" by stripping leading workspace segment
  if (cleanPath.startsWith("workspace/")) {
    cleanPath = cleanPath.substring("workspace/".length);
  }

  // Platform-level views live outside org scope
  const rootSegment = cleanPath.split("/")[0].split("?")[0];
  if (PLATFORM_ROUTES.has(rootSegment)) {
    return `/${cleanPath}`;
  }

  return `/${organizationName}/workspace/${cleanPath}`;
};

/**
 * Builds a fully-qualified path to a view within the current app context.
 *
 * Resolves to one of two URL shapes based on whether appCode is available:
 *  - With appCode: /{org}/workspace/app/{appCode}/{view}/{params?}
 *  - Without:      /{org}/workspace/{view}?app={appName}
 *
 * This is the primary path builder used by useWorkspaceRouter and replaces
 * all inline `buildViewPath` / `GymRoutes` patterns in feature modules.
 *
 * @param organizationName - Current organization slug
 * @param appCode - App code from route params (may be undefined)
 * @param appName - Resolved app name (fallback when appCode is absent)
 * @param view - Target view name (e.g. "members", "Subscription")
 * @param params - Optional path parameter (e.g. member ID)
 * @returns Fully qualified absolute path
 *
 * @example
 * buildAppViewPath("acme", "myGym", "myGym", "members")
 * // => "/acme/workspace/app/myGym/members"
 *
 * buildAppViewPath("acme", undefined, "myGym", "members")
 * // => "/acme/workspace/members?app=myGym"
 *
 * buildAppViewPath("acme", "myGym", "myGym", "selectPlan", "abc123")
 * // => "/acme/workspace/app/myGym/selectPlan/abc123"
 */
export const buildAppViewPath = (
  organizationName: string,
  appCode: string | undefined,
  appName: string,
  view: string,
  params?: string,
): string => {
  if (appCode) {
    const segments = [`app/${appCode}/${view}`];
    if (params) segments.push(params);
    return buildWorkspacePath(segments.join("/"), organizationName);
  }

  // Fallback: query-param based routing for non-appCode contexts
  const queryString = `?app=${appName}`;
  const pathSegment = params ? `${view}/${params}` : view;
  return buildWorkspacePath(`${pathSegment}${queryString}`, organizationName);
};
