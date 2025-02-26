import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Like үйлдэл
export const likePost = createAsyncThunk(
  'like/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post('/likes', { postId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Like хийхэд алдаа гарлаа');
    }
  }
);

// Unlike үйлдэл
export const unlikePost = createAsyncThunk(
  'like/unlikePost', 
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/likes/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Unlike хийхэд алдаа гарлаа');
    }
  }
);

const likeSlice = createSlice({
  name: 'like',
  initialState: {
    likes: [],
    loading: false,
    error: null
  },
  reducers: {
    clearLikeError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Like cases
      .addCase(likePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.loading = false;
        state.likes.push(action.payload);
      })
      .addCase(likePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Unlike cases  
      .addCase(unlikePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        state.loading = false;
        state.likes = state.likes.filter(like => like.postId !== action.payload.postId);
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearLikeError } = likeSlice.actions;
export default likeSlice.reducer;