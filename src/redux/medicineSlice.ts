import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

interface Medicine {
  id: string;
  medicine_name: string;
  number: string;
  stock: number;
  expiry_date: string;
  store_phone_number: string;
  date_time: string;
  bill_number: string;
  stia_name: string;
  total_price: number;
  paid: number;
  medicine_type?: "Bottle" | "Tablets" | "Injection";
  medicine_quantity?: string;
  medicine_unit?: "ml" | "L" | "Units";
  usages?: any[];
}

interface MedicineState {
  medicines: Medicine[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: MedicineState = {
  medicines: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchMedicines = createAsyncThunk("medicine/fetchMedicines", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/inventory/medicines/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch medicines");
  }
});

export const addMedicine = createAsyncThunk("medicine/addMedicine", async (data: any, { rejectWithValue }) => {
  try {
    const response = await api.post("/inventory/medicines/", data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add medicine");
  }
});

export const updateMedicine = createAsyncThunk("medicine/updateMedicine", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/inventory/medicines/${id}/`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update medicine");
  }
});

export const deleteMedicine = createAsyncThunk("medicine/deleteMedicine", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/inventory/medicines/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete medicine");
  }
});

const medicineSlice = createSlice({
  name: "medicine",
  initialState,
  reducers: {
    clearMedicineMessage: (state) => {
      state.message = null;
    },
    clearMedicineError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicines.pending, (state) => {
        if (state.medicines.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload;
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMedicine.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines.push(action.payload);
        state.message = "New medicine record added successfully!";
      })
      .addCase(addMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedicine.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.medicines.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.medicines[index] = action.payload;
        }
        state.message = "Medicine record updated successfully!";
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = state.medicines.filter((m) => m.id !== action.payload);
        state.message = "Record deleted successfully!";
      })
      .addCase(deleteMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMedicineMessage, clearMedicineError } = medicineSlice.actions;
export default medicineSlice.reducer;
