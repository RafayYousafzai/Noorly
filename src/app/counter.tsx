import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Assuming you still want to log history
import { addHistoryEntry } from "@/utils/tasbeeh-store";

// Hardcoded Theme to match Library exactly
const COLORS = {
  background: "#0F1115",
  card: "#16191E",
  border: "#2C3033",
  buttonBg: "#23272F",
  accent: "#00E5FF",
  textMain: "#FFFFFF",
  textMuted: "#888888",
  glowBg: "rgba(0, 229, 255, 0.1)",
};

function CircleProgressDisplay({
  count,
  goal,
  onPress,
  hapticEnabled,
  setNumber,
}: any) {
  const progress = Math.min(count / goal, 1);

  const handlePress = async () => {
    if (hapticEnabled) {
      try {
        // selectionAsync is vastly superior for Android fast-tapping.
        // It provides a crisp "tick" instead of a muddy buzz.
        await Haptics.selectionAsync();
      } catch (e) {
        // Haptics not available
      }
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.circleWrapper,
        pressed && { transform: [{ scale: 0.98 }] }, // Subtle press animation
      ]}
    >
      <View style={styles.circleOuter}>
        {/* Fill Background */}
        <View
          style={[styles.circleProgress, { height: `${progress * 100}%` }]}
        />

        {/* Top Right Set Indicator */}
        {setNumber && (
          <View style={styles.setIndicator}>
            <Text style={styles.setIndicatorText}>Set {setNumber}</Text>
          </View>
        )}

        {/* Center Content */}
        <View style={styles.circleCenterContent}>
          <Text style={styles.counterNumber}>{count}</Text>
          <Text style={styles.counterLabel}>REPS</Text>
        </View>
      </View>
    </Pressable>
  );
}

function IconButton({
  icon,
  label,
  onPress,
  variant = "default",
  hapticEnabled = true,
}: any) {
  const handlePress = async () => {
    if (hapticEnabled) {
      try {
        await Haptics.selectionAsync();
      } catch (e) {}
    }
    onPress?.();
  };

  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.iconButton,
        isPrimary && styles.iconButtonPrimary,
        pressed && { opacity: 0.7 },
      ]}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={isPrimary ? "#000" : COLORS.textMain}
      />
      <Text style={[styles.iconButtonText, isPrimary && { color: "#000" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function CounterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tasbeehName?: string;
    tasbeehGoal?: string;
  }>();

  const [count, setCount] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);

  const completionLockRef = useRef(false);

  const parsedGoal = params.tasbeehGoal
    ? Number.parseInt(params.tasbeehGoal, 10)
    : NaN;
  const goal = Number.isFinite(parsedGoal) && parsedGoal > 0 ? parsedGoal : 100;
  const tasbeehName = params.tasbeehName || "SubhanAllah";
  const totalSets = 5;

  const addToHistory = async (eventType: "manual-reset" | "goal-complete") => {
    try {
      await addHistoryEntry({
        tasbeehName,
        goal,
        countAtEvent: count,
        currentSet,
        completedSets,
        eventType,
      });
    } catch {
      // Non-blocking storage failure
    }
  };

  const handleIncrement = async () => {
    if (completionLockRef.current || count >= goal) {
      return;
    }

    const newCount = count + 1;
    setCount(newCount);

    // Check if goal is reached
    if (newCount >= goal) {
      completionLockRef.current = true; // Lock immediately to prevent double taps

      try {
        await addToHistory("goal-complete");
      } catch {}

      // Play success haptic (A stronger buzz for completion)
      if (hapticEnabled) {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } catch (e) {}
      }

      // Auto-reset after brief delay for visual feedback
      setTimeout(() => {
        setCount(0);
        setCompletedSets((prev) => prev + 1);
        setCurrentSet((prev) => (prev < totalSets ? prev + 1 : 1));
        completionLockRef.current = false; // Unlock
      }, 700);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset Counter",
      "Are you sure you want to reset the current set?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            completionLockRef.current = false;
            if (count > 0) {
              await addToHistory("manual-reset");
            }
            setCount(0);
            setCurrentSet(1);
            setCompletedSets(0);
            if (hapticEnabled) {
              try {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning,
                );
              } catch (e) {}
            }
          },
        },
      ],
    );
  };

  const handleHapticToggle = async () => {
    setHapticEnabled((prev) => !prev);
    try {
      await Haptics.selectionAsync();
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.topBar}>
          <View style={{ width: 24 }} /> {/* Spacer to center title */}
          <Text style={styles.upperLabel}>CURRENT FOCUS</Text>
          <View style={{ width: 24 }} /> {/* Spacer to center title */}
        </View>

        <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
          {tasbeehName}
        </Text>
        <Text style={styles.subtitle}>Glory be to Allah</Text>
      </View>

      <View style={styles.centerDisplay}>
        <CircleProgressDisplay
          count={count}
          goal={goal}
          onPress={handleIncrement}
          hapticEnabled={hapticEnabled}
          setNumber={currentSet}
        />
      </View>

      <View style={styles.bottomSection}>
        {/* Settings / Info Row */}
        <View style={styles.infoRow}>
          <Pressable onPress={handleHapticToggle} style={styles.infoPill}>
            <MaterialIcons
              name={hapticEnabled ? "vibration" : "smartphone"}
              size={16}
              color={hapticEnabled ? COLORS.accent : COLORS.textMuted}
            />
            <Text
              style={[
                styles.infoText,
                hapticEnabled && { color: COLORS.accent },
              ]}
            >
              Haptics {hapticEnabled ? "On" : "Off"}
            </Text>
          </Pressable>

          <View style={styles.infoPill}>
            <MaterialIcons
              name="track-changes"
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.infoText}>Target: {goal}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <IconButton
            icon="refresh"
            label="Reset"
            onPress={handleReset}
            hapticEnabled={hapticEnabled}
          />
          <IconButton
            icon="open-in-full"
            label="Full Screen"
            variant="primary"
            onPress={() => router.push("/fullscreen-counter")}
            hapticEnabled={hapticEnabled}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "space-between",
    paddingBottom: Platform.OS === "android" ? 20 : 0,
  },

  /* Header Section */
  headerSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  upperLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.accent,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 5,
  },

  /* Circular Display */
  centerDisplay: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  circleWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.card,
    borderWidth: 0,
    // borderColor: COLORS.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    elevation: 50,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  circleProgress: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 229, 255, 0.15)", // Subtle fill color
  },
  setIndicator: {
    position: "absolute",
    top: 25,
    backgroundColor: COLORS.glowBg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  setIndicatorText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.accent,
  },
  circleCenterContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  counterNumber: {
    fontSize: 84,
    fontWeight: "bold",
    color: COLORS.accent,
    lineHeight: 90,
  },
  counterLabel: {
    fontSize: 12,
    letterSpacing: 2,
    color: COLORS.textMain,
    marginTop: 5,
  },

  /* Bottom Controls */
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 25,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.buttonBg,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconButtonPrimary: {
    backgroundColor: COLORS.accent,
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
  },
});
