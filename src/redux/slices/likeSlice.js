import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const likePost = createAsyncThunk(
  'like/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Гараар авсан токен:', token);
      const response = await api.post('/likes', { postId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Лайкийн хариу:', response.data);
      return response.data; // { message, post, likesCount }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      console.error('Лайкийн алдаа:', errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

const likeSlice = createSlice({
  name: 'like',
  initialState: { likes: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(likePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.likes.push(action.payload); // Түр хадгална
        state.loading = false;
        state.error = null;
      })
      .addCase(likePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default likeSlice.reducer;