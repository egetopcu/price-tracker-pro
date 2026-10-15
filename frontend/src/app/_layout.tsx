import { colors } from "@/styles/global";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.header},
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false , title: 'Products'}} />
      <Stack.Screen name="product/[id]" options={{ title: "Prices" }} />
    </Stack>
  );
}