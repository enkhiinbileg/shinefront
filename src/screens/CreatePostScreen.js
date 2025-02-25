import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { createPost, fetchPosts } from '../redux/slices/postSlice';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CreatePostScreen = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.post);
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);

  const categories = ['Байгаль', 'Хот', 'Түүх', 'Соёл', 'Адал явдал'];

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Анхааруулга', 'Зургийн сан руу хандах зөвшөөрөл өгнө үү.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages].slice(0, 5)); // Максимум 5 зураг
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Зураг сонгоход алдаа гарлаа.');
    }
  };

  const removeImage = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim() || images.length === 0) {
      Alert.alert('Анхааруулга', 'Тодорхойлолт болон дор хаяж нэг зураг оруулна уу.');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await dispatch(createPost({ 
        description, 
        images, 
        location,
        category 
      })).unwrap();
      
      dispatch(fetchPosts());
      navigation.navigate('PostList');
    } catch (error) {
      Alert.alert('Алдаа', error.message || 'Пост оруулахад алдаа гарлаа.');
    }
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
      {error && <Text style={styles.error}>Алдаа: {error}</Text>}
      <Button title="Постын жагсаалт руу буцах" onPress={() => navigation.navigate('PostList')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: '#5C6BC0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#5C6BC0',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: '31%',
    aspectRatio: 1,
  },
  addImageGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CreatePostScreen;