import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface Disease {
  id: string;
  name: string;
}

interface DiseaseState {
  diseases: Disease[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: DiseaseState = {
  diseases: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchDiseases = createAsyncThunk("disease/fetchDiseases", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/medical/diseases/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch diseases");
  }
});

export const addDisease = createAsyncThunk("disease/addDisease", async (data: { name: string }, { rejectWithValue }) => {
  try {
    const response = await api.post("/medical/diseases/", data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add disease");
  }
});

export const deleteDisease = createAsyncThunk("disease/deleteDisease", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/medical/diseases/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete disease");
  }
});

const diseaseSlice = createSlice({
  name: "disease",
  initialState,
  reducers: {
    clearDiseaseMessage: (state) => {
      state.message = null;
    },
    clearDiseaseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiseases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiseases.fulfilled, (state, action) => {
        state.loading = false;
        state.diseases = action.payload;
      })
      .addCase(fetchDiseases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addDisease.fulfilled, (state, action) => {
        state.loading = false;
        state.diseases.push(action.payload);
        state.message = "Disease added successfully!";
      })
      .addCase(deleteDisease.fulfilled, (state, action) => {
        state.loading = false;
        state.diseases = state.diseases.filter((d) => d.id !== action.payload);
        state.message = "Disease deleted successfully!";
      });
  },
});

export const { clearDiseaseMessage, clearDiseaseError } = diseaseSlice.actions;
export default diseaseSlice.reducer;
