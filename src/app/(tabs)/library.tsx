import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";

// Cleaned Data Structure
const INITIAL_TASBEEH_DATA = [
  {
    id: "1",
    title: "SubhanAllah",
    arabic: "سُبْحَانَ اللَّهِ",
    translation: "Glory be to Allah",
    count: "33",
  },
  {
    id: "2",
    title: "Alhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّٰهِ",
    translation: "Praise be to Allah",
    count: "99",
  },
  {
    id: "3",
    title: "Allahu Akbar",
    arabic: "ٱللَّٰهُ أَكْبَرُ",
    translation: "Allah is the Greatest",
    count: "33",
  },
  {
    id: "4",
    title: "Astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    translation: "I seek forgiveness",
    count: "100",
  },
];

// Hardcoded Theme
const COLORS = {
  background: "#000",
  card: "#16191E",
  border: "#2C3033",
  buttonBg: "#23272F",
  accent: "#00E5FF",
  textMain: "#FFFFFF",
  textMuted: "#888888",
  glowBg: "rgba(0, 229, 255, 0.1)",
};

export default function LibraryScreen() {
  const router = useRouter();

  // State Management
  const [tasbeehList, setTasbeehList] = useState(INITIAL_TASBEEH_DATA);
  const [searchQuery, setSearchQuery] = useState("");

  // Inline Form State
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCount, setNewCount] = useState("");

  // Handlers
  const handleStartJourney = (item: any) => {
    router.push({
      pathname: "/counter", // Ensure this matches your actual counter screen file name
      params: {
        tasbeehName: item.title,
        tasbeehGoal: String(item.count),
      },
    });
  };

  const handleDelete = (id: string) => {
    setTasbeehList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewCount(String(item.count));
    setIsFormVisible(true);
  };

  const cancelForm = () => {
    setIsFormVisible(false);
    setEditingId(null);
    setNewTitle("");
    setNewCount("");
  };

  const handleSaveTasbeeh = () => {
    if (!newTitle.trim() || !newCount.trim()) return;

    if (editingId) {
      setTasbeehList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, title: newTitle, count: newCount }
            : item,
        ),
      );
    } else {
      const newTasbeeh = {
        id: Date.now().toString(),
        title: newTitle,
        arabic: "...",
        translation: "Custom Tasbeeh",
        count: newCount,
      };
      setTasbeehList([newTasbeeh, ...tasbeehList]);
    }

    cancelForm();
  };

  const filteredList = useMemo(() => {
    return tasbeehList.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.arabic.includes(searchQuery),
    );
  }, [tasbeehList, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Updated Unified Header */}
      <View style={styles.topBar}>
        <View style={{ width: 24 }} />{" "}
        <Text style={styles.upperLabel}>YOUR SANCTUARY</Text>
        <View style={{ width: 24 }} />{" "}
        {/* Spacer to keep title perfectly centered */}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Explore Library</Text>
          {/* <Text style={styles.subtitle}>Manage your tasbeeh collection</Text> */}
        </View>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your tasbeeh..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Inline Form */}
        {isFormVisible && (
          <View style={styles.inlineFormContainer}>
            <View style={styles.formHeader}>
              <ThemedText style={styles.formTitle}>
                {editingId ? "Edit Tasbeeh" : "Create New Tasbeeh"}
              </ThemedText>
              <Pressable onPress={cancelForm}>
                <MaterialIcons name="close" size={24} color="#888" />
              </Pressable>
            </View>

            <ThemedText style={styles.formInputLabel}>Tasbeeh Name</ThemedText>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. SubhanAllah"
              placeholderTextColor="#666"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <ThemedText style={styles.formInputLabel}>Target Goal</ThemedText>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 33 or 100"
              placeholderTextColor="#666"
              value={newCount}
              onChangeText={setNewCount}
              keyboardType="numeric"
            />

            <View style={styles.formActionsGroup}>
              <Pressable style={styles.formCancelBtn} onPress={cancelForm}>
                <ThemedText style={styles.formCancelText}>Cancel</ThemedText>
              </Pressable>
              <Pressable style={styles.formSaveBtn} onPress={handleSaveTasbeeh}>
                <ThemedText style={styles.formSaveText}>
                  {editingId ? "Update" : "Save"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Cards List */}
        <View style={styles.cardList}>
          {filteredList.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.arabicText}>{item.arabic}</ThemedText>
                <View style={styles.goalPill}>
                  <ThemedText style={styles.goalText}>
                    Goal: {item.count}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.englishTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.translationText}>
                {item.translation}
              </ThemedText>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <View style={styles.iconActionGroup}>
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() => handleDelete(item.id)}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={24}
                      color="#FF5252"
                    />
                  </Pressable>
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() => handleEdit(item)}
                  >
                    <MaterialIcons
                      name="edit"
                      size={22}
                      color={COLORS.accent}
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.startJourneyBtn}
                  onPress={() => handleStartJourney(item)}
                >
                  <ThemedText style={styles.startJourneyText}>
                    START JOURNEY
                  </ThemedText>
                  <MaterialIcons name="arrow-forward" size={18} color="#000" />
                </Pressable>
              </View>
            </View>
          ))}

          {filteredList.length === 0 && !isFormVisible && (
            <ThemedText style={styles.emptyText}>
              No Tasbeeh found matching "{searchQuery}"
            </ThemedText>
          )}
        </View>
      </ScrollView>

      {/* Floating Create Button */}
      {!isFormVisible && (
        <View style={styles.floatingButtonContainer}>
          <Pressable
            style={styles.createButton}
            onPress={() => {
              setEditingId(null);
              setIsFormVisible(true);
            }}
          >
            <MaterialIcons name="add" size={24} color="#000" />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    color: COLORS.accent,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
  },

  subLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  mainHeading: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16191E",
    borderRadius: 24,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },

  /* Inline Form Styles */
  inlineFormContainer: {
    backgroundColor: "#16191E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#2C3033",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  formTitle: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "bold",
  },
  formInputLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#23272F",
    borderRadius: 12,
    padding: 15,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2C3033",
    marginBottom: 15,
  },
  formActionsGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 5,
  },
  formCancelBtn: {
    flex: 1,
    backgroundColor: "#23272F",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  formCancelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  formSaveBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  formSaveText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },

  /* Card Styles */
  cardList: {
    gap: 20,
  },
  card: {
    backgroundColor: "#16191E",
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  goalPill: {
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  goalText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  arabicText: {
    color: COLORS.accent,
    fontSize: 26,
    fontWeight: "bold",
  },
  englishTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  translationText: {
    color: "#888",
    fontSize: 14,
    marginBottom: 20,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2C3033",
    paddingTop: 15,
  },
  iconActionGroup: {
    flexDirection: "row",
    gap: 15,
  },
  iconBtn: {
    padding: 5,
  },
  startJourneyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  startJourneyText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },

  /* Floating Button */
  floatingButtonContainer: {
    position: "absolute",
    bottom: 30,
    right: 25,
    alignItems: "center",
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    gap: 8,
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  createButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});
