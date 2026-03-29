import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface GalleryImage {
  id: number;
  uploaded_by: number;
  uploaded_by_details: any;
  image: string;
  image_url: string;
  title: string;
  category: string;
  is_approved: boolean;
  created_at: string;
}

interface GalleryState {
  images: GalleryImage[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: GalleryState = {
  images: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchGallery = createAsyncThunk("gallery/fetchGallery", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/gallery/images/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch gallery");
  }
});

export const uploadGalleryImage = createAsyncThunk("gallery/uploadGalleryImage", async (formData: FormData, { rejectWithValue }) => {
  try {
    const response = await api.post("/gallery/images/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to upload image");
  }
});

export const deleteGalleryImage = createAsyncThunk("gallery/deleteGalleryImage", async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/gallery/images/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to delete image");
  }
});

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    clearGalleryMessage: (state) => {
      state.message = null;
    },
    clearGalleryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGallery.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadGalleryImage.fulfilled, (state, action) => {
        state.images.unshift(action.payload);
        state.message = "Image uploaded successfully!";
      })
      .addCase(deleteGalleryImage.fulfilled, (state, action) => {
        state.images = state.images.filter((img) => img.id !== action.payload);
        state.message = "Image deleted successfully!";
      });
  },
});

export const { clearGalleryMessage, clearGalleryError } = gallerySlice.actions;
export default gallerySlice.reducer;
