import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Action = {
  id: string;
  title: string;
  goal: string;
  duration: number;
  completed: boolean;
};

type WilddayContextValue = {
  ready: boolean;
  onboarded: boolean;
  goalName: string;
  actions: Action[];
  finishOnboarding: (goalName: string, actionTitle: string, duration: number) => void;
  completeAction: (id: string) => void;
  rescheduleAction: (id: string) => void;
};

const STORAGE_KEY = "wildday.state.v1";

const initialState = {
  onboarded: false,
  goalName: "",
  actions: [] as Action[]
};

const WilddayContext = createContext<WilddayContextValue | null>(null);

export function WilddayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) setState(JSON.parse(value));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<WilddayContextValue>(() => ({
    ready,
    onboarded: state.onboarded,
    goalName: state.goalName,
    actions: state.actions,
    finishOnboarding: (goalName, actionTitle, duration) => setState({
      onboarded: true,
      goalName,
      actions: [{
        id: String(Date.now()),
        title: actionTitle,
        goal: goalName,
        duration,
        completed: false
      }]
    }),
    completeAction: (id) => setState((current) => ({
      ...current,
      actions: current.actions.map((action) =>
        action.id === id ? { ...action, completed: true } : action
      )
    })),
    rescheduleAction: (id) => setState((current) => {
      const target = current.actions.find((action) => action.id === id);
      if (!target) return current;
      return {
        ...current,
        actions: [
          ...current.actions.filter((action) => action.id !== id),
          { ...target, completed: false }
        ]
      };
    })
  }), [ready, state]);

  return <WilddayContext.Provider value={value}>{children}</WilddayContext.Provider>;
}

export function useWildday() {
  const context = useContext(WilddayContext);
  if (!context) throw new Error("useWildday must be used inside WilddayProvider");
  return context;
}