import { MaterialIcons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

import { useTheme } from "@/hooks/use-theme";

export default function CreateTasbeehModal({
  isVisible,
  children,
  onClose,
}: Props) {
  const colors = useTheme();
  const styles = getStyles(colors);
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      {/* Semi-transparent overlay */}
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create New Tasbeeh</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" color={colors.text} size={22} />
            </Pressable>
          </View>
          {/* Modal Content goes here */}
          <View style={styles.contentBody}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "40%", // Slightly taller for form inputs
    width: "100%",
    backgroundColor: colors.backgroundElement, // Dark theme background
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    position: "absolute",
    bottom: 0,
  },
  titleContainer: {
    height: 60,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSelected,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  contentBody: {
    padding: 20,
    flex: 1,
  },
});
