import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useWildday } from "@/state/WilddayContext";
import { colors, radii, spacing, typography } from "@/theme";
import { setDailyReminder, cancelDailyReminder } from "@/services/notifications";
import { shareWildday } from "@/services/share";

export default function ReflectScreen() {
  const { weekFocusMinutes, weekCompleted, reflection, saveReflection, reminderEnabled, reminderHour, reminderMinute, saveReminderSettings } = useWildday();
  const [text, setText] = useState(reflection);
  const [reminderOn, setReminderOn] = useState(reminderEnabled);
  const [reminderTime, setReminderTime] = useState(`${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}`);
  const [reminderMessage, setReminderMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareChoice, setShareChoice] = useState<"week" | "reflection">("week");

  async function shareWeek() {
    const result = await shareWildday({ title: shareChoice === "week" ? "My Wildday week" : "My Wildday reflection", message: shareChoice === "week" ? `This week: ${weekCompleted} moves completed. ${weekFocusMinutes} minutes of focus.` : (text.trim() ? `My reflection:\n\n${text.trim().slice(0, 1500)}` : "I have not written a reflection yet.") });
    setShareMessage(result.ok ? "Ready to share." : "Sharing was cancelled or unavailable.");
  }

  async function toggleReminder(value: boolean) {
    setReminderMessage("");
    if (!value) {
      await cancelDailyReminder();
      setReminderOn(false);
      saveReminderSettings(false, reminderHour, reminderMinute);
      return;
    }
    const [hourText, minuteText] = reminderTime.split(":");
    const hour = Math.min(23, Math.max(0, Number(hourText) || 0));
    const minute = Math.min(59, Math.max(0, Number(minuteText) || 0));
    const result = await setDailyReminder(true, hour, minute);
    if (!result.enabled) {
      setReminderMessage(result.reason === "permission-denied" ? "Notifications are off. You can enable them in system settings." : "Reminders are unavailable here.");
      return;
    }
    setReminderOn(true);
    saveReminderSettings(true, hour, minute);
    setReminderTime(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>REFLECT</Text>
      <Text style={styles.title}>What did the week teach you?</Text>
      <Text style={styles.body}>No grade. No streak. Just enough honesty to make the next week more workable.</Text>
      <View style={styles.stats}>
        <View><Text style={styles.stat}>{weekCompleted}</Text><Text style={styles.label}>moves this week</Text></View>
        <View><Text style={styles.stat}>{weekFocusMinutes}</Text><Text style={styles.label}>focus minutes</Text></View>
      </View>
      <TextInput multiline value={text} onChangeText={setText} placeholder="What worked? What got in the way? What should change?" placeholderTextColor={colors.muted} style={styles.input} textAlignVertical="top" />
      <View style={styles.shareRow}><Pressable accessibilityRole="radio" accessibilityState={{selected:shareChoice==="week"}} onPress={()=>setShareChoice("week")} style={[styles.shareChoice,shareChoice==="week"&&styles.shareChoiceActive]}><Text style={styles.shareChoiceText}>Week</Text></Pressable><Pressable accessibilityRole="radio" accessibilityState={{selected:shareChoice==="reflection"}} onPress={()=>setShareChoice("reflection")} style={[styles.shareChoice,shareChoice==="reflection"&&styles.shareChoiceActive]}><Text style={styles.shareChoiceText}>Reflection</Text></Pressable></View><Pressable accessibilityRole="button" onPress={shareWeek} style={styles.shareButton}><Text style={styles.shareText}>Share selected</Text></Pressable>{shareMessage ? <Text style={styles.reminderMessage}>{shareMessage}</Text> : null}
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}><View style={styles.reminderCopy}><Text style={styles.reminderTitle}>A gentle reminder</Text><Text style={styles.reminderBody}>One local notification. You choose when.</Text></View><Switch accessibilityLabel="Daily Wildday reminder" value={reminderOn} onValueChange={toggleReminder} trackColor={{ false: colors.line, true: colors.accent }} thumbColor={colors.ink} /></View>
        {reminderOn ? <View style={styles.timeRow}><Text style={styles.timeLabel}>Daily at</Text><TextInput accessibilityLabel="Reminder time" value={reminderTime} onChangeText={setReminderTime} onBlur={() => toggleReminder(true)} keyboardType="numbers-and-punctuation" style={styles.timeInput} maxLength={5} placeholder="09:00" placeholderTextColor={colors.muted} /></View> : null}
        {reminderMessage ? <Text style={styles.reminderMessage}>{reminderMessage}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Save reflection" onPress={() => saveReflection(text)} style={styles.button}>
        <Text style={styles.buttonText}>Save reflection</Text>
      </Pressable>
    </View>
  );
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background,padding:spacing.lg,paddingTop:64,gap:spacing.md},
  eyebrow:{...typography.eyebrow,color:colors.muted},title:{...typography.title,color:colors.text},body:{...typography.body,color:colors.muted},
  stats:{flexDirection:"row",gap:12,marginVertical:spacing.md},stat:{fontSize:28,fontWeight:"800",color:colors.text},label:{...typography.small,color:colors.muted},
  input:{flex:1,minHeight:180,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.line,borderRadius:radii.lg,padding:16,color:colors.text,fontSize:16,lineHeight:24},
  shareRow:{flexDirection:"row",gap:8,marginTop:spacing.lg},shareChoice:{flex:1,borderWidth:1,borderColor:colors.line,borderRadius:radii.md,padding:12,alignItems:"center",backgroundColor:colors.surface},shareChoiceActive:{backgroundColor:colors.accent,borderColor:colors.accent},shareChoiceText:{fontWeight:"800",color:colors.text},shareButton:{backgroundColor:colors.ink,borderRadius:radii.md,padding:16,alignItems:"center"},shareText:{color:colors.paper,fontWeight:"800",fontSize:16},reminderCard:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.line,borderRadius:radii.lg,padding:spacing.md,gap:12},reminderHeader:{flexDirection:"row",alignItems:"center",gap:12},reminderCopy:{flex:1},reminderTitle:{...typography.body,color:colors.text,fontWeight:"800"},reminderBody:{...typography.small,color:colors.muted,marginTop:3},timeRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},timeLabel:{...typography.small,color:colors.muted},timeInput:{borderWidth:1,borderColor:colors.line,borderRadius:radii.md,paddingHorizontal:12,paddingVertical:8,color:colors.text,fontWeight:"800",fontSize:16,width:88,textAlign:"center"},reminderMessage:{...typography.small,color:colors.muted},button:{backgroundColor:colors.ink,borderRadius:radii.md,padding:16,alignItems:"center"},buttonText:{color:colors.paper,fontWeight:"800",fontSize:16}
});