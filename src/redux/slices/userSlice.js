import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserProfile as fetchUserProfileApi } from '../../utils/api';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await fetchUserProfileApi(userId);
      console.log('Thunk-д буцаж ирсэн data:', data); // Шалгах
      return data; // Зөвхөн сериалчлагддаг data-г буцаана
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // Зөвхөн сериалчлагддаг data-г хадгална
        console.log('State.profile-д хадгалагдсан:', state.profile); // Шалгах
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;