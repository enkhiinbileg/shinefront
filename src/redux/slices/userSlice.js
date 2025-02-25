import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async (userId) => {
  const response = await axios.get(`http://192.168.88.201:5000/api/users/${userId}`);
  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState: { profile: null, loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;