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
import Onboard from '../screens/Onboard';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Onboard">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="PostList" component={PostListScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Comment" component={CommentScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Onboard" component={Onboard} options={{ headerShown: false }}/>
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;