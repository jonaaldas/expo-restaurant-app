import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
} from "react-native";
import Colors from "@/constants/Colors";
import { ofetch } from "ofetch";
import { useUser } from "@/contexts/user";
import { useRouter } from "expo-router";
import UpgradeButton from "@/components/UpgradeButton";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { user, refreshSubscription } = useUser();

  const handleContinueFree = async () => {
    try {
      setLoading(true);
      
      if (!user?._id || !user?.email) {
        Alert.alert("Error", "User information is missing. Please try logging in again.");
        return;
      }
      
      await ofetch(`${process.env.EXPO_PUBLIC_JS_SERVER_URL}/stay-free`, {
        method: "POST",
        body: {
          userID: user._id,
          email: user.email,
          name: user?.name || "Unknown User",
        },
      });

      // Refresh subscription data after setting free plan
      refreshSubscription();

      Alert.alert(
        "Free Plan Selected ✅",
        "You are now on the free plan. You can save up to 3 restaurants and upgrade anytime in settings.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(app)")
          }
        ]
      );
    } catch (error) {
      console.error("Error setting free plan:", error);
      
      let errorMessage = "Something went wrong setting up your free plan. Please try again.";
      if (error instanceof Error && error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      Alert.alert("Free Plan Setup Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Unlock Premium</Text>
          <Text style={styles.subtitle}>
            Get unlimited access to all restaurant features
          </Text>
        </View>
        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🍔</Text>
            <Text style={styles.featureText}>Save unlimited restaurants</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>=�</Text>
            <Text style={styles.featureText}>Create detailed notes</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>=�</Text>
            <Text style={styles.featureText}>Export your data</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>=</Text>
            <Text style={styles.featureText}>Advanced search tools</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.priceSubtext}>per month</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <UpgradeButton 
            style={styles.subscribeButton}
            textStyle={styles.subscribeButtonText}
            onSuccess={() => {
              Alert.alert(
                "Welcome to Premium! 🎉",
                "You now have unlimited access to all features."
              );
            }}
          />

          <Pressable
            style={styles.freeButton}
            onPress={handleContinueFree}
            disabled={loading}
          >
            <Text style={styles.freeButtonText}>Continue with Free</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Cancel anytime " No hidden fees " Secure payment
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.colors.navy,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.colors.gray,
    textAlign: "center",
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 18,
    color: Colors.colors.navy,
    flex: 1,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  price: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.colors.orange,
  },
  priceSubtext: {
    fontSize: 16,
    color: Colors.colors.gray,
    marginTop: 4,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  subscribeButton: {
    backgroundColor: Colors.colors.orange,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    color: Colors.colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  freeButton: {
    borderWidth: 2,
    borderColor: Colors.colors.gray,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  freeButtonText: {
    color: Colors.colors.gray,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  footer: {
    fontSize: 14,
    color: Colors.colors.gray,
    textAlign: "center",
    lineHeight: 20,
  },
});
