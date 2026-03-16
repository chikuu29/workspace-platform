
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { parseApiError, ParsedError } from '@/utils/apiErrorParser';

interface ErrorState {
    globalError: ParsedError | null;
    lastErrorId: string | null;
}

const initialState: ErrorState = {
    globalError: null,
    lastErrorId: null,
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setGlobalError: (state, action: PayloadAction<any>) => {
            state.globalError = parseApiError(action.payload);
            state.lastErrorId = Date.now().toString();
        },
        clearGlobalError: (state) => {
            state.globalError = null;
            state.lastErrorId = null;
        },
    },
    extraReducers: (builder) => {
        // Automatically capture rejected actions from AsyncThunks
        builder.addMatcher(
            (action): action is PayloadAction<any> => action.type.endsWith('/rejected'),
            (state, action) => {
                // If the action payload exists (rejected with value), use it
                // Otherwise fallback to the serialized error
                if (action.payload) {
                    state.globalError = parseApiError(action.payload);
                    state.lastErrorId = Date.now().toString();
                    console.log("Global Error Captured (Payload):", action.payload);
                } else {
                    // Fallback for network errors or thunks that didn't use rejectWithValue.
                    // Cast to any to access .error which is present on rejected actions but missing from PayloadAction<any>
                    const err = (action as any).error;
                    if (err) {
                        state.globalError = parseApiError(err);
                        state.lastErrorId = Date.now().toString();
                        console.log("Global Error Captured (Error):", err);
                    }
                }
            }
        );
        // Optional: Clear error on new pending actions?
        // User might want to keep the error until manually closed, so strictly optional.
        // For "popop" style, we usually wait for user to close.
    },
});

export const { setGlobalError, clearGlobalError } = errorSlice.actions;
export default errorSlice.reducer;
