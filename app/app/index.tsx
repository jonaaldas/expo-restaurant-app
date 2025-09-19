import { Redirect } from "expo-router";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Text } from "react-native";

export default function Index() {
   return (
    <>
      <AuthLoading>
        <Text>Loading...</Text>
      </AuthLoading>
      <Unauthenticated>
        <Redirect href="/(auth)/sign-in" />
      </Unauthenticated>
      <Authenticated>
        <Redirect href="/(app)" />
      </Authenticated>
    </>
  );
  // Always redirect to main app since we're using hardcoded userId
  // return <Redirect href="/(app)" />;
}
