import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  getCustomTasbeehItems,
  saveCustomTasbeehItems,
  type TasbeehItem,
} from "@/utils/tasbeeh-store";

const DEFAULT_TASBEEH: TasbeehItem[] = [
  { id: "1", name: "SubhanAllah", goal: 100, isDefault: true },
  { id: "2", name: "Alhamdulillah", goal: 100, isDefault: true },
  { id: "3", name: "Allahu Akbar", goal: 100, isDefault: true },
  { id: "4", name: "Astaghfirullah", goal: 100, isDefault: true },
];

function TasbeehCard({
  item,
  onPress,
  onEdit,
  onDelete,
  selected,
}: {
  item: TasbeehItem;
  onPress: (item: TasbeehItem) => void;
  onEdit: (item: TasbeehItem) => void;
  onDelete: (id: string) => void;
  selected: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
    >
      <ThemedView
        type={selected ? "backgroundSelected" : "backgroundElement"}
        style={[
          styles.card,
          selected && { backgroundColor: "#004d4c", borderWidth: 0 },
        ]}
      >
        <View style={styles.cardContent}>
          <ThemedText
            type="smallBold"
            style={[
              styles.cardName,
              { color: selected ? "#ffffff" : "#004d4c" },
            ]}
          >
            {item.name}
          </ThemedText>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={[styles.goalText, selected && { color: "#e0e0e0" }]}
          >
            Goal: {item.goal}
          </ThemedText>
        </View>
        <View style={styles.cardActions}>
          {selected && (
            <ThemedText
              type="smallBold"
              style={[styles.selectedBadge, { color: "#ffffff" }]}
            >
              ✓
            </ThemedText>
          )}
          {!item.isDefault && (
            <>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onEdit(item);
                }}
                style={({ pressed }) => [
                  pressed && { opacity: 0.6 },
                  { padding: Spacing.one },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={[styles.editButton, selected && { color: "#c9fff6" }]}
                >
                  Edit
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  Alert.alert("Delete", "Remove this tasbeeh?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      onPress: () => onDelete(item.id),
                      style: "destructive",
                    },
                  ]);
                }}
                style={({ pressed }) => [
                  pressed && { opacity: 0.6 },
                  { padding: Spacing.one },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={[
                    styles.deleteButton,
                    selected && { color: "#ff8c8c" },
                  ]}
                >
                  Del
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

function CustomizeModal({
  visible,
  onClose,
  item,
  onSave,
  title,
  submitLabel,
  editable = true,
}: {
  visible: boolean;
  onClose: () => void;
  item?: TasbeehItem;
  onSave: (name: string, goal: number) => void;
  title: string;
  submitLabel: string;
  editable?: boolean;
}) {
  const [name, setName] = useState(item?.name || "");
  const [goal, setGoal] = useState(item?.goal.toString() || "100");
  const theme = useTheme();

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(item?.name || "");
    setGoal(item?.goal?.toString() || "100");
  }, [item, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    const goalNum = parseInt(goal, 10);
    if (!goalNum || goalNum <= 0) {
      Alert.alert("Error", "Please enter a valid goal");
      return;
    }
    onSave(name, goalNum);
    setName("");
    setGoal("100");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            {title}
          </ThemedText>

          <View style={styles.formGroup}>
            <ThemedText type="small" style={styles.label}>
              Name
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              placeholder="e.g., Custom Salawat"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              editable={editable}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText type="small" style={styles.label}>
              Target Goal
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              placeholder="e.g., 100, 313, 1000"
              placeholderTextColor={theme.textSecondary}
              value={goal}
              onChangeText={setGoal}
              keyboardType="number-pad"
              editable={editable}
            />
          </View>

          <View style={styles.modalButtons}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedView
                type="backgroundElement"
                style={styles.modalButtonInner}
              >
                <ThemedText type="smallBold" style={styles.buttonLabel}>
                  Cancel
                </ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.modalButtonInner,
                  { backgroundColor: "#004d4c" },
                ]}
              >
                <ThemedText type="smallBold" style={styles.buttonLabelLight}>
                  {submitLabel}
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const [tasbeehList, setTasbeehList] = useState<TasbeehItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TasbeehItem | undefined>();
  const theme = useTheme();

  useEffect(() => {
    let isMounted = true;

    const loadLibrary = async () => {
      try {
        const customItems = await getCustomTasbeehItems();
        if (isMounted) {
          setTasbeehList([...DEFAULT_TASBEEH, ...customItems]);
        }
      } catch {
        if (isMounted) {
          setTasbeehList(DEFAULT_TASBEEH);
        }
      }
    };

    loadLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top + Spacing.four,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
    default: {
      paddingTop: insets.top + Spacing.four,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
  });

  const handleCardPress = (item: TasbeehItem) => {
    setSelectedId(item.id);
    router.push({
      pathname: "/counter",
      params: {
        tasbeehName: item.name,
        tasbeehGoal: item.goal.toString(),
      },
    });
  };

  const handleCreateTasbeeh = async (name: string, goal: number) => {
    const newItem: TasbeehItem = {
      id: Date.now().toString(),
      name,
      goal,
      isDefault: false,
    };

    const updatedList = [...tasbeehList, newItem];
    setTasbeehList(updatedList);
    setSelectedId(newItem.id);
    setCreateModalVisible(false);

    try {
      await saveCustomTasbeehItems(
        updatedList.filter((item) => !item.isDefault),
      );
    } catch {
      Alert.alert("Save failed", "Could not save tasbeeh. Please try again.");
    }
  };

  const handleDeleteTasbeeh = async (id: string) => {
    const updatedList = tasbeehList.filter((item) => item.id !== id);
    setTasbeehList(updatedList);

    if (selectedId === id) {
      setSelectedId(DEFAULT_TASBEEH[0].id);
    }

    try {
      await saveCustomTasbeehItems(
        updatedList.filter((item) => !item.isDefault),
      );
    } catch {
      Alert.alert(
        "Delete failed",
        "Could not update tasbeeh library. Please try again.",
      );
    }
  };

  const handleEditTasbeeh = (item: TasbeehItem) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleSaveEditedTasbeeh = async (name: string, goal: number) => {
    if (!editingItem) {
      return;
    }

    const updatedList = tasbeehList.map((item) =>
      item.id === editingItem.id ? { ...item, name, goal } : item,
    );

    setTasbeehList(updatedList);
    setEditModalVisible(false);
    setEditingItem(undefined);

    try {
      await saveCustomTasbeehItems(
        updatedList.filter((item) => !item.isDefault),
      );
    } catch {
      Alert.alert("Edit failed", "Could not update tasbeeh. Please try again.");
    }
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={tasbeehList}
        keyExtractor={(item) => item.id}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        contentInset={insets}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.listContentContainer,
          contentPlatformStyle,
        ]}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <ThemedText style={styles.mainTitle}>
              📿 Tasbeeh{"\n"}Library
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Choose a tasbeeh or{"\n"}create a custom one
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TasbeehCard
            item={item}
            selected={selectedId === item.id}
            onPress={() => handleCardPress(item)}
            onEdit={() => handleEditTasbeeh(item)}
            onDelete={() => handleDeleteTasbeeh(item.id)}
          />
        )}
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => {
              setCreateModalVisible(true);
            }}
          >
            <ThemedText style={styles.createButtonText}>
              + Create New Tasbeeh
            </ThemedText>
          </Pressable>
        }
      />

      {/* Modals */}
      <CustomizeModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        item={undefined}
        title="Create Tasbeeh"
        submitLabel="Create"
        editable={true}
        onSave={(name, goal) => handleCreateTasbeeh(name, goal)}
      />

      <CustomizeModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingItem(undefined);
        }}
        item={editingItem}
        title="Edit Tasbeeh"
        submitLabel="Save"
        editable={true}
        onSave={handleSaveEditedTasbeeh}
      />
    </ThemedView>
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
  listContentContainer: {
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  headerSection: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  mainTitle: {
    fontSize: 44,
    fontWeight: "800",
    lineHeight: 48,
    marginBottom: Spacing.three,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 34,
  },
  card: {
    borderRadius: 24, // Matched large border radius
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
  },
  goalText: {
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.9,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  selectedBadge: {
    fontSize: 22,
    marginRight: Spacing.one,
  },
  deleteButton: {
    fontWeight: "800",
    color: "#ba1a1a",
    fontSize: 14,
  },
  editButton: {
    fontWeight: "700",
    color: "#006c60",
    fontSize: 14,
  },
  createButton: {
    backgroundColor: "#004d4c",
    borderRadius: 32, // Pill shape match
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.one,
    marginBottom: Spacing.five,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  modalContent: {
    borderRadius: 24,
    padding: Spacing.five,
    width: "100%",
    maxWidth: 400,
    gap: Spacing.four,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#004d4c",
    textAlign: "center",
  },
  formGroup: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#004d4c",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  buttonLabelLight: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  modalButton: {
    flex: 1,
  },
  modalButtonInner: {
    borderRadius: 32, // Match pill aesthetic
    paddingVertical: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
});
