/**
 * gymApi.service.ts
 *
 * Dedicated service for gym module API interactions.
 */
import { GETAPI } from "@/app/api";
import { map } from "rxjs/operators";
import { GymDashboardStats, MemberDocument, MembersResponse } from "../types/Gym.types";

export const GymApiService = {
  /**
   * Fetches aggregated dashboard statistics.
   */
  getDashboardStats: () => {
    return GETAPI({ path: "/v1/gym/dashboard/stats", isPrivateApi: true }).pipe(
      map((res: any) => res.data as GymDashboardStats)
    );
  },

  /**
   * Fetches the paginated list of gym members.
   */
  getMembers: (skip: number = 0, limit: number = 50) => {
    return GETAPI({
      path: "/v1/gym/members",
      params: { skip, limit },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as MembersResponse));
  },

  /**
   * Fetches a single member by record_id or member_id.
   */
  getMember: (identifier: string) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data as MemberDocument));
  },
};
