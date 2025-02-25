import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { fetchPosts } from './postSlice';

export const createComment = createAsyncThunk(
  'comment/createComment',
  async (commentData, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await api.post('/comments', commentData);
      const newComment = response.data;

      // Шууд state шинэчлэх
      const posts = getState().post.posts;
      const updatedPosts = posts.map((p) =>
        p.id === commentData.postId
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      );
      dispatch({ type: 'post/fetchPosts/fulfilled', payload: updatedPosts });

      await dispatch(fetchPosts()); // Серверээс шинэчилнэ
      return newComment;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      return rejectWithValue(errorMsg);
    }
  }
);

const commentSlice = createSlice({
  name: 'comment',
  initialState: { comments: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        state.loading = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default commentSlice.reducer;
