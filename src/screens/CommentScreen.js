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
  StatusBar,
  Button,
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createComment } from '../redux/slices/commentSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { mn } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons } from '@expo/vector-icons';

const CommentScreen = ({ route, navigation }) => {
  const postId = route?.params?.postId;
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [submitAnim] = useState(new Animated.Value(1));
  const dispatch = useDispatch();
  const { loading, error, comments } = useSelector((state) => state.comment);
  const userAvatar = "https://via.placeholder.com/40"; // Энийг өөрийн хэрэглэгчийн avatar-аар солих

  const MAX_CHARS = 500;

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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Зураг сонгоход алдаа гарлаа:', err);
    }
  };

  const handleSubmit = async () => {
    if (content.trim() === '') return;
    
    Animated.sequence([
      Animated.timing(submitAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(submitAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    dispatch(createComment({ content, postId, authorId: 'your-user-id', image }));
    setContent('');
    setImage(null);
    navigation.navigate('PostList');
  };

  const renderComment = ({ item }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={200}
      style={styles.commentContainer}
    >
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: item.author?.profileImage || userAvatar }}
            style={styles.commentAvatar}
            contentFit="cover"
          />
          <View>
            <Text style={styles.commentAuthor}>{item.author?.name || 'Хэрэглэгч'}</Text>
            <Text style={styles.commentDate}>
              {format(new Date(item.createdAt), 'MMM d, HH:mm', { locale: mn })}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => {
            // Handle more options
            Haptics.selectionAsync();
          }}
        >
          <MaterialIcons name="more-vert" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.commentText}>{item.content}</Text>

      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.commentImage}
          contentFit="cover"
        />
      )}

      <View style={styles.commentActions}>
        <TouchableOpacity 
          style={styles.commentAction}
          onPress={() => {
            Haptics.selectionAsync();
            // Handle like
          }}
        >
          <MaterialIcons 
            name={item.isLiked ? "favorite" : "favorite-border"} 
            size={18} 
            color={item.isLiked ? "#FF4B4B" : "#666"} 
          />
          <Text style={[
            styles.actionText,
            item.isLiked && styles.likedText
          ]}>
            {item.likes?.length || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.commentAction}
          onPress={() => {
            Haptics.selectionAsync();
            // Handle reply
          }}
        >
          <MaterialIcons name="reply" size={18} color="#666" />
          <Text style={styles.actionText}>Хариулах</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.glassHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Сэтгэгдлүүд</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        {comments.length > 0 ? (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat-bubble-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Сэтгэгдэл байхгүй байна</Text>
            <Text style={styles.emptySubtext}>Анхны сэтгэгдлийг үлдээгээрэй</Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
          <TextInput
            style={styles.modernInput}
            placeholder="Та юу бодож байна?"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={MAX_CHARS}
          />
        </View>

        <Text style={styles.charCount}>
          {content.length}/{MAX_CHARS}
        </Text>

        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeImage}
              onPress={() => setImage(null)}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={pickImage}
          >
            <Icon name="image" size={24} color="#007AFF" />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: submitAnim }] }}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!content.trim() || loading) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!content.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Илгээх</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
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
  imagePreview: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    padding: 16,
  },
  commentContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  commentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  likedText: {
    color: '#FF4B4B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CommentScreen;