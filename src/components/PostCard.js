import React, { useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { likePost } from '../redux/slices/likeSlice';
import { fetchPosts, updatePost } from '../redux/slices/postSlice';

const PostCard = ({ post, onComment }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.like);
  const posts = useSelector((state) => state.post.posts);
  const currentPost = posts.find((p) => p.id === post.id) || post;

  const handleLike = async () => {
    try {
      const result = await dispatch(likePost(post.id)).unwrap();
      if (result && result.post) {
        dispatch(updatePost(result.post));
        dispatch(fetchPosts());
      }
    } catch (err) {
      console.log('Лайк амжилтгүй:', err);
    }
  };

  const likesCount = currentPost.likes ? currentPost.likes.length : 0;
  const comments = currentPost.comments || [];

  useEffect(() => {
    console.log('Current post:', currentPost);
    console.log('Comments:', comments);
  }, [currentPost]);

  return (
    <View style={styles.card}>
      <Text>{currentPost.description}</Text>
      {currentPost.image && <Image source={{ uri: currentPost.image }} style={styles.image} />}
      <Text>Лайк: {likesCount}</Text>
      
      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>Сэтгэгдэл ({comments.length}):</Text>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Text key={comment.id} style={styles.comment}>
              {comment.content} - {comment.authorId}
            </Text>
          ))
        ) : (
          <Text style={styles.noComments}>Сэтгэгдэл байхгүй</Text>
        )}
      </View>

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
  commentsContainer: { marginTop: 10 },
  commentsTitle: { fontWeight: 'bold', marginBottom: 5 },
  comment: { fontSize: 14, color: '#333', marginBottom: 5 },
  noComments: { fontSize: 14, color: '#666', fontStyle: 'italic' },
});

export default PostCard;