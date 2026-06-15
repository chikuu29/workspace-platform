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
  TrainerDocument,
  TrainersResponse,
  EnrollMembershipPayload,
  EnrollMembershipResponse,
  CollectPaymentPayload,
  CollectPaymentResponse,
  SendPaymentLinkPayload,
  SendPaymentLinkResponse,
  MembershipInvoiceResponse,
  // ── New order-first flow types ──
  CreateOrderPayload,
  CreateOrderResponse,
  ConfirmOrderResponse,
  GetOrderResponse,
  GymInvoiceResponse,
  PayInvoicePayload,
  PayInvoiceResponse,
  SendInvoiceLinkPayload,
  SendInvoiceLinkResponse,
  CancelInvoiceResponse,
  CheckoutPreviewPayload,
  CheckoutPreviewResponse,
  CheckoutPayload,
  CheckoutResponse,
} from "../types/Gym.types";


export const GymApiService = {
  // ── Dashboard ───────────────────────────────────────────────────────

  /** Fetches dashboard analytics — KPIs + recent enrollments. */
  getAnalytics: () => {
    return GETAPI({ path: "/v1/gym/analytics", isPrivateApi: true }).pipe(
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

  /** Fetches a single member by id or member_id. */
  getMember: (identifier: string) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data as MemberDocument));
  },

  /** Fetches a member's active subscription membership. */
  getMemberMembership: (identifier: string) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}/membership`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data));
  },

  /** Fetches paginated orders for a member. */
  getMemberOrders: (identifier: string, page: number = 1, limit: number = 10) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}/orders`,
      params: { page, limit },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: any[]; pagination: any }));
  },

  /** Fetches paginated invoices for a member. */
  getMemberInvoices: (identifier: string, page: number = 1, limit: number = 10) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}/invoices`,
      params: { page, limit },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: any[]; pagination: any }));
  },

  /** Fetches paginated payments for a member. */
  getMemberPayments: (identifier: string, page: number = 1, limit: number = 10) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}/payments`,
      params: { page, limit },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: any[]; pagination: any }));
  },

  /** Fetches paginated attendance records for a member. */
  getMemberAttendance: (identifier: string, page: number = 1, limit: number = 10) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}/attendance`,
      params: { page, limit },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: any[]; pagination: any }));
  },

  /** Fetches paginated activity timeline for a member. */
  getMemberTimeline: (identifier: string, page: number = 1, limit: number = 10) => {
    return GETAPI({
      path: `/v1/gym/members/${identifier}/timeline`,
      params: { page, limit },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: any[]; pagination: any }));
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

  /** Fetches a single subscription plan by id, code, or ObjectId. */
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

  // ── Membership Billing Flow ─────────────────────────────────────────

  /** Enrolls a member in a plan — creates subscription + invoice (no payment). */
  enrollMembership: (payload: EnrollMembershipPayload) => {
    return POSTAPI({
      path: "/v1/gym/membership/enroll",
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as EnrollMembershipResponse));
  },

  /** Records payment against a subscription's invoice. */
  collectPayment: (subscriptionId: string, payload: CollectPaymentPayload) => {
    return POSTAPI({
      path: `/v1/gym/membership/${subscriptionId}/collect-payment`,
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as CollectPaymentResponse));
  },

  /** Sends a payment link for a subscription's invoice. */
  sendPaymentLink: (subscriptionId: string, payload?: SendPaymentLinkPayload) => {
    return POSTAPI({
      path: `/v1/gym/membership/${subscriptionId}/send-payment-link`,
      data: payload || {},
      isPrivateApi: true,
    }).pipe(map((res: any) => res as SendPaymentLinkResponse));
  },

  /** Fetches invoice details for a subscription. */
  getSubscriptionInvoice: (subscriptionId: string) => {
    return GETAPI({
      path: `/v1/gym/membership/${subscriptionId}/invoice`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as MembershipInvoiceResponse));
  },

  // ── Subscription Stats ──────────────────────────────────────────────

  /** Fetches aggregated subscription/billing KPIs. */
  getSubscriptionAnalytics: () => {
    return GETAPI({
      path: "/v1/gym/analytics/subscriptions",
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

  /** Gets the member QR image stream URL. */
  getMemberQrCodeUrl: (memberId: string) => {
    return `/v1/gym/members/${encodeURIComponent(memberId)}/qr`;
  },

  /** Dispatches membership card email (simulated). */
  emailMembershipCard: (memberId: string) => {
    return POSTAPI({
      path: `/v1/gym/members/${encodeURIComponent(memberId)}/email-card`,
      data: {},
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string }));
  },

  /** Fetches attendance analytics and heatmap. */
  getAttendanceAnalytics: () => {
    return GETAPI({
      path: "/v1/gym/analytics/attendance",
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data as AttendanceStats));
  },

  /** Gets member attendance report (month-wise and history log). */
  getMemberAttendanceReport: (memberId: string, year?: number, month?: number) => {
    return GETAPI({
      path: `/v1/gym/analytics/attendance/member/${encodeURIComponent(memberId)}`,
      params: { year, month },
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data));
  },

  // ── Trainers ────────────────────────────────────────────────────────

  /** Fetches the paginated list of gym trainers. */
  getTrainers: (skip: number = 0, limit: number = 50) => {
    return GETAPI({
      path: "/v1/gym/trainers",
      params: { skip, limit },
      isPrivateApi: true,
    }).pipe(map((res: any) => res as TrainersResponse));
  },

  /** Fetches a single trainer by id or trainer_id. */
  getTrainer: (identifier: string) => {
    return GETAPI({
      path: `/v1/gym/trainers/${identifier}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res.data as TrainerDocument));
  },

  /** Updates an existing trainer. */
  updateTrainer: (identifier: string, payload: any) => {
    return PUTAPI({
      path: `/v1/gym/trainers/${identifier}`,
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string; data: TrainerDocument }));
  },

  /** Soft-deletes a trainer. */
  deleteTrainer: (identifier: string) => {
    return DELETEAPI({
      path: `/v1/gym/trainers/${identifier}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as { success: boolean; message: string }));
  },

  // ── Order-First Membership Sales Flow ────────────────────────────────
  // Subscription is NEVER written until payment is confirmed via payGymInvoice.

  /**
   * Creates a billing order for a member+plan combination.
   * No subscription record is created — order_number is the state carrier.
   */
  createMembershipOrder: (payload: CreateOrderPayload) => {
    return POSTAPI({
      path: "/v1/gym/membership/create-order",
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as CreateOrderResponse));
  },

  /**
   * Confirms a membership order and generates the linked invoice.
   */
  confirmMembershipOrder: (orderNumber: string) => {
    return POSTAPI({
      path: `/v1/gym/orders/${encodeURIComponent(orderNumber)}/confirm`,
      data: {},
      isPrivateApi: true,
    }).pipe(map((res: any) => res as ConfirmOrderResponse));
  },

  /**
   * Fetches membership order details.
   */
  getMembershipOrder: (orderNumber: string) => {
    return GETAPI({
      path: `/v1/gym/orders/${encodeURIComponent(orderNumber)}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as GetOrderResponse));
  },

  /**
   * Fetch a gym invoice with full payment history and member/plan context.
   * Used by the InvoiceDetails page.
   */
  getGymInvoice: (invoiceNumber: string) => {
    return GETAPI({
      path: `/v1/gym/invoices/${invoiceNumber}`,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as GymInvoiceResponse));
  },

  /**
   * Pay an invoice — atomically creates subscription + activates member.
   * This is the single write boundary where the subscription is created.
   */
  payGymInvoice: (invoiceNumber: string, payload: PayInvoicePayload) => {
    return POSTAPI({
      path: `/v1/gym/invoices/${invoiceNumber}/pay`,
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as PayInvoiceResponse));
  },

  /**
   * Send a payment link for a gym invoice via email/SMS/both.
   * Subscription is NOT created here — created when customer pays via link.
   */
  sendGymInvoiceLink: (invoiceNumber: string, payload?: SendInvoiceLinkPayload) => {
    return POSTAPI({
      path: `/v1/gym/invoices/${invoiceNumber}/send-link`,
      data: payload || {},
      isPrivateApi: true,
    }).pipe(map((res: any) => res as SendInvoiceLinkResponse));
  },

  /**
   * Cancel an unpaid gym invoice (draft or sent status only).
   * Safe to call — no subscription exists yet.
   */
  cancelGymInvoice: (invoiceNumber: string) => {
    return POSTAPI({
      path: `/v1/gym/invoices/${invoiceNumber}/cancel`,
      data: {},
      isPrivateApi: true,
    }).pipe(map((res: any) => res as CancelInvoiceResponse));
  },

  /** Preview checkout pricing for a member + plan combination */
  checkoutPreview: (payload: CheckoutPreviewPayload) => {
    return POSTAPI({
      path: "/v1/gym/checkout/preview",
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as CheckoutPreviewResponse));
  },

  /** Execute checkout atomically */
  checkout: (payload: CheckoutPayload) => {
    return POSTAPI({
      path: "/v1/gym/checkout",
      data: payload,
      isPrivateApi: true,
    }).pipe(map((res: any) => res as CheckoutResponse));
  },
};

