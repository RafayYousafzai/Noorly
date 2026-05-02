import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  clearHistoryEntries,
  getHistoryEntries,
  type HistoryEntry,
} from "@/utils/tasbeeh-store";

import { useTheme } from "@/hooks/use-theme";

export default function HistoryScreen() {
  const colors = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all saved session entries? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearHistoryEntries();
            setEntries([]);
          },
        },
      ],
    );
  };

  const completionCount = entries.filter(
    (entry) => entry.eventType === "goal-complete",
  ).length;
  const resetCount = entries.filter(
    (entry) => entry.eventType === "manual-reset",
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topBar}>
        <View style={{ width: 24 }} /> {/* Spacer to center title */}
        <Text style={styles.upperLabel}>YOUR PROGRESS</Text>
        <View style={{ width: 24 }} /> {/* Spacer to center title */}
      </View>

      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        data={entries}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>History</Text>
            {/* <Text style={styles.subtitle}>Completed and reset sessions</Text> */}

            {/* Dashboard Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>{entries.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {completionCount}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Resets</Text>
                <Text style={[styles.statValue, { color: "#FF5252" }]}>
                  {resetCount}
                </Text>
              </View>
            </View>

            {/* Clear Button */}
            {!isLoading && entries.length > 0 && (
              <Pressable
                onPress={handleClearHistory}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={18}
                  color="#FF5252"
                />
                <Text style={styles.clearButtonText}>Clear History</Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const isReset = item.eventType === "manual-reset";
          return (
            <View style={styles.historyCard}>
              <View style={styles.historyRow}>
                <Text style={styles.historyName}>{item.tasbeehName}</Text>
                  <View
                    style={[
                      styles.eventBadge,
                      isReset ? styles.resetBadge : styles.completeBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.eventBadgeText,
                        isReset
                          ? { color: "#FF5252" }
                          : { color: colors.accent },
                      ]}
                    >
                      {isReset ? "Reset" : "Goal Reached"}
                    </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <MaterialIcons
                    name="track-changes"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>Goal: {item.goal}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons
                    name="touch-app"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>
                    Count: {item.countAtEvent}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <MaterialIcons
                    name="repeat"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>Set: {item.currentSet}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons
                    name="done-all"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>
                    Completed Sets: {item.completedSets}
                  </Text>
                </View>
              </View>

              <Text style={styles.timestamp}>
                {new Date(item.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.placeholder}>
            <MaterialIcons name="history" size={48} color={colors.backgroundSelected} />
            <Text style={styles.placeholderText}>
              {isLoading ? "Loading history..." : "No history yet"}
            </Text>
            <Text style={styles.placeholderSubtext}>
              Resets and completed goals will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => {
  const danger = "#FF5252";
  const dangerBg = "rgba(255, 82, 82, 0.1)";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "android" ? 40 : 20,
    },

    /* Top Bar */
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "android" ? 40 : 10,
      paddingBottom: 10,
    },

    upperLabel: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 2,
      color: colors.accent,
    },

    /* Header Section */
    headerSection: {
      alignItems: "center",
      marginBottom: 25,
    },
    mainTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
    },

    /* Stats Row */
    statsRow: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.backgroundElement,
      borderRadius: 16,
      paddingVertical: 15,
      paddingHorizontal: 10,
      alignItems: "center",
      gap: 5,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },

    /* Clear Button */
    clearButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-end",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: dangerBg,
      gap: 6,
    },
    clearButtonText: {
      color: danger,
      fontSize: 12,
      fontWeight: "700",
    },

    /* History Cards */
    historyCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 16,
      marginBottom: 15,
      padding: 16,
    },
    historyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 10,
    },
    historyName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    eventBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    resetBadge: {
      backgroundColor: dangerBg,
    },
    completeBadge: {
      backgroundColor: colors.backgroundSelected,
    },
    eventBadgeText: {
      fontSize: 11,
      fontWeight: "700",
    },
    detailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 1,
    },
    detailText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    timestamp: {
      marginTop: 8,
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: "right",
      fontStyle: "italic",
    },

    /* Placeholder */
    placeholder: {
      borderRadius: 16,
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    placeholderText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    placeholderSubtext: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
};
