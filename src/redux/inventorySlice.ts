import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface FoodStock {
  id: number;
  food_name: string;
  quantity_kg: string;
  supplier: string;
  bill_number?: string;
  price_per_kg: string;
  total_amount?: string;
  purchase_date: string;
  notes: string;
}

interface InventoryState {
  foodStocks: FoodStock[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: InventoryState = {
  foodStocks: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchFoodStocks = createAsyncThunk("inventory/fetchFoodStocks", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/inventory/foods/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || "Failed to fetch food stocks");
  }
});

export const addFoodStock = createAsyncThunk("inventory/addFoodStock", async (data: any, { rejectWithValue }) => {
  try {
    const response = await api.post("/inventory/foods/", data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || "Failed to add food stock");
  }
});

export const updateFoodStock = createAsyncThunk("inventory/updateFoodStock", async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/inventory/foods/${id}/`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || "Failed to update food stock");
  }
});

export const deleteFoodStock = createAsyncThunk("inventory/deleteFoodStock", async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/inventory/foods/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || "Failed to delete food stock");
  }
});

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearInventoryMessage: (state) => { state.message = null; },
    clearInventoryError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoodStocks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFoodStocks.fulfilled, (state, action) => { state.loading = false; state.foodStocks = action.payload; })
      .addCase(fetchFoodStocks.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addFoodStock.pending, (state) => { state.loading = true; })
      .addCase(addFoodStock.fulfilled, (state, action) => { state.loading = false; state.foodStocks.push(action.payload); state.message = "Food stock added!"; })
      .addCase(addFoodStock.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateFoodStock.pending, (state) => { state.loading = true; })
      .addCase(updateFoodStock.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.foodStocks.findIndex((f) => f.id === action.payload.id);
        if (idx !== -1) state.foodStocks[idx] = action.payload;
        state.message = "Food stock updated!";
      })
      .addCase(updateFoodStock.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deleteFoodStock.pending, (state) => { state.loading = true; })
      .addCase(deleteFoodStock.fulfilled, (state, action) => { state.loading = false; state.foodStocks = state.foodStocks.filter((f) => f.id !== action.payload); state.message = "Food stock deleted!"; })
      .addCase(deleteFoodStock.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearInventoryMessage, clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;
