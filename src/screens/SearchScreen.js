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
  Keyboard,
  Image,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { search, setFilters, clearFilters } from '../redux/slices/searchSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Chip from '../components/Chip';
import * as Haptics from 'expo-haptics';
import { debounce } from 'lodash';
import { useTheme } from '../context/ThemeContext';
import Animated, { FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';

// Бүхэл бүтэн дизайн системийн хувьд тогтвортой өнгөний палитр
const Colors = {
  primary: '#007AFF', // Илүү тод, орчин үеийн цэнхэр
  secondary: '#6B7280', // Саарал - дэд текстэд
  background: '#F7F8FA', // Хөнгөн саарал background
  card: '#FFFFFF', // Цагаан карт
  accent: '#34D399', // Ногоон - тодотголд
  border: '#E5E7EB', // Хөнгөн хүрээ
};

const SearchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const searchState = useSelector((state) => state.search);
  const { results, pagination, filters, loading } = searchState;
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterHeight = new RNAnimated.Value(0);
  const { theme } = useTheme();
  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = debounce((query) => {
    dispatch(setFilters({ query }));
    dispatch(search({ ...filters, query }));
  }, 300); // 500ms → 300ms болгож хурдыг нэмэв

  useEffect(() => {
    dispatch(search(filters));
    return () => debouncedSearch.cancel();
  }, []);

  const toggleFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    RNAnimated.timing(filterHeight, {
      toValue: showFilters ? 0 : 180, // Илүү авсаархан filter хэсэг
      duration: 250,
      useNativeDriver: false,
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

  const renderSearchBar = () => (
    <View style={[styles.searchBarContainer, { backgroundColor: Colors.card }]}>
      <Icon name="search" size={20} color={isFocused ? Colors.primary : Colors.secondary} />
      <TextInput
        ref={searchInputRef}
        style={styles.searchInput}
        placeholder="Хайх..."
        placeholderTextColor={Colors.secondary}
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          debouncedSearch(text);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        onSubmitEditing={() => dispatch(search(filters))}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            setSearchQuery('');
            dispatch(clearFilters());
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={styles.iconButton}
        >
          <Icon name="close" size={20} color={Colors.secondary} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
        <Icon
          name={showFilters ? 'expand-less' : 'tune'}
          size={20}
          color={showFilters ? Colors.primary : Colors.secondary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <RNAnimated.View style={[styles.filtersContainer, { height: filterHeight }]}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Төрөл</Text>
        <View style={styles.chipGroup}>
          {[
            { id: 'posts', label: 'Пост' },
            { id: 'products', label: 'Бүтээгдэхүүн' },
            { id: 'users', label: 'Хэрэглэгч' },
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
        <Text style={styles.filterTitle}>Эрэмбэлэх</Text>
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
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          entering={FadeInUp.delay(i * 100)}
          style={styles.skeletonItem}
        >
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonCircle} />
            <View>
              <View style={[styles.skeletonLine, { width: 120 }]} />
              <View style={[styles.skeletonLine, { width: 80 }]} />
            </View>
          </View>
          <View style={styles.skeletonBody} />
        </Animated.View>
      ))}
    </View>
  );

  const renderItem = ({ item, index }) => {
    switch (filters.type) {
      case 'posts':
        return (
          <Animated.View entering={FadeInUp.delay(index * 50)} layout={Layout.springify()}>
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => navigation.navigate('PostDetail', { post: item })}
              activeOpacity={0.7}
            >
              <View style={styles.resultHeader}>
                <Image
                  source={{
                    uri:
                      item.author?.profileImage ||
                      'https://images.pexels.com/photos/1045614/pexels-photo-1045614.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
                  }}
                  style={styles.authorImage}
                />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{item.author?.name}</Text>
                  <Text style={styles.postDate}>
                    {new Date(item.createdAt).toLocaleDateString('mn-MN')}
                  </Text>
                </View>
              </View>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
              )}
              <Text style={styles.postContent} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.postStats}>
                <View style={styles.statItem}>
                  <Icon name="favorite" size={16} color={Colors.accent} />
                  <Text style={styles.statText}>{item._count?.likes || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="chat-bubble-outline" size={16} color={Colors.secondary} />
                  <Text style={styles.statText}>{item._count?.comments || 0}</Text>
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
              source={{
                uri:
                  item.image ||
                  'https://images.pexels.com/photos/1045614/pexels-photo-1045614.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
              }}
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
                <Text style={styles.statText}>📝 {item._count?.posts || 0}</Text>
                <Text style={styles.statText}>👥 {item._count?.followers || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
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
              dispatch(search({ ...filters, page: pagination.page + 1 }));
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => dispatch(search(filters))}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        <Animated.View entering={FadeInUp} style={styles.emptyContainer}>
          <Icon name="search-off" size={48} color={Colors.secondary} />
          <Text style={styles.emptyText}>Илэрц олдсонгүй</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(search(filters))}
          >
            <Text style={styles.retryButtonText}>Дахин оролдох</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 10,
    fontWeight: '500',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  iconButton: {
    padding: 8,
  },
  filtersContainer: {
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  filterSection: {
    paddingVertical: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  resultItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  postDate: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginVertical: 12,
  },
  postContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.secondary,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 4,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
  },
  skeletonItem: {
    backgroundColor: Colors.card,
    padding: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    marginRight: 12,
  },
  skeletonLine: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    marginVertical: 4,
  },
  skeletonBody: {
    height: 100,
    backgroundColor: Colors.border,
    borderRadius: 12,
  },
});

export default SearchScreen;