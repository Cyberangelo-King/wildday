import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Cadence = "daily" | "weekdays" | "weekly";
export type OccurrenceStatus = "completed" | "deferred";

export type Action = {
  id: string;
  title: string;
  goalId: string;
  goal: string;
  duration: number;
  cadence: Cadence;
  anchorWeekday: number;
  history: Record<string, OccurrenceStatus>;
  completedCount: number;
};

export type Goal = {
  id: string;
  name: string;
  actions: number;
};

type StoredState = {
  version: 4;
  onboarded: boolean;
  goalName: string;
  goals: Goal[];
  actions: Action[];
  focusMinutes: number;
  focusSessions: number;
  reflection: string;
  reflectionDate: string;
};

type WilddayContextValue = StoredState & {
  ready: boolean;
  todayKey: string;
  nextAction?: Action;
  completedToday: number;
  deferredToday: number;
  dueActions: Action[];
  finishOnboarding: (goalName: string, actionTitle: string, duration: number) => void;
  addGoalWithAction: (goalName: string, title: string, duration: number, cadence?: Cadence) => void;
  addAction: (input: { goalId: string; title: string; duration: number; cadence?: Cadence }) => void;
  completeAction: (id: string) => void;
  rescheduleAction: (id: string) => void;
  recordFocus: (actionId?: string, minutes?: number) => void;
  saveReflection: (text: string) => void;
};

const STORAGE_KEY = "wildday.state.v4";

const initialState: StoredState = {
  version: 4, onboarded: false, goalName: "", goals: [], actions: [],
  focusMinutes: 0, focusSessions: 0, reflection: "", reflectionDate: ""
};

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function weekday(date = new Date()) {
  return date.getDay();
}

function isDue(action: Action, date = new Date()) {
  if (action.cadence === "daily") return true;
  if (action.cadence === "weekdays") return weekday(date) >= 1 && weekday(date) <= 5;
  return weekday(date) === action.anchorWeekday;
}

function safeDuration(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(180, Math.max(5, Math.round(number))) : 20;
}

function migrate(raw: unknown): StoredState {
  if (!raw || typeof raw !== "object") return initialState;
  const source = raw as Partial<StoredState> & { actions?: Array<Record<string, unknown>>; goals?: Array<Record<string, unknown>> };
  const now = new Date();
  const today = dayKey(now);

  const actions: Action[] = Array.isArray(source.actions)
    ? source.actions
      .filter((item) => typeof item?.id === "string" && typeof item?.title === "string")
      .map((item) => {
        const created = typeof item.createdAt === "string" ? new Date(item.createdAt) : now;
        const legacyCompleted = item.completed === true;
        const legacyDeferred = item.deferred === true;
        return {
          id: item.id as string,
          title: String(item.title).trim().slice(0, 200),
          goalId: String(item.goalId ?? ""),
          goal: String(item.goal ?? ""),
          duration: safeDuration(item.duration),
          cadence: item.cadence === "weekdays" || item.cadence === "weekly" ? item.cadence : "daily",
          anchorWeekday: Number.isInteger(item.anchorWeekday) ? Number(item.anchorWeekday) : created.getDay(),
          history: item.history && typeof item.history === "object"
            ? item.history as Record<string, OccurrenceStatus>
            : legacyCompleted ? { [today]: "completed" } : legacyDeferred ? { [today]: "deferred" } : {},
          completedCount: Number.isFinite(Number(item.completedCount))
            ? Math.max(0, Number(item.completedCount))
            : legacyCompleted ? 1 : 0
        };
      })
    : [];

  const goals: Goal[] = Array.isArray(source.goals)
    ? source.goals
      .filter((item) => typeof item?.id === "string" && typeof item?.name === "string")
      .map((item) => ({
        id: item.id as string,
        name: String(item.name).trim().slice(0, 120),
        actions: actions.filter((action) => action.goalId === item.id).length
      }))
    : [];

  return {
    version: 4,
    onboarded: Boolean(source.onboarded),
    goalName: typeof source.goalName === "string" ? source.goalName : "",
    goals,
    actions,
    focusMinutes: Math.max(0, Number(source.focusMinutes) || 0),
    focusSessions: Math.max(0, Number(source.focusSessions) || 0),
    reflection: typeof source.reflection === "string" ? source.reflection.slice(0, 5000) : "",
    reflectionDate: typeof source.reflectionDate === "string" ? source.reflectionDate : ""
  };
}

const WilddayContext = createContext<WilddayContextValue | null>(null);

export function WilddayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(initialState);
  const [ready, setReady] = useState(false);
  const todayKey = dayKey();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setState(value ? migrate(JSON.parse(value)) : initialState))
      .catch(() => setState(initialState))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<WilddayContextValue>(() => {
    const dueActions = state.actions.filter((action) => isDue(action));
    const completedToday = dueActions.filter((action) => action.history[todayKey] === "completed").length;
    const deferredToday = dueActions.filter((action) => action.history[todayKey] === "deferred").length;
    const nextAction = dueActions.find((action) => !action.history[todayKey]);

    return {
      ...state, ready, todayKey, dueActions, nextAction, completedToday, deferredToday,

      finishOnboarding: (goalName, actionTitle, duration) => {
        const goalId = String(Date.now());
        const action: Action = {
          id: goalId + "-action", title: actionTitle.trim().slice(0, 200), goalId, goal: goalName.trim().slice(0, 120),
          duration: safeDuration(duration), cadence: "daily", anchorWeekday: weekday(),
          history: {}, completedCount: 0
        };
        setState({
          ...initialState, version: 4, onboarded: true, goalName: goalName.trim().slice(0, 120),
          goals: [{ id: goalId, name: goalName.trim().slice(0, 120), actions: 1 }], actions: [action]
        });
      },

      addGoalWithAction: (goalName, title, duration, cadence = "daily") => setState((current) => {
        const cleanGoal = goalName.trim().slice(0, 120);
        const cleanTitle = title.trim().slice(0, 200);
        if (!cleanGoal || !cleanTitle) return current;
        const goalId = String(Date.now());
        const action: Action = {
          id: goalId + "-action", title: cleanTitle, goalId, goal: cleanGoal, duration: safeDuration(duration),
          cadence, anchorWeekday: weekday(), history: {}, completedCount: 0
        };
        return { ...current, goals: [...current.goals, { id: goalId, name: cleanGoal, actions: 1 }], actions: [...current.actions, action] };
      }),

      addAction: ({ goalId, title, duration, cadence = "daily" }) => setState((current) => {
        const goal = current.goals.find((item) => item.id === goalId);
        const cleanTitle = title.trim().slice(0, 200);
        if (!goal || !cleanTitle) return current;
        return {
          ...current,
          actions: [...current.actions, {
            id: String(Date.now()), title: cleanTitle, goalId, goal: goal.name, duration: safeDuration(duration),
            cadence, anchorWeekday: weekday(), history: {}, completedCount: 0
          }],
          goals: current.goals.map((item) => item.id === goalId ? { ...item, actions: item.actions + 1 } : item)
        };
      }),

      completeAction: (id) => setState((current) => {
        const target = current.actions.find((item) => item.id === id);
        if (!target || !isDue(target) || target.history[todayKey] === "completed") return current;
        return {
          ...current,
          actions: current.actions.map((item) => item.id === id
            ? { ...item, history: { ...item.history, [todayKey]: "completed" }, completedCount: item.completedCount + 1 }
            : item)
        };
      }),

      rescheduleAction: (id) => setState((current) => {
        const target = current.actions.find((item) => item.id === id);
        if (!target || !isDue(target)) return current;
        return { ...current, actions: current.actions.map((item) =>
          item.id === id ? { ...item, history: { ...item.history, [todayKey]: "deferred" } } : item
        )};
      }),

      recordFocus: (actionId, minutes) => setState((current) => {
        const action = current.actions.find((item) => item.id === actionId);
        const amount = Math.min(180, Math.max(0, Math.round(minutes ?? action?.duration ?? 0)));
        if (!amount) return current;
        return { ...current, focusMinutes: current.focusMinutes + amount, focusSessions: current.focusSessions + 1 };
      }),

      saveReflection: (text) => setState((current) => ({
        ...current, reflection: text.trim().slice(0, 5000), reflectionDate: new Date().toISOString()
      }))
    };
  }, [ready, state, todayKey]);

  return <WilddayContext.Provider value={value}>{children}</WilddayContext.Provider>;
}

export function useWildday() {
  const context = useContext(WilddayContext);
  if (!context) throw new Error("useWildday must be used inside WilddayProvider");
  return context;
}
