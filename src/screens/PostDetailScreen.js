import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SharedElement } from 'react-navigation-shared-element';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withSpring
} from 'react-native-reanimated';
import { Haptics } from 'react-native';
import { MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

const AnimatedImage = Animated.createAnimatedComponent(Image);

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const insets = useSafeAreaInsets();
  const [isSaved, setIsSaved] = useState(false);
  const scrollY = useSharedValue(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [-100, 0],
            [1.2, 1],
            'clamp'
          ),
        },
      ],
    };
  });

  const dates = [
    { date: '6/15', day: 'Пүрэв', available: true },
    { date: '6/16', day: 'Баасан', available: true },
    { date: '6/17', day: 'Бямба', available: false },
    { date: '6/18', day: 'Ням', available: true },
  ];

  // Add floating action button handler
  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Share implementation
  };

  // Add weather info
  const weatherInfo = {
    temp: '23°C',
    condition: 'Нартай',
    icon: 'sunny'
  };

  // Add experience level
  const experienceLevel = {
    level: 'Дунд зэрэг',
    icon: 'footsteps',
    color: '#FF9800'
  };

  // Add safety measures
  const safetyMeasures = [
    { icon: 'medical', label: 'Анхны тусламж' },
    { icon: 'shield-checkmark', label: 'Даатгал' },
    { icon: 'fitness', label: 'Бэлтгэл дасгал' }
  ];

  // Add what to bring section
  const whatToBring = [
    { icon: 'water', label: 'Ус' },
    { icon: 'shirt', label: 'Хувцас' },
    { icon: 'camera', label: 'Камер' },
    { icon: 'sunny', label: 'Нарны шил' }
  ];

  // Add tour highlights
  const tourHighlights = [
    {
      icon: 'camera',
      title: 'Зураг авах боломжтой',
      description: '10+ Instagram spots'
    },
    {
      icon: 'restaurant',
      title: 'Уламжлалт хоол',
      description: 'Authentic local food'
    },
    {
      icon: 'people',
      title: 'Жуулчдын сэтгэгдэл',
      description: '4.8 (120+ reviews)'
    }
  ];

  // Add tour guide info
  const guideInfo = {
    languages: ['Монгол', 'English', '日本語'],
    experience: '5+ жил',
    certifications: ['Professional Guide', 'First Aid']
  };

  const renderTabContent = () => {
    if (activeTab === 'details') {
      return (
        <>
          <View style={styles.highlights}>
            <View style={styles.highlightItem}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#666" />
              <Text style={styles.highlightValue}>2-3 цаг</Text>
              <Text style={styles.highlightLabel}>Үргэлжлэх</Text>
            </View>
            <View style={styles.highlightItem}>
              <MaterialCommunityIcons name="currency-usd" size={24} color="#666" />
              <Text style={styles.highlightValue}>50K₮</Text>
              <Text style={styles.highlightLabel}>Хүн тус бүр</Text>
            </View>
            <View style={styles.highlightItem}>
              <MaterialCommunityIcons name="account-group" size={24} color="#666" />
              <Text style={styles.highlightValue}>4-8</Text>
              <Text style={styles.highlightLabel}>Бүлгийн хэмжээ</Text>
            </View>
          </View>

          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Үйлчилгээнүүд</Text>
            <View style={styles.amenitiesGrid}>
              <View style={styles.amenityItem}>
                <MaterialCommunityIcons name="wifi" size={24} color="#666" />
                <Text style={styles.amenityText}>Wifi</Text>
              </View>
              <View style={styles.amenityItem}>
                <MaterialCommunityIcons name="food" size={24} color="#666" />
                <Text style={styles.amenityText}>Хоол</Text>
              </View>
              <View style={styles.amenityItem}>
                <MaterialCommunityIcons name="car" size={24} color="#666" />
                <Text style={styles.amenityText}>Тээвэр</Text>
              </View>
              <View style={styles.amenityItem}>
                <MaterialCommunityIcons name="camera" size={24} color="#666" />
                <Text style={styles.amenityText}>Зураг авалт</Text>
              </View>
            </View>
          </View>

          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>Хөтөлбөр</Text>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Text style={styles.timeText}>09:00</Text>
                <View style={styles.timelineDot} />
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>Цугларах</Text>
                <Text style={styles.scheduleDescription}>Чингис хааны хөшөө</Text>
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Text style={styles.timeText}>12:00</Text>
                <View style={styles.timelineDot} />
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>Үдийн хоол</Text>
                <Text style={styles.scheduleDescription}>Уламжлалт монгол хоол</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Тухай</Text>
          <Text style={styles.description}>{post.description}</Text>

          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Байршил</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location" size={24} color="#FF4B4B" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{post.location}</Text>
                  <Text style={styles.locationAddress}>Улаанбаатар хот</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.directionButton}>
                <Ionicons name="navigate" size={20} color="#007AFF" />
                <Text style={styles.directionText}>Чиглүүлэх</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.meetingPoint}>
              <View style={styles.meetingIconContainer}>
                <Ionicons name="flag" size={20} color="#4CAF50" />
              </View>
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingTitle}>Цугларах цэг</Text>
                <Text style={styles.meetingAddress}>Чингис хааны хөшөө</Text>
              </View>
            </View>
          </View>

          <View style={styles.datesSection}>
            <Text style={styles.sectionTitle}>Боломжтой өдрүүд</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.datesScrollView}
            >
              {dates.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    selectedDate === index && styles.selectedDateCard,
                    !item.available && styles.unavailableDateCard
                  ]}
                  onPress={() => item.available && setSelectedDate(index)}
                  disabled={!item.available}
                >
                  <Text style={[
                    styles.dateText,
                    selectedDate === index && styles.selectedDateText
                  ]}>{item.date}</Text>
                  <Text style={[
                    styles.dayText,
                    selectedDate === index && styles.selectedDateText
                  ]}>{item.day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.guestSection}>
            <Text style={styles.sectionTitle}>Зочдын тоо</Text>
            <View style={styles.guestCounter}>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => guestCount > 1 && setGuestCount(c => c - 1)}
              >
                <Ionicons name="remove" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{guestCount}</Text>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => guestCount < 8 && setGuestCount(c => c + 1)}
              >
                <Ionicons name="add" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    }
    return (
      <View style={styles.reviewsTab}>
        <View style={styles.ratingOverview}>
          <View style={styles.ratingLeft}>
            <Text style={styles.ratingBig}>4.8</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(star => (
                <Ionicons key={star} name="star" size={20} color="#FFD700" />
              ))}
            </View>
            <Text style={styles.totalReviews}>128 сэтгэгдэл</Text>
          </View>
          <View style={styles.ratingBars}>
            {[5,4,3,2,1].map(rating => (
              <View key={rating} style={styles.ratingBar}>
                <Text style={styles.ratingNumber}>{rating}</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barFill, { width: `${rating * 20}%` }]} />
                </View>
                <Text style={styles.ratingCount}>{rating * 10}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.reviewCard}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.reviewerImage}
            contentFit="cover"
          />
          <View style={styles.reviewContent}>
            <Text style={styles.reviewerName}>Б. Бат-Эрдэнэ</Text>
            <View style={styles.starsContainer}>
              {[1,2,3,4,5].map(star => (
                <Ionicons 
                  key={star} 
                  name="star" 
                  size={16} 
                  color="#FFD700" 
                />
              ))}
            </View>
            <Text style={styles.reviewText}>
              Маш сайхан аялал байлаа. Хөтөч маш сайн, мэдлэгтэй.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHighlights = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.highlightsScroll}
    >
      <MotiView 
        style={styles.weatherCard}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Ionicons name={weatherInfo.icon} size={24} color="#FF9800" />
        <Text style={styles.weatherTemp}>{weatherInfo.temp}</Text>
        <Text style={styles.weatherCondition}>{weatherInfo.condition}</Text>
      </MotiView>

      <MotiView 
        style={styles.experienceCard}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        delay={100}
      >
        <Ionicons name={experienceLevel.icon} size={24} color={experienceLevel.color} />
        <Text style={styles.experienceLevel}>{experienceLevel.level}</Text>
        <Text style={styles.experienceLabel}>Түвшин</Text>
      </MotiView>

      <MotiView 
        style={styles.durationCard}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        delay={200}
      >
        <Ionicons name="time" size={24} color="#4CAF50" />
        <Text style={styles.durationText}>2-3 цаг</Text>
        <Text style={styles.durationLabel}>Үргэлжлэх</Text>
      </MotiView>
    </ScrollView>
  );

  const renderSafetySection = () => (
    <View style={styles.safetySection}>
      <Text style={styles.sectionTitle}>Аюулгүй байдал</Text>
      <View style={styles.safetyGrid}>
        {safetyMeasures.map((item, index) => (
          <MotiView 
            key={index}
            style={styles.safetyItem}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            delay={index * 100}
          >
            <View style={styles.safetyIconContainer}>
              <Ionicons name={item.icon} size={24} color="#4CAF50" />
            </View>
            <Text style={styles.safetyLabel}>{item.label}</Text>
          </MotiView>
        ))}
      </View>
    </View>
  );

  const renderTourHighlights = () => (
    <View style={styles.highlightsSection}>
      <Text style={styles.sectionTitle}>Онцлох үйлчилгээ</Text>
      {tourHighlights.map((item, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          delay={index * 100}
          style={styles.highlightRow}
        >
          <View style={styles.highlightIcon}>
            <Ionicons name={item.icon} size={24} color="#5C6BC0" />
          </View>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightTitle}>{item.title}</Text>
            <Text style={styles.highlightDescription}>{item.description}</Text>
          </View>
        </MotiView>
      ))}
    </View>
  );

  const renderGuideInfo = () => (
    <View style={styles.guideSection}>
      <Text style={styles.sectionTitle}>Хөтчийн мэдээлэл</Text>
      <View style={styles.guideCard}>
        <View style={styles.guideHeader}>
          <Image
            source={{ uri: post.author?.profileImage }}
            style={styles.guideLargeAvatar}
            contentFit="cover"
          />
          <View style={styles.guideHeaderInfo}>
            <Text style={styles.guideName}>{post.author?.name}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.badgeText}>Баталгаажсан</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.guideStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{guideInfo.experience}</Text>
            <Text style={styles.statLabel}>Туршлага</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>500+</Text>
            <Text style={styles.statLabel}>Аялагч</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Үнэлгээ</Text>
          </View>
        </View>

        <View style={styles.languagesContainer}>
          <Text style={styles.languagesTitle}>Хэлний мэдлэг:</Text>
          <View style={styles.languagesList}>
            {guideInfo.languages.map((lang, index) => (
              <View key={index} style={styles.languageChip}>
                <Text style={styles.languageText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Floating Share Button */}
      <TouchableOpacity 
        style={[styles.floatingButton, { top: insets.top + 10 }]}
        onPress={handleShare}
      >
        <BlurView intensity={30} tint="dark" style={styles.buttonBlur}>
          <Ionicons name="share-outline" size={24} color="#FFF" />
        </BlurView>
      </TouchableOpacity>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <SharedElement id={`post.${post.id}.card`}>
          <View style={styles.imageContainer}>
            <AnimatedImage
              source={{ uri: post.images[0] }}
              style={[styles.image, imageAnimatedStyle]}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.4)']}
              style={[styles.gradient]}
            >
              <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => setIsSaved(!isSaved)}
                >
                  <Ionicons 
                    name={isSaved ? "bookmark" : "bookmark-outline"} 
                    size={28} 
                    color="#FFF" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.imageOverlayContent}>
                <Text style={styles.locationTitle}>{post.location}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.ratingText}>4.8</Text>
                  <Text style={styles.reviewCount}>(128 сэтгэгдэл)</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </SharedElement>

        <View style={styles.content}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: post.author?.profileImage }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.authorInfo}>
              <Text style={styles.username}>{post.author?.name}</Text>
              <Text style={styles.userType}>Аялалын хөтөч</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followText}>Дагах</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'details' && styles.activeTab]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
                Дэлгэрэнгүй
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Сэтгэгдэл
              </Text>
            </TouchableOpacity>
          </View>

          {renderHighlights()}
          {renderSafetySection()}
          {renderTourHighlights()}
          {renderGuideInfo()}
          {renderTabContent()}

          <View style={styles.bookingSection}>
            <View style={styles.priceBreakdown}>
              <Text style={styles.priceLabel}>{guestCount} хүн × 50,000₮</Text>
              <Text style={styles.priceValue}>{guestCount * 50000}₮</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.bookButton,
                (!selectedDate || guestCount < 1) && styles.disabledButton
              ]}
              disabled={!selectedDate || guestCount < 1}
            >
              <Text style={styles.bookButtonText}>
                {selectedDate ? 'Захиалах' : 'Өдөр сонгоно уу'}
              </Text>
            </TouchableOpacity>
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
  imageContainer: {
    height: height * 0.5,
    width: width,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  locationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 4,
  },
  content: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFF',
    marginTop: -30,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followText: {
    color: '#FFF',
    fontWeight: '600',
  },
  highlights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
  },
  highlightItem: {
    alignItems: 'center',
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  locationSection: {
    marginBottom: 24,
  },
  locationCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,75,75,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 8,
  },
  directionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  meetingPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  meetingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76,175,80,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  meetingTitle: {
    fontSize: 14,
    color: '#666',
  },
  meetingAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  datesSection: {
    marginBottom: 24,
  },
  datesScrollView: {
    marginTop: 12,
  },
  dateCard: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedDateCard: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  unavailableDateCard: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedDateText: {
    color: '#FFF',
  },
  guestSection: {
    marginBottom: 24,
  },
  guestCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCount: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewContent: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bookingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  priceBreakdown: {
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  buttonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  ratingOverview: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  ratingLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  ratingBig: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  ratingBars: {
    flex: 1,
    paddingLeft: 20,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    width: 20,
    fontSize: 14,
    color: '#666',
  },
  barContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  ratingCount: {
    width: 30,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  reviewsTab: {
    padding: 16,
  },
  highlightsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  weatherCard: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
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
  weatherTemp: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  weatherCondition: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  experienceCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
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
  experienceLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  experienceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  safetySection: {
    marginBottom: 24,
  },
  safetyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  safetyItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  safetyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyLabel: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  durationCard: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
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
  durationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  durationLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  highlightsSection: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  highlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  highlightDescription: {
    fontSize: 14,
    color: '#666',
  },
  guideSection: {
    marginBottom: 24,
  },
  guideCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
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
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  guideLargeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  guideHeaderInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  guideStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
  },
  languagesContainer: {
    marginTop: 8,
  },
  languagesTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageText: {
    fontSize: 14,
    color: '#333',
  },
});

export default PostDetailScreen; 