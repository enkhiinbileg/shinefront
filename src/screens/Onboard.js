import React, { useState, useRef } from "react";
import { StyleSheet, View, Dimensions, Pressable, Text, Image } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  FadeInLeft,
  FadeOutLeft,
  useAnimatedRef,
  ReduceMotion,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native"; // Шинээр нэмэгдсэн
import { LinearGradient } from 'expo-linear-gradient'; // Энийг нэмэх
import Icon from "react-native-vector-icons/FontAwesome5"; // Энийг нэмэх

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Тогтмол утгууд
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;
const DOT_SIZE = 10;
const GAP = DOT_SIZE * 2;
const PROGRESS_VIEW_SIZE = DOT_SIZE * 2.6;
const LEFT_SPACE = -(PROGRESS_VIEW_SIZE - DOT_SIZE) / 2;
const MAIN_BUTTON_WIDTH_COLLAPSED = SCREEN_WIDTH * 0.9;
const MAIN_BUTTON_WIDTH_EXPANDED = SCREEN_WIDTH * 0.67;
const SUB_BUTTON_WIDTH = SCREEN_WIDTH * 0.2;

// Өгөгдөл
const cardDataArray = [
  {
    id: 1,
    title: "Монголын Үзэсгэлэнт Газрууд",
    description: "Дэлхийд алдартай байгалийн үзэсгэлэнт газруудаар аялах боломж",
    imageUrl: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=2072&auto=format&fit=crop",
    info: "200+ байршил",
    stats: [
      { icon: "map-marker-alt", text: "200+ байршил" },
      { icon: "camera", text: "1000+ зураг" }
    ]
  },
  {
    id: 2,
    title: "Мэргэжлийн Хөтөч",
    description: "Туршлагатай хөтөч, орчуулагчид таны аяллыг дурсгалтай болгоно",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop",
    info: "50+ хөтөч",
    stats: [
      { icon: "users", text: "50+ хөтөч" },
      { icon: "language", text: "10+ хэл" }
    ]
  },
  {
    id: 3,
    title: "Аюулгүй & Найдвартай",
    description: "24/7 туслалцаа, аяллын даатгал, найдвартай үйлчилгээ",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
    info: "24/7 туслалцаа",
    stats: [
      { icon: "shield-alt", text: "100% даатгал" },
      { icon: "headset", text: "24/7 тусламж" }
    ]
  },
];

// Spring тохиргоо
const SPRING_CONFIG = {
  mass: 1,
  damping: 16,
  stiffness: 300,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
  reduceMotion: ReduceMotion.System,
};

// Dot компонент
const Dot = ({ index, animatedIndex }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(
      animatedIndex.value,
      [index - 1, index],
      ["#E7DBD3", "#1fbe52"]
    );
    return { backgroundColor };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

// Paginator компонент
const Paginator = ({ itemsLength, animatedIndex }) => {
  const processView = useAnimatedStyle(() => {
    const width = interpolate(
      animatedIndex.value,
      [0, itemsLength - 1],
      [
        PROGRESS_VIEW_SIZE,
        itemsLength * (DOT_SIZE + GAP) - GAP + PROGRESS_VIEW_SIZE - DOT_SIZE,
      ]
    );

    return {
      width,
      left: LEFT_SPACE,
      backgroundColor: withSpring("#1fbe52", SPRING_CONFIG),
    };
  });

  return (
    <View style={styles.paginatorContainer}>
      <Animated.View style={[styles.processView, processView]} />
      {Array.from({ length: itemsLength }).map((_, index) => (
        <Dot key={index} index={index} animatedIndex={animatedIndex} />
      ))}
    </View>
  );
};

// Card компонент
const Card = ({ data }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Image
          source={{ uri: data.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>{data.title}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>
            
            <Text style={styles.descriptionText}>{data.description}</Text>
            
            <View style={styles.statsContainer}>
              {data.stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Icon name={stat.icon} size={16} color="#fff" />
                  <Text style={styles.statText}>{stat.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

// OnboardingControls компонент
const OnboardingControls = ({
  scrollViewRef,
  activeIndex,
  setActiveIndex,
  animatedIndex,
  steppedAhead,
}) => {
  const navigation = useNavigation(); // Navigation hook нэмсэн

  const handleScroll = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      y: 0,
      animated: true,
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < cardDataArray.length - 1) {
      const newIndex = activeIndex + 1;
      steppedAhead.value = withSpring(1, SPRING_CONFIG);
      animatedIndex.value = withSpring(newIndex, SPRING_CONFIG);
      handleScroll(newIndex);
      setActiveIndex(newIndex);
    } else {
      navigation.navigate("Login"); // Finish дээр Home руу шилжинэ
    }
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      steppedAhead.value = withSpring(newIndex === 0 ? 0 : 1, SPRING_CONFIG);
      animatedIndex.value = withSpring(newIndex, SPRING_CONFIG);
      handleScroll(newIndex);
      setActiveIndex(newIndex);
    }
  };

  const handleSkip = () => {
    const lastIndex = cardDataArray.length - 1;
    steppedAhead.value = withSpring(1, SPRING_CONFIG);
    animatedIndex.value = withSpring(lastIndex, SPRING_CONFIG);
    handleScroll(lastIndex);
    setActiveIndex(lastIndex);
  };

  const mainButtonAStyle = useAnimatedStyle(() => {
    const width = interpolate(
      steppedAhead.value,
      [0, 1],
      [MAIN_BUTTON_WIDTH_COLLAPSED, MAIN_BUTTON_WIDTH_EXPANDED]
    );
    return {
      width,
      position: "absolute",
      right: (SCREEN_WIDTH * 0.1) / 2,
      zIndex: -1,
    };
  });

  const subButtonAStyle = useAnimatedStyle(() => {
    const width = interpolate(
      steppedAhead.value,
      [0, 1],
      [0, SUB_BUTTON_WIDTH]
    );
    const translateX = interpolate(
      steppedAhead.value,
      [0, 1],
      [-SUB_BUTTON_WIDTH, 0]
    );
    return {
      width,
      transform: [{ translateX }],
    };
  });

  return (
    <>
      <Paginator itemsLength={cardDataArray.length} animatedIndex={animatedIndex} />
      <Animated.View style={styles.controlContainer}>
        <AnimatedPressable
          onPress={handleBackPress}
          style={[styles.backButton, subButtonAStyle]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backButtonText}>Back</Text>
        </AnimatedPressable>
        <AnimatedPressable
          onPress={handlePress}
          style={[styles.mainButton, mainButtonAStyle]}
          accessibilityRole="button"
          accessibilityLabel={
            activeIndex >= cardDataArray.length - 1 ? "Finish" : "Continue"
          }
        >
          {activeIndex >= cardDataArray.length - 1 && (
            <Animated.View
              entering={FadeInLeft}
              exiting={FadeOutLeft.duration(100)}
              style={styles.checkContainer}
            >
              <Check color={"#006cff"} strokeWidth={4} size={15} />
            </Animated.View>
          )}
          <Animated.Text style={styles.buttonText}>
            {activeIndex >= cardDataArray.length - 1 ? "Finish" : "Continue"}
          </Animated.Text>
        </AnimatedPressable>
      </Animated.View>
      <Pressable onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </Pressable>
    </>
  );
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Onboard = () => {
  const scrollViewRef = useAnimatedRef();
  const [activeIndex, setActiveIndex] = useState(0);
  const animatedIndex = useSharedValue(0);
  const steppedAhead = useSharedValue(0);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContainer}
        scrollEventThrottle={16}
        decelerationRate="normal"
        onScroll={({ nativeEvent }) => {
          const index = Math.round(nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
          animatedIndex.value = withSpring(index, SPRING_CONFIG);
        }}
      >
        {cardDataArray.map((data, index) => (
          <Card key={index} data={data} />
        ))}
      </Animated.ScrollView>
      <OnboardingControls
        scrollViewRef={scrollViewRef}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        animatedIndex={animatedIndex}
        steppedAhead={steppedAhead}
      />
    </View>
  );
};

// Стилүүд
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  scrollViewContainer: {
    paddingVertical: 50,
  },
  paginatorContainer: {
    flexDirection: "row",
    columnGap: GAP,
    position: "relative",
    alignItems: "center",
    marginTop: 40,
  },
  processView: {
    backgroundColor: "#1fbe52",
    position: "absolute",
    height: PROGRESS_VIEW_SIZE,
    borderRadius: PROGRESS_VIEW_SIZE / 2,
    zIndex: -1,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  controlContainer: {
    flexDirection: "row",
    marginTop: 25,
    width: "100%",
  },
  mainButton: {
    backgroundColor: '#FF385C',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    shadowColor: '#FF385C',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
  },
  checkContainer: {
    width: 20,
    height: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CARD_HEIGHT,
    justifyContent: 'flex-end',
    padding: 30,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  titleContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ratingText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  skipButtonText: {
    color: '#FF385C',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Onboard;