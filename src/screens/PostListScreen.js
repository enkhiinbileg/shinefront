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
  ScrollView,
  useColorScheme
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
import { useFocusEffect } from '@react-navigation/native';
import { MotiView } from 'moti';
import { useTheme } from '../context/ThemeContext';

const PostListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.post);
  const [refreshing, setRefreshing] = React.useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [weather, setWeather] = useState({ temp: '23°', condition: '☀️' });
  const colorScheme = useColorScheme();
  const { theme, toggleTheme } = useTheme();

  // Theme colors - илүү дэлгэрэнгүй өнгөний тохиргоо
  const colors = {
    background: theme === 'dark' ? '#121212' : '#F8F9FA',
    surface: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    text: theme === 'dark' ? '#FFFFFF' : '#1A1A1A',
    textSecondary: theme === 'dark' ? '#AAAAAA' : '#666666',
    card: theme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    border: theme === 'dark' ? '#333333' : '#E9ECEF',
    primary: theme === 'dark' ? '#7986CB' : '#5C6BC0',
    accent: theme === 'dark' ? '#B39DDB' : '#3949AB',
    navBar: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    navBarBorder: theme === 'dark' ? '#333333' : '#EFEFEF',
    weatherGradient: theme === 'dark' 
      ? ['#1A237E', '#303F9F']
      : ['#4FC3F7', '#2196F3'],
  };

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

  const renderWeatherCard = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 500 }}
      style={[styles.weatherCard, { backgroundColor: colors.card }]}
    >
      <BlurView 
        intensity={theme === 'dark' ? 40 : 60} 
        tint={theme === 'dark' ? 'dark' : 'light'} 
        style={styles.weatherBlur}
      >
        <View style={styles.weatherContent}>
          <View>
            <Text style={[styles.weatherTemp, { color: colors.text }]}>{weather.temp}</Text>
            <Text style={[styles.weatherLocation, { color: colors.textSecondary }]}>
              Улаанбаатар
            </Text>
          </View>
          <Text style={styles.weatherIcon}>{weather.condition}</Text>
        </View>
      </BlurView>
    </MotiView>
  );

  const renderThemeToggle = () => (
    <TouchableOpacity
      style={[
        styles.themeToggle,
        { backgroundColor: colors.surface }
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        toggleTheme();
      }}
    >
      <Ionicons
        name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={24}
        color={colors.text}
      />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <Animated.View 
      style={[styles.header, { opacity: headerOpacity, paddingTop: insets.top }]}
    >
      <BlurView 
        intensity={theme === 'dark' ? 40 : 90} 
        tint={theme === 'dark' ? 'dark' : 'light'} 
        style={[styles.headerBlur, { borderBottomColor: colors.border }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                Сайн байна уу! 👋
              </Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Аяллын Бүртгэл
              </Text>
            </Animated.View>
          </View>
          <View style={styles.headerRight}>
            {renderThemeToggle()}
            <TouchableOpacity 
              style={[
                styles.notificationButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate('Notifications');
              }}
            >
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={colors.text} 
              />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.profileButton,
                { borderColor: colors.primary }
              ]}
              onPress={() => navigation.navigate('UserProfile')}
            >
              <ExpoImage
                source={{ uri: 'https://images.pexels.com/photos/1045614/pexels-photo-1045614.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load' }}
                style={styles.profileImage}
                contentFit="cover"
                transition={300}
              />
            </TouchableOpacity>
          </View>
        </View>

        {renderWeatherCard()}

        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={[styles.searchBar, { 
              backgroundColor: colors.card,
              borderColor: colors.border 
            }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Хаашаа аялах вэ?
            </Text>
            <View style={styles.searchRight}>
              <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
              <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {[
              { icon: '🌎', label: 'Бүгд' },
              { icon: '🏔️', label: 'Байгаль' },
              { icon: '🌆', label: 'Хот' },
              { icon: '🏛️', label: 'Түүх' },
              { icon: '🎭', label: 'Соёл' },
              { icon: '🏃', label: 'Адал явдал' }
            ].map((filter, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100 }}
              >
                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    { 
                      backgroundColor: selectedFilter === index ? colors.primary : colors.card,
                      borderColor: selectedFilter === index ? colors.accent : colors.border 
                    }
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedFilter(index);
                  }}
                >
                  <Text style={styles.filterIcon}>{filter.icon}</Text>
                  <Text style={[
                    styles.filterText,
                    { 
                      color: selectedFilter === index ? '#FFF' : colors.textSecondary 
                    }
                  ]}>{filter.label}</Text>
                </TouchableOpacity>
              </MotiView>
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
        colors={colors.weatherGradient}
        style={styles.createPostGradient}
      >
        <MaterialIcons name="add" size={28} color="#FFF" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderNavBar = () => (
    <BlurView 
      intensity={theme === 'dark' ? 40 : 80} 
      tint={theme === 'dark' ? 'dark' : 'light'}
      style={[
        styles.navBar, 
        { 
          paddingBottom: insets.bottom,
          borderTopColor: colors.navBarBorder,
          backgroundColor: colors.navBar 
        }
      ]}
    >
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
          <Animated.View style={styles.navButtonContent}>
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={item.route === 'PostList' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              styles.navLabel,
              { color: colors.textSecondary },
              item.route === 'PostList' && [
                styles.navLabelActive,
                { color: colors.primary }
              ]
            ]}>
              {item.label}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </BlurView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      {renderHeader()}
      
      <Animated.FlatList
        data={posts}
        keyExtractor={(item, index) => `post-${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <Animated.View
            key={`post-view-${item.id}-${index}`}
            style={{
              opacity: fadeAnim,
              transform: [
                { translateY: Animated.multiply(slideAnim, new Animated.Value(index + 1)) }
              ]
            }}
          >
            <SharedElement id={`post-${item.id}-${index}`}>
              <PostCard 
                key={`post-card-${item.id}-${index}`}
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
          { paddingBottom: insets.bottom + 90 }
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
        <BlurView 
          intensity={theme === 'dark' ? 40 : 95} 
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={[
            styles.loadingContainer,
            { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)' }
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
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
  welcomeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    transform: [{ scale: 1 }],
  },
  filterButtonActive: {
    backgroundColor: '#5C6BC0',
    borderColor: '#3949AB',
    transform: [{ scale: 1.05 }],
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
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
    flex: 1,
    alignItems: 'center',
  },
  navButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchPlaceholder: {
    color: '#ADB5BD',
    fontSize: 15,
    fontWeight: '500',
  },
  createPostButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#5C6BC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 100,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
  },
  weatherCard: {
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  weatherBlur: {
    padding: 16,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  weatherLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  weatherIcon: {
    fontSize: 36,
  },
  searchRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 12,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
});

export default PostListScreen;