import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface Donation {
  id: string;
  donor: string;
  donation_type: "Money" | "Material";
  amount: number | null;
  material_details: string | null;
  material_quantity: string | null;
  added_by?: string;
  added_by_name?: string;
  donation_date: string;
  created_at: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  dob: string | null;
  address: string;
  donations: Donation[];
  total_money: number;
  material_summary: string | null;
  last_donation_date: string | null;
  created_at: string;
}

interface DonorState {
  donors: Donor[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: DonorState = {
  donors: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchDonors = createAsyncThunk("donor/fetchDonors", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/management/donors/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch donors");
  }
});

export const addDonation = createAsyncThunk("donor/addDonation", async (data: any, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.post("/management/donations/", data);
    dispatch(fetchDonors()); // Refetch to get updated totals and history
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to log donation");
  }
});

export const updateDonor = createAsyncThunk("donor/updateDonor", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/management/donors/${id}/`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update donor");
  }
});

export const deleteDonor = createAsyncThunk("donor/deleteDonor", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/management/donors/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete donor");
  }
});

const donorSlice = createSlice({
  name: "donor",
  initialState,
  reducers: {
    clearDonorMessage: (state) => {
      state.message = null;
    },
    clearDonorError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonors.pending, (state) => {
        if (state.donors.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonors.fulfilled, (state, action) => {
        state.loading = false;
        state.donors = action.payload;
      })
      .addCase(fetchDonors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDonation.fulfilled, (state) => {
        state.loading = false;
        state.message = "Donation logged successfully!";
      })
      .addCase(addDonation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDonor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.donors.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.donors[index] = action.payload;
        }
        state.message = "Donor record updated!";
      })
      .addCase(deleteDonor.fulfilled, (state, action) => {
        state.loading = false;
        state.donors = state.donors.filter((d) => d.id !== action.payload);
        state.message = "Donor record removed.";
      });
  },
});

export const { clearDonorMessage, clearDonorError } = donorSlice.actions;
export default donorSlice.reducer;
