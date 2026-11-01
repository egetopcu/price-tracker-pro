import { colors } from "@/styles/global";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {
  return (
    <GestureHandlerRootView style = {{flex : 1}}>
          <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.header},
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false , title: 'Products'}} />
      <Stack.Screen name="product/[id]" options={{ title: "Prices" }} />
    </Stack>
    </GestureHandlerRootView>
  );
}