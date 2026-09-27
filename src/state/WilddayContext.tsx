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

export type Note = { id: string; text: string; createdAt: string; completed: boolean };

type StoredState = {
  version: 5;
  onboarded: boolean;
  goalName: string;
  goals: Goal[];
  actions: Action[];
  focusMinutes: number;
  focusHistory: Record<string, number>;
  focusSessions: number;
  reflection: string;
  reflectionDate: string;
  notes: Note[];
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

type WilddayContextValue = StoredState & {
  ready: boolean;
  todayKey: string;
  nextAction?: Action;
  completedToday: number;
  deferredToday: number;
  weekCompleted: number;
  weekFocusMinutes: number;
  dueActions: Action[];
  finishOnboarding: (goalName: string, actionTitle: string, duration: number, cadence?: Cadence) => void;
  addGoalWithAction: (goalName: string, title: string, duration: number, cadence?: Cadence) => void;
  addAction: (input: { goalId: string; title: string; duration: number; cadence?: Cadence }) => void;
  completeAction: (id: string) => void;
  rescheduleAction: (id: string) => void;
  recordFocus: (actionId?: string, minutes?: number) => void;
  saveReflection: (text: string) => void;
  addNote: (text: string) => void;
  toggleNote: (id: string) => void;
  deleteNote: (id: string) => void;
  saveReminderSettings: (enabled: boolean, hour: number, minute: number) => void;
  storageError: string | null;
  retryPersistence: () => Promise<void>;
};

const STORAGE_KEY = "wildday.state.v5";
const LEGACY_STORAGE_KEY = "wildday.state.v4";

const initialState: StoredState = {
  version: 5, onboarded: false, goalName: "", goals: [], actions: [],
  focusMinutes: 0, focusHistory: {}, focusSessions: 0, reflection: "", reflectionDate: "", reminderEnabled: false, reminderHour: 9, reminderMinute: 0
};

export function getLocalDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const today = getLocalDayKey(now);

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
    version: 5,
    onboarded: Boolean(source.onboarded),
    goalName: typeof source.goalName === "string" ? source.goalName : "",
    goals,
    actions,
    focusMinutes: Math.max(0, Number(source.focusMinutes) || 0),
    focusHistory: source.focusHistory && typeof source.focusHistory === "object" ? source.focusHistory as Record<string, number> : {},
    focusSessions: Math.max(0, Number(source.focusSessions) || 0),
    reflection: typeof source.reflection === "string" ? source.reflection.slice(0, 5000) : "",
    reflectionDate: typeof source.reflectionDate === "string" ? source.reflectionDate : "",
    notes: Array.isArray(source.notes) ? source.notes.filter((item): item is Note => !!item && typeof item === "object" && typeof (item as Note).id === "string" && typeof (item as Note).text === "string").map((item) => ({ id: item.id, text: item.text.trim().slice(0, 500), createdAt: item.createdAt, completed: Boolean(item.completed) })).slice(0, 100) : [],
    reminderEnabled: Boolean(source.reminderEnabled),
    reminderHour: Math.min(23, Math.max(0, Number(source.reminderHour) || 9)),
    reminderMinute: Math.min(59, Math.max(0, Number(source.reminderMinute) || 0))
  };
}

const WilddayContext = createContext<WilddayContextValue | null>(null);

export function WilddayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const todayKey = getLocalDayKey();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (value) => {
        if (value) return setState(migrate(JSON.parse(value)));
        const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) return setState(migrate(JSON.parse(legacy)));
        setState(initialState);
      })
      .catch(() => { setState(initialState); setStorageError("Your saved Wildday data could not be opened."); })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).then(() => { if (active) setStorageError(null); }).catch(() => { if (active) setStorageError("Wildday could not save your latest change."); });
    return () => { active = false; };
  }, [state, ready]);

  const value = useMemo<WilddayContextValue>(() => {
    const dueActions = state.actions.filter((action) => isDue(action));
    const completedToday = dueActions.filter((action) => action.history[todayKey] === "completed").length;
    const deferredToday = dueActions.filter((action) => action.history[todayKey] === "deferred").length;
    const nextAction = dueActions.find((action) => !action.history[todayKey]);
    const weekKeys = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      return getLocalDayKey(date);
    });
    const weekCompleted = state.actions.reduce((sum, action) => sum + weekKeys.filter((key) => action.history[key] === "completed").length, 0);
    const weekFocusMinutes = weekKeys.reduce((sum, key) => sum + (state.focusHistory[key] ?? 0), 0);

    return {
      ...state, ready, storageError, retryPersistence: async () => {
        try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageError(null); } catch { setStorageError("Wildday still cannot save on this device."); }
      }, todayKey, dueActions, nextAction, completedToday, deferredToday, weekCompleted, weekFocusMinutes,

      finishOnboarding: (goalName, actionTitle, duration, cadence = "daily") => {
        const goalId = String(Date.now());
        const action: Action = {
          id: goalId + "-action", title: actionTitle.trim().slice(0, 200), goalId, goal: goalName.trim().slice(0, 120),
          duration: safeDuration(duration), cadence, anchorWeekday: weekday(),
          history: {}, completedCount: 0
        };
        setState({
          ...initialState, version: 5, onboarded: true, goalName: goalName.trim().slice(0, 120),
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
        return { ...current, focusMinutes: current.focusMinutes + amount, focusHistory: { ...current.focusHistory, [todayKey]: (current.focusHistory[todayKey] ?? 0) + amount }, focusSessions: current.focusSessions + 1 };
      }),

      saveReflection: (text) => setState((current) => ({
        ...current, reflection: text.trim().slice(0, 5000), reflectionDate: new Date().toISOString()
      })),

      addNote: (text) => setState((current) => {
        const clean = text.trim().slice(0, 500);
        if (!clean) return current;
        return { ...current, notes: [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: clean, createdAt: new Date().toISOString(), completed: false }, ...current.notes].slice(0, 100) };
      }),

      toggleNote: (id) => setState((current) => ({ ...current, notes: current.notes.map((note) => note.id === id ? { ...note, completed: !note.completed } : note) })),

      deleteNote: (id) => setState((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) })),

      saveReminderSettings: (enabled, hour, minute) => setState((current) => ({
        ...current,
        reminderEnabled: enabled,
        reminderHour: Math.min(23, Math.max(0, Math.round(hour))),
        reminderMinute: Math.min(59, Math.max(0, Math.round(minute)))
      }))
    };
  }, [ready, state, todayKey, storageError]);

  return <WilddayContext.Provider value={value}>{children}</WilddayContext.Provider>;
}

export function useWildday() {
  const context = useContext(WilddayContext);
  if (!context) throw new Error("useWildday must be used inside WilddayProvider");
  return context;
}
