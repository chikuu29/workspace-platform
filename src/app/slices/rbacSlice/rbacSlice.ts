import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, logout } from "../auth/authSlice";

interface PolicySummary {
    id: string;
    name: string;
}

interface RbacState {
    roles: string[];
    permissions: string[];
    scope: string[];
    user_type: string | "SYSTEM" | "ORGANIZATION" | "UNASSIGNED";
    policies: PolicySummary[];
}

const initialState: RbacState = {
    roles: [],
    permissions: [],
    scope: [],
    user_type: "UNASSIGNED",
    policies: [],
};

const rbacSlice = createSlice({
    name: 'rbac',
    initialState,
    reducers: {
        setRbac: (state, action: PayloadAction<Partial<RbacState>>) => {
            if (action.payload.roles) state.roles = action.payload.roles;
            if (action.payload.permissions) state.permissions = action.payload.permissions;
            if (action.payload.scope) state.scope = action.payload.scope;
            if (action.payload.user_type) state.user_type = action.payload.user_type;
            if (action.payload.policies) state.policies = action.payload.policies;
        },
        clearRbac: (state) => {
            state.roles = [];
            state.permissions = [];
            state.scope = [];
            state.user_type = "UNASSIGNED";
            state.policies = [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login, (state, action) => {
            if (action.payload?.login_info?.authorization) {
                const authz = action.payload.login_info.authorization;
                state.roles = authz.roles || [];
                state.permissions = authz.permissions || [];
                state.scope = authz.scope || [];
                state.user_type = authz.user_type || null;
                state.policies = authz.policies || [];
            }
        });
        builder.addCase(logout, (state) => {
            state.roles = [];
            state.permissions = [];
            state.scope = [];
            state.user_type = "UNASSIGNED";
            state.policies = [];
        });
    }
});

export const { setRbac, clearRbac } = rbacSlice.actions;
export default rbacSlice.reducer;
