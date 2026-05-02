import { useCounter } from "@/context/CounterContext";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/hooks/use-theme";

export default function FullscreenCounterScreen() {
  const colors = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const { count, handleIncrement, goal, currentSet, hapticEnabled } = useCounter();

  const handlePress = async () => {
    if (hapticEnabled) {
      try {
        if (Platform.OS === "android") {
          await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Clock_Tick);
        } else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (e) {
        Haptics.selectionAsync().catch(() => { });
      }
    }
    handleIncrement();
  };

  const handleMinimize = () => {
    if (hapticEnabled) {
      if (Platform.OS === "android") {
        Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Keyboard_Tap).catch(() => { });
      } else {
        Haptics.selectionAsync().catch(() => { });
      }
    }
    router.back();
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <StatusBar style="auto" hidden={true} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={handleMinimize} style={styles.minimizeBtn}>
            <Image
              source={require("@/assets/images/tabIcons/minimize.png")}
              style={{ width: 20, height: 20 }}
            />
          </Pressable>
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.countText}>{count}</Text>

          {/* Subtle goal and sets indicator */}
          <View style={styles.subtleInfoContainer}>
            <Text style={styles.subtleText}>Set {currentSet}</Text>
            <Text style={styles.subtleSeparator}>•</Text>
            <Text style={styles.subtleText}>Goal {goal}</Text>
          </View>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    // backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    paddingTop: Platform.OS === "android" ? 50 : 20,
  },
  minimizeBtn: {
    padding: 12,
    backgroundColor: colors.backgroundElement,
    borderRadius: 30,
    zIndex: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -160,
  },
  countText: {
    fontSize: 140,
    fontWeight: "bold",
    color: colors.accent,
    textAlign: "center",
  },
  subtleInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    opacity: 0.5,
  },
  subtleText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  subtleSeparator: {
    color: colors.textSecondary,
    fontSize: 14,
    marginHorizontal: 10,
  },
});
