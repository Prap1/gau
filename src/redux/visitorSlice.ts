import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface Visit {
  id: string;
  visitor: string;
  visit_date: string;
  visit_time: string | null;
  notes: string | null;
  created_at: string;
}

export interface Visitor {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  dob: string | null;
  address: string;
  added_by?: string;
  added_by_name?: string;
  created_at: string;
  visits: Visit[];
  last_visit_date: string | null;
}

interface VisitorState {
  visitors: Visitor[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: VisitorState = {
  visitors: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchVisitors = createAsyncThunk("visitor/fetchVisitors", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/management/visitors/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch visitors");
  }
});

export const addVisitor = createAsyncThunk("visitor/addVisitor", async (data: any, { rejectWithValue }) => {
  try {
    const response = await api.post("/management/visitors/", data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add visitor");
  }
});

export const addVisit = createAsyncThunk("visitor/addVisit", async (data: any, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post("/management/visits/", data);
    dispatch(fetchVisitors());
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add visit record");
  }
});

export const updateVisitor = createAsyncThunk("visitor/updateVisitor", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/management/visitors/${id}/`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update visitor");
  }
});

export const deleteVisitor = createAsyncThunk("visitor/deleteVisitor", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/management/visitors/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete visitor");
  }
});

const visitorSlice = createSlice({
  name: "visitor",
  initialState,
  reducers: {
    clearVisitorMessage: (state) => {
      state.message = null;
    },
    clearVisitorError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.loading = false;
        state.visitors = action.payload;
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.visitors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.visitors[index] = action.payload;
          state.message = "Visitor information updated!";
        } else {
          state.visitors.unshift(action.payload);
          state.message = "Visitor recorded successfully!";
        }
      })
      .addCase(addVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addVisit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVisit.fulfilled, (state) => {
        state.loading = false;
        state.message = "Visit recorded successfully!";
      })
      .addCase(addVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.visitors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.visitors[index] = action.payload;
        }
        state.message = "Visitor record updated!";
      })
      .addCase(deleteVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.visitors = state.visitors.filter((v) => v.id !== action.payload);
        state.message = "Visitor record removed.";
      });
  },
});

export const { clearVisitorMessage, clearVisitorError } = visitorSlice.actions;
export default visitorSlice.reducer;
