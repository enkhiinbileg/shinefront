import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  RefreshControl,
  Platform,
  StatusBar,
  Animated
} from 'react-native';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../redux/slices/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { SharedElement } from 'react-navigation-shared-element';
import MaskedView from '@react-native-masked-view/masked-view';
import jwtDecode from 'jwt-decode';
import { logout } from '../redux/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.45;
const PROFILE_IMAGE_SIZE = 110;

const UserProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.user);
  const userId = useSelector((state) => state.auth.user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const menuItems = [
    {
      icon: 'images-outline',
      title: 'Миний постууд',
      route: 'PostList',
      count: '24'
    },
    {
      icon: 'heart-outline',
      title: 'Таалагдсан',
      route: 'Likes',
      count: '128'
    },
    {
      icon: 'bookmark-outline',
      title: 'Хадгалсан',
      route: 'Saved',
      count: '56'
    }
  ];

  const scrollY = useRef(new Animated.Value(0)).current;
  const [showFullHeader, setShowFullHeader] = useState(true);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const profileScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: ({ nativeEvent }) => {
        setShowFullHeader(nativeEvent.contentOffset.y <= HEADER_HEIGHT / 2);
      }
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await checkAuthAndFetchProfile();
    setRefreshing(false);
  };

  const checkAuthAndFetchProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.navigate('Login');
      return;
    }

    let fetchedUserId = userId;
    if (!fetchedUserId) {
      try {
        const decoded = jwtDecode(token);
        fetchedUserId = decoded.userId;
      } catch (e) {
        navigation.navigate('Login');
        return;
      }
    }

    if (fetchedUserId) {
      dispatch(fetchUserProfile(fetchedUserId));
    }
  };

  useEffect(() => {
    checkAuthAndFetchProfile();
  }, [dispatch, userId, navigation]);

  const handleLogout = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await dispatch(logout()).unwrap();
      
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Алдаа', 'Системээс гарахад алдаа гарлаа');
    }
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        { transform: [{ translateY: headerTranslateY }] }
      ]}
    >
      <ImageBackground
        source={{ uri: profile?.profileImage || 'https://images.pexels.com/photos/7135014/pexels-photo-7135014.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
        style={styles.headerImage}
        blurRadius={3}
      >
        <LinearGradient
          colors={['rgba(86, 15, 227, 0)', 'rgba(0,0,0,0)']}
          style={styles.headerGradient}
        >
          <BlurView intensity={80} tint="dark" style={styles.headerContent}>
            <SharedElement id={`profile.${profile?.id}.image`}>
              <Image
                source={{ uri: profile?.profileImage || 'https://images.pexels.com/photos/1045614/pexels-photo-1045614.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load' }}
                style={[
                  styles.profileImage
                ]}
                contentFit="cover"
                transition={1000}
              />
            </SharedElement>
            <Animated.View style={[styles.profileInfo, { opacity: headerOpacity }]}>
              <MaskedView
                maskElement={
                  <Text style={styles.name}>{profile?.name || 'Тодорхойгүй'}</Text>
                }
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.name, { opacity: 0 }]}>
                    {profile?.name || 'Тодорхойгүй'}
                  </Text>
                </LinearGradient>
              </MaskedView>
              <Text style={styles.email}>{profile?.email || 'Тодорхойгүй'}</Text>
              <View style={styles.badgeContainer}>
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.verifiedBadge}
                >
                  <MaterialCommunityIcons name="check-decagram" size={16} color="#FFF" />
                  <Text style={styles.verifiedText}>Баталгаажсан</Text>
                </LinearGradient>
              </View>
            </Animated.View>
          </BlurView>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.statItem}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(item.route);
          }}
        >
          <LinearGradient
            colors={['#5C6BC0', '#3949AB']}
            style={styles.statIconContainer}
          >
            <Ionicons name={item.icon} size={24} color="#FFF" />
          </LinearGradient>
          <Text style={styles.statCount}>{item.count}</Text>
          <Text style={styles.statLabel}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMenuItem = (item, index, last = false) => (
    <TouchableOpacity
      key={index}
      style={[styles.menuItem, !last && styles.menuItemBorder]}
      onPress={() => {
        Haptics.selectionAsync();
        if (item.title === 'Гарах') {
          Alert.alert(
            'Гарах',
            'Та системээс гарахдаа итгэлтэй байна уу?',
            [
              { text: 'Үгүй', style: 'cancel' },
              { 
                text: 'Тийм',
                onPress: handleLogout,
                style: 'destructive'
              }
            ]
          );
        }
      }}
    >
      <LinearGradient
        colors={item.danger ? ['#FF5252', '#FF1744'] : ['#5C6BC0', '#3949AB']}
        style={styles.menuIconContainer}
      >
        <Ionicons name={item.icon} size={22} color="#FFF" />
      </LinearGradient>
      <Text style={[styles.menuText, item.danger && styles.dangerText]}>
        {item.title}
      </Text>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={item.danger ? '#FF5252' : '#999'} 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C6BC0" />
        <Text style={styles.loadingText}>Ачаалж байна...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#5C6BC0"
            colors={['#5C6BC0']}
          />
        }
      >
        <View style={styles.scrollContent}>
          {renderStats()}
          
          <View style={styles.menuContainer}>
            {[
              { icon: 'settings-outline', title: 'Тохиргоо' },
              { icon: 'notifications-outline', title: 'Мэдэгдэл' },
              { icon: 'shield-outline', title: 'Нууцлал' },
              { icon: 'help-circle-outline', title: 'Тусламж' },
              { icon: 'log-out-outline', title: 'Гарах', danger: true }
            ].map((item, index, array) => 
              renderMenuItem(item, index, index === array.length - 1)
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    borderWidth: 4,
    borderColor: '#FFF',
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  badgeContainer: {
    marginTop: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: HEADER_HEIGHT - 50,
  },
  scrollContent: {
    paddingTop: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#F8F9FA',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 32,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dangerText: {
    color: '#FF5252',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginHorizontal: 16,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});

export default UserProfileScreen;