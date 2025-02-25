import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ProductListScreen from '../screens/ProductListScreen';
import CreateProductScreen from '../screens/CreateProductScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostListScreen from '../screens/PostListScreen';
import CommentScreen from '../screens/CommentScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostList" component={PostListScreen} />
      <Stack.Screen name="Comment" component={CommentScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;