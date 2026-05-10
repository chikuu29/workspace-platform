/**
 * useWorkspaceRouter.ts
 *
 * Centralized navigation hook for the entire workspace frontend.
 * Replaces all scattered useNavigate + useLocation + useParams + useSearchParams
 * boilerplate with a single, memory-efficient API.
 *
 * Consumers call:
 *   const { navigateTo, buildPath, goBack, appName } = useWorkspaceRouter();
 *   navigateTo("members");               // => /{org}/workspace/app/{appCode}/members
 *   navigateTo("selectPlan", memberId);   // => /{org}/workspace/app/{appCode}/selectPlan/{id}
 *   buildPath("Subscription");            // => returns path string without navigating
 *
 * Aligned with ActionEngine's buildWorkspacePath pattern and router.tsx route tree.
 *
 * @module core/hooks/useWorkspaceRouter
 */

import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { buildAppViewPath } from "@/core/utils/pathBuilder";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkspaceRouter {
  /** Organization slug extracted from route params */
  readonly organizationName: string;

  /** Pre-computed workspace prefix: "/{org}/workspace" */
  readonly workspacePrefix: string;

  /** Resolved app name (appCode > searchParams.app > "Default") */
  readonly appName: string;

  /** Raw appCode from URL params — undefined when not on /app/:appCode route */
  readonly appCode: string | undefined;

  /**
   * Build a fully-qualified workspace path without triggering navigation.
   * Useful for href attributes, breadcrumb construction, and conditional logic.
   */
  readonly buildPath: (view: string, params?: string) => string;

  /**
   * Navigate to a workspace view within the current app context.
   * Automatically resolves the correct URL shape based on appCode presence.
   */
  readonly navigateTo: (view: string, params?: string) => void;

  /** Navigate back in browser history (wrapper around navigate(-1)) */
  readonly goBack: () => void;
}

// ─── Hook Implementation ─────────────────────────────────────────────────────

/**
 * Centralized workspace navigation hook.
 *
 * Consolidates 4 separate React Router hooks + multiple useMemo/useCallback
 * chains that were previously duplicated across every feature module component.
 *
 * Performance characteristics:
 *  - organizationName: stable string, recalculates only on route param change
 *  - workspacePrefix: memoized, recalculates only on organizationName change
 *  - appName: memoized, recalculates only on appCode/searchParams change
 *  - buildPath: stable useCallback, recalculates only on context change
 *  - navigateTo: stable useCallback, references buildPath
 *  - goBack: stable useCallback, never recalculates (empty deps after navigate)
 */
export const useWorkspaceRouter = (): WorkspaceRouter => {
  const navigate = useNavigate();
  const { organization_name, appCode } = useParams();
  const [searchParams] = useSearchParams();

  // Resolve organization name — fallback prevents runtime errors on edge-case routes
  const organizationName = useMemo(
    () => organization_name || "default",
    [organization_name],
  );

  // Pre-compute the workspace prefix for breadcrumb/path display use cases
  const workspacePrefix = useMemo(
    () => `/${organizationName}/workspace`,
    [organizationName],
  );

  // Resolve app name from multiple sources with priority: route param > query param > default
  const appParam = searchParams.get("app");
  const appName = useMemo(
    () => appCode || appParam || "Default",
    [appCode, appParam],
  );

  // Stable path builder — delegates to the shared pure utility
  const buildPath = useCallback(
    (view: string, params?: string): string =>
      buildAppViewPath(organizationName, appCode, appName, view, params),
    [organizationName, appCode, appName],
  );

  // Stable navigation function — composes buildPath + navigate
  const navigateTo = useCallback(
    (view: string, params?: string): void => {
      navigate(buildPath(view, params));
    },
    [navigate, buildPath],
  );

  // Stable back navigation — never changes after initial mount
  const goBack = useCallback(() => navigate(-1), [navigate]);

  return {
    organizationName,
    workspacePrefix,
    appName,
    appCode,
    buildPath,
    navigateTo,
    goBack,
  };
};
