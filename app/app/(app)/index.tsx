import { Text, View } from "@/components/Themed";
import {
  Image,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Button,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { useRestaurantContext } from "@/app/useContext/restaurant";
import { useState } from "react";
import { SearchParams } from "@/types/restaurants";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function Index() {
  const { searchRestaurants, isSearching, restaurantsIds } = useRestaurantContext();
  const [textInputValue, setTextInputValue] = useState("");
  const { user } = useUser();

  const handleSettingsPress = () => {
    router.push('/(app)/settings');
  };
  
  return (
    <View style={styles.container}>
      <Image
        resizeMode="cover"
        source={require("@/assets/images/res.jpg")}
        style={styles.image}
      />
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <SafeAreaView style={styles.safeArea}>
          <View
            style={styles.content}
            lightColor="transparent"
            darkColor="transparent"
          >
            <Pressable 
              style={styles.settingsButton}
              onPress={handleSettingsPress}
            >
              <Text style={styles.settingsIcon}>👤</Text>
            </Pressable>
            <Text style={styles.title}>Discover Amazing Restaurants</Text>
            <Text style={styles.description}>
              Find your next favorite dining experience in your neighborhood
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Search for a restaurant"
              placeholderTextColor={Colors.colors.gray}
              value={textInputValue}
              onChangeText={(text) => {
                setTextInputValue(text);
              }}
            />
            <Pressable
              className={`${isSearching || !textInputValue.trim() ? "opacity-50" : ""}`}
              style={({ pressed }) => [
                styles.niceButton,
                {
                  opacity: pressed || isSearching ? 0.9 : 1,
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
            <Pressable
              style={({ pressed }) => [
                styles.niceButtonSecondary,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => router.push("/(app)/saved")}
            >
              <Text style={styles.niceButtonTextSecondary}>
                Saved Restaurants
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    display: "flex",
    width: "100%",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  image: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.colors.navyOverlay,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    color: Colors.colors.white,
    marginBottom: 24,
    lineHeight: 24,
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
  niceButtonSecondary: {
    width: "90%",
    height: 52,
    backgroundColor: Colors.colors.whiteTransparent,
    borderColor: Colors.colors.white,
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  niceButtonTextSecondary: {
    color: Colors.colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  settingsButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.colors.whiteTransparent,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 20,
  },
});
