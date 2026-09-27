import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Cadence = "daily" | "weekdays" | "weekly";

export type Action = {
  id: string;
  title: string;
  goalId: string;
  goal: string;
  duration: number;
  cadence: Cadence;
  completed: boolean;
  deferred: boolean;
  completedCount: number;
};

export type Goal = {
  id: string;
  name: string;
  actions: number;
  progress: number;
};

type StoredState = {
  onboarded: boolean;
  goalName: string;
  goals: Goal[];
  actions: Action[];
  focusMinutes: number;
  reflection: string;
  reflectionDate: string;
  focusSessions: number;
};

type WilddayContextValue = StoredState & {
  ready: boolean;
  nextAction?: Action;
  completedToday: number;
  deferredToday: number;
  finishOnboarding: (goalName: string, actionTitle: string, duration: number) => void;
  addGoalWithAction: (goalName: string, title: string, duration: number, cadence?: Cadence) => void;
  addAction: (input: { goalId: string; title: string; duration: number; cadence?: Cadence }) => void;
  completeAction: (id: string) => void;
  rescheduleAction: (id: string) => void;
  recordFocus: (actionId?: string, minutes?: number) => void;
  saveReflection: (text: string) => void;
};

const STORAGE_KEY = "wildday.state.v3";
const initialState: StoredState = {
  onboarded: false, goalName: "", goals: [], actions: [],
  focusMinutes: 0, reflection: "", reflectionDate: "", focusSessions: 0
};

const WilddayContext = createContext<WilddayContextValue | null>(null);

export function WilddayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => { if (value) setState(JSON.parse(value)); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<WilddayContextValue>(() => {
    const nextAction = state.actions.find((item) => !item.completed && !item.deferred);
    return {
      ...state,
      ready,
      nextAction,
      completedToday: state.actions.filter((item) => item.completed).length,
      deferredToday: state.actions.filter((item) => item.deferred).length,

      finishOnboarding: (goalName, actionTitle, duration) => {
        const goalId = String(Date.now());
        setState({
          onboarded: true, goalName,
          goals: [{ id: goalId, name: goalName, actions: 1, progress: 0 }],
          actions: [{
            id: goalId + "-action", title: actionTitle, goalId, goal: goalName,
            duration, cadence: "daily", completed: false, deferred: false, completedCount: 0
          }],
          focusMinutes: 0, reflection: "", reflectionDate: "", focusSessions: 0
        });
      },

      addGoalWithAction: (goalName, title, duration, cadence = "daily") => setState((current) => {
        const goalId = String(Date.now());
        return {
          ...current,
          goals: [...current.goals, { id: goalId, name: goalName, actions: 1, progress: 0 }],
          actions: [...current.actions, {
            id: goalId + "-action", title, goalId, goal: goalName, duration,
            cadence, completed: false, deferred: false, completedCount: 0
          }]
        };
      }),

      addAction: ({ goalId, title, duration, cadence = "daily" }) => setState((current) => {
        const goal = current.goals.find((item) => item.id === goalId);
        if (!goal) return current;
        return {
          ...current,
          actions: [...current.actions, {
            id: String(Date.now()), title, goalId, goal: goal.name, duration,
            cadence, completed: false, deferred: false, completedCount: 0
          }],
          goals: current.goals.map((item) => item.id === goalId ? { ...item, actions: item.actions + 1 } : item)
        };
      }),

      completeAction: (id) => setState((current) => {
        const target = current.actions.find((item) => item.id === id);
        if (!target || target.completed) return current;
        return {
          ...current,
          actions: current.actions.map((item) => item.id === id
            ? { ...item, completed: true, deferred: false, completedCount: item.completedCount + 1 }
            : item),
          goals: current.goals.map((goal) => goal.id === target.goalId
            ? { ...goal, progress: Math.min(100, goal.progress + Math.round(100 / Math.max(1, goal.actions))) }
            : goal)
        };
      }),

      rescheduleAction: (id) => setState((current) => ({
        ...current,
        actions: current.actions.map((item) =>
          item.id === id ? { ...item, deferred: true } : item
        )
      })),

      recordFocus: (actionId, minutes) => setState((current) => {
        const action = current.actions.find((item) => item.id === actionId);
        return {
          ...current,
          focusMinutes: current.focusMinutes + (minutes ?? action?.duration ?? 0),
          focusSessions: current.focusSessions + 1
        };
      }),

      saveReflection: (text) => setState((current) => ({
        ...current,
        reflection: text,
        reflectionDate: new Date().toISOString()
      }))
    };
  }, [ready, state]);

  return <WilddayContext.Provider value={value}>{children}</WilddayContext.Provider>;
}

export function useWildday() {
  const context = useContext(WilddayContext);
  if (!context) throw new Error("useWildday must be used inside WilddayProvider");
  return context;
}