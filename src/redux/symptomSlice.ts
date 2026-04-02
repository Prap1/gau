import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface Symptom {
  id: string;
  name: string;
}

interface SymptomState {
  symptoms: Symptom[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: SymptomState = {
  symptoms: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchSymptoms = createAsyncThunk("symptom/fetchSymptoms", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/medical/symptoms/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch symptoms");
  }
});

export const addSymptom = createAsyncThunk("symptom/addSymptom", async (data: { name: string }, { rejectWithValue }) => {
  try {
    const response = await api.post("/medical/symptoms/", data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add symptom");
  }
});

export const deleteSymptom = createAsyncThunk("symptom/deleteSymptom", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/medical/symptoms/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete symptom");
  }
});

const symptomSlice = createSlice({
  name: "symptom",
  initialState,
  reducers: {
    clearSymptomMessage: (state) => {
      state.message = null;
    },
    clearSymptomError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSymptoms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSymptoms.fulfilled, (state, action) => {
        state.loading = false;
        state.symptoms = action.payload;
      })
      .addCase(fetchSymptoms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addSymptom.fulfilled, (state, action) => {
        state.loading = false;
        state.symptoms.push(action.payload);
        state.message = "Symptom added successfully!";
      })
      .addCase(deleteSymptom.fulfilled, (state, action) => {
        state.loading = false;
        state.symptoms = state.symptoms.filter((s) => s.id !== action.payload);
        state.message = "Symptom deleted successfully!";
      });
  },
});

export const { clearSymptomMessage, clearSymptomError } = symptomSlice.actions;
export default symptomSlice.reducer;
