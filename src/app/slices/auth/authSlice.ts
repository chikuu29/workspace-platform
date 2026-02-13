import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    loginInfo: null,
    access_token: null,
    authRes:null
};


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.authRes=action.payload
            state.isAuthenticated = action.payload.success;
            state.loginInfo = action.payload.login_info;
            state.access_token = action.payload.access_token;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.loginInfo = null;
            state.access_token = null;
            state.authRes=null
        }
    }

})

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;