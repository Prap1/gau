import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export interface BlogPost {
  id: number;
  author: number;
  author_details: any;
  title: string;
  content: string;
  cover_image: string;
  cover_image_url: string;
  category: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogState {
  posts: BlogPost[];
  myPosts: BlogPost[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: BlogState = {
  posts: [],
  myPosts: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchPosts = createAsyncThunk("blog/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/blog/posts/");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch posts");
  }
});

export const createPost = createAsyncThunk("blog/createPost", async (formData: FormData, { rejectWithValue }) => {
  try {
    const response = await api.post("/blog/posts/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to create post");
  }
});

export const updatePost = createAsyncThunk("blog/updatePost", async ({ id, formData }: { id: number; formData: FormData }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/blog/posts/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to update post");
  }
});

export const deletePost = createAsyncThunk("blog/deletePost", async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/blog/posts/${id}/`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to delete post");
  }
});

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogMessage: (state) => {
      state.message = null;
    },
    clearBlogError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.message = "Blog post created successfully!";
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.posts[index] = action.payload;
        state.message = "Blog post updated successfully!";
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
        state.message = "Blog post deleted successfully!";
      });
  },
});

export const { clearBlogMessage, clearBlogError } = blogSlice.actions;
export default blogSlice.reducer;
