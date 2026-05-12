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
    user_type: string | null;
    policies: PolicySummary[];
    is_superuser?: boolean;
    is_root_user?: boolean;
}

const initialState: RbacState = {
    roles: [],
    permissions: [],
    scope: [],
    user_type: null,
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
            if (action.payload.is_superuser !== undefined) state.is_superuser = action.payload.is_superuser;
            if (action.payload.is_root_user !== undefined) state.is_root_user = action.payload.is_root_user;
        },
        clearRbac: (state) => {
            state.roles = [];
            state.permissions = [];
            state.scope = [];
            state.user_type = null;
            state.policies = [];
            state.is_superuser = false;
            state.is_root_user = false;
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
                state.is_superuser = authz.is_superuser || false;
                state.is_root_user = authz.is_root_user || false;
            }
        });
        builder.addCase(logout, (state) => {
            state.roles = [];
            state.permissions = [];
            state.scope = [];
            state.user_type = null;
            state.policies = [];
            state.is_superuser = false;
            state.is_root_user = false;
        });
    }
});

export const { setRbac, clearRbac } = rbacSlice.actions;
export default rbacSlice.reducer;
