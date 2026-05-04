/**
 * gymApi.service.ts
 *
 * Dedicated service for gym module API interactions.
 * Covers members, subscription plans, subscription activation, and stats.
 *
 * All methods return RxJS Observables for consistency with the
 * platform's GETAPI/POSTAPI/PUTAPI/DELETEAPI layer.
 */
import { GETAPI, POSTAPI, PUTAPI, DELETEAPI } from "@/app/api";
import { map } from "rxjs/operators";
import type {
  GymDashboardStats,
  MemberDocument,
  MembersResponse,
  SubscriptionPlanDocument,
  PlansResponse,
  CreatePlanPayload,
  ActivateSubscriptionPayload,
  ActivateSubscriptionResponse,
  SubscriptionStats,
  AttendanceStats,
} from "../types/Gym.types";

export const GymApiService = {
  // ── Dashboard ───────────────────────────────────────────────────────

  /** Fetches aggregated dashboard statistics. */
  getDashboardStats: () => {
    return GETAPI({ path: "/v1/gym/dashboard/stats", isPrivateApi: true }).pipe(
      map((res: any) => res.data as GymDashboardStats)
    );
  },

  // ── Members ─────────────────────────────────────────────────────────

  /** Fetches the paginated list of gym members. */
  getMembers: (skip: number = 0, limit: number = 50) => {
    return GETAPI({
      path: "/v1/gym/members",
      params: { skip, limit },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as MembersResponse));
  },

  /** Fetches a single member by record_id or member_id. */
  getMember: (identifier: string) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data as MemberDocument));
  },

  // ── Subscription Plans ──────────────────────────────────────────────

  /** Fetches the paginated list of subscription plans. */
  getPlans: (skip: number = 0, limit: number = 50, activeOnly: boolean = false) => {
    return GETAPI({
      path: "/v1/gym/plans",
      params: { skip, limit, active_only: activeOnly },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as PlansResponse));
  },

  /** Fetches a single subscription plan by record_id, code, or ObjectId. */
  getPlan: (identifier: string) => {
    return GETAPI({
      path: `/v1/gym/plans/${identifier}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data as SubscriptionPlanDocument));
  },

  /** Creates a new subscription plan. */
  createPlan: (payload: CreatePlanPayload) => {
    return POSTAPI({
      path: "/v1/gym/plans",
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: SubscriptionPlanDocument }));
  },

  /** Updates an existing subscription plan. */
  updatePlan: (identifier: string, payload: Partial<CreatePlanPayload>) => {
    return PUTAPI({
      path: `/v1/gym/plans/${identifier}`,
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: SubscriptionPlanDocument }));
  },

  /** Soft-deletes a subscription plan. */
  deletePlan: (identifier: string) => {
    return DELETEAPI({
      path: `/v1/gym/plans/${identifier}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string }));
  },

  // ── Subscription Activation ─────────────────────────────────────────

  /** Activates a subscription — links a member to a plan. */
  activateSubscription: (payload: ActivateSubscriptionPayload) => {
    return POSTAPI({
      path: "/v1/gym/subscriptions/activate",
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as ActivateSubscriptionResponse));
  },

  // ── Subscription Stats ──────────────────────────────────────────────

  /** Fetches aggregated subscription/billing KPIs. */
  getSubscriptionStats: () => {
    return GETAPI({
      path: "/v1/gym/subscription/stats",
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data as SubscriptionStats));
  },

  // ── Attendance ──────────────────────────────────────────────────────

  /** Records a member check-in. */
  checkin: (memberId: string) => {
    return POSTAPI({
      path: "/v1/gym/checkin",
      data: { member_id: memberId },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: any }));
  },

  /** Fetches attendance analytics and heatmap. */
  getAttendanceStats: () => {
    return GETAPI({
      path: "/v1/gym/attendance/stats",
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data as AttendanceStats));
  },
};
