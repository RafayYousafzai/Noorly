import {
  addHistoryEntry,
  getActiveState,
  saveActiveState,
} from "@/utils/tasbeeh-store";
import * as Haptics from "expo-haptics";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

type CounterContextType = {
  count: number;
  currentSet: number;
  completedSets: number;
  isGoalReached: boolean;
  goal: number;
  tasbeehName: string;
  hapticEnabled: boolean;
  setGoal: (goal: number) => void;
  setTasbeehName: (name: string) => void;
  handleIncrement: () => Promise<void>;
  handleStartNewCount: () => Promise<void>;
  handleReset: () => Promise<void>;
  handleHapticToggle: () => Promise<void>;
};

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);
  const [isGoalReached, setIsGoalReached] = useState(false);
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
          setIsGoalReached(saved.completedSets > 0 && saved.count === 0);
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
      currentSet,
      completedSets,
      goal,
      tasbeehName,
      hapticEnabled,
    }).catch(() => {});
  }, [
    count,
    currentSet,
    completedSets,
    goal,
    tasbeehName,
    hapticEnabled,
    isReady,
  ]);

  const addToHistory = async (eventType: "manual-reset" | "goal-complete") => {
    try {
      await addHistoryEntry({
        tasbeehName,
        goal,
        countAtEvent: count,
        currentSet,
        completedSets,
        eventType,
      });
    } catch {
      // Non-blocking storage failure
    }
  };

  const handleIncrement = async () => {
    if (isGoalReached && count === 0) {
      // User started the next set, so switch action button back to Reset.
      setIsGoalReached(false);
    }

    const newCount = count + 1;
    if (newCount >= goal) {
      setCount(0);
      setCompletedSets((prev) => prev + 1);
      setCurrentSet((prev) => prev + 1);
      setIsGoalReached(true);

      if (hapticEnabled) {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } catch (e) {}
      }
    } else {
      setCount(newCount);
      if (hapticEnabled) {
        try {
          await Haptics.selectionAsync();
        } catch (e) {}
      }
    }
  };

  const handleStartNewCount = async () => {
    const hasProgress = count > 0 || completedSets > 0;
    if (hasProgress) {
      const eventType = completedSets > 0 ? "goal-complete" : "manual-reset";
      try {
        await addToHistory(eventType);
      } catch {}
    }

    setCount(0);
    setCurrentSet(1);
    setCompletedSets(0);
    setIsGoalReached(false);

    if (hapticEnabled) {
      try {
        await Haptics.selectionAsync();
      } catch (e) {}
    }
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset Counter",
      "Are you sure you want to reset the current set?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setIsGoalReached(false);
            if (count > 0 || completedSets > 0) {
              await addToHistory("manual-reset");
            }
            setCount(0);
            setCurrentSet(1);
            setCompletedSets(0);
            if (hapticEnabled) {
              try {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning,
                );
              } catch (e) {}
            }
          },
        },
      ],
    );
  };

  const handleHapticToggle = async () => {
    setHapticEnabled((prev) => !prev);
    try {
      await Haptics.selectionAsync();
    } catch (e) {}
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
        setGoal,
        setTasbeehName,
        handleIncrement,
        handleStartNewCount,
        handleReset,
        handleHapticToggle,
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
