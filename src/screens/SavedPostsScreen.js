import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Modal, RefreshControl, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import * as Haptics from 'expo-haptics';

const SavedPostsScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [savedPosts] = useState([
    {
      id: '1',
      title: 'Хөвсгөл нуур аялал',
      description: 'Хөвсгөл нуурын байгалийн үзэсгэлэнт газар руу хийх аялал',
      images: ['https://picsum.photos/400/600'],
      author: {
        id: '1',
        name: 'Болд',
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      category: 'Байгаль',
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [showSortModal, setShowSortModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filters = [
    { id: 'all', label: 'Бүгд', icon: 'grid-view' },
    { id: 'nature', label: 'Байгаль', icon: 'landscape' },
    { id: 'city', label: 'Хот', icon: 'location-city' },
    { id: 'food', label: 'Хоол', icon: 'restaurant' }
  ];

  const sortOptions = [
    { id: 'date', label: 'Огноогоор', icon: 'access-time' },
    { id: 'likes', label: 'Таалагдсанаар', icon: 'favorite' },
    { id: 'comments', label: 'Сэтгэгдлээр', icon: 'comment' }
  ];

  const onRefresh = async () => {
    setIsRefreshing(true);
    // API call to fetch saved posts
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const toggleSelection = (postId) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(postId)) {
      newSelection.delete(postId);
    } else {
      newSelection.add(postId);
    }
    setSelectedPosts(newSelection);
  };

  const renderFilter = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.id && styles.filterButtonActive
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        setSelectedFilter(item.id);
      }}
    >
      <MaterialIcons
        name={item.icon}
        size={20}
        color={selectedFilter === item.id ? '#fff' : '#666'}
      />
      <Text
        style={[
          styles.filterText,
          selectedFilter === item.id && styles.filterTextActive
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        onPress={() => setShowSortModal(false)}
      >
        <BlurView intensity={90} tint="dark" style={styles.sortModal}>
          <View style={styles.sortModalContent}>
            <Text style={styles.sortModalTitle}>Эрэмбэлэх</Text>
            {sortOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  sortBy === option.id && styles.selectedSortOption
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSortBy(option.id);
                  setShowSortModal(false);
                }}
              >
                <MaterialIcons
                  name={option.icon}
                  size={24}
                  color={sortBy === option.id ? '#0066ff' : '#666'}
                />
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option.id && styles.selectedSortOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.gridItem,
        isSelectionMode && selectedPosts.has(item.id) && styles.selectedGridItem
      ]}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsSelectionMode(true);
        toggleSelection(item.id);
      }}
      onPress={() => {
        if (isSelectionMode) {
          toggleSelection(item.id);
        } else {
          navigation.navigate('PostDetail', { post: item });
        }
      }}
    >
      <Image
        source={{ uri: item.images[0] }}
        style={styles.gridImage}
        contentFit="cover"
      />
      {isSelectionMode && (
        <View style={styles.selectionOverlay}>
          <MaterialIcons
            name={selectedPosts.has(item.id) ? 'check-circle' : 'radio-button-unchecked'}
            size={24}
            color="#fff"
          />
        </View>
      )}
      <BlurView intensity={60} tint="dark" style={styles.gridItemInfo}>
        <Text style={styles.gridItemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.gridItemCategory} numberOfLines={1}>
          {item.category}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );

  // Add renderItem function for list view
  const renderItem = ({ item }) => (
    <PostCard 
      post={item} 
      onLongPress={() => {
        if (!isSelectionMode) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setIsSelectionMode(true);
          toggleSelection(item.id);
        }
      }}
      onPress={() => {
        if (isSelectionMode) {
          toggleSelection(item.id);
        }
      }}
      isSelected={isSelectionMode && selectedPosts.has(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Хадгалсан</Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => {
              Haptics.selectionAsync();
              setShowSortModal(true);
            }}
          >
            <MaterialIcons name="sort" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <MaterialIcons
              name={viewMode === 'grid' ? 'view-list' : 'grid-view'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
          {isSelectionMode && (
            <>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  // Handle delete selected
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <MaterialIcons name="delete" size={24} color="#FF4B4B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  setIsSelectionMode(false);
                  setSelectedPosts(new Set());
                }}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </>
          )}
        </View>
        <FlatList
          horizontal
          data={filters}
          renderItem={renderFilter}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </BlurView>
      <FlatList
        key={viewMode}
        data={savedPosts}
        renderItem={viewMode === 'grid' ? renderGridItem : renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0066ff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="bookmark-border" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Хадгалсан пост байхгүй байна</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => {
                Haptics.selectionAsync();
                // Navigate to explore
              }}
            >
              <Text style={styles.exploreButtonText}>Пост үзэх</Text>
            </TouchableOpacity>
          </View>
        }
        numColumns={viewMode === 'grid' ? 2 : 1}
      />
      {renderSortModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600'
  },
  sortButton: {
    padding: 8,
  },
  filterList: {
    padding: 16,
    paddingTop: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: '#0066ff',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#0066ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    width: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sortModalContent: {
    padding: 16,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  selectedSortOption: {
    backgroundColor: '#f0f7ff',
  },
  sortOptionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#666',
  },
  selectedSortOptionText: {
    color: '#0066ff',
    fontWeight: '600',
  },
  gridItem: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  selectedGridItem: {
    opacity: 0.7,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridItemInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  gridItemTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gridItemCategory: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default SavedPostsScreen; 