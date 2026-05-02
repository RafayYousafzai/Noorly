import { useCounter } from "@/context/CounterContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/hooks/use-theme";

function CircleProgressDisplay({
  count,
  goal,
  onPress,
  hapticEnabled,
  setNumber,
  colors,
}: any) {
  const styles = getStyles(colors);
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
  colors,
}: any) {
  const styles = getStyles(colors);
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
        color={isPrimary ? colors.background : colors.text}
      />
      <Text style={[styles.iconButtonText, isPrimary && { color: colors.background }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function CounterScreen() {
  const colors = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams<{
    tasbeehName?: string;
    tasbeehGoal?: string;
  }>();

  const {
    count,
    goal,
    tasbeehName,
    currentSet,
    isGoalReached,
    hapticEnabled,
    setGoal,
    setTasbeehName,
    handleIncrement,
    handleStartNewCount,
    handleReset,
    handleHapticToggle,
  } = useCounter();

  useEffect(() => {
    if (params.tasbeehName) {
      setTasbeehName(params.tasbeehName);
    }
    if (params.tasbeehGoal) {
      const parsedGoal = Number.parseInt(params.tasbeehGoal, 10);
      if (Number.isFinite(parsedGoal) && parsedGoal > 0) {
        setGoal(parsedGoal);
      }
    }
  }, [params.tasbeehName, params.tasbeehGoal, setTasbeehName, setGoal]);

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
        {/* <Text style={styles.subtitle}>Glory be to Allah</Text> */}
      </View>

      <View style={styles.centerDisplay}>
        <CircleProgressDisplay
          count={count}
          goal={goal}
          onPress={handleIncrement}
          hapticEnabled={hapticEnabled}
          setNumber={currentSet}
          colors={colors}
        />
      </View>

      <View style={styles.bottomSection}>
        {/* Settings / Info Row */}
        <View style={styles.infoRow}>
          <Pressable onPress={handleHapticToggle} style={styles.infoPill}>
            <MaterialIcons
              name={hapticEnabled ? "vibration" : "smartphone"}
              size={16}
              color={hapticEnabled ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.infoText,
                hapticEnabled && { color: colors.accent },
              ]}
            >
              Haptics {hapticEnabled ? "On" : "Off"}
            </Text>
          </Pressable>

          <View style={styles.infoPill}>
            <MaterialIcons
              name="track-changes"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>Target: {goal}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <IconButton
            icon={isGoalReached ? "playlist-add" : "refresh"}
            label={isGoalReached ? "New Count" : "Reset"}
            onPress={isGoalReached ? handleStartNewCount : handleReset}
            hapticEnabled={hapticEnabled}
            colors={colors}
          />
          <IconButton
            icon="open-in-full"
            label="Full Screen"
            variant="primary"
            onPress={() => router.push("/fullscreen-counter")}
            hapticEnabled={hapticEnabled}
            colors={colors}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.accent,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
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
    backgroundColor: colors.backgroundElement,
    borderWidth: 0,
    // borderColor: colors.backgroundSelected,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  circleProgress: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: colors.backgroundSelected, // Subtle fill color
    borderRadius: 200,
  },
  setIndicator: {
    position: "absolute",
    top: 25,
    backgroundColor: colors.backgroundSelected,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  setIndicatorText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accent,
  },
  circleCenterContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  counterNumber: {
    fontSize: 84,
    fontWeight: "bold",
    color: colors.accent,
    lineHeight: 90,
  },
  counterLabel: {
    fontSize: 12,
    letterSpacing: 2,
    color: colors.text,
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
    backgroundColor: colors.backgroundElement,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.backgroundElement,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconButtonPrimary: {
    backgroundColor: colors.accent,
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
});
