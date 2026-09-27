import { Redirect, Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { useWildday } from "@/state/WilddayContext";

function NotificationObserver() {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const url = response?.notification.request.content.data?.url;
    if (response && response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER && typeof url === "string") {
      router.push(url as never);
    }
  }, [response]);
  return null;
}

function NavigationGate() {
  const { ready, onboarded } = useWildday();
  if (!ready) return null;
  return onboarded ? <Stack screenOptions={{ headerShown: false }} /> : <Redirect href="/onboarding" />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NotificationObserver />
      <NavigationGate />
    </SafeAreaProvider>
  );
}