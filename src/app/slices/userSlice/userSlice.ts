import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, logout } from "../auth/authSlice";

interface UserProfile {
    sub?: string;
    user_id?: number;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone_number?: string | null;
    user_type?: "PLATFORM" | "ORGANIZATION";
    is_active?: boolean;
    profile?: Record<string, any>;
}

interface UserState {
    profile: UserProfile | null;
}

const initialState: UserState = {
    profile: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfile>) => {
            state.profile = action.payload;
        },
        clearUser: (state) => {
            state.profile = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login, (state, action) => {
            if (action.payload?.login_info?.identity) {
                state.profile = action.payload.login_info.identity;
            }
        });
        builder.addCase(logout, (state) => {
            state.profile = null;
        });
    }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
