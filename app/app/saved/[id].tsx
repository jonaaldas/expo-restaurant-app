import React, { useState, useRef } from "react";
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Restaurant } from "@/types/restaurants";
import { Ionicons } from "@expo/vector-icons";
import { useRestaurantContext } from "@/app/useContext/restaurant";
import Colors from "@/constants/Colors";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function SavedRestaurantDetail() {
  const { id } = useLocalSearchParams();
  const idParam = Array.isArray(id) ? id[0] : id;

  const scrollViewRef = useRef<ScrollView>(null);
  const mainScrollViewRef = useRef<ScrollView>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = screenHeight * 0.45;
  const { savedRestaurants } = useRestaurantContext();
  
  // Note state management
  const [note, setNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState("");

  const restaurant = savedRestaurants.find(
    (res: Restaurant) => res.place_id === idParam
  );

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  const coverImages = restaurant.photos.map((photo) => photo.photoUri);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewImageIndex, setReviewImageIndex] = useState(0);

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
      setReviewImageIndex(0);
    }
  };

  const prevReview = () => {
    if (restaurant.reviews.reviews.length > 1) {
      setCurrentReviewIndex((prev) =>
        prev === 0 ? restaurant.reviews.reviews.length - 1 : prev - 1
      );
      setReviewImageIndex(0);
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

  const handleSaveNote = () => {
    setNote(tempNote);
    setIsEditingNote(false);
  };

  const handleCancelNote = () => {
    setTempNote(note);
    setIsEditingNote(false);
  };

  const handleStartEditNote = () => {
    setTempNote(note);
    setIsEditingNote(true);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Animated Header with Images */}
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

        {/* Main Content */}
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
              <Text style={[
                styles.statusText,
                restaurant.current_opening_hours?.open_now ? styles.openText : styles.closedText
              ]}>
                {restaurant.current_opening_hours?.open_now ? "Open" : "Closed"}
              </Text>
            </View>

            {/* Notes Section - Prominent Feature */}
            <View style={styles.notesContainer}>
              <View style={styles.notesHeader}>
                <Text style={styles.notesTitle}>My Notes</Text>
                {!isEditingNote && (
                  <TouchableOpacity onPress={handleStartEditNote}>
                    <Ionicons name="create-outline" size={24} color={Colors.colors.orange} />
                  </TouchableOpacity>
                )}
              </View>
              
              {isEditingNote ? (
                <View style={styles.noteEditContainer}>
                  <TextInput
                    style={styles.noteInput}
                    value={tempNote}
                    onChangeText={setTempNote}
                    placeholder="Add your thoughts about this restaurant..."
                    multiline
                    autoFocus
                    maxLength={500}
                  />
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={styles.saveNoteButton}
                      onPress={handleSaveNote}
                    >
                      <Text style={styles.saveNoteText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelNoteButton}
                      onPress={handleCancelNote}
                    >
                      <Text style={styles.cancelNoteText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={handleStartEditNote}>
                  {note ? (
                    <Text style={styles.noteText}>{note}</Text>
                  ) : (
                    <Text style={styles.noNoteText}>Tap to add a note...</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Opening Hours */}
            {restaurant.current_opening_hours?.weekday_descriptions && (
              <View style={styles.openTimeContainer}>
                <Text style={styles.sectionTitle}>Opening Hours</Text>
                {restaurant.current_opening_hours.weekday_descriptions.map((desc, idx) => (
                  <Text key={idx} style={styles.openTime}>
                    • {desc}
                  </Text>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.googleMapsButton]}
                onPress={() => Linking.openURL(restaurant.google_maps_uri)}
              >
                <Ionicons name="map-outline" size={20} color="white" />
                <Text style={styles.googleMapsText}>Google Maps</Text>
              </TouchableOpacity>

              {restaurant.website_uri && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.websiteButton]}
                  onPress={() => Linking.openURL(restaurant.website_uri)}
                >
                  <Ionicons name="globe-outline" size={20} color="black" />
                  <Text style={styles.websiteText}>Website</Text>
                </TouchableOpacity>
              )}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  imageSliderContainer: {
    height: screenHeight * 0.45,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  slideContainer: {
    width: screenWidth,
    height: screenHeight * 0.45,
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
  restaurantName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  cuisineType: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
  },
  openText: {
    color: "#00a300",
  },
  closedText: {
    color: "#ff4444",
  },
  notesContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  noteEditContainer: {
    marginTop: 8,
  },
  noteInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  noteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  saveNoteButton: {
    backgroundColor: Colors.colors.orange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveNoteText: {
    color: "white",
    fontWeight: "600",
  },
  cancelNoteButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelNoteText: {
    color: "#666",
    fontWeight: "600",
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  noNoteText: {
    fontSize: 15,
    color: "#999",
    fontStyle: "italic",
  },
  openTimeContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  openTime: {
    color: "#666",
    fontSize: 14,
    marginBottom: 6,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
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
    width: screenWidth - 72,
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
});