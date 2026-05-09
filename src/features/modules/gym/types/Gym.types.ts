/**
 * Gym.types.ts
 *
 * Strict typing for the Gym Management module.
 * Covers dashboard stats, members, subscription plans, and subscriptions.
 */

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface GymKpiData {
  total_members: number;
  active_members: number;
  attention_members: number;
  frozen_members: number;
  members_added_this_month: number;
  total_trainers: number;
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

// ─── Members ─────────────────────────────────────────────────────────────────

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
    email?: string;
    phone?: string;
    gender?: string;
    address?: string;
    status: "active" | "attention" | "frozen";
    plan: string;
    plan_code?: string;
    subscription_id?: string;
    member_id?: string;
    [key: string]: any;
  };
  /** Enriched: active subscription summary (null if no active sub) */
  subscription?: {
    subscription_id: string;
    plan_name: string;
    plan_code: string;
    price: number;
    currency: string;
    billing_cycle: string;
    start_date: string;
    end_date: string;
    status: string;
    is_paid: boolean;
  } | null;
  /** Enriched: whether the member has an active plan */
  has_plan?: boolean;
  /** Enriched: full plan details (single-member endpoint only) */
  plan_details?: SubscriptionPlanData | null;
  /** Enriched: all past subscriptions (single-member endpoint only) */
  subscription_history?: {
    subscription_id: string;
    plan_name: string;
    status: string;
    start_date: string;
    end_date: string;
    price: number;
    is_paid: boolean;
  }[];
}

export interface MembersResponse {
  success: boolean;
  data: MemberDocument[];
  total: number;
  skip: number;
  limit: number;
}

// ─── Trainers ────────────────────────────────────────────────────────────────

export interface TrainerDocument {
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
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender?: string;
    address?: string;
    trainer_id: string;
    specialization: string;
    experienceYears: number | string;
    joiningDate: string;
    availableSlot?: string;
    bio?: string;
    idProof?: string;
    certifications?: string;
    profilePic?: string;
    paymentMode?: string;
    status: "active" | "on_leave" | "terminated";
    [key: string]: any;
  };
}

export interface TrainersResponse {
  success: boolean;
  data: TrainerDocument[];
  total: number;
  skip: number;
  limit: number;
}

// ─── Subscription Plans ──────────────────────────────────────────────────────

/** Shape of a subscription plan stored in MongoDB via OrgRepository */
export interface SubscriptionPlanDocument {
  _id: string;
  _meta: {
    entity_type: string;
    record_id: string;
    version: number;
    is_deleted: boolean;
    created: { at: string; by: string };
    updated: { at: string; by: string };
  };
  data: SubscriptionPlanData;
}

export interface SubscriptionPlanData {
  name: string;
  code: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: "monthly" | "quarterly" | "yearly";
  is_active: boolean;
  features: string[];
  accent_color: string;
  max_members?: number | null;
}

export interface PlansResponse {
  success: boolean;
  data: SubscriptionPlanDocument[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
  };
}

// ─── Subscriptions (member ↔ plan link) ──────────────────────────────────────

export interface SubscriptionDocument {
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
    member_id: string;
    member_name: string;
    plan_code: string;
    plan_name: string;
    plan_record_id: string;
    subscription_id: string;
    price: number;
    currency: string;
    billing_cycle: string;
    start_date: string;
    end_date: string;
    status: "active" | "expired" | "cancelled";
    is_paid: boolean;
    payment_amount: number;
    notes: string;
  };
}

/** Payload sent to POST /gym/subscriptions/activate */
export interface ActivateSubscriptionPayload {
  member_id: string;
  plan_code: string;
  start_date?: string;
  is_paid?: boolean;
  payment_amount?: number;
  notes?: string;
}

/** Response from POST /gym/subscriptions/activate */
export interface ActivateSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscription: SubscriptionDocument;
    subscription_id: string;
    member_id: string;
    plan_name: string;
    start_date: string;
    end_date: string;
  };
}

// ─── Subscription Stats ─────────────────────────────────────────────────────

export interface PlanWithMembers {
  plan_code: string;
  plan_name: string;
  price: number;
  billing_cycle: string;
  member_count: number;
  revenue: number;
  accent_color: string;
}

export interface SubscriptionStats {
  total_plans: number;
  active_plans: number;
  total_subscribers: number;
  total_mrr: number;
  plans_with_members: PlanWithMembers[];
}

export interface AttendanceStats {
  daily_visits: { date: string; count: number }[];
  hourly_heatmap: { hour: number; count: number }[];
  active_last_7_days: number;
  total_members: number;
  slipping_members: number;
}

// ─── Create Plan Payload ────────────────────────────────────────────────────

/** Payload sent to POST /gym/plans */
export interface CreatePlanPayload {
  name: string;
  code: string;
  description?: string;
  price: number;
  currency?: string;
  billing_cycle: "monthly" | "quarterly" | "yearly";
  is_active?: boolean;
  features?: string[];
  accent_color?: string;
}
