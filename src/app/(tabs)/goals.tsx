import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Cadence, useWildday } from "@/state/WilddayContext";
import { colors, radii, spacing, typography } from "@/theme";

export default function GoalsScreen() {
  const { goals, actions, addGoalWithAction } = useWildday();
  const [goal, setGoal] = useState("");
  const [action, setAction] = useState("");
  const [cadence, setCadence] = useState<Cadence>("daily");

  function create() {
    if (!goal.trim() || !action.trim()) return;
    addGoalWithAction(goal.trim(), action.trim(), 20, cadence);
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
          <Text style={styles.goalProgress}>{actions.filter((action) => action.goalId === item.id).reduce((sum, action) => sum + action.completedCount, 0)} moves completed</Text>
        </View>
      ))}

      <View style={styles.addCard}>
        <Text style={styles.cardTitle}>Add a system</Text>
        <TextInput value={goal} onChangeText={setGoal} placeholder="Goal, project or life area" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput value={action} onChangeText={setAction} placeholder="Small repeatable action" placeholderTextColor={colors.muted} style={styles.input} />
        <Text style={styles.label}>CADENCE</Text>
        <View style={styles.cadenceRow}>{(["daily","weekdays","weekly"] as Cadence[]).map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{selected:cadence===item}} onPress={()=>setCadence(item)} style={[styles.cadence,cadence===item&&styles.cadenceSelected]}><Text style={styles.cadenceText}>{item==="daily"?"Every day":item==="weekdays"?"Weekdays":"Weekly"}</Text></Pressable>)}</View>
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
  goalCard:{backgroundColor:colors.ink,borderRadius:radii.lg,padding:spacing.lg,gap:8},goalName:{...typography.section,color:colors.paper},goalMeta:{...typography.small,color:colors.mutedOnInk},goalProgress:{...typography.small,color:colors.accent,marginTop:6},
  bar:{height:5,backgroundColor:colors.lineOnInk,borderRadius:5,overflow:"hidden",marginTop:8},fill:{height:"100%",backgroundColor:colors.accent},
  addCard:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.line,borderRadius:radii.lg,padding:spacing.md,gap:10,marginTop:spacing.sm},cardTitle:{...typography.section,color:colors.text},label:{...typography.eyebrow,color:colors.muted},cadenceRow:{flexDirection:"row",gap:8},cadence:{flex:1,borderWidth:1,borderColor:colors.line,borderRadius:radii.md,paddingVertical:12,alignItems:"center"},cadenceSelected:{backgroundColor:colors.accent,borderColor:colors.accent},cadenceText:{fontSize:13,fontWeight:"700",color:colors.text},
  input:{borderWidth:1,borderColor:colors.line,borderRadius:radii.md,padding:14,color:colors.text,fontSize:15},button:{backgroundColor:colors.ink,borderRadius:radii.md,padding:15,alignItems:"center"},buttonText:{color:colors.paper,fontWeight:"800"}
});