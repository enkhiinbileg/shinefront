import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Animated, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { likePost } from '../redux/slices/likeSlice';
import { fetchPosts, updatePost } from '../redux/slices/postSlice';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedElement } from 'react-navigation-shared-element';
import { Image as ExpoImage } from 'expo-image';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onComment, onPress }) => {
  const dispatch = useDispatch();
  const likes = useSelector((state) => state.likes) || {};
  const auth = useSelector((state) => state.auth) || {};
  const posts = useSelector((state) => state.post.posts) || [];
  const currentPost = posts.find((p) => p.id === post.id) || post;

  const loading = likes.loading || false;
  const isLiked = likes.likedPosts?.[currentPost?.id]?.isLiked || false;
  const likesCount = likes.likedPosts?.[currentPost?.id]?.likesCount || currentPost?.likes?.length || 0;
  const comments = currentPost.comments || [];
  const user = auth.user;

  const doubleTapRef = useRef(null);
  const lastTap = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLike = useCallback(async () => {
    if (!user) {
      Alert.alert('Анхааруулга', 'Та эхлээд нэвтэрнэ үү');
      return;
    }
    if (!currentPost?.id || loading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await dispatch(likePost(currentPost.id)).unwrap();
      if (result && result.post) {
        dispatch(updatePost(result.post));
        dispatch(fetchPosts());
      }
    } catch (err) {
      Alert.alert('Алдаа', err.message || 'Лайк хийхэд алдаа гарлаа');
    }
  }, [dispatch, currentPost?.id, loading, user]);

  const handlePress = useCallback((event) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      if (!isLiked) handleLike();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      onPress?.(event);
    }
  }, [handleLike, onPress, isLiked]);

  const renderTags = useCallback(() => {
    const tags = currentPost.tags || ['Аялал', 'Байгаль', 'Адал явдал'];
    return tags.map((tag, index) => (
      <View key={index} style={styles.tag}>
        <Text style={styles.tagText}>#{tag}</Text>
      </View>
    ));
  }, [currentPost.tags]);

  const renderStats = useCallback(() => (
    <BlurView intensity={20} style={styles.statsContainer}>
      <Ionicons name="heart" size={12} color="#FFF" />
      <Text style={styles.statsText}>{likesCount.toLocaleString()}</Text>
      <Ionicons name="chatbubble" size={12} color="#FFF" />
      <Text style={styles.statsText}>{comments.length.toLocaleString()}</Text>
    </BlurView>
  ), [likesCount, comments.length]);

  const renderComments = useCallback(() => (
    <View style={styles.commentsContainer}>
      <Text style={styles.commentsTitle}>Сэтгэгдэл ({comments.length}):</Text>
      {comments.length > 0 ? (
        comments.slice(0, 2).map((comment) => ( // Эхний 2 сэтгэгдлийг харуулна
          <Text key={comment.id} style={styles.comment}>
            {comment.content} - {comment.authorId}
          </Text>
        ))
      ) : (
        <Text style={styles.noComments}>Сэтгэгдэл байхгүй</Text>
      )}
      {comments.length > 2 && (
        <TouchableOpacity onPress={onComment}>
          <Text style={styles.viewMoreComments}>Бүх сэтгэгдлийг харах...</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [comments, onComment]);

  if (!currentPost) return null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.95} onPress={handlePress}>
      <SharedElement id={`post.${currentPost.id}.image`}>
        <ExpoImage
          source={{ uri: currentPost.image }}
          style={styles.postImage}
          contentFit="cover"
          transition={300}
        />
      </SharedElement>

      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.3)']}
        style={styles.overlay}
        locations={[0, 0.5, 1]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <SharedElement id={`user.${currentPost.userId}.avatar`}>
              <ExpoImage
                source={{ uri: currentPost.userAvatar || 'https://via.placeholder.com/40' }}
                style={styles.avatar}
                contentFit="cover"
              />
            </SharedElement>
            <View>
              <SharedElement id={`user.${currentPost.userId}.name`}>
                <Text style={styles.username}>{currentPost.username || 'Аялагч'}</Text>
              </SharedElement>
              <View style={styles.locationWrapper}>
                <Ionicons name="location" size={12} color="#FFF" />
                <Text style={styles.location}>{currentPost.location || 'Улаанбаатар, Монгол'}</Text>
              </View>
            </View>
          </View>
          {renderStats()}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {currentPost.title || 'Аяллын тэмдэглэл'}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {currentPost.description}
        </Text>

        {renderComments()}

        <View style={styles.footer}>
          <View style={styles.tagsContainer}>{renderTags()}</View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike} disabled={loading}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? '#FF3B30' : '#666'}
              />
              <Text style={styles.actionText}>{likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onComment}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  commentsContainer: {
    marginTop: 10,
  },
  commentsTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  noComments: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  viewMoreComments: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
});

export default React.memo(PostCard);