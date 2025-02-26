import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.88.230:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Токеныг AsyncStorage-с авах
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Токен хүлээн авлаа:', token);
    return token;
  } catch (error) {
    console.error('Токен авах үед алдаа:', error);
    return null;
  }
};

const setupInterceptors = (instance) => {
  instance.interceptors.request.use(
    async (config) => {
      const token = await getToken();
      console.log('Хүсэлтийн өмнөх токен:', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Header-д нэмэгдсэн Authorization:', config.headers.Authorization);
      } else {
        console.warn('Токен олдсонгүй');
      }
      return config;
    },
    (error) => {
      console.error('Интерцепторын хүсэлтийн алдаа:', error);
      return Promise.reject(error);
    }
  );
};

setupInterceptors(api);

// Auth функцууд
export const loginUser = async (credentials) => {
  try {
    console.log('Нэвтрэх хүсэлт явуулж байна...', credentials);
    const response = await api.post('/auth/login', credentials);
    console.log('Нэвтрэх хариулт:', response.data);

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Хариулт буруу форматтай байна');
    }

    const { token } = response.data;
    if (token) {
      await AsyncStorage.setItem('token', token);
      console.log('Токеныг амжилттай хадгаллаа:', token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Хариултад токен алга:', response.data);
    }
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Нэвтрэхэд алдаа гарлаа';
    console.error('Нэвтрэх үед алдаа:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('Бүртгүүлэх хүсэлт явуулж байна...', userData);
    const response = await api.post('/auth/register', userData);
    console.log('Бүртгүүлэх хариулт:', response.data);

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Хариулт буруу форматтай байна');
    }

    const { token } = response.data;
    if (token) {
      await AsyncStorage.setItem('token', token);
      console.log('Токеныг амжилттай хадгаллаа:', token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Хариултад токен алга:', response.data);
    }
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Бүртгүүлэхэд алдаа гарлаа';
    console.error('Бүртгүүлэх үед алдаа:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    console.log('fetchUserProfile response.data:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Профайл авахад алдаа гарлаа');
  }
};

export const fetchProducts = async () => {
  const token = await getToken();
  console.log('Гараар шалгаж байна, токен:', token);
  return api.get('/products', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createProduct = (productData) => api.post('/products', productData);

export const fetchCategories = () => api.get('/categories');

export const fetchPosts = () => api.get('/posts');

export const createPost = (postData) => {
  const formData = new FormData();
  formData.append('description', postData.description || '');
  formData.append('location', postData.location || '');
  formData.append('category', postData.category || '');

  if (postData.images && postData.images.length > 0) {
    postData.images.forEach((imageUri, index) => {
      formData.append('images', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `post-image-${index}.jpg`,
      });
    });
  }

  console.log('Sending post data:', formData);

  return api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createComment = async (commentData) => {
  const token = await getToken();
  console.log('Гараар шалгаж байна, токен:', token);
  return api.post('/comments', commentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const likePost = async (likeData) => {
  const token = await getToken();
  console.log('Гараар шалгаж байна, токен:', token);
  return api.post('/likes', likeData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default api;