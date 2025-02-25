import React, { useCallback, useRef } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { likePost } from '../redux/slices/likeSlice';
import { fetchPosts } from '../redux/slices/postSlice';

const PostCard = ({ post, onComment, onPress }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.likes); // 'like'-ийн оронд 'likes'
  const lastTap = useRef(null);
  const isLiked = post.isLiked; // Постын өгөгдлөөс ирж байна гэж таамаглаж байна

  const handleLike = async () => {
    try {
      console.log('Лайк дарж байна, post.id:', post.id);
      const result = await dispatch(likePost(post.id)).unwrap();
      if (result) {
        dispatch(fetchPosts()); // Постыг шинэчлэх
      }
    } catch (err) {
      Alert.alert('Алдаа', err.message || 'Лайк хийхэд алдаа гарлаа');
    }
  };

  const handlePress = useCallback(
    (event) => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;
      if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
        if (!isLiked) handleLike();
        lastTap.current = null;
      } else {
        lastTap.current = now;
        onPress?.(event);
      }
    },
    [handleLike, onPress, isLiked]
  );

  const likesCount = post.likes ? post.likes.length : 0;

  return (
    <View style={styles.card}>
      <Text>{post.description}</Text>
      {post.image && <Image source={{ uri: post.image }} style={styles.image} />}
      <Text>Лайк: {likesCount}</Text>
      <Button title="Лайк" onPress={handleLike} disabled={loading} />
      <Button title="Коммент" onPress={onComment} />
      {loading && <Text style={styles.status}>Лайк ачаалж байна...</Text>}
      {error && <Text style={styles.error}>Алдаа: {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 10, borderWidth: 1, marginBottom: 10 },
  image: { width: 200, height: 200 },
  status: { color: 'blue', marginTop: 5 },
  error: { color: 'red', marginTop: 5 },
});

export default React.memo(PostCard);