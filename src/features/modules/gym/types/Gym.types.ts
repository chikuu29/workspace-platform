/**
 * GymDashboard.types.ts
 *
 * Strict typing for the Gym Management Dashboard.
 */

export interface GymKpiData {
  total_members: number;
  active_members: number;
  attention_members: number;
  frozen_members: number;
  members_added_this_month: number;
  revenue_mrr: number;
  checkins_today: number;
  trainer_utilization: number;
}

export interface RecentMember {
  record_id: string;
  name: string;
  plan: string;
  created_at: string;
}

export interface GymDashboardStats {
  kpis: GymKpiData;
  recent_members: RecentMember[];
}

export interface MemberDocument {
  _id: string;
  _meta: {
    entity_type: string;
    record_id: string;
    version: number;
    is_deleted: boolean;
    created: { at: string; by: string };
    updated: { at: string; by: string };
  };
  data: {
    firstName?: string;
    lastName?: string;
    memberFirstName?: string;
    memberLastName?: string;
    email?: string;
    memberEmail?: string;
    phone?: string;
    memberPhone?: string;
    status: "active" | "attention" | "frozen";
    plan: string;
    member_id?: string;
    [key: string]: any;
  };
}

export interface MembersResponse {
  success: boolean;
  data: MemberDocument[];
  total: number;
  skip: number;
  limit: number;
}
