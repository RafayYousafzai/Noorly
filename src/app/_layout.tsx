import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { useColorScheme, Platform } from "react-native";
import { NavigationBar } from "expo-navigation-bar";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { CounterProvider } from "@/context/CounterContext";
import { useTheme } from "@/hooks/use-theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <CounterProvider>
        {Platform.OS === "android" && <NavigationBar style="auto" />}
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false, animation: "none" }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" />
          <Stack.Screen
            name="fullscreen-counter"
            options={{ headerShown: false }}
          />
        </Stack>
      </CounterProvider>
    </ThemeProvider>
  );
}
