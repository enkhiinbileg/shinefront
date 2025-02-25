import React, { useEffect, useCallback, useState } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Text,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  Animated,
  ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../redux/slices/postSlice';
import PostCard from '../components/PostCard';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedElement } from 'react-navigation-shared-element';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';

const PostListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.post);
  const [refreshing, setRefreshing] = React.useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Анимэйшн утгуудыг useRef ашиглан хадгалах
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;

  // Компонент ачаалагдахад анимэйшн эхлүүлэх
  React.useEffect(() => {
    dispatch(fetchPosts());
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchPosts()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const loadMorePosts = useCallback(() => {
    if (hasMore && !loading) {
      dispatch(fetchPosts(page)).then(action => {
        if (action.payload.length < 10) { // Хуудас бүрт 10 пост
          setHasMore(false);
        }
        setPage(prev => prev + 1);
      });
    }
  }, [hasMore, loading, page]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header, 
        { 
          opacity: headerOpacity, 
          paddingTop: insets.top,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <BlurView intensity={80} tint="light" style={styles.headerBlur}>
        <View style={styles.headerContent}>
          <View>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <Text style={styles.headerTitle}>Аяллууд</Text>
              <Text style={styles.headerSubtitle}>Шинэ газрууд нээ</Text>
            </Animated.View>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <ExpoImage
              source={{ uri: 'https://via.placeholder.com/40' }}
              style={styles.profileImage}
              contentFit="cover"
              transition={200}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>Аяллын газар хайх...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {['Бүгд', 'Байгаль', 'Хот', 'Түүх', 'Соёл', 'Адал явдал'].map((filter, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: new Animated.Value(1),
                  transform: [{ scale: new Animated.Value(1) }]
                }}
              >
                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    index === 0 && styles.filterButtonActive
                  ]}
                >
                  <Text style={[
                    styles.filterText,
                    index === 0 && styles.filterTextActive
                  ]}>{filter}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderCreatePostButton = () => (
    <TouchableOpacity
      style={styles.createPostButton}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('CreatePost');
      }}
    >
      <LinearGradient
        colors={['#5C6BC0', '#3949AB']}
        style={styles.createPostGradient}
      >
        <MaterialIcons name="add" size={28} color="#FFF" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderNavBar = () => (
    <BlurView intensity={80} style={[styles.navBar, { paddingBottom: insets.bottom }]}>
      {[
        { icon: 'compass', route: 'PostList', label: 'Нээх' },
        { icon: 'map', route: 'Map', label: 'Газрын зураг' },
        { icon: 'bookmark', route: 'Saved', label: 'Хадгалсан' },
        { icon: 'person', route: 'UserProfile', label: 'Профайл' }
      ].map((item) => (
        <TouchableOpacity 
          key={item.route}
          style={styles.navButton}
          onPress={() => {
            Haptics.selectionAsync();
            navigation.navigate(item.route);
          }}
        >
          <Animated.View>
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={item.route === 'PostList' ? '#5C6BC0' : '#666'} 
            />
            <Text style={[
              styles.navLabel,
              item.route === 'PostList' && styles.navLabelActive
            ]}>
              {item.label}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </BlurView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      
      <Animated.FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                { translateY: Animated.multiply(slideAnim, new Animated.Value(index + 1)) }
              ]
            }}
          >
            <SharedElement id={`post.${item.id}`}>
              <PostCard 
                post={item} 
                onComment={() => navigation.navigate('Comment', { postId: item.id })}
                onPress={() => navigation.navigate('PostDetail', { post: item })} 
              />
            </SharedElement>
          </Animated.View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#5C6BC0"
            colors={['#5C6BC0']}
            progressBackgroundColor="#FFF"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 60 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
      />

      {renderCreatePostButton()}
      {loading && !refreshing && (
        <BlurView intensity={95} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5C6BC0" />
        </BlurView>
      )}
      
      {renderNavBar()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    paddingHorizontal: 16,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  createPostGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  filterScroll: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#5C6BC0',
    borderColor: '#3949AB',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  listContent: {
    paddingTop: 60,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 20,
    alignItems: 'center',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  navButton: {
    padding: 10,
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#5C6BC0',
    fontWeight: '600',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#5C6BC0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 15,
  },
  createPostButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 100,
  },
});

export default PostListScreen;