import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useWildday } from "@/state/WilddayContext";
import { colors, radii, spacing, typography } from "@/theme";

export default function OnboardingScreen() {
  const router = useRouter();
  const { finishOnboarding } = useWildday();
  const [goal, setGoal] = useState("");
  const [action, setAction] = useState("");
  const [duration, setDuration] = useState("20");

  const canContinue = goal.trim().length > 1 && action.trim().length > 1;

  function begin() {
    if (!canContinue) return;
    finishOnboarding(goal.trim(), action.trim(), Math.max(5, Number(duration) || 20));
    router.replace("/");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>WELCOME TO WILDDAY</Text>
      <Text style={styles.title}>What matters enough to move today?</Text>
      <Text style={styles.body}>Start with one thing. You can build the rest later.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>WHAT ARE YOU WORKING TOWARD?</Text>
        <TextInput
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g. Build my portfolio"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>WHAT IS THE SMALLEST REPEATABLE MOVE?</Text>
        <TextInput
          value={action}
          onChangeText={setAction}
          placeholder="e.g. Work on it for 20 minutes"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>MINUTES</Text>
        <TextInput
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
          style={[styles.input, styles.shortInput]}
        />
      </View>

      <Pressable disabled={!canContinue} onPress={begin} style={[styles.button, !canContinue && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>Start my first day</Text>
      </Pressable>

      <Text style={styles.footer}>No streaks to protect. No reset button. Just the next move.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 76, gap: spacing.md },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  title: { ...typography.title, color: colors.text, marginTop: 4 },
  body: { ...typography.body, color: colors.muted, marginBottom: spacing.md },
  field: { gap: 7 },
  label: { ...typography.eyebrow, color: colors.muted },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radii.md, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 16 },
  shortInput: { width: 100 },
  button: { marginTop: spacing.md, backgroundColor: colors.ink, borderRadius: radii.md, padding: 16, alignItems: "center" },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: colors.paper, fontWeight: "800", fontSize: 16 },
  footer: { ...typography.small, color: colors.muted, textAlign: "center", marginTop: "auto", paddingBottom: spacing.md }
});