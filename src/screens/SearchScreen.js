import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated as RNAnimated,
  Platform,
  Keyboard,
  Image,
  RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { search, setFilters, clearFilters } from '../redux/slices/searchSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Chip from '../components/Chip';
import * as Haptics from 'expo-haptics';
import { debounce } from 'lodash';
import { useTheme } from '../context/ThemeContext';
import Animated, { 
  FadeInUp, 
  FadeOutDown,
  Layout 
} from 'react-native-reanimated';

const SearchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const searchState = useSelector((state) => state.search);
  console.log('Search state:', searchState);
  const { results, pagination, filters, loading } = searchState;
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterHeight = new RNAnimated.Value(0);
  const { theme } = useTheme();
  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  const debouncedSearch = debounce((query) => {
    dispatch(setFilters({ query }));
    dispatch(search({ ...filters, query }));
  }, 500);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  // Анхны хайлт
  useEffect(() => {
    dispatch(search(filters));
  }, []);

  const toggleFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    RNAnimated.timing(filterHeight, {
      toValue: showFilters ? 0 : 200,
      duration: 300,
      useNativeDriver: false
    }).start();
    setShowFilters(!showFilters);
  };

  const handleTypeChange = (type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(setFilters({ type }));
    dispatch(search({ ...filters, type }));
  };

  const handleSortChange = (sortBy) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(setFilters({ sortBy }));
    dispatch(search({ ...filters, sortBy }));
  };

  const handleFocus = () => {
    setIsFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const renderSearchBar = () => (
    <View style={[styles.searchBarContainer, { 
      backgroundColor: theme.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 19,
      elevation: 3,
      margin: 12,
      borderRadius: 12,
      borderWidth: isFocused ? 2 : 0,
      borderColor: theme.primary,
      transform: [{ scale: isFocused ? 1.02 : 1 }],
    }]}>
      <Icon 
        name="search" 
        size={24} 
        color={isFocused ? theme.primary : theme.textSecondary} 
      />
      <TextInput
        ref={searchInputRef}
        style={[styles.searchInput, { 
          color: theme.text,
          fontSize: 16,
          fontWeight: '500'
        }]}
        placeholder="Хайх..."
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          debouncedSearch(text);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        onSubmitEditing={() => dispatch(search(filters))}
      />
      {searchQuery ? (
        <TouchableOpacity
          onPress={() => {
            setSearchQuery('');
            dispatch(clearFilters());
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={styles.iconButton}
        >
          <Icon name="close" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity 
        onPress={toggleFilters}
        style={[styles.iconButton, { backgroundColor: showFilters ? theme.primary + '20' : 'transparent' }]}
      >
        <Icon 
          name={showFilters ? "expand-less" : "tune"} 
          size={20} 
          color={showFilters ? theme.primary : theme.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <RNAnimated.View 
      style={[
        styles.filtersContainer,
        { height: filterHeight }
      ]}
    >
      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, { color: theme.text }]}>Төрөл</Text>
        <View style={styles.chipGroup}>
          {[
            { id: 'posts', label: 'Пост' },
            { id: 'products', label: 'Бүтээгдэхүүн' },
            { id: 'users', label: 'Хэрэглэгч' }
          ].map((type) => (
            <Chip
              key={type.id}
              selected={filters.type === type.id}
              onPress={() => handleTypeChange(type.id)}
              style={styles.chip}
            >
              {type.label}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, { color: theme.text }]}>Эрэмбэлэх</Text>
        <View style={styles.chipGroup}>
          <Chip
            selected={filters.sortBy === 'latest'}
            onPress={() => handleSortChange('latest')}
            style={styles.chip}
          >
            Шинэ
          </Chip>
          <Chip
            selected={filters.sortBy === 'popular'}
            onPress={() => handleSortChange('popular')}
            style={styles.chip}
          >
            Их үзсэн
          </Chip>
        </View>
      </View>
    </RNAnimated.View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1,2,3].map(i => (
        <Animated.View 
          key={i}
          entering={FadeInUp.delay(i * 100)}
          style={[styles.skeletonItem, { backgroundColor: theme.card }]}
        >
          <View style={styles.skeletonHeader}>
            <View style={[styles.skeletonCircle, { backgroundColor: theme.border }]} />
            <View>
              <View style={[styles.skeletonLine, { width: 120, backgroundColor: theme.border }]} />
              <View style={[styles.skeletonLine, { width: 80, backgroundColor: theme.border }]} />
            </View>
          </View>
          <View style={[styles.skeletonBody, { backgroundColor: theme.border }]} />
        </Animated.View>
      ))}
    </View>
  );

  const renderItem = ({ item, index }) => {
    switch (filters.type) {
      case 'posts':
        return (
          <Animated.View
            entering={FadeInUp.delay(index * 100)}
            exiting={FadeOutDown}
            layout={Layout.springify()}
          >
            <TouchableOpacity
              style={[styles.resultItem, {
                backgroundColor: theme.card,
                margin: 8,
                borderRadius: 16,
                shadowColor: "white",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 1,
                transform: [{ scale: 1 }],
                borderWidth: 1,
                borderColor: '#35F8F5'
              }]}
              onPress={() => navigation.navigate('PostDetail', { post: item })}
              activeOpacity={0.5}
            >
              <View style={styles.resultHeader}>
                <Image
                  source={{ uri: item.author?.profileImage || 'https://images.pexels.com/photos/1045614/pexels-photo-1045614.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load' }}
                  style={[styles.authorImage, { borderWidth: 2, borderColor: theme.primary }]}
                />
                <View style={styles.authorInfo}>
                  <Text style={[styles.authorName, { color: theme.text }]}>{item.author?.name}</Text>
                  <Text style={[styles.postDate, { color: theme.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleDateString('mn-MN')}
                  </Text>
                </View>
              </View>
              {item.image && (
                <Image 
                  source={{ uri: item.image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              )}
              <Text style={[styles.postContent, { color: theme.text }]} numberOfLines={3}>
                {item.description}
              </Text>
              <View style={styles.postStats}>
                <View style={styles.statItem}>
                  <Icon name="favorite" size={16} color={theme.primary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>{item._count?.likes || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="chat-bubble-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>{item._count?.comments || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      case 'products':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          >
            <Image
              source={{ uri: item.image || 'https://images.pexels.com/photos/1045614/pexels-photo-1045614.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load' }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              <Text style={styles.productCategory}>{item.category?.name}</Text>
            </View>
          </TouchableOpacity>
        );
      case 'users':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
          >
            <Image
              source={{ uri: item.profileImage || 'https://via.placeholder.com/50' }}
              style={styles.userImage}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <View style={styles.userStats}>
                <Text style={styles.statText}>📝 {item._count?.posts || 0} posts</Text>
                <Text style={styles.statText}>👥 {item._count?.followers || 0} followers</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderSearchBar()}
      {renderFilters()}
      
      {loading ? (
        renderSkeleton()
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (pagination.page < pagination.pages) {
              dispatch(search({
                ...filters,
                page: pagination.page + 1
              }));
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => dispatch(search(filters))}
              tintColor={theme.primary}
            />
          }
        />
      ) : (
        <Animated.View 
          entering={FadeInUp}
          style={styles.emptyContainer}
        >
          <Icon name="search-off" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            Хайлтын илэрц олдсонгүй
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => dispatch(search(filters))}
          >
            <Text style={styles.retryButtonText}>Дахин хайх</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  filtersContainer: {
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  filterSection: {
    padding: 16,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    marginRight: 8,
  },
  resultItem: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  postDate: {
    fontSize: 13,
    opacity: 0.6,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 12,
    letterSpacing: 0.3,
  },
  postStats: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 10,
    borderRadius: 10,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginVertical: 10,
  },
  listContainer: {
    padding: 8,
  },
  retryButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonItem: {
    padding: 20,
    marginVertical: 10,
    borderRadius: 20,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    marginVertical: 5,
  },
  skeletonBody: {
    height: 120,
    borderRadius: 12,
    marginTop: 16,
  },
});

export default SearchScreen; 
