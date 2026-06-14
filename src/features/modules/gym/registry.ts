import type { AppModuleConfig } from "@/core/registry/AppRegistry";

export const registry: AppModuleConfig = {
    layout: () => import("@/theme/layouts/workspace"),
    home: () => import("./GymView"),
    // Member management
    members: () => import("./ViewMember"),
    member: () => import("./MemberDetail"),
    attendance: () => import("./Attendance"),
    // Billing & Subscriptions
    subscriptions: () => import("./SubscriptionsPlan"),
    AddSubscriptionPlan: () => import("./AddSubscriptionPlan"),

    PaymentsHistory: () => import("./GymComingSoon").then(m => ({ default: m.PaymentsHistory })),
    // ── New Multi-Step Sales Flow (Invoice-First Architecture) ────
    plans: () => import("./Plans"),
    reviewOrder: () => import("./ReviewOrder"),
    orderView: () => import("./OrderView"),
    invoiceView: () => import("./InvoiceDetails"),
    paymentSelect: () => import("./PaymentSelection"),
    cashPayment: () => import("./CashPayment"),
    onlinePayment: () => import("./OnlinePayment"),
    paymentLink: () => import("./PaymentLinkPage"),
    checkout: () => import("./MembershipCheckout"),
    // Trainers
    trainers: () => import("./TrainersStaff"),
    TrainerProfile: () => import("./TrainerProfile"),
    trainerSchedules: () => import("./GymComingSoon").then(m => ({ default: m.TrainerSchedules })),
    // Classes
    listClasses: () => import("./GymComingSoon").then(m => ({ default: m.ListClasses })),
    addClass: () => import("./GymComingSoon").then(m => ({ default: m.AddClass })),
    classBookings: () => import("./GymComingSoon").then(m => ({ default: m.ClassBookings })),
    // Reports
    revenueReport: () => import("./RevenueReport"),
    attendanceReport: () => import("./AttendanceReport"),
    performanceReport: () => import("./GymComingSoon").then(m => ({ default: m.PerformanceReport })),
};
