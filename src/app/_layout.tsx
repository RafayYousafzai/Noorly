import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { useColorScheme, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { CounterProvider } from "@/context/CounterContext";
import { useTheme } from "@/hooks/use-theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(theme.background);
      NavigationBar.setButtonStyleAsync(colorScheme === "dark" ? "light" : "dark");
    }
  }, [colorScheme, theme]);
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <CounterProvider>
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
