import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCategories = createAsyncThunk('category/fetchCategories', async () => {
  const response = await axios.get('http://http://192.168.88.230:5000/api/categories');
  return response.data;
});

const categorySlice = createSlice({
  name: 'category',
  initialState: { categories: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categorySlice.reducer;