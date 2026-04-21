import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import {
  BottomTabInset,
  Colors,
  MaxContentWidth,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

function CircleProgressDisplay({
  count,
  goal,
  onPress,
  hapticEnabled,
  setNumber,
}: {
  count: number;
  goal: number;
  onPress?: () => void;
  hapticEnabled?: boolean;
  setNumber?: number;
}) {
  const theme = useTheme();
  const progress = Math.min(count / goal, 1);

  const handlePress = async () => {
    if (hapticEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // Haptics not available on this platform
      }
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}
    >
      <View
        style={[styles.circleContainer, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.circleOuter,
            {
              borderColor: theme.backgroundElement,
              backgroundColor: theme === Colors.dark ? "#1a1a1a" : "#ffffff",
            },
          ]}
        >
          <View
            style={[
              styles.circleProgress,
              {
                height: `${progress * 100}%`,
                backgroundColor: "#004d4c",
              },
            ]}
          />
        </View>
        {setNumber && (
          <View style={styles.setIndicator}>
            <ThemedText
              type="smallBold"
              style={[styles.setIndicatorText, { color: "#004d4c" }]}
            >
              x{setNumber}
            </ThemedText>
          </View>
        )}
        <View style={styles.circleCenterContent}>
          <ThemedText
            type="title"
            style={[styles.counterNumber, { color: "#004d4c" }]}
          >
            {count}
          </ThemedText>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.counterLabel}
          >
            Repetitions
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function IconButton({
  label,
  onPress,
  variant = "default",
  hapticEnabled = true,
}: {
  label: string;
  onPress?: () => void;
  variant?: "default" | "secondary" | "compact";
  hapticEnabled?: boolean;
}) {
  const theme = useTheme();
  const isCompact = variant === "compact";

  const handlePress = async () => {
    if (hapticEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available on this platform
      }
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.iconButtonPressable,
        isCompact && styles.iconButtonPressableCompact,
        pressed && styles.pressed,
      ]}
    >
      <ThemedView
        type={
          variant === "secondary" ? "backgroundSelected" : "backgroundElement"
        }
        style={[styles.iconButton, isCompact && styles.iconButtonCompact]}
      >
        <ThemedText type="smallBold" style={styles.iconButtonText}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function CounterScreen() {
  const [count, setCount] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);
  const goal = 100;
  const totalSets = 5;
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);

    // Check if goal is reached
    if (newCount >= goal) {
      // Play success haptic
      if (hapticEnabled) {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } catch (e) {
          // Haptics not available
        }
      }

      // Auto-reset after brief delay for visual feedback
      setTimeout(() => {
        setCount(0);
        setCompletedSets((prev) => prev + 1);
        if (currentSet < totalSets) {
          setCurrentSet((prev) => prev + 1);
        }
      }, 600);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset Counter",
      "Are you sure you want to reset the current set?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Reset Set",
          onPress: async () => {
            setCount(0);
            if (hapticEnabled) {
              try {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning,
                );
              } catch (e) {
                // Haptics not available
              }
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleHapticToggle = async () => {
    setHapticEnabled((prev) => !prev);
    if (!hapticEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
    default: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.wrapper}>
        {/* Header Text */}
        <View style={styles.headerSection}>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.upperLabel}
          >
            CURRENT FOCUS
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={[styles.mainTitle, { color: "#004d4c" }]}
          >
            SubhanAllah
          </ThemedText>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.subtitle}
          >
            Glory be to Allah
          </ThemedText>
        </View>

        {/* Main Circular Counter */}
        <View style={styles.centerDisplay}>
          <CircleProgressDisplay
            count={count}
            goal={goal}
            onPress={handleIncrement}
            hapticEnabled={hapticEnabled}
            setNumber={currentSet}
          />
        </View>

        {/* Haptic & Goal Row */}
        <Pressable
          onPress={handleHapticToggle}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <View style={styles.controlRow}>
            <View style={styles.controlItem}>
              <ThemedText type="small" themeColor="textSecondary">
                {hapticEnabled ? "✓" : "✗"} Haptic{" "}
                {hapticEnabled ? "On" : "Off"}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.controlItem}>
              <ThemedText type="small" themeColor="textSecondary">
                Goal: {goal}
              </ThemedText>
            </View>
          </View>
        </Pressable>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <IconButton
            label="↺ Reset"
            variant="default"
            onPress={handleReset}
            hapticEnabled={hapticEnabled}
          />
          <IconButton
            label="✎ Edit"
            variant="secondary"
            hapticEnabled={hapticEnabled}
          />
          <IconButton
            label="⛶"
            variant="default"
            hapticEnabled={hapticEnabled}
          />
        </View>

        {Platform.OS === "web" && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  wrapper: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.five,
  },
  /* Header Section */
  headerSection: {
    alignItems: "center",
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  upperLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginVertical: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: "italic",
  },
  /* Circular Display */
  centerDisplay: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Spacing.five,
  },
  circleContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  circleProgress: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 130,
    borderTopRightRadius: 130,
  },
  circleCenterContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  setIndicator: {
    position: "absolute",
    top: Spacing.three,
    right: Spacing.three,
    backgroundColor: "rgba(0, 77, 76, 0.1)",
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  setIndicatorText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  counterNumber: {
    fontSize: 72,
    fontWeight: "700",
    lineHeight: 80,
  },
  counterLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: Spacing.two,
  },
  /* Control Row */
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  controlItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d4d4d4",
  },
  /* Action Buttons */
  actionButtonsRow: {
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "center",
  },
  iconButtonPressable: {
    flex: 1,
  },
  iconButtonPressableCompact: {
    flex: 0,
  },
  iconButton: {
    borderRadius: 40,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  iconButtonCompact: {
    borderRadius: 28,
    width: 56,
    height: 56,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
