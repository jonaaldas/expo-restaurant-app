import { Stack } from "expo-router";

export default function RestaurantLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{
        headerShown: false,
        navigationBarHidden: false,
       }} />

    </Stack>
  );
}