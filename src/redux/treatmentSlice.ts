import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

interface Treatment {
  id: string;
  cow: string;
  cow_token_no?: string;
  cow_admission_date?: string;
  checkup_date: string;
  symptoms: string;
  medicine: string;
  status: "Ongoing" | "Recovered" | "Death";
  doctor_name?: string;
  notes: string;
  cow_history?: string;
  cow_diseases?: string;
  cow_condition?: "Normal" | "Serious";
}

interface Cow {
  id: string;
  token_no: string;
  caller_of_rescue: string;
}

interface TreatmentState {
  treatments: Treatment[];
  cows: Cow[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: TreatmentState = {
  treatments: [],
  cows: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchTreatments = createAsyncThunk("treatment/fetchTreatments", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/medical/treatment/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch treatments");
  }
});

export const fetchCows = createAsyncThunk("treatment/fetchCows", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/cattle/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch cows");
  }
});

export const addTreatment = createAsyncThunk("treatment/addTreatment", async (data: any, { rejectWithValue }) => {
  try {
    const response = await api.post("/medical/", data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add treatment");
  }
});

export const updateTreatment = createAsyncThunk("treatment/updateTreatment", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/medical/${id}/`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update treatment");
  }
});

export const deleteTreatment = createAsyncThunk("treatment/deleteTreatment", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/medical/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete treatment");
  }
});

const treatmentSlice = createSlice({
  name: "treatment",
  initialState,
  reducers: {
    clearTreatmentMessage: (state) => {
      state.message = null;
    },
    clearTreatmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreatments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.loading = false;
        state.treatments = action.payload;
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCows.fulfilled, (state, action) => {
        state.cows = action.payload;
      })
      .addCase(addTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTreatment.fulfilled, (state, action) => {
        state.loading = false;
        state.treatments.push(action.payload);
        state.message = "Daily checkup logged successfully!";
      })
      .addCase(addTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTreatment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.treatments.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.treatments[index] = action.payload;
        }
        state.message = "Treatment record updated successfully!";
      })
      .addCase(updateTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTreatment.fulfilled, (state, action) => {
        state.loading = false;
        state.treatments = state.treatments.filter((t) => t.id !== action.payload);
        state.message = "Treatment record deleted successfully!";
      })
      .addCase(deleteTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTreatmentMessage, clearTreatmentError } = treatmentSlice.actions;
export default treatmentSlice.reducer;
