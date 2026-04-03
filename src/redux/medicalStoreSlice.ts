import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface MedicalStore {
  id: string;
  name: string;
  contact_no: string;
}

interface MedicalStoreState {
  medicalStores: MedicalStore[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: MedicalStoreState = {
  medicalStores: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchMedicalStores = createAsyncThunk("medicalStore/fetchMedicalStores", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/inventory/medical-stores/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch medical stores");
  }
});

export const addMedicalStore = createAsyncThunk("medicalStore/addMedicalStore", async (data: { name: string, contact_no: string }, { rejectWithValue }) => {
  try {
    const response = await api.post("/inventory/medical-stores/", data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add medical store");
  }
});

export const deleteMedicalStore = createAsyncThunk("medicalStore/deleteMedicalStore", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/inventory/medical-stores/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete medical store");
  }
});

const medicalStoreSlice = createSlice({
  name: "medicalStore",
  initialState,
  reducers: {
    clearMedicalStoreMessage: (state) => {
      state.message = null;
    },
    clearMedicalStoreError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalStores.fulfilled, (state, action) => {
        state.loading = false;
        state.medicalStores = action.payload;
      })
      .addCase(fetchMedicalStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addMedicalStore.fulfilled, (state, action) => {
        state.loading = false;
        state.medicalStores.push(action.payload);
        state.message = "Medical store added successfully!";
      })
      .addCase(deleteMedicalStore.fulfilled, (state, action) => {
        state.loading = false;
        state.medicalStores = state.medicalStores.filter((s) => s.id !== action.payload);
        state.message = "Medical store deleted successfully!";
      });
  },
});

export const { clearMedicalStoreMessage, clearMedicalStoreError } = medicalStoreSlice.actions;
export default medicalStoreSlice.reducer;
