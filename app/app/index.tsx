import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    let premium = false;
    if (!premium) {
      return <Redirect href="/(app)/subscribe" />;
    }
    return <Redirect href="/(app)" />;
  }

  //check if they are paid user

  return <Redirect href="/(auth)/sign-in" />;
}
