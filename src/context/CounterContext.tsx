import {
  addHistoryEntry,
  getActiveState,
  saveActiveState,
} from "@/utils/tasbeeh-store";
import * as Haptics from "expo-haptics";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

type CounterContextType = {
  count: number;
  currentSet: number;
  completedSets: number;
  isGoalReached: boolean;
  goal: number;
  tasbeehName: string;
  hapticEnabled: boolean;
  pressAgainToReset: boolean;
  setGoal: (goal: number) => void;
  setTasbeehName: (name: string) => void;
  handleIncrement: () => Promise<void>;
  handleStartNewCount: () => Promise<void>;
  handleReset: () => Promise<void>;
  handleHapticToggle: () => Promise<void>;
  setPressAgainToReset: (val: boolean) => void;
};

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);
  const [isGoalReached, setIsGoalReached] = useState(false);
  const [pressAgainToReset, setPressAgainToReset] = useState(false);
  const [goal, setGoal] = useState(100);
  const [tasbeehName, setTasbeehName] = useState("SubhanAllah");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadState() {
      try {
        const saved = await getActiveState();
        if (saved) {
          setCount(saved.count);
          setCurrentSet(saved.currentSet);
          setCompletedSets(saved.completedSets);
          setGoal(saved.goal);
          setTasbeehName(saved.tasbeehName);
          setHapticEnabled(saved.hapticEnabled);
          setIsGoalReached(saved.count >= saved.goal);
        }
      } catch (e) {}
      setIsReady(true);
    }
    loadState();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveActiveState({
      count,
      currentSet: 1,
      completedSets: count >= goal ? 1 : 0,
      goal,
      tasbeehName,
      hapticEnabled,
    }).catch(() => {});
  }, [
    count,
    goal,
    tasbeehName,
    hapticEnabled,
    isReady,
  ]);

  const addToHistory = async (eventType: "manual-reset" | "goal-complete", finalCount = count) => {
    try {
      await addHistoryEntry({
        tasbeehName,
        goal,
        countAtEvent: finalCount,
        currentSet: 1,
        completedSets: eventType === "goal-complete" ? 1 : 0,
        eventType,
      });
    } catch {
      // Non-blocking storage failure
    }
  };

  const handleIncrement = async () => {
    if (isGoalReached) {
      if (pressAgainToReset) {
        await handleStartNewCount();
      } else {
        setPressAgainToReset(true);
        if (hapticEnabled) {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (e) {}
        }
      }
      return;
    }

    const newCount = count + 1;
    if (newCount >= goal) {
      setCount(goal);
      setIsGoalReached(true);

      if (hapticEnabled) {
        try {
          if (Platform.OS === "android") {
            await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm);
            setTimeout(async () => {
              try {
                await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Clock_Tick);
              } catch {}
            }, 150);
          } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(async () => {
              try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
            }, 200);
          }
        } catch (e) {}
      }

      await addToHistory("goal-complete", goal);
    } else {
      setCount(newCount);
    }
  };

  const handleStartNewCount = async () => {
    setCount(0);
    setCurrentSet(1);
    setCompletedSets(0);
    setIsGoalReached(false);
    setPressAgainToReset(false);
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset Counter",
      "Are you sure you want to reset the counter?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setIsGoalReached(false);
            setPressAgainToReset(false);
            if (count > 0) {
              await addToHistory("manual-reset", count);
            }
            setCount(0);
            setCurrentSet(1);
            setCompletedSets(0);
            if (hapticEnabled) {
              try {
                if (Platform.OS === "android") {
                  await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject);
                } else {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
              } catch (e) {}
            }
          },
        },
      ],
    );
  };

  const handleHapticToggle = async () => {
    setHapticEnabled((prev) => !prev);
  };

  return (
    <CounterContext.Provider
      value={{
        count,
        currentSet,
        completedSets,
        isGoalReached,
        goal,
        tasbeehName,
        hapticEnabled,
        pressAgainToReset,
        setGoal,
        setTasbeehName,
        handleIncrement,
        handleStartNewCount,
        handleReset,
        handleHapticToggle,
        setPressAgainToReset,
      }}
    >
      {children}
    </CounterContext.Provider>
  );
}

export function useCounter() {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return context;
}
