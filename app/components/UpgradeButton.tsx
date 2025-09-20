import React, { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { ofetch } from "ofetch";
import { useUser } from "@/contexts/user";
import Colors from "@/constants/Colors";

interface UpgradeButtonProps {
  style?: any;
  textStyle?: any;
  onSuccess?: () => void;
}

export default function UpgradeButton({ style, textStyle, onSuccess }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, refreshSubscription } = useUser();
  const router = useRouter();

  const handleUpgrade = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?._id || !user?.email) {
        Alert.alert("Error", "User information is missing. Please try logging in again.");
        return;
      }

      // Create or get customer
      const createCustomerResponse = await ofetch(
        `${process.env.EXPO_PUBLIC_JS_SERVER_URL}/new_customer`,
        {
          method: "POST",
          body: {
            name: user?.name || "Unknown User",
            userID: user._id,
            email: user.email,
          },
        }
      );

      if (!createCustomerResponse.success) {
        Alert.alert(
          "Customer Creation Failed", 
          "We couldn't set up your account for billing. Please try again or contact support."
        );
        return;
      }

      const customerId = createCustomerResponse.customer.id;

      // Check if they already have an active subscription
      if (user && refreshSubscription) {
        refreshSubscription();
        // Wait a moment for the refresh, then check current status
        setTimeout(async () => {
          // You could add a subscription check here if needed
        }, 500);
      }

      // Create payment sheet
      const res = await ofetch(
        `${process.env.EXPO_PUBLIC_JS_SERVER_URL}/sheet`,
        {
          method: "POST",
          body: { period: "monthly", customerId },
        }
      );

      const initConfig = {
        merchantDisplayName: "AI Restaurant Journal",
        customerId: res.customer,
        customerEphemeralKeySecret: res.ephemeralKey,
        allowsDelayedPaymentMethods: true,
        paymentMethodOrder: ["card", "applePay", "googlePay"],
        defaultBillingDetails: {
          email: user.email,
        },
        returnURL: "app://stripe-redirect",
      };

      const { error: initError } = await initPaymentSheet({
        ...initConfig,
        paymentIntentClientSecret: res.clientSecret,
      });

      if (initError) {
        console.log(initError);
        Alert.alert("Error", "Failed to initialize payment. Please try again.");
        return;
      }

      const { error: presentError } = await presentPaymentSheet();
      
      if (!presentError) {
        // Payment successful - refresh subscription data
        refreshSubscription();
        
        Alert.alert(
          "Subscription Successful! 🎉",
          "Your subscription is now active. Enjoy unlimited access!",
          [
            {
              text: "OK",
              onPress: () => {
                onSuccess?.();
                router.replace("/(app)");
              }
            }
          ]
        );
      } else {
        // Payment was cancelled or failed - only refresh if it was actually cancelled by user
        // If user just closed the sheet, we don't want to invalidate cache unnecessarily
        if (presentError.code === 'Canceled') {
          console.log("Payment cancelled by user");
          // Don't refresh cache immediately, user might try again
        } else {
          console.log("Payment failed:", presentError);
          // Only refresh on actual payment failures, not user cancellations
          refreshSubscription();
        }
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      
      let errorMessage = "Upgrade failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("payment")) {
          errorMessage = "Payment processing failed. Please check your payment method.";
        }
      }
      
      Alert.alert("Upgrade Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initPaymentSheet, presentPaymentSheet, user, refreshSubscription, router, onSuccess]);

  return (
    <Pressable 
      style={[styles.upgradeButton, style, loading && styles.disabledButton]} 
      onPress={handleUpgrade}
      disabled={loading}
    >
      <Text style={[styles.upgradeButtonText, textStyle]}>
        {loading ? "Processing..." : "🚀 Upgrade to Premium"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  upgradeButton: {
    backgroundColor: Colors.colors?.orange || "#FF6B35",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: Colors.colors?.orange || "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});