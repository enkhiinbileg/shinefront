import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { createPost, fetchPosts } from '../redux/slices/postSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreatePostScreen = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.post);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Зургийн сан руу хандах зөвшөөрөл өгөөгүй байна.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      alert('Та нэвтрээгүй байна. Эхлээд нэвтэрнэ үү.');
      return;
    }

    await dispatch(createPost({ description, authorId: 'your-user-id', image, token }));
    dispatch(fetchPosts());
    setDescription('');
    setImage(null);
    navigation.navigate('PostList'); // Амжилттай бол буцна
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Тодорхойлолт оруулна уу"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Зураг сонгох" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Пост оруулах" onPress={handleSubmit} disabled={loading} />
      {loading && <ActivityIndicator />}
      {error && <Text style={styles.error}></Text>}
      <Button title="Постын жагсаалт руу буцах" onPress={() => navigation.navigate('PostList')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  image: { width: 200, height: 200, marginVertical: 10 },
  error: { color: 'red' },
});

export default CreatePostScreen;