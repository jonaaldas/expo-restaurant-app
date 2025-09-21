import { Redirect } from "expo-router";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Text, View } from "react-native";
import { useUser } from "@/contexts/user";
import { useEffect } from "react";

export default function Index() {
  const { user, subscription, isLoadingSubscription } = useUser();
  
  useEffect(() => {
    if (user && subscription) {
      console.log("User subscription status:", {
        userId: user._id,
        hasActiveSubscription: subscription.hasActiveSubscription,
        subscriptionStatus: subscription.subscriptions?.[0]?.status
      });
    }
  }, [user, subscription]);

  // Determine redirect based on subscription status
  const getRedirectPath = () => {
    if (!user) return null;
    
    // If subscription is still loading, wait
    if (isLoadingSubscription) return null;
    
    // If we have user but no subscription data, assume new user (redirect to paywall)
    if (!subscription) {
      return "/subscribe";
    }
    
    const subscriptionStatus = subscription.subscriptions?.[0]?.status;
    
    // If status is "none", redirect to subscribe page
    if (subscriptionStatus === "none") {
      return "/subscribe";
    }
    
    // If they have any other status (active, trialing, free), go to main app
    return "/(app)";
  };

  const redirectPath = getRedirectPath();

  return (
    <>
      <AuthLoading>
        <Text>Loading...</Text>
      </AuthLoading>
      <Unauthenticated>
        <Redirect href="/(auth)/sign-in" />
      </Unauthenticated>
      <Authenticated>
        {isLoadingSubscription ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading...</Text>
          </View>
        ) : redirectPath ? (
          <Redirect href={redirectPath} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading subscription...</Text>
          </View>
        )}
      </Authenticated>
    </>
  );
}
