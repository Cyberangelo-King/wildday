import { Redirect } from "expo-router";
import { useWildday } from "@/state/WilddayContext";

export default function Index() {
  const { ready, onboarded } = useWildday();
  if (!ready) return null;
  return onboarded ? <Redirect href="/(tabs)/today" /> : <Redirect href="/onboarding" />;
}
