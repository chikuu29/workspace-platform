/**
 * useGymNavigation.ts
 *
 * Reusable hook to handle all gym-related navigation logic.
 * Encapsulates workspace prefix calculation and app code context.
 */

import { useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { GymRoutes } from "./GymRoutes";

export const useGymNavigation = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { appCode } = useParams();

    const workspacePrefix = useMemo(() => {
        return pathname.includes("/workspace")
            ? `${pathname.split("/workspace")[0]}/workspace`
            : "";
    }, [pathname]);

    const goToMembers = useCallback(() => {
        navigate(GymRoutes.members(workspacePrefix, appCode));
    }, [navigate, workspacePrefix, appCode]);

    const goToMemberDetail = useCallback((memberId: string) => {
        navigate(GymRoutes.memberDetail(workspacePrefix, memberId, appCode));
    }, [navigate, workspacePrefix, appCode]);

    const goToSelectPlan = useCallback((memberId: string) => {
        navigate(GymRoutes.selectPlan(workspacePrefix, memberId, appCode));
    }, [navigate, workspacePrefix, appCode]);

    const goToSubscriptionHub = useCallback(() => {
        navigate(GymRoutes.subscriptionHub(workspacePrefix, appCode));
    }, [navigate, workspacePrefix, appCode]);

    const goBack = useCallback(() => navigate(-1), [navigate]);

    return {
        workspacePrefix,
        appCode,
        goToMembers,
        goToMemberDetail,
        goToSelectPlan,
        goToSubscriptionHub,
        goBack,
    };
};
