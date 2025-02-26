import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const search = createAsyncThunk(
  'search/search',
  async (params, { rejectWithValue }) => {
    try {
      console.log('Search params:', params);
      const response = await api.get('/search', { params });
      console.log('Search response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    pagination: {
      total: 0,
      pages: 0,
      page: 1,
      limit: 10
    },
    filters: {
      query: '',
      type: 'posts',
      category: '',
      priceRange: null,
      location: '',
      sortBy: 'latest'
    },
    loading: false,
    error: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset page when filters change
    },
    clearFilters: (state) => {
      state.filters = {
        query: '',
        type: 'posts',
        category: '',
        priceRange: null,
        location: '',
        sortBy: 'latest'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(search.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(search.fulfilled, (state, action) => {
        state.results = action.payload.results;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(search.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearFilters } = searchSlice.actions;
export default searchSlice.reducer; 