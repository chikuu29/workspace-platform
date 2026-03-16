import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Removed monolithic LoginInfo, now handled by userSlice, tenantSlice, rbacSlice

interface AuthState {
    isAuthenticated: boolean;
    access_token: string | null;
    authRes: any | null;
    isLoading: boolean;
    isHydrated: boolean;
}

const initialState: AuthState = {
    isAuthenticated: false,
    access_token: null,
    authRes: null,
    isLoading: true,
    isHydrated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        login: (state, action: PayloadAction<any>) => {
            state.authRes = action.payload;
            state.isAuthenticated = action.payload.success;
            state.access_token = action.payload.access_token;
            state.isLoading = false;
            state.isHydrated = true;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.access_token = null;
            state.authRes = null;
            state.isLoading = false;
            state.isHydrated = true;
        }
    }
});

export const { login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;