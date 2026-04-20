import { createSlice } from '@reduxjs/toolkit';

interface UserState {
    users: any[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: [],
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
});

export default userSlice.reducer;
