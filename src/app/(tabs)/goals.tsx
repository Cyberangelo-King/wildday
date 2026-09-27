import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useWildday } from "@/state/WilddayContext";
import { colors, radii, spacing, typography } from "@/theme";

export default function GoalsScreen() {
  const { goals, addGoalWithAction } = useWildday();
  const [goal, setGoal] = useState("");
  const [action, setAction] = useState("");

  function create() {
    if (!goal.trim() || !action.trim()) return;
    addGoalWithAction(goal.trim(), action.trim(), 20);
    setGoal("");
    setAction("");
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>SYSTEMS</Text>
      <Text style={styles.title}>What matters.</Text>
      <Text style={styles.intro}>Goals give your days a direction. Actions give them a way forward.</Text>

      {goals.map((item) => (
        <View key={item.id} style={styles.goalCard}>
          <Text style={styles.goalName}>{item.name}</Text>
          <Text style={styles.goalMeta}>{item.actions} repeatable move{item.actions === 1 ? "" : "s"}</Text>
          <View style={styles.bar}><View style={[styles.fill, { width: Math.min(100, item.progress) + "%" }]} /></View>
        </View>
      ))}

      <View style={styles.addCard}>
        <Text style={styles.cardTitle}>Add a system</Text>
        <TextInput value={goal} onChangeText={setGoal} placeholder="Goal, project or life area" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput value={action} onChangeText={setAction} placeholder="Small repeatable action" placeholderTextColor={colors.muted} style={styles.input} />
        <Pressable onPress={create} style={styles.button}>
          <Text style={styles.buttonText}>Add to Wildday</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content:{padding:spacing.lg,paddingTop:64,gap:spacing.md,backgroundColor:colors.background,minHeight:"100%"},
  eyebrow:{...typography.eyebrow,color:colors.muted},title:{...typography.title,color:colors.text},intro:{...typography.body,color:colors.muted,marginBottom:spacing.md},
  goalCard:{backgroundColor:colors.ink,borderRadius:radii.lg,padding:spacing.lg,gap:8},goalName:{...typography.section,color:colors.paper},goalMeta:{...typography.small,color:colors.mutedOnInk},
  bar:{height:5,backgroundColor:colors.lineOnInk,borderRadius:5,overflow:"hidden",marginTop:8},fill:{height:"100%",backgroundColor:colors.accent},
  addCard:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.line,borderRadius:radii.lg,padding:spacing.md,gap:10,marginTop:spacing.sm},cardTitle:{...typography.section,color:colors.text},
  input:{borderWidth:1,borderColor:colors.line,borderRadius:radii.md,padding:14,color:colors.text,fontSize:15},button:{backgroundColor:colors.ink,borderRadius:radii.md,padding:15,alignItems:"center"},buttonText:{color:colors.paper,fontWeight:"800"}
});