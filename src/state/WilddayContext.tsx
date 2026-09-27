import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Action = {
  id: string;
  title: string;
  goalId: string;
  goal: string;
  duration: number;
  completed: boolean;
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
};

type WilddayContextValue = StoredState & {
  ready: boolean;
  nextAction?: Action;
  completedToday: number;
  finishOnboarding: (goalName: string, actionTitle: string, duration: number) => void;
  addGoal: (name: string) => string;
  addAction: (input: { goalId: string; title: string; duration: number }) => void;
  completeAction: (id: string) => void;
  rescheduleAction: (id: string) => void;
  recordFocus: (actionId?: string) => void;
  saveReflection: (text: string) => void;
};

const STORAGE_KEY = "wildday.state.v2";

const initialState: StoredState = {
  onboarded: false,
  goalName: "",
  goals: [],
  actions: [],
  focusMinutes: 0,
  reflection: ""
};

const WilddayContext = createContext<WilddayContextValue | null>(null);

export function WilddayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(initialState);
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

  const value = useMemo<WilddayContextValue>(() => {
    const nextAction = state.actions.find((item) => !item.completed);
    return {
      ...state,
      ready,
      nextAction,
      completedToday: state.actions.filter((item) => item.completed).length,
      finishOnboarding: (goalName, actionTitle, duration) => {
        const goalId = String(Date.now());
        setState({
          onboarded: true,
          goalName,
          goals: [{ id: goalId, name: goalName, actions: 1, progress: 0 }],
          actions: [{ id: goalId + "-action", title: actionTitle, goalId, goal: goalName, duration, completed: false }],
          focusMinutes: 0,
          reflection: ""
        });
      },
      addGoal: (name) => {
        const id = String(Date.now());
        setState((current) => ({
          ...current,
          goals: [...current.goals, { id, name, actions: 0, progress: 0 }]
        }));
        return id;
      },
      addAction: ({ goalId, title, duration }) => setState((current) => {
        const goal = current.goals.find((item) => item.id === goalId);
        if (!goal) return current;
        return {
          ...current,
          actions: [...current.actions, { id: String(Date.now()), title, goalId, goal: goal.name, duration, completed: false }],
          goals: current.goals.map((item) => item.id === goalId ? { ...item, actions: item.actions + 1 } : item)
        };
      }),
      completeAction: (id) => setState((current) => {
        const target = current.actions.find((item) => item.id === id);
        if (!target || target.completed) return current;
        return {
          ...current,
          actions: current.actions.map((item) => item.id === id ? { ...item, completed: true } : item),
          goals: current.goals.map((goal) => goal.id === target.goalId
            ? { ...goal, progress: Math.min(100, goal.progress + Math.round(100 / Math.max(1, goal.actions))) }
            : goal)
        };
      }),
      rescheduleAction: (id) => setState((current) => {
        const target = current.actions.find((item) => item.id === id);
        if (!target) return current;
        return { ...current, actions: [...current.actions.filter((item) => item.id !== id), { ...target, completed: false }] };
      }),
      recordFocus: (actionId) => setState((current) => {
        const action = current.actions.find((item) => item.id === actionId);
        return { ...current, focusMinutes: current.focusMinutes + (action?.duration ?? 0) };
      }),
      saveReflection: (text) => setState((current) => ({ ...current, reflection: text }))
    };
  }, [ready, state]);

  return <WilddayContext.Provider value={value}>{children}</WilddayContext.Provider>;
}

export function useWildday() {
  const context = useContext(WilddayContext);
  if (!context) throw new Error("useWildday must be used inside WilddayProvider");
  return context;
}