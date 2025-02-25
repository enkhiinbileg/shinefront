import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Постуудыг татах
export const fetchPosts = createAsyncThunk('post/fetchPosts', async () => {
  const response = await axios.get('http://http://192.168.88.230:5000/api/posts');
  return response.data;
});

// Шинэ пост үүсгэх
export const createPost = createAsyncThunk(
  'post/createPost',
  async (postData, { getState }) => {
    const token = getState().auth.token;

    const formData = new FormData();
    formData.append('description', postData.description);
    formData.append('authorId', postData.authorId);
    if (postData.image) {
      formData.append('image', {
        uri: postData.image,
        type: 'image/jpeg',
        name: 'post-image.jpg',
      });
    }

    const response = await axios.post(
      'http://192.168.88.201:5000/api/posts',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState: { posts: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPosts.pending, (state) => { state.loading = true; })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
        state.loading = false;
      })
      .addCase(createPost.pending, (state) => { state.loading = true; })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default postSlice.reducer;