import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useCounter } from "@/context/CounterContext";

export default function FullscreenCounterScreen() {
  const router = useRouter();
  const { count, handleIncrement, goal, currentSet } = useCounter();

  const handleMinimize = () => {
    router.back();
  };

  return (
    <Pressable style={styles.container} onPress={handleIncrement}>
      <StatusBar style="light" hidden={true} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={handleMinimize} style={styles.minimizeBtn}>
            <MaterialIcons name="close-fullscreen" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.countText}>{count}</Text>
          
          {/* Subtle goal and sets indicator */}
          <View style={styles.subtleInfoContainer}>
            <Text style={styles.subtleText}>Set {currentSet}</Text>
            <Text style={styles.subtleSeparator}>•</Text>
            <Text style={styles.subtleText}>Goal {goal}</Text>
          </View>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 30,
    zIndex: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -80,
  },
  countText: {
    fontSize: 140,
    fontWeight: "bold",
    color: "#FFFFFF",
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
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  subtleSeparator: {
    color: "#FFFFFF",
    fontSize: 14,
    marginHorizontal: 10,
  },
});
