import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const createComment = createAsyncThunk('comment/createComment', async (commentData) => {
  const response = await axios.post('http://192.168.88.201:5000/api/comments', commentData);
  return response.data;
});

const commentSlice = createSlice({
  name: 'comment',
  initialState: { comments: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        state.loading = false;
      })
      .addCase(createComment.pending, (state) => { state.loading = true; })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default commentSlice.reducer;