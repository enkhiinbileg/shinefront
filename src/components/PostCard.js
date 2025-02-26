import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  Animated,
  Pressable,
  ActivityIndicator,
  Share,
  PanResponder
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, unlikePost } from '../redux/slices/likeSlice';
import { fetchPosts } from '../redux/slices/postSlice';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';
import { MotiView, MotiText } from 'moti';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const PostCard = ({ post, onComment }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.likes);
  const currentUser = useSelector((state) => state.auth.user);
  const lastTap = useRef(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showTripInfo, setShowTripInfo] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const animateScale = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateHeart = () => {
    setShowLikeAnimation(true);
    Animated.sequence([
      Animated.spring(heartAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.spring(heartAnim, {
        toValue: 0,
        useNativeDriver: true,
      })
    ]).start(() => setShowLikeAnimation(false));
  };

  const animateCardEntry = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  };

  useEffect(() => {
    animateCardEntry();
  }, []);

  // Check if post is already liked on mount
  useEffect(() => {
    if (post.likes && currentUser) {
      const isAlreadyLiked = post.likes.some(like => like.userId === currentUser.id);
      setIsLiked(isAlreadyLiked);
      setLikesCount(post.likes.length);
    }
  }, [post.likes, currentUser]);

  const handleLike = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Анхааруулга', 'Та эхлээд нэвтэрнэ үү');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Optimistic update
      setIsLiked(prev => !prev);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      
      animateHeart();
      
      // Like эсвэл Unlike хийх
      const action = isLiked ? unlikePost : likePost;
      const result = await dispatch(action(post.id)).unwrap();
      
      // Серверээс ирсэн like-ын тоогоор шинэчлэх
      if (result.likesCount !== undefined) {
        setLikesCount(result.likesCount);
      }
      
    } catch (error) {
      // Алдаа гарвал буцаах
      setIsLiked(prev => !prev);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      
      Alert.alert('Алдаа', error.message || 'Like хийхэд алдаа гарлаа');
    }
  };

  const handlePress = useCallback((event) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (!isLiked) {
        handleLike();
        animateScale();
      }
      lastTap.current = null;
    } else {
      lastTap.current = now;
      navigation.navigate('PostDetail', { post });
    }
  }, [handleLike, navigation, isLiked]);

  const renderOptionsModal = () => (
    <BlurView
      intensity={90}
      tint="dark"
      style={[
        StyleSheet.absoluteFill,
        styles.optionsModal
      ]}
    >
      <TouchableOpacity 
        style={styles.optionsOverlay}
        onPress={() => setShowOptions(false)}
      />
      <Animated.View style={styles.optionsContent}>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="bookmark-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Хадгалах</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="alert-circle-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Мэдэгдэх</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="link-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Холбоос хуулах</Text>
        </TouchableOpacity>
      </Animated.View>
    </BlurView>
  );

  // Reaction sound effect
  const playReactionSound = async () => {
    try {
      await soundObject.loadAsync(require('../assets/sounds/pop.mp3'));
      await soundObject.playAsync();
    } catch (error) {
      console.log('Sound error:', error);
    }
  };

  // Pan Responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: () => {},
      onPanResponderRelease: () => {},
    })
  ).current;

  // Reactions data
  const reactions = [
    { id: 'love', icon: '❤️', label: 'Love' },
    { id: 'wow', icon: '😮', label: 'Wow' },
    { id: 'haha', icon: '😂', label: 'Haha' },
    { id: 'sad', icon: '😢', label: 'Sad' },
    { id: 'angry', icon: '😠', label: 'Angry' }
  ];

  const renderReactionBar = () => null;

  // Add trip info section
  const renderTripInfo = () => (
    <MotiView
      from={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={styles.tripInfoContainer}
    >
      <View style={styles.tripInfoRow}>
        <View style={styles.tripInfoItem}>
          <MaterialIcons name="timer" size={20} color="#666" />
          <Text style={styles.tripInfoText}>{post.duration || '3-5 өдөр'}</Text>
        </View>
        <View style={styles.tripInfoItem}>
          <MaterialIcons name="group" size={20} color="#666" />
          <Text style={styles.tripInfoText}>{post.groupSize || '2-8 хүн'}</Text>
        </View>
        <View style={styles.tripInfoItem}>
          <MaterialIcons name="attach-money" size={20} color="#666" />
          <Text style={styles.tripInfoText}>{post.price || '150,000₮'}</Text>
        </View>
      </View>
      <View style={styles.tripHighlights}>
        {(post.highlights || ['Байгалийн үзэсгэлэн', 'Түүх соёл', 'Адал явдал']).map((highlight, index) => (
          <View key={index} style={styles.highlightTag}>
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>
    </MotiView>
  );

  const handleReaction = () => {};

  const handleSave = () => {};

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await Share.share({
        message: `${post.description}\n\n${post.images[0]}`,
        title: 'Пост хуваалцах'
      });

    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Алдаа', 'Хуваалцахад алдаа гарлаа');
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <SharedElement id={`post.${post.id}.card`}>
        <View style={styles.card}>
          <Pressable onPress={handlePress}>
            <View style={styles.imageContainer}>
              {!imageLoaded && (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator color="#FFF" />
                </View>
              )}
              {post.images && post.images.length > 0 && (
                <Image
                  source={{ uri: post.images[0] }}
                  style={styles.image}
                  contentFit="cover"
                  transition={500}
                  onLoadEnd={() => setImageLoaded(true)}
                />
              )}
              
              {/* Double tap heart animation */}
              {showLikeAnimation && (
                <Animated.View style={[styles.heartOverlay, {
                  transform: [
                    { scale: heartAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.2, 1]
                    })}
                  ],
                  opacity: heartAnim
                }]}>
                  <MaterialCommunityIcons name="heart" size={80} color="#FFF" />
                </Animated.View>
              )}

              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              >
                <View style={styles.header}>
                  <TouchableOpacity 
                    style={styles.userInfo}
                    onPress={() => {
                      Haptics.selectionAsync();
                      navigation.navigate('UserProfile', { userId: post.author.id });
                    }}
                  >
                    <SharedElement id={`user.${post.author.id}.avatar`}>
                      <Image
                        source={{ 
                          uri: post.author?.profileImage || 
                          'https://images.pexels.com/photos/1045614/pexels-photo-1045614.jpeg'
                        }}
                        style={styles.avatar}
                        contentFit="cover"
                        transition={200}
                      />
                    </SharedElement>
                    <View>
                      <Text style={styles.username}>{post.author?.name || 'Аялагч'}</Text>
                      {post.location && (
                        <View style={styles.locationContainer}>
                          <MaterialIcons name="place" size={14} color="#FFF" />
                          <Text style={styles.location}>{post.location}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={() => {
                      Haptics.selectionAsync();
                      // Handle save
                    }}
                  >
                    <MaterialIcons name="bookmark-border" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Pressable>

          <BlurView intensity={60} tint="light" style={styles.content}>
            <TouchableOpacity 
              style={styles.tripInfoHeader}
              onPress={() => setShowTripInfo(!showTripInfo)}
            >
              <Text style={styles.title} numberOfLines={2}>
                {post.title || 'Говийн бүсийн аялал'}
              </Text>
              <MaterialIcons 
                name={showTripInfo ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#666"
              />
            </TouchableOpacity>

            {showTripInfo && renderTripInfo()}

            <Text numberOfLines={2} style={styles.description}>
              {post.description}
            </Text>
            
            <View style={styles.metadata}>
              {post.category && (
                <LinearGradient
                  colors={['#5C6BC0', '#3949AB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.categoryTag}
                >
                  <Text style={styles.categoryText}>{post.category}</Text>
                </LinearGradient>
              )}
              <Text style={styles.date}>
                {new Date(post.createdAt).toLocaleDateString('mn-MN')}
              </Text>
            </View>
            
            <View style={styles.actions}>
              <View style={styles.leftActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleLike}
                  disabled={loading}
                >
                  <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={26}
                      color={isLiked ? '#FF4B4B' : '#666'}
                    />
                  </Animated.View>
                  <Text style={[styles.actionText, isLiked && styles.likedText]}>
                    {likesCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => {
                    Haptics.selectionAsync();
                    onComment();
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#666" />
                  <Text style={styles.actionText}>
                    {post.comments?.length || 0}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  Haptics.selectionAsync();
                  handleShare();
                }}
              >
                <Ionicons name="share-social-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </SharedElement>
      {showOptions && renderOptionsModal()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 450,
  },
  heartOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    zIndex: 10,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  location: {
    fontSize: 13,
    color: '#FFF',
    marginTop: 4,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 16,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  likedText: {
    color: '#FF4B4B',
  },
  imagePlaceholder: {
    position: 'absolute',
    width: '100%',
    height: 400,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  optionsModal: {
    justifyContent: 'flex-end',
  },
  optionsOverlay: {
    flex: 1,
  },
  optionsContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  reactionBar: {},
  reactionButton: {},
  selectedReaction: {},
  reactionEmoji: {},
  reactionLabel: {},
  swipeIndicators: {},
  swipeIndicator: {},
  swipeText: {},
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  tripInfoContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  tripInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripInfoText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tripHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  highlightTag: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tripInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default React.memo(PostCard);