import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createComment } from '../redux/slices/commentSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

const CommentScreen = ({ route, navigation }) => {
  const postId = route?.params?.postId;
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.comment);
  const userAvatar = "https://via.placeholder.com/40"; // Энийг өөрийн хэрэглэгчийн avatar-аар солих

  if (!postId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="error-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>Постын ID олдсонгүй</Text>
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => navigation.navigate('PostList')}
          >
            <Text style={styles.returnButtonText}>Буцах</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (content.trim() === '') return;
    
    try {
      await dispatch(createComment({ content, postId, authorId: 'your-user-id' }));
      setContent('');
      navigation.navigate('PostList');
    } catch (err) {
      // Алдааг handle хийх
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.glassHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Сэтгэгдэл бичих</Text>
        </View>
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        <View style={styles.inputWrapper}>
          <Image 
            source={{ uri: userAvatar }} 
            style={styles.avatar}
          />
          <TextInput
            style={styles.modernInput}
            placeholder="Та юу бодож байна?"
            placeholderTextColor="#8E8E93"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={1000}
          />
        </View>

        {/* Character Count */}
        <Text style={styles.charCount}>
          {content.length}/1000
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={pickImage}
          >
            <Icon name="attach-file" size={24} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, !content.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Илгээх</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  glassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 100,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,60,67,0.03)',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginLeft: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(0,122,255,0.3)',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  returnButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommentScreen;