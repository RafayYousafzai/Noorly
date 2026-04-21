import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { CounterProvider } from "@/context/CounterContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <CounterProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false, animation: "none" }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="fullscreen-counter"
            options={{ presentation: "fullScreenModal", headerShown: false }}
          />
        </Stack>
      </CounterProvider>
    </ThemeProvider>
  );
}
