import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchProducts = createAsyncThunk('product/fetchProducts', async () => {
  const response = await axios.get('http://192.168.88.201:5000/api/products');
  return response.data;
});

export const createProduct = createAsyncThunk('product/createProduct', async (productData) => {
  const response = await axios.post('http://192.168.88.201:5000/api/products', productData);
  return response.data;
});

const productSlice = createSlice({
  name: 'product',
  initialState: { products: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
        state.loading = false;
      })
      .addCase(createProduct.pending, (state) => { state.loading = true; })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;