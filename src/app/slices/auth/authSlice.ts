import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// --- Type Definitions ---

/** Shape of user info returned by the /auth/me endpoint */
export interface LoginInfo {
    userFullName: string;
    role: string;
    email: string;
    phone: string | null;
    image: string | null;
    firstName: string;
    lastName: string;
    tenant_name: string | null;
    permissions: string[];
}

/** Payload dispatched after successful login or session hydration */
export interface AuthPayload {
    success: boolean;
    login_info: LoginInfo;
    access_token: string;
    authProvider?: string;
    message?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    loginInfo: LoginInfo | null;
    access_token: string | null;
    authRes: AuthPayload | null;
}

// --- Initial State ---

const initialState: AuthState = {
    isAuthenticated: false,
    loginInfo: null,
    access_token: null,
    authRes: null,
};

// --- Slice ---

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Hydrate auth state from login response or /auth/me response.
         * Both share the same AuthPayload shape.
         */
        login: (state, action: PayloadAction<AuthPayload>) => {
            state.authRes = action.payload;
            state.isAuthenticated = action.payload.success;
            state.loginInfo = action.payload.login_info;
            state.access_token = action.payload.access_token;
        },
        /** Clear all auth state — called on logout or 401 */
        logout: (state) => {
            state.isAuthenticated = false;
            state.loginInfo = null;
            state.access_token = null;
            state.authRes = null;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;