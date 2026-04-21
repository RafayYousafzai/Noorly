import { MaterialIcons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

export default function CreateTasbeehModal({
  isVisible,
  children,
  onClose,
}: Props) {
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      {/* Semi-transparent overlay */}
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create New Tasbeeh</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" color="#fff" size={22} />
            </Pressable>
          </View>
          {/* Modal Content goes here */}
          <View style={styles.contentBody}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "40%", // Slightly taller for form inputs
    width: "100%",
    backgroundColor: "#1A1C1E", // Dark theme background
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
    borderBottomColor: "#2C3033",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  contentBody: {
    padding: 20,
    flex: 1,
  },
});
