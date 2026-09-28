import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const REMINDER_ID = "wildday-daily-reminder";
const CHANNEL_ID = "wildday-reminders";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function setDailyReminder(enabled: boolean, hour: number, minute: number) {
  if (Platform.OS === "web") return { enabled: false, reason: "unsupported" as const };

  let existing: Notifications.NotificationRequest[] = [];
  try { existing = await Notifications.getAllScheduledNotificationsAsync(); } catch { return { enabled: false as const, reason: "unavailable" as const }; }
  const current = existing.find((item) => item.identifier === REMINDER_ID);
  if (current) await Notifications.cancelScheduledNotificationAsync(current.identifier);

  if (!enabled) return { enabled: false as const };

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: false },
    });
    if (!requested.granted) return { enabled: false as const, reason: "permission-denied" as const };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Wildday reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150],
      sound: undefined,
    });
  }

  try {
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: "Wildday",
      body: "What matters today? Open Wildday and choose your next move.",
      data: { url: "/(tabs)/today" },
      ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: Math.min(23, Math.max(0, Math.round(hour))),
      minute: Math.min(59, Math.max(0, Math.round(minute))),
    },
  });
  } catch {
    return { enabled: false as const, reason: "unavailable" as const };
  }

  return { enabled: true as const };
}

export async function cancelDailyReminder() {
  if (Platform.OS === "web") return;
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const current = existing.find((item) => item.identifier === REMINDER_ID);
  if (current) await Notifications.cancelScheduledNotificationAsync(current.identifier);
}
