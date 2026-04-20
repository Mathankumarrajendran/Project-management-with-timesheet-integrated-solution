import { createSlice } from '@reduxjs/toolkit';

interface ProjectState {
    projects: any[];
    loading: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    loading: false,
    error: null,
};

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {},
});

export default projectSlice.reducer;
