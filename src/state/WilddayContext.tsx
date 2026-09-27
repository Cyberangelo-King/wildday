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
  actions: Action[];
  completeAction: (id: string) => void;
  rescheduleAction: (id: string) => void;
};

const STORAGE_KEY = "wildday.actions.v1";

const initialActions: Action[] = [
  { id: "1", title: "Write for 20 minutes", goal: "Writing", duration: 20, completed: false },
  { id: "2", title: "Review one technical idea", goal: "Learning", duration: 25, completed: false },
  { id: "3", title: "Move for 15 minutes", goal: "Body", duration: 15, completed: true }
];

const WilddayContext = createContext<WilddayContextValue | null>(null);

export function WilddayProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState(initialActions);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => { if (value) setActions(JSON.parse(value)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(actions)).catch(() => {});
  }, [actions]);

  const value = useMemo<WilddayContextValue>(() => ({
    actions,
    completeAction: (id) => setActions((current) =>
      current.map((action) => action.id === id ? { ...action, completed: true } : action)
    ),
    rescheduleAction: (id) => setActions((current) => {
      const target = current.find((action) => action.id === id);
      if (!target) return current;
      return [
        ...current.filter((action) => action.id !== id),
        { ...target, completed: false }
      ];
    })
  }), [actions]);

  return <WilddayContext.Provider value={value}>{children}</WilddayContext.Provider>;
}

export function useWildday() {
  const context = useContext(WilddayContext);
  if (!context) throw new Error("useWildday must be used inside WilddayProvider");
  return context;
}