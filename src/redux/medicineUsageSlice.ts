import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

interface MedicineUsage {
  id: string;
  medicine: string;
  medicine_name: string;
  batch_number: string;
  medicine_type: "Bottle" | "Tablets" | "Injection";
  medicine_unit: "ml" | "L" | "Units";
  quantity: number;
  usage_date: string;
  usage_type: "Used" | "Defect" | "Expired";
  notes: string;
}

interface MedicineUsageState {
  usages: MedicineUsage[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: MedicineUsageState = {
  usages: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchMedicineUsages = createAsyncThunk("medicineUsage/fetchMedicineUsages", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/inventory/usage/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch usage records");
  }
});

export const addMedicineUsage = createAsyncThunk("medicineUsage/addMedicineUsage", async (data: any, { rejectWithValue }) => {
  try {
    const response = await api.post("/inventory/usage/", data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to record usage");
  }
});

export const updateMedicineUsage = createAsyncThunk("medicineUsage/updateMedicineUsage", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/inventory/usage/${id}/`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update record");
  }
});

export const deleteMedicineUsage = createAsyncThunk("medicineUsage/deleteMedicineUsage", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/inventory/usage/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete record");
  }
});

const medicineUsageSlice = createSlice({
  name: "medicineUsage",
  initialState,
  reducers: {
    clearUsageMessage: (state) => {
      state.message = null;
    },
    clearUsageError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicineUsages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicineUsages.fulfilled, (state, action) => {
        state.loading = false;
        state.usages = action.payload;
      })
      .addCase(fetchMedicineUsages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addMedicineUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMedicineUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.usages.push(action.payload);
        state.message = "Usage record added successfully!";
      })
      .addCase(addMedicineUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMedicineUsage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.usages.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.usages[index] = action.payload;
        }
        state.message = "Record updated successfully!";
      })
      .addCase(deleteMedicineUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.usages = state.usages.filter((u) => u.id !== action.payload);
        state.message = "Record deleted successfully!";
      });
  },
});

export const { clearUsageMessage, clearUsageError } = medicineUsageSlice.actions;
export default medicineUsageSlice.reducer;
