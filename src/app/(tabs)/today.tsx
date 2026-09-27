import { Redirect } from "expo-router";
import TodayScreen from "../index";
import { useWildday } from "@/state/WilddayContext";

export default function TodayTab() {
  const { ready, onboarded } = useWildday();
  if (!ready) return null;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <TodayScreen />;
}