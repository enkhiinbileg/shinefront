import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import postReducer from './slices/postSlice';
import commentReducer from './slices/commentSlice';
import likeReducer from './slices/likeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    product: productReducer,
    category: categoryReducer,
    post: postReducer,
    comment: commentReducer,
    like: likeReducer,
  },
});

export default store;
