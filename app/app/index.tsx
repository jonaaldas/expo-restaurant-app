import { Redirect } from "expo-router";

export default function Index() {
  // Always redirect to main app since we're using hardcoded userId
  return <Redirect href="/(app)" />;
}
