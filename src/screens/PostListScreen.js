import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../redux/slices/postSlice';
import PostCard from '../components/PostCard';

const PostListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.post);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Button title="Шинэ пост оруулах" onPress={() => navigation.navigate('CreatePost')} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard post={item} onComment={() => navigation.navigate('Comment', { postId: item.id })} />
        )}
      />
      {loading && <ActivityIndicator />}
      <Button title="Профайл руу шилжих" onPress={() => navigation.navigate('UserProfile')} />
      <Button title="Бүтээгдэхүүн рүү шилжих" onPress={() => navigation.navigate('ProductList')} />
      <Button title="Ангилал руу шилжих" onPress={() => navigation.navigate('CategoryList')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default PostListScreen;