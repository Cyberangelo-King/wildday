import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { WilddayProvider } from "@/state/WilddayContext";

export default function RootLayout() {
  return (
    <WilddayProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </WilddayProvider>
  );
}