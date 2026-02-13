import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { APP_LOADER } from "../../../types/appConfigInterface";

const initialState: APP_LOADER = {
    loaderText: "Loading Please Wait..",
    active: false

}

const appLoaderSlice = createSlice({
    name: 'loader',
    initialState,
    reducers: {
        startLoading: (state, action: PayloadAction<string>) => {
            state.active = true;
            state.loaderText = action.payload;
        },
        stopLoading: (state) => {
            state.active = false;
            state.loaderText = initialState.loaderText; // Reset to default text
        },

    }
})

export const { startLoading, stopLoading } = appLoaderSlice.actions;

export default appLoaderSlice.reducer;