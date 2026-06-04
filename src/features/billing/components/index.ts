/**
 * Shared Billing Components — barrel export.
 *
 * Reusable billing UI components that can be composed by any app module
 * (gym, hostel, etc.) for their checkout/payment flows.
 *
 * The billing backend is already centralized (BillingService SDK).
 * These frontend components complement that by providing reusable
 * payment UI patterns that maintain consistency across apps.
 */
export { default as PaymentMethodSelector } from "./PaymentMethodSelector";
export type { PaymentMode, OnlineMethod } from "./PaymentMethodSelector";

export { default as CashTillCalculator } from "./CashTillCalculator";
export { default as OrderSummaryCard } from "./OrderSummaryCard";
export { default as PaymentLinkDispatcher } from "./PaymentLinkDispatcher";
export { default as PaymentSuccessReceipt } from "./PaymentSuccessReceipt";
