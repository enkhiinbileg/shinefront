import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createComment } from '../redux/slices/commentSlice';

const CommentScreen = ({ route, navigation }) => {
  const postId = route?.params?.postId;
  if (!postId) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Постын ID олдсонгүй!</Text>
      </View>
    );
  }

  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.comment);

  const handleSubmit = async () => {
    if (content.trim() === '') return;
    try {
      const commentData = { content, postId };
      await dispatch(createComment(commentData)).unwrap();
      setContent('');
      navigation.goBack(); // PostList руу буцна
    } catch (err) {
      console.log('Коммент амжилтгүй:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Таны сэтгэгдэл"
        value={content}
        onChangeText={setContent}
      />
      <Button title="Сэтгэгдэл нэмэх" onPress={handleSubmit} disabled={loading} color="#6200ea" />
      {error && <Text style={styles.error}>Алдаа: {error}</Text>}
      <Button title="Буцах" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
  error: { color: 'red', marginTop: 10 },
});

export default CommentScreen;