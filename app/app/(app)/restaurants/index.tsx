import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import RestaurantCard from "@/components/RestaurantCard";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRestaurantContext } from "@/app/useContext/restaurant";
import Colors from "@/constants/Colors";
import { TextInput } from "react-native";
import { useState } from "react";
import { SearchParams } from "@/types/restaurants";
export default function Restaurants() {
  const { restaurants, isSearching, searchRestaurants, restaurantsIds } = useRestaurantContext();
  const [textInputValue, setTextInputValue] = useState("");
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 20,
        }}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => router.push("/saved")}
        >
          <Ionicons name="bookmark" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* search input */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 20,
          marginBottom: 12,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TextInput
          style={[styles.input, { width: "100%", maxWidth: 400, alignSelf: "center" }]}
          placeholder="Search for a restaurant"
          placeholderTextColor={Colors.colors.gray}
          value={textInputValue}
          onChangeText={(text) => {
            setTextInputValue(text);
          }}
        />
        <Pressable
          style={({ pressed }) => [
            styles.niceButton,
            {
              opacity: pressed || isSearching ? 0.9 : 1,
              width: "100%",
              maxWidth: 400,
              alignSelf: "center",
            },
          ]}
          onPress={() => {
            if (!isSearching && textInputValue.trim()) {
              searchRestaurants({
                query: textInputValue,
              } as SearchParams);
              setTextInputValue("");
            }
          }}
          disabled={isSearching || !textInputValue.trim()}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color={Colors.colors.white} />
          ) : (
            <Text style={styles.niceButtonText}>Search</Text>
          )}
        </Pressable>
      </View>

      <Text style={{ fontSize: 24, fontWeight: "bold", margin: 20 }}>
        Restaurants
      </Text>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching for restaurants...</Text>
        </View>
      ) : (
        <>
          <Text style={{ margin: 20, marginTop: 0 }}>
            Found {restaurants.length} restaurants
          </Text>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {restaurants.map((restaurant, index) => {
              return (
                <Pressable
                  key={restaurant.place_id}
                  onPress={() => {
                    router.push({
                      pathname: "/restaurant/[id]",
                      params: { id: restaurant.place_id },
                    });
                  }}
                >
                  <RestaurantCard restaurant={restaurant} />
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  input: {
    width: "90%",
    height: 48,
    borderColor: Colors.colors.orange,
    color: Colors.colors.navy,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.colors.white,
  },
  niceButton: {
    width: "90%",
    height: 52,
    backgroundColor: Colors.colors.orange,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: Colors.colors.orangeShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  niceButtonText: {
    color: Colors.colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
