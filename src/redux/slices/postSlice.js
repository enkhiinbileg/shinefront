import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createPost as apiCreatePost, fetchPosts as apiFetchPosts } from '../../utils/api'; // api.js-ээс импортлож байна

export const fetchPosts = createAsyncThunk('post/fetchPosts', async () => {
  const response = await apiFetchPosts();
  return response.data;
});

export const createPost = createAsyncThunk(
  'post/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const { description, images, location, category, token } = postData;
      const formData = new FormData();
      formData.append('description', description);
      formData.append('location', location || '');
      formData.append('category', category || '');

      // Олон зураг нэмэх
      images.forEach((imageUri, index) => {
        formData.append('images', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `post-image-${index}.jpg`,
        });
      });

      const response = await apiCreatePost(formData); // api.js-ийн createPost-г ашиглана
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState: { posts: [], loading: false, error: null },
  reducers: {
    updatePost(state, action) {
      const updatedPost = action.payload;
      const index = state.posts.findIndex((p) => p.id === updatedPost.id);
      if (index !== -1) {
        state.posts[index] = updatedPost;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Пост оруулахад алдаа гарлаа';
      });
  },
});

export const { updatePost } = postSlice.actions;
export default postSlice.reducer;