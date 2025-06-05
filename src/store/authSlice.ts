import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    accessToken: string | null;
    permissions: string | null;
    email: string | null;
}

const initialState: AuthState = {
    accessToken: null,
    permissions: null,
    email: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string | null>) => {
            state.accessToken = action.payload;
        },
        clearAccessToken: (state) => {
            state.accessToken = null;
        },
		refresh(state,action){
			state = action.payload.result;
			return state;
		},
    },
});

export const { setAccessToken, clearAccessToken, refresh } = authSlice.actions;
export default authSlice.reducer;
