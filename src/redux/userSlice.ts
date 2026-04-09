import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: "admin" | "doctor" | "member";
  profile_image: string | null;
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
  joining_date?: string;
  gender?: string;
  dob?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  address?: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (role: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/auth/users/?role=${role}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch users");
  }
});

export const addUser = createAsyncThunk("users/addUser", async (data: any, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/users/", data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      const errVals = Object.values(error.response.data);
      if (errVals.length > 0 && Array.isArray(errVals[0])) {
        return rejectWithValue(errVals[0][0]);
      }
    }
    return rejectWithValue(error.response?.data?.message || "Failed to add user");
  }
});

export const updateUser = createAsyncThunk("users/updateUser", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/auth/users/${id}/`, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      const errVals = Object.values(error.response.data);
      if (errVals.length > 0 && Array.isArray(errVals[0])) {
        return rejectWithValue((errVals[0] as string[])[0]);
      }
    }
    return rejectWithValue(error.response?.data?.message || "Failed to update user");
  }
});

export const deleteUser = createAsyncThunk("users/deleteUser", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/auth/users/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete user");
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserMessage: (state) => {
      state.message = null;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        if (state.users.length === 0) if (state.users.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.message = "User added successfully!";
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.message = "User updated successfully!";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.message = "User deleted successfully!";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserMessage, clearUserError } = userSlice.actions;
export default userSlice.reducer;
