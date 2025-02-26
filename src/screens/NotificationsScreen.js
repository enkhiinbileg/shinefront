import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, ScrollView, RefreshControl, SectionList, Share } from 'react-native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications] = useState([
    {
      id: '1',
      type: 'comment',
      user: {
        name: 'Болд',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      postId: '1',
      postImage: 'https://picsum.photos/200',
      time: '2 цагийн өмнө',
      read: false
    },
    {
      id: '2',
      type: 'like',
      user: {
        name: 'Сараа',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
      },
      postId: '2',
      postImage: 'https://picsum.photos/201',
      time: '4 цагийн өмнө',
      read: true
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Бүгд' },
    { id: 'unread', label: 'Уншаагүй' },
    { id: 'mentions', label: 'Дурдсан' }
  ];

  const [notificationGroups, setNotificationGroups] = useState({
    today: [],
    yesterday: [],
    older: []
  });

  const groupNotifications = (notifications) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return notifications.reduce((groups, notification) => {
      const notifDate = new Date(notification.time);
      
      if (notifDate.toDateString() === today.toDateString()) {
        groups.today.push(notification);
      } else if (notifDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(notification);
      } else {
        groups.older.push(notification);
      }
      return groups;
    }, { today: [], yesterday: [], older: [] });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    // API call to fetch new notifications
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const markAllAsRead = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // API call to mark all as read
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'comment':
        return 'chat-bubble';
      case 'like':
        return 'favorite';
      default:
        return 'notifications';
    }
  };

  const getNotificationText = (type, name) => {
    switch(type) {
      case 'comment':
        return `${name} таны постонд сэтгэгдэл үлдээлээ`;
      case 'like':
        return `${name} таны постыг таалаглалаа`;
      default:
        return 'Шинэ мэдэгдэл';
    }
  };

  const handleReaction = (type, item) => {
    Haptics.selectionAsync();
    if (type === 'comment') {
      navigation.navigate('Comment', { postId: item.postId });
    } else if (type === 'like') {
      navigation.navigate('PostDetail', { postId: item.postId });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => {
        Haptics.selectionAsync();
        navigation.navigate('PostDetail', { postId: item.postId });
      }}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        handleReaction(item.type, item);
      }}
    >
      <View style={styles.notificationContent}>
        <Image
          source={{ uri: item.user.avatar }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.textContainer}>
          <Text style={styles.message}>
            <Text style={styles.username}>{item.user.name}</Text>
            {' '}{getNotificationText(item.type, item.user.name)}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.rightContent}>
          <MaterialIcons 
            name={getNotificationIcon(item.type)} 
            size={24} 
            color={item.type === 'like' ? '#FF4B4B' : '#666'} 
          />
          {item.postImage && (
            <Image
              source={{ uri: item.postImage }}
              style={styles.postThumbnail}
              contentFit="cover"
              transition={200}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{section.unreadCount}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Мэдэгдлүүд</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={markAllAsRead}
            >
              <MaterialIcons name="done-all" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {/* Handle settings */}}
            >
              <MaterialIcons name="settings" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.selectedTab
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.selectedTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>

      <SectionList
        sections={[
          { title: 'Өнөөдөр', data: notificationGroups.today, unreadCount: notificationGroups.today.filter(n => !n.read).length },
          { title: 'Өчигдөр', data: notificationGroups.yesterday, unreadCount: notificationGroups.yesterday.filter(n => !n.read).length },
          { title: 'Өмнөх', data: notificationGroups.older, unreadCount: notificationGroups.older.filter(n => !n.read).length }
        ]}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0066ff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Мэдэгдэл байхгүй байна</Text>
          </View>
        }
      />
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 16,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedTab: {
    backgroundColor: '#0066ff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadItem: {
    backgroundColor: '#f0f7ff',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  username: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rightContent: {
    alignItems: 'center',
  },
  postThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginTop: 8,
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
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#0066ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NotificationsScreen; 