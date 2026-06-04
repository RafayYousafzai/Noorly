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
  const {
    count,
    handleIncrement,
    goal,
    hapticEnabled,
    isGoalReached,
    pressAgainToReset,
    handleStartNewCount,
    setPressAgainToReset,
  } = useCounter();

  const handlePress = async () => {
    if (isGoalReached) {
      if (pressAgainToReset) {
        if (hapticEnabled) {
          try {
            if (Platform.OS === "android") {
              await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Keyboard_Tap);
            } else {
              await Haptics.selectionAsync();
            }
          } catch {}
        }
        await handleStartNewCount();
      } else {
        setPressAgainToReset(true);
        if (hapticEnabled) {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch {}
        }
      }
      return;
    }

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
          {isGoalReached ? (
            pressAgainToReset ? (
              <View style={{ alignItems: "center", paddingHorizontal: 30 }}>
                <Text style={styles.promptText}>Press again to start new</Text>
              </View>
            ) : (
              <View style={{ alignItems: "center", paddingHorizontal: 30 }}>
                <Text style={styles.completedText}>Completed!</Text>
                <Text style={styles.completedSubtext}>Tap to reset</Text>
              </View>
            )
          ) : (
            <>
              <Text style={styles.countText}>{count}</Text>
              {/* Subtle goal indicator */}
              <View style={styles.subtleInfoContainer}>
                <Text style={styles.subtleText}>Goal {goal}</Text>
              </View>
            </>
          )}
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
  completedText: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.accent,
    marginTop: 20,
    textAlign: "center",
  },
  completedSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
  },
  promptText: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.accent,
    marginTop: 20,
    textAlign: "center",
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
});
