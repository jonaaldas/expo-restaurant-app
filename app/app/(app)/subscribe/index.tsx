import React, { useCallback, useState } from "react";
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
import { useStripe } from "@stripe/stripe-react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SubscribePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const user = useQuery(api.user.getUser);
  const handleSubscribe = useCallback(async () => {
    await handlePurchase("monthly");
  }, []);

  const handlePurchase = useCallback(
    async (period: "monthly") => {
      try {
        setLoading(true);
        const createCustomerResponse = await ofetch(
          `${process.env.EXPO_PUBLIC_JS_SERVER_URL}/new_customer`,
          {
            method: "POST",
            body: {
              name: user?.name,
              userID: user?._id,
              email: user?.email,
            },
          }
        );
        const createCustomer = await createCustomerResponse;
        console.log("createCustomer", createCustomer);

        if (!createCustomer.success) {
          alert("Failed to create customer.");
          return;
        }

        const customerId = createCustomer.customer.id;

        const hasActiveSubscriptionResponse = await ofetch(
          `${process.env.EXPO_PUBLIC_JS_SERVER_URL}/check-subscription`,
          {
            method: "POST",
            body: {
              customerId: customerId,
            },
          }
        );

        const hasActiveSubscription = await hasActiveSubscriptionResponse;
        if (hasActiveSubscription.hasActiveSubscription) {
          alert("You already have an active subscription.");
          return;
        }

        const res = await ofetch(
          `${process.env.EXPO_PUBLIC_JS_SERVER_URL}/sheet`,
          {
            method: "POST",
            body: { period, customerId },
          }
        );

        const resJson = await res;

        const initConfig = {
          merchantDisplayName: "AI Journal",
          customerId: resJson.customer,
          customerEphemeralKeySecret: resJson.ephemeralKey,
          allowsDelayedPaymentMethods: true,
          paymentMethodOrder: ["card", "applePay", "googlePay"],
          defaultBillingDetails: {
            email: user?.email,
          },
          returnURL: "app://stripe-redirect",
        };

        const { error: initError } = await initPaymentSheet({
          ...initConfig,
          paymentIntentClientSecret: resJson.clientSecret,
        });
        if (initError) {
          console.log(initError);
          alert("Purchase failed. Please try again.");
          return;
        }
        const { error: presentError } = await presentPaymentSheet();
        if (!presentError) {
          // onSubscriptionComplete?.()
        }
      } catch (error) {
        console.log("error", error);
        alert("Purchase failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [initPaymentSheet, presentPaymentSheet]
  );

  const handleContinueFree = () => {
    // here we stay with the current free plan only 3 saved restaurants
    Alert.alert(
      "You are still on the free plan. You can save up to 3 restaurants."
    ); // temp
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
          <Pressable
            style={[
              styles.subscribeButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            <Text style={styles.subscribeButtonText}>
              {loading ? "Processing..." : "Subscribe Now"}
            </Text>
          </Pressable>

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
