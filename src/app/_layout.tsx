import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useWildday } from "@/state/WilddayContext";

function NavigationGate() {
  const { ready, onboarded } = useWildday();
  if (!ready) return null;
  return onboarded ? <Stack screenOptions={{ headerShown: false }} /> : <Redirect href="/onboarding" />;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationGate />
    </>
  );
}