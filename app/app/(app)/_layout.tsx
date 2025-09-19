import { Stack } from "expo-router";

export default function AppLayout() {
  // Auth check removed - using hardcoded userId

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        navigationBarHidden: true,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}