import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  clearHistoryEntries,
  getHistoryEntries,
  type HistoryEntry,
} from "@/utils/tasbeeh-store";

export default function HistoryScreen() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const loadHistory = useCallback(async () => {
    try {
      const storedEntries = await getHistoryEntries();
      setEntries(storedEntries);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  };

  const handleClearHistory = () => {
    Alert.alert("Clear history", "Remove all saved session entries?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearHistoryEntries();
          setEntries([]);
        },
      },
    ]);
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

  const completionCount = entries.filter(
    (entry) => entry.eventType === "goal-complete",
  ).length;
  const resetCount = entries.filter(
    (entry) => entry.eventType === "manual-reset",
  ).length;

  return (
    <FlatList
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      data={entries}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <ThemedView style={styles.wrapper}>
          <View style={styles.headerSection}>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.upperLabel}
            >
              YOUR PROGRESS
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.mainTitle, { color: "#004d4c" }]}
            >
              History
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.subtitle}
            >
              Completed and reset sessions
            </ThemedText>
          </View>

          <View style={styles.statsRow}>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="small" themeColor="textSecondary">
                Total
              </ThemedText>
              <ThemedText type="subtitle" style={styles.statValue}>
                {entries.length}
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="small" themeColor="textSecondary">
                Completed
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.statValue, { color: "#0a8f73" }]}
              >
                {completionCount}
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="small" themeColor="textSecondary">
                Resets
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.statValue, { color: "#b5453a" }]}
              >
                {resetCount}
              </ThemedText>
            </ThemedView>
          </View>

          {!isLoading && entries.length > 0 && (
            <Pressable
              onPress={handleClearHistory}
              style={({ pressed }) => [
                styles.clearButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedText type="smallBold" style={styles.clearButtonText}>
                Clear History
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>
      }
      renderItem={({ item }) => (
        <ThemedView type="backgroundElement" style={styles.historyCard}>
          <View style={styles.historyRow}>
            <ThemedText type="smallBold" style={styles.historyName}>
              {item.tasbeehName}
            </ThemedText>
            <ThemedText
              type="small"
              style={[
                styles.eventBadge,
                item.eventType === "manual-reset"
                  ? styles.resetBadge
                  : styles.completeBadge,
              ]}
            >
              {item.eventType === "manual-reset" ? "Reset" : "Goal Reached"}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Goal: {item.goal} • Count: {item.countAtEvent}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Set: {item.currentSet} • Completed Sets: {item.completedSets}
          </ThemedText>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.timestamp}
          >
            {new Date(item.createdAt).toLocaleString()}
          </ThemedText>
        </ThemedView>
      )}
      ListEmptyComponent={
        <ThemedView style={styles.wrapper}>
          <ThemedView type="backgroundElement" style={styles.placeholder}>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.placeholderText}
            >
              {isLoading ? "Loading history..." : "No history yet"}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.placeholderSubtext}
            >
              Resets and completed goals will appear here
            </ThemedText>
          </ThemedView>
        </ThemedView>
      }
      ListFooterComponent={Platform.OS === "web" ? <WebBadge /> : null}
      showsVerticalScrollIndicator={false}
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
    />
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
    gap: Spacing.four,
  },
  headerSection: {
    alignItems: "center",
    gap: Spacing.one,
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
  statsRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignItems: "center",
    gap: Spacing.half,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#004d4c",
  },
  clearButton: {
    alignSelf: "flex-end",
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    backgroundColor: "#2a2f2f",
  },
  clearButtonText: {
    color: "#ffb4ab",
  },
  historyCard: {
    borderRadius: Spacing.four,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyName: {
    fontSize: 16,
    color: "#004d4c",
  },
  eventBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.four,
    overflow: "hidden",
    fontWeight: "600",
  },
  resetBadge: {
    color: "#ffb4ab",
    backgroundColor: "#4a2121",
  },
  completeBadge: {
    color: "#92f7dd",
    backgroundColor: "#1d3f38",
  },
  timestamp: {
    marginTop: Spacing.half,
    fontSize: 11,
  },
  placeholder: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.two,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholderSubtext: {
    fontSize: 12,
    textAlign: "center",
  },
});
