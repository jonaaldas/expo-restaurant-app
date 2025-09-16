import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRestaurantContext } from "@/app/useContext/restaurant";
import Colors from "@/constants/Colors";
import { Restaurant } from "@/types/restaurants";

const screenWidth = Dimensions.get("window").width;

export default function SavedRestaurantsList() {
  const { savedRestaurants, isLoadingSaved, refetchSavedRestaurants } = useRestaurantContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchSavedRestaurants();
    setRefreshing(false);
  };

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => {
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => router.push(`/saved/${item.place_id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          {/* Restaurant Image */}
          <View style={styles.imageContainer}>
            {item.photos && item.photos.length > 0 ? (
              <Image
                source={{ uri: item.photos[0].photoUri }}
                style={styles.restaurantImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="restaurant-outline" size={24} color="#ccc" />
              </View>
            )}
          </View>

          {/* Restaurant Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.restaurantAddress} numberOfLines={2}>
              {item.formatted_address}
            </Text>
            
            <View style={styles.metaRow}>
              {/* Rating */}
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              
              {/* Price Level */}
              {item.price_level && (
                <Text style={styles.priceLevel}>{item.price_level}</Text>
              )}
              
              {/* Status */}
              <View style={[
                styles.statusBadge,
                item.current_opening_hours?.open_now ? styles.openBadge : styles.closedBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  item.current_opening_hours?.open_now ? styles.openText : styles.closedText
                ]}>
                  {item.current_opening_hours?.open_now ? "Open" : "Closed"}
                </Text>
              </View>
            </View>
          </View>

          {/* Arrow Icon */}
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoadingSaved) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.colors.orange} />
          <Text style={styles.loadingText}>Loading saved restaurants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Restaurants</Text>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{savedRestaurants.length}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      {savedRestaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No saved restaurants yet</Text>
          <Text style={styles.emptySubtitle}>
            Start exploring and save restaurants you want to try!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedRestaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.place_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.colors.orange}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  headerRight: {
    width: 40,
    alignItems: "center",
  },
  countBadge: {
    backgroundColor: Colors.colors.orange,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: Colors.colors.orange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 8,
  },
  restaurantCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 12,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  priceLevel: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  openBadge: {
    backgroundColor: "#e6f7e6",
  },
  closedBadge: {
    backgroundColor: "#ffe6e6",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  openText: {
    color: "#00a300",
  },
  closedText: {
    color: "#ff4444",
  },
  separator: {
    height: 12,
  },
});