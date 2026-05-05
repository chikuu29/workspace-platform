/**
 * useGymNavigation.ts
 *
 * Stable navigation helper for the gym module.
 * Encapsulates route-building logic so every gym component
 * can navigate without duplicating URL construction.
 */
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";

export const useGymNavigation = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { appCode } = useParams();
  const [searchParams] = useSearchParams();

  const appParam = searchParams.get("app");
  const appName = useMemo(() => appCode || appParam || "myGym", [appCode, appParam]);

  const prefix = useMemo(
    () =>
      pathname.includes("/workspace")
        ? `${pathname.split("/workspace")[0]}/workspace`
        : "",
    [pathname],
  );

  /** Navigate to a gym view by name (e.g. "members", "AddMember", "Subscription") */
  const navigateTo = useCallback(
    (view: string) => {
      const path = appCode
        ? `${prefix}/app/${appCode}/${view}`
        : `${prefix}/${view}?app=${appName}`;
      navigate(path);
    },
    [appCode, appName, navigate, prefix],
  );

  return { navigateTo, appName } as const;
};
