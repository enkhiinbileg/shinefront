import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const likePost = createAsyncThunk('like/likePost', async (postId, { rejectWithValue }) => {
  try {
    console.log('Лайкийн хүсэлт:', { postId });
    const response = await api.post('/likes', { postId });
    console.log('Лайкийн хариу:', response.data);
    return response.data;
  } catch (error) {
    console.log(error)
    const errorMsg = error.response?.data?.error || error.message;
    console.error('Лайкийн алдаа:', errorMsg);
    return rejectWithValue(errorMsg);
  }
});

const likeSlice = createSlice({
  name: 'like',
  initialState: { likes: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(likePost.fulfilled, (state, action) => {
        state.likes.push(action.payload);
        state.loading = false;
        state.error = null; // Алдааг цэвэрлэнэ
      })
      .addCase(likePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Алдааг хадгална
      });
  },
});

export default likeSlice.reducer;