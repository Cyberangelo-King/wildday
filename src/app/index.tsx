import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useWildday } from "@/state/WilddayContext";
import { colors, radii, spacing, typography } from "@/theme";

export default function TodayScreen() {
  const { dueActions, completeAction, rescheduleAction, completedToday, deferredToday } = useWildday();
  const todayKey = new Date().toLocaleDateString("en-CA");
  const next = useMemo(() => dueActions.find((item) => !item.history[todayKey]), [dueActions, todayKey]);
  const completed = completedToday;
  const deferred = deferredToday;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>TODAY</Text><Text style={styles.title}>Make today count.</Text></View>
        <View style={styles.progressPill}><Text style={styles.progressText}>{completed}/{dueActions.length}</Text></View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>YOUR NEXT MOVE</Text>
        <Text style={styles.heroTitle}>{next?.title ?? (deferred ? "You chose enough for today." : "You’re clear for today.")}</Text>
        <Text style={styles.heroBody}>
          {next ? next.duration + " min · " + next.goal + " · " + next.cadence : "A good day does not need to be a full day."}
        </Text>
        {next ? <View style={styles.actions}>
          <Pressable style={styles.primary} onPress={() => completeAction(next.id)}><Text style={styles.primaryText}>Done</Text></Pressable>
          <Pressable style={styles.secondary} onPress={() => rescheduleAction(next.id)}><Text style={styles.secondaryText}>Later</Text></Pressable>
        </View> : null}
      </View>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Today</Text><Text style={styles.sectionMeta}>{dueActions.length} moves</Text></View>

      {dueActions.map((action) => (
        <View key={action.id} style={[styles.card, action.history[todayKey] && styles.quietCard]}>
          <View style={[styles.check, action.history[new Date().toISOString().slice(0, 10)] === "completed" && styles.checkDone]}><Text style={styles.checkText}>{action.history[new Date().toISOString().slice(0, 10)] === "completed" ? "✓" : ""}</Text></View>
          <View style={styles.cardCopy}>
            <Text style={[styles.cardTitle, action.history[new Date().toISOString().slice(0, 10)] === "completed" && styles.completedText]}>{action.title}</Text>
            <Text style={styles.cardMeta}>{action.goal} · {action.duration} min · {action.cadence}</Text>
          </View>
          {action.history[new Date().toISOString().slice(0, 10)] === "deferred" ? <Text style={styles.later}>LATER</Text> : null}
        </View>
      ))}

      <View style={styles.note}>
        <Text style={styles.noteTitle}>No punishment loop.</Text>
        <Text style={styles.noteBody}>Missing a move changes the plan. It does not change your worth.</Text>
      </View>
    </ScrollView>
  );
}
const styles=StyleSheet.create({
 content:{padding:spacing.lg,paddingTop:64,gap:spacing.md,backgroundColor:colors.background,minHeight:"100%"},
 header:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:spacing.md},
 eyebrow:{...typography.eyebrow,color:colors.muted},title:{...typography.title,color:colors.text,marginTop:6},
 progressPill:{paddingHorizontal:12,paddingVertical:8,borderRadius:999,backgroundColor:colors.surface},progressText:{color:colors.text,fontWeight:"700"},
 hero:{backgroundColor:colors.ink,borderRadius:radii.xl,padding:spacing.lg,gap:spacing.sm},heroEyebrow:{...typography.eyebrow,color:colors.mutedOnInk},heroTitle:{...typography.hero,color:colors.paper},heroBody:{...typography.body,color:colors.mutedOnInk},
 actions:{flexDirection:"row",gap:spacing.sm,marginTop:spacing.sm},primary:{backgroundColor:colors.accent,borderRadius:radii.md,paddingHorizontal:20,paddingVertical:13},primaryText:{color:colors.ink,fontWeight:"800"},
 secondary:{borderWidth:1,borderColor:colors.lineOnInk,borderRadius:radii.md,paddingHorizontal:20,paddingVertical:13},secondaryText:{color:colors.paper,fontWeight:"700"},
 sectionHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"baseline",marginTop:spacing.md},sectionTitle:{...typography.section,color:colors.text},sectionMeta:{...typography.small,color:colors.muted},
 card:{flexDirection:"row",alignItems:"center",gap:spacing.md,backgroundColor:colors.surface,borderRadius:radii.lg,padding:spacing.md,borderWidth:1,borderColor:colors.line},quietCard:{opacity:.55},
 check:{width:28,height:28,borderRadius:14,borderWidth:1.5,borderColor:colors.line,alignItems:"center",justifyContent:"center"},checkDone:{backgroundColor:colors.accent,borderColor:colors.accent},checkText:{color:colors.ink,fontWeight:"900"},
 cardCopy:{flex:1},cardTitle:{...typography.body,color:colors.text,fontWeight:"700"},completedText:{textDecorationLine:"line-through"},cardMeta:{...typography.small,color:colors.muted,marginTop:3},later:{...typography.eyebrow,color:colors.muted},
 note:{padding:spacing.md,marginTop:spacing.sm},noteTitle:{...typography.body,color:colors.text,fontWeight:"700"},noteBody:{...typography.small,color:colors.muted,marginTop:4,lineHeight:19}
});