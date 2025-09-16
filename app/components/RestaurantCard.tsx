import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Restaurant } from "@/types/restaurants";
import Colors from "@/constants/Colors";

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const imageSource = restaurant.photos[0]?.photoUri ? { uri: restaurant.photos[0].photoUri } : require('@/assets/images/res.jpg');

  return (
    <View style={styles.card}>
      <Image 
        resizeMode="cover"  
        source={imageSource}
        style={styles.image} 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {restaurant.rating}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.address}>{restaurant.formatted_address}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.placeId}>Place ID: {restaurant.place_id}</Text>
        </View>
        
        <View style={styles.statusRow}>
          {
            !restaurant.would_try && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonWouldTry,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {}}
              >
                <Text style={styles.buttonText}> ✅ Try</Text>
              </Pressable>
            )
          }
          {restaurant.reviews.reviews.length > 0 && (
            <Text style={styles.reviewCount}>
              {restaurant.reviews.reviews.length} reviews
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoRow: {
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  placeId: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wouldTry: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    padding: 8,
    borderRadius: 6,
  },
  buttonWouldTry: {
    backgroundColor: Colors.colors.orange,
  },
  buttonSkip: {
    backgroundColor: Colors.colors.gray,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.colors.white,
    fontWeight: '500',
  },
  buttonTextWouldTry: {
    color: Colors.colors.white,
  },
  buttonTextSkip: {
    color: Colors.colors.white,
  },
});
