import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Purchases, {LOG_LEVEL, CustomerInfo } from 'react-native-purchases'; 
export default function SubscribePage() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    if(Platform.OS === 'ios') {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_PURCHASES_API_KEY!,
      });
    } else if (Platform.OS === 'android') {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_PURCHASES_API_KEY!,
      });
    }
  }, []);

  const getCustomerInfo = async () => {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    console.log(customerInfo);
  };
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!',
        'Welcome to Premium! You now have access to all features.',
        [{ text: 'Continue', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueFree = () => {
    router.back();
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
            <Text style={styles.featureIcon}>=
</Text>
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
            style={[styles.subscribeButton, isProcessing && styles.disabledButton]}
            onPress={handleSubscribe}
            disabled={isProcessing}
          >
            <Text style={styles.subscribeButtonText}>
              {isProcessing ? 'Processing...' : 'Subscribe Now'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.freeButton}
            onPress={handleContinueFree}
            disabled={isProcessing}
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.colors.navy,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 40,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
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
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  freeButton: {
    borderWidth: 2,
    borderColor: Colors.colors.gray,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  freeButtonText: {
    color: Colors.colors.gray,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  footer: {
    fontSize: 14,
    color: Colors.colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});