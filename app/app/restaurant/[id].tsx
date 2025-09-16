import React, { useEffect, useState, useRef } from "react";
import { Share } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Restaurant } from "@/types/restaurants";
import { Ionicons } from "@expo/vector-icons";
import { useRestaurantContext } from "@/app/useContext/restaurant";
import Colors from "@/constants/Colors";
import { saveRestaurant } from "@/utils/restaurants";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams();
  const idParam = Array.isArray(id) ? id[0] : id;

  const scrollViewRef = useRef<ScrollView>(null);
  const mainScrollViewRef = useRef<ScrollView>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = screenHeight * 0.55;
  const { restaurants, saveRestaurant, isSaving, restaurantsIds } = useRestaurantContext();

  const restaurant = restaurants.find(
    (res: Restaurant) => res.place_id === idParam
  );

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.conttainer}>
        <Text>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  const coverImages = restaurant.photos.map((photo) => photo.photoUri);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewImageIndex, setReviewImageIndex] = useState(0);

  // Get current review or null if no reviews
  const currentReview =
    restaurant.reviews.reviews.length > 0
      ? restaurant.reviews.reviews[currentReviewIndex]
      : null;

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / screenWidth);
    setCurrentImageIndex(index);
  };

  const onReviewImageScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / screenWidth);
    setReviewImageIndex(index);
  };

  const nextReview = () => {
    if (restaurant.reviews.reviews.length > 1) {
      setCurrentReviewIndex((prev) =>
        prev === restaurant.reviews.reviews.length - 1 ? 0 : prev + 1
      );
      setReviewImageIndex(0); // Reset image index when changing reviews
    }
  };

  const prevReview = () => {
    if (restaurant.reviews.reviews.length > 1) {
      setCurrentReviewIndex((prev) =>
        prev === 0 ? restaurant.reviews.reviews.length - 1 : prev - 1
      );
      setReviewImageIndex(0); // Reset image index when changing reviews
    }
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.imageSliderContainer,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
        >
          {coverImages.map((imageUrl, index) => (
            <View key={index} style={styles.slideContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.pagination}>
          {coverImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Fixed Navigation Buttons */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareButton} >
        <Ionicons name="share-outline" size={24} color="white" />
      </TouchableOpacity>

      {/* Main Content with Scroll Listener */}
      <Animated.ScrollView
        ref={mainScrollViewRef}
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisineType}>{restaurant.formatted_address}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.closedText}>
              {restaurant.current_opening_hours.open_now ? "Open" : "Closed"}
            </Text>
          </View>

          <View style={styles.openTimeContainer}>
                        {restaurant.current_opening_hours.weekday_descriptions.map((desc, idx) => (
              <Text key={idx} style={styles.openTime}>
                • {desc}
              </Text>
            ))}
          </View>
          <View style={styles.buttonsContainer}>
            {/* First Row */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.gridButton, styles.googleMapsButton]}
                onPress={() => Linking.openURL(restaurant.google_maps_uri)}
              >
                <Ionicons name="map-outline" size={20} color="white" />
                <Text style={styles.googleMapsText}>Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridButton, styles.websiteButton]}
                onPress={() => Linking.openURL(restaurant.website_uri)}
              >
                <Ionicons name="globe-outline" size={20} color="black" />
                <Text style={styles.websiteText}>Website</Text>
              </TouchableOpacity>
            </View>

            {/* Second Row */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[
                  styles.gridButton, 
                  styles.yesButton,
                  isSaving && styles.savingButton
                ]} 
                onPress={() => {
                  if (!isSaving) {
                    saveRestaurant(restaurant.place_id);
                  }
                }}
                disabled={isSaving || restaurantsIds.includes(restaurant.place_id)}
              >
                {isSaving ? (
                  <View style={styles.savingContainer}>
                    <ActivityIndicator size="small" color={Colors.colors.white} />
                    <Text style={styles.yesButtonText}>Saving...</Text>
                  </View>
                ) : (
                  restaurantsIds.includes(restaurant.place_id) ? (
                    <Text style={styles.yesButtonText}>Saved! 🎉</Text>
                    ) : (
                  <Text style={styles.yesButtonText}>Yes, I want to try</Text>
                  )
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Reviews</Text>
              {restaurant.reviews.reviews.length > 1 && (
                <View style={styles.reviewNavigation}>
                  <TouchableOpacity
                    onPress={prevReview}
                    style={styles.navButton}
                  >
                    <Ionicons name="chevron-back" size={20} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.reviewCounter}>
                    {currentReviewIndex + 1} of{" "}
                    {restaurant.reviews.reviews.length}
                  </Text>
                  <TouchableOpacity
                    onPress={nextReview}
                    style={styles.navButton}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {currentReview ? (
              <View style={styles.reviewContainer}>
                {/* Review Images Carousel */}
                {restaurant.reviews.photos &&
                  restaurant.reviews.photos.length > 0 && (
                    <View style={styles.reviewImagesContainer}>
                      <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={onReviewImageScrollEnd}
                        scrollEventThrottle={16}
                      >
                        {restaurant.reviews.photos.map((photo, index) => (
                          <View key={index} style={styles.reviewImageSlide}>
                            <Image
                              source={{ uri: photo.photo_reference }}
                              style={styles.reviewImage}
                              resizeMode="cover"
                            />
                          </View>
                        ))}
                      </ScrollView>

                      {restaurant.reviews.photos.length > 1 && (
                        <View style={styles.reviewImagePagination}>
                          {restaurant.reviews.photos.map((_, index) => (
                            <View
                              key={index}
                              style={[
                                styles.reviewImageDot,
                                index === reviewImageIndex &&
                                  styles.reviewImageDotActive,
                              ]}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                {/* Review Text */}
                <View style={styles.reviewTextContainer}>
                  <Text style={styles.reviewText}>{currentReview.text}</Text>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewAuthor}>
                      — {currentReview.author_name} - {currentReview.rating} ⭐
                    </Text>
                    <Text style={styles.reviewTime}>
                      {currentReview.relative_time_description}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsText}>No reviews available</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  imageSliderContainer: {
    height: screenHeight * 0.55,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  slideContainer: {
    width: screenWidth,
    height: screenHeight * 0.55,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  shareButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "white",
    width: 24,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  restaurantInfo: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 40,
    marginTop: -20,
    minHeight: screenHeight,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    marginTop: 16,
    backgroundColor: "#f0f0f0",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  cuisineType: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  closedText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "500",
  },
  openTime: {
    color: "#666",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  googleMapsButton: {
    backgroundColor: "#000",
  },
  websiteButton: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#000",
  },
  yesButton: {
    backgroundColor: Colors.colors.orange,
  },
  savingButton: {
    backgroundColor: Colors.colors.gray,
    opacity: 0.8,
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noButton: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#000",
  },
  googleMapsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  websiteText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  yesButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewsSection: {
    marginTop: 24,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  reviewNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewCounter: {
    fontSize: 14,
    color: "#666",
  },
  reviewContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
  },
  reviewImagesContainer: {
    position: "relative",
  },
  reviewImageSlide: {
    width: screenWidth - 72, // Account for card margins and padding
    height: 200,
  },
  reviewImage: {
    width: "100%",
    height: "100%",
  },
  reviewImagePagination: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
  },
  reviewImageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 3,
  },
  reviewImageDotActive: {
    backgroundColor: "white",
    width: 20,
  },
  reviewTextContainer: {
    padding: 16,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    marginBottom: 12,
  },
  reviewMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  reviewTime: {
    fontSize: 13,
    color: "#999",
  },
  noReviewsContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  noReviewsText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  openTimeContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 8,
  },
});
