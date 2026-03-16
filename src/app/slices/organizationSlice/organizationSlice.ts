import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, logout } from "../auth/authSlice";

interface Subscription {
    plan: string | null;
    plan_details?: any;
    status: string;
    is_active: boolean;
    auto_renew: boolean;
    expiry: string | null;
    cycle_start: string | null;
}

interface ActiveOrganization {
    id?: number;
    uuid?: string;
    name?: string;
    email?: string | null;
    status?: string;
    deployment_type?: string;
    is_active?: boolean;
    is_platform_organization?: boolean;
    created_at?: string;
    subscription?: Subscription | null;
    apps?: Record<string, any>;
    subscribed_apps?: Record<string, any>[];
    features?: Record<string, any>[];
}

interface OrganizationState {
    organization: ActiveOrganization | null;
}

const initialState: OrganizationState = {
    organization: null
};

const organizationSlice = createSlice({
    name: 'organizations',
    initialState,
    reducers: {
        setOrganization: (state, action: PayloadAction<ActiveOrganization>) => {
            state.organization = action.payload;
        },
        clearOrganization: (state) => {
            state.organization = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login, (state, action) => {
            if (action.payload?.login_info?.organization) {
                state.organization = action.payload.login_info.organization;
            }
        });
        builder.addCase(logout, (state) => {
            state.organization = null;
        });
    }
});

export const { setOrganization, clearOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;
