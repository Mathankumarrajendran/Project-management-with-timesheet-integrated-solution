import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    employeeId: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    hydrated: boolean; // Track if localStorage has been loaded
}

// Load initial state from localStorage
const loadAuthFromStorage = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                return { user, token };
            } catch {
                return { user: null, token: null };
            }
        }
    }
    return { user: null, token: null };
};

const { user: initialUser, token: initialToken } = loadAuthFromStorage();

const initialState: AuthState = {
    user: initialUser,
    token: initialToken,
    loading: false,
    error: null,
    hydrated: true, // Set to true since we've loaded from localStorage
};

// Login
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, user } = response.data.data; // Fix: response.data.data instead of response.data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return { token, user };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Get profile
export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/auth/profile');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Get profile
        builder.addCase(getProfile.fulfilled, (state, action) => {
            state.user = action.payload;
        });

        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
        });
    },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
