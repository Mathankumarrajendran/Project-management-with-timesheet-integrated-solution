import { createSlice } from '@reduxjs/toolkit';

interface TaskState {
    tasks: any[];
    loading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    tasks: [],
    loading: false,
    error: null,
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {},
});

export default taskSlice.reducer;
