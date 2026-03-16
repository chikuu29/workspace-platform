
import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { GETAPI, POSTAPI } from '@/app/api';

interface BusinessDetails {
    legal_name: string;
    description?: string; // Added based on typical needs, though not in original state explicitly
    business_email: string;
    industry?: string;
    tax_id?: string;
    website?: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    owner_name?: string;
    total_stores?: number;
    main_branch?: string;
    estimated_annual_sales?: string;
    business_type?: string;
    founding_date?: string;
    timezone?: string;
    currency?: string;
}


interface Feature {
    code: string;
    name: string;
    description?: string;
    is_base_feature: boolean;
    addon_price: string;
}

interface App {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    base_price: string;
    features?: Feature[];
}

interface Plan {
    id: string;
    plan_code: string;
    name: string;
    description?: string;
    current_version?: {
        price: string;
        currency: string;
        billing_cycle: string;
        max_users: number;
        max_branches: number;
        storage_limit_gb: number;
    };
}

interface OnboardingState {
    validationsPassed: boolean;
    validatedAccountsData: any;
    businessDetails: BusinessDetails | null;

    // Plan Selection State
    plans: Plan[];
    apps: App[];
    selectedPlan: any;
    selectedApps: string[];
    selectedFeatures: Record<string, string[]>; // { appId: [featureCode1, featureCode2] }
    billingCycle: 'monthly' | 'yearly';

    loading: boolean;
    error: string | null;
    appliedCoupon: { code: string; percentage: number } | null;
}

const initialState: OnboardingState = {
    validationsPassed: false,
    validatedAccountsData: {},
    businessDetails: null,

    plans: [],
    apps: [],
    selectedPlan: {}, // Default
    selectedApps: [],
    selectedFeatures: {},
    billingCycle: 'monthly',

    loading: false,
    error: null,
    appliedCoupon: null,
}

// Async Thunks
export const fetchPlans = createAsyncThunk<Plan[]>(
    'onboarding/fetchPlans',
    async (_, { rejectWithValue }) => {
        try {
            return await new Promise<Plan[]>((resolve, reject) => {
                GETAPI({ path: 'plans/available_plans' }).subscribe({
                    next: (res: any) => {
                        if (res && res.success) {
                            resolve(res.data);
                        } else {
                            reject(res?.message || "Failed to fetch plans");
                        }
                    },
                    error: (err) => reject(err.message || "Network error")
                });
            });
        } catch (error: any) {
            return rejectWithValue(error);
        }
    }
);

export const fetchApps = createAsyncThunk<App[]>(
    'onboarding/fetchApps',
    async (_, { rejectWithValue }) => {
        try {
            return await new Promise<App[]>((resolve, reject) => {
                GETAPI({ path: "saas/get_apps" }).subscribe({
                    next: (res: any) => {
                        if (res && res.success) {
                            resolve(res.data);
                        } else {
                            reject(res?.message || "Failed to fetch apps");
                        }
                    },
                    error: (err) => reject(err.message || "Network error")
                });
            });
        } catch (error: any) {
            return rejectWithValue(error);
        }
    }
);

export const fetchBusinessDetails = createAsyncThunk(
    'onboarding/fetchBusinessDetails',
    async ({ organization_id, organization_uuid }: { organization_id: string, organization_uuid: string }, { rejectWithValue }) => {
        try {
            return await new Promise((resolve, reject) => {
                GETAPI({
                    path: "/account/organization/profile",
                    params: { organization_id, organization_uuid },
                }).subscribe({
                    next: (res: any) => {
                        if (res && res.success && res.data) {
                            // Map API response to partial BusinessDetails if needed, or assume exact match
                            // Based on previous code, keys align pretty well but let's be safe
                            resolve(res.data[0]);
                        } else {
                            reject(res?.message || "Failed to fetch profile");
                        }
                    },
                    error: (err) => reject(err.message || "Network error")
                });
            });
        } catch (error: any) {
            return rejectWithValue(error);
        }
    }
);

// Existing updateBusinessDetails thunk...
export const updateBusinessDetails = createAsyncThunk(
    'onboarding/updateBusinessDetails',
    async (payload: any, { rejectWithValue }) => { // Payload includes organization_id, organization_uuid and form fields
        try {
            return await new Promise((resolve, reject) => {
                const { organization_id, organization_uuid, ...data } = payload;
                POSTAPI({
                    path: `/account/organization/profile?organization_id=${organization_id}&organization_uuid=${organization_uuid}`,
                    data: payload
                }).subscribe({
                    next: (res: any) => {
                        if (res && res.success) {
                            resolve(data); // Return the updated data to update state
                        } else {
                            reject(res?.message || "Failed to update profile");
                        }
                    },
                    error: (err) => reject(err.message || "Network error")
                });
            });
        } catch (error: any) {
            return rejectWithValue(error);
        }
    }
);

// Payment Verification Thunk
export const verifyPayment = createAsyncThunk(
    'onboarding/verifyPayment',
    async (payload: any, { rejectWithValue }) => {
        try {
            return await new Promise((resolve, reject) => {
                POSTAPI({
                    path: '/account/verify-payment',
                    data: payload
                }).subscribe({
                    next: (res: any) => {
                        if (res && res.success) {
                            resolve(res.data);
                        } else {
                            // console.log("err", res);
                            // Remove non-serializable errorInfo (AxiosError) before rejecting
                            const { errorInfo, ...serializableError } = res;
                            reject(serializableError);
                        }
                    },
                    error: (err) => {
                        // Extract serializable error data
                        console.log("err", err);
                        const errorData = err.response?.data || { message: err.message || "Network Error" };
                        reject(errorData);
                    }
                });
            });
        } catch (error: any) {
            // Fallback sanitization: Ensure we don't pass non-serializable Axios objects
            const safeError = (error.config && error.request)
                ? { message: error.message || "Network Error", ...error.response?.data }
                : error;

            // Double check to remove errorInfo
            const { errorInfo, ...finalError } = safeError;

            return rejectWithValue(finalError);
        }
    }
);


// Get Payment Status Thunk
export const getPaymentStatus = createAsyncThunk(
    'onboarding/getPaymentStatus',
    async (payload: any, { rejectWithValue }) => {
        // ... (existing implementation)
        try {
            return await new Promise((resolve, reject) => {
                POSTAPI({
                    path: '/account/check-onboarding-status',
                    data: payload
                }).subscribe({
                    next: (res: any) => {
                        if (res && res.success) {
                            resolve(res.data[0]);
                        } else {
                            const { errorInfo, ...serializableError } = res;
                            reject(serializableError);
                        }
                    },
                    error: (err) => {
                        const errorData = err.response?.data || { message: err.message || "Network Error" };
                        reject(errorData);
                    }
                });
            });
        } catch (error: any) {
            const safeError = (error.config && error.request)
                ? { message: error.message || "Network Error", ...error.response?.data }
                : error;
            const { errorInfo, ...finalError } = safeError;
            return rejectWithValue(finalError);
        }
    }
);



const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        setValidatedAccountsData: (state, action: PayloadAction<{ validatedAccountsData: any; validationsPassed: boolean }>) => {
            state.validatedAccountsData = action.payload.validatedAccountsData;
            state.validationsPassed = action.payload.validationsPassed;
        },
        setAppliedCoupon: (state, action: PayloadAction<{ code: string; percentage: number }>) => {
            state.appliedCoupon = action.payload;
        },
        clearAppliedCoupon: (state) => {
            state.appliedCoupon = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Plan Selection Reducers
        setSelectedPlan: (state, action: PayloadAction<any>) => {
            const { plan_code, current_version } = action.payload;
            state.selectedPlan = { plan_code: plan_code, current_version_id: current_version.id };
            if (plan_code === 'FREE_TRIAL') {
                if (state.selectedApps.length > 1) {
                    state.selectedApps = [state.selectedApps[0]]; // Keep only first app
                }
            }
        },
        toggleApp: (state, action: PayloadAction<string>) => {
            const appId = action.payload;
            const isRemoving = state.selectedApps.includes(appId);

            if (state.selectedPlan === 'FREE_TRIAL') {
                state.selectedApps = isRemoving ? [] : [appId];
            } else {
                state.selectedApps = isRemoving
                    ? state.selectedApps.filter(id => id !== appId)
                    : [...state.selectedApps, appId];
            }

            if (!isRemoving) {
                const app = state.apps.find(a => a.id === appId);
                if (app && app.features) {
                    const baseFeatures = app.features
                        .filter((f: any) => f.is_base_feature)
                        .map((f: any) => f.code);
                    state.selectedFeatures = { ...state.selectedFeatures, [appId]: baseFeatures };
                }
            } else {
                const { [appId]: _, ...rest } = state.selectedFeatures;
                state.selectedFeatures = rest;
            }
        },
        toggleFeature: (state, action: PayloadAction<{ appId: string, featureCode: string }>) => {
            const { appId, featureCode } = action.payload;
            const appFeats = state.selectedFeatures[appId] || [];

            if (appFeats.includes(featureCode)) {
                state.selectedFeatures = {
                    ...state.selectedFeatures,
                    [appId]: appFeats.filter(f => f !== featureCode)
                };
            } else {
                state.selectedFeatures = {
                    ...state.selectedFeatures,
                    [appId]: [...appFeats, featureCode]
                };
            }
        },
        setBillingCycle: (state, action: PayloadAction<'monthly' | 'yearly'>) => {
            state.billingCycle = action.payload;
        },
        restorePlanSelection: (state, action: PayloadAction<{ selectedPlan: string, selectedApps: string[], selectedFeatures: any }>) => {
            state.selectedPlan = action.payload.selectedPlan;
            state.selectedApps = action.payload.selectedApps;
            state.selectedFeatures = action.payload.selectedFeatures;
        }
    },
    extraReducers: (builder) => {
        // Fetch Business Details
        builder.addCase(fetchBusinessDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchBusinessDetails.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Map the API response structure to our State structure if they differ slightly
            // Ideally should be consistent.
            const data = action.payload || {};
            state.businessDetails = {
                legal_name: data.legal_name || data.company_name || data.name || "",
                business_email: data.business_email || "",
                industry: data.industry || "",
                tax_id: data.tax_id || "",
                website: data.website || "",
                phone: data.phone || "",
                address_line1: data.address?.line1 || data.address_line1 || data.address || "",
                address_line2: data.address?.line2 || data.address_line2 || "",
                city: data.address?.city || data.city || "",
                state: data.address?.state || data.state || "",
                country: data.address?.country || data.country || "",
                pincode: data.address?.pincode || data.pincode || "",
                owner_name: data.owner_name || "",
                total_stores: data.total_stores || 1,
                main_branch: data.main_branch || "",
                estimated_annual_sales: data.estimated_annual_sales || "",
                business_type: data.business_type || "",
                founding_date: data.founding_date || "",
                timezone: data.timezone || "UTC",
                currency: data.currency || "INR",
            };
        });
        builder.addCase(fetchBusinessDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Update Business Details
        builder.addCase(updateBusinessDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateBusinessDetails.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            if (state.businessDetails) {
                state.businessDetails = { ...state.businessDetails, ...action.payload };
            }
        });
        builder.addCase(updateBusinessDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Plans
        builder.addCase(fetchPlans.fulfilled, (state, action) => {
            state.plans = action.payload;
        });

        // Fetch Apps
        builder.addCase(fetchApps.fulfilled, (state, action) => {
            state.apps = action.payload;
        });
    }
})

export const {
    setValidatedAccountsData,
    clearError,
    setSelectedPlan,
    toggleApp,
    toggleFeature,
    setBillingCycle,
    restorePlanSelection,
    setAppliedCoupon,
    clearAppliedCoupon
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

// Selectors
const selectOnboardingState = (state: { onboarding: OnboardingState }) => state.onboarding;

export const selectPricing = createSelector(
    [selectOnboardingState],
    (onboarding) => {
        const { plans, apps, selectedPlan, selectedApps, selectedFeatures, appliedCoupon } = onboarding;

        const planDetails = plans.find((p: Plan) => p.plan_code === selectedPlan.plan_code);
        const planBasePrice = parseFloat(planDetails?.current_version?.price || "0");

        const calculateAppTotal = (app: App) => {
            const basePrice = parseFloat(app.base_price) || 0;
            const selectedForApp = selectedFeatures[app.id] || [];
            const addonsPrice = app.features
                ? app.features
                    .filter((f: Feature) => !f.is_base_feature && selectedForApp.includes(f.code))
                    .reduce((sum: number, f: Feature) => sum + (parseFloat(f.addon_price) || 0), 0)
                : 0;
            return basePrice + addonsPrice;
        };

        const appsSubtotal = apps
            .filter((app: App) => selectedApps.includes(app.id))
            .reduce((sum: number, app: App) => sum + calculateAppTotal(app), 0);

        const subtotal = planBasePrice + appsSubtotal;
        const discountAmount = appliedCoupon ? subtotal * appliedCoupon.percentage : 0;
        const taxableAmount = subtotal - discountAmount;

        const taxRate = 0.18; // 18% GST
        const tax = taxableAmount * taxRate;
        const grandTotal = taxableAmount + tax;

        return {
            subtotal: Number(subtotal.toFixed(2)),
            discountAmount: Number(discountAmount.toFixed(2)),
            taxableAmount: Number(taxableAmount.toFixed(2)),
            tax: Number(tax.toFixed(2)),
            grandTotal: Number(grandTotal.toFixed(2)),
            planBasePrice,
            taxRate
        };
    }
);
