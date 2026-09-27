import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useWildday } from "@/state/WilddayContext";
import { colors, radii, spacing, typography } from "@/theme";
import { shareWildday } from "@/services/share";

export default function NotesScreen() {
  const { notes, addNote, toggleNote, deleteNote } = useWildday();
  const [text, setText] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  function save() {
    if (!text.trim()) return;
    addNote(text);
    setText("");
  }

  async function shareNote(noteText: string) {
    const result = await shareWildday({ title: "A Wildday note", message: noteText.slice(0, 1500) });
    setShareMessage(result.ok ? "Ready to share." : "Sharing was cancelled or unavailable.");
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>CAPTURE</Text>
        <Text style={styles.title}>Get it out of your head.</Text>
        <Text style={styles.body}>A mental note should take seconds, not become another project.</Text>

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Quick note"
            value={text}
            onChangeText={setText}
            onSubmitEditing={save}
            placeholder="Remember to…"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            style={styles.input}
          />
          <View style={styles.composerFooter}>
            <Text style={styles.counter}>{text.length}/500</Text>
            <Pressable accessibilityRole="button" onPress={save} disabled={!text.trim()} style={[styles.save, !text.trim() && styles.disabled]}>
              <Text style={styles.saveText}>Capture</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MENTAL NOTES</Text>
          {shareMessage ? <Text style={styles.empty}>{shareMessage}</Text> : null}
          {notes.length === 0 ? <Text style={styles.empty}>Nothing floating around. Good.</Text> : null}
          {notes.length > 0 ? notes.map((note) => (
            <View key={note.id} style={styles.note}>
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: note.completed }} onPress={() => toggleNote(note.id)} style={[styles.check, note.completed && styles.checkDone]}>
                <Text style={styles.checkText}>{note.completed ? "✓" : ""}</Text>
              </Pressable>
              <Pressable style={styles.noteBody} onLongPress={() => Alert.alert("Note actions", "Choose what you want to do.", [{ text: "Cancel", style: "cancel" }, { text: "Share", onPress: () => shareNote(note.text) }, { text: "Delete", style: "destructive", onPress: () => deleteNote(note.id) }])} onPress={() => Alert.alert("Note actions", "Choose what you want to do.", [{ text: "Cancel", style: "cancel" }, { text: "Share", onPress: () => shareNote(note.text) }, { text: "Delete", style: "destructive", onPress: () => deleteNote(note.id) }])}>
                <Text style={[styles.noteText, note.completed && styles.done]}>{note.text}</Text>
              </Pressable>
            </View>
          )) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles=StyleSheet.create({
screen:{flex:1,backgroundColor:colors.background},content:{padding:spacing.lg,paddingTop:64,paddingBottom:48},eyebrow:{...typography.eyebrow,color:colors.muted},title:{...typography.title,color:colors.text,marginTop:8},body:{...typography.body,color:colors.muted,marginTop:spacing.md},composer:{marginTop:spacing.xl,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.line,borderRadius:radii.lg,padding:spacing.md},input:{minHeight:110,color:colors.text,fontSize:17,lineHeight:25,textAlignVertical:"top"},composerFooter:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:8},counter:{...typography.small,color:colors.muted},save:{backgroundColor:colors.ink,borderRadius:radii.md,paddingHorizontal:18,paddingVertical:11},disabled:{opacity:.35},saveText:{color:colors.paper,fontWeight:"800"},section:{marginTop:spacing.xl},sectionTitle:{...typography.eyebrow,color:colors.muted},empty:{...typography.body,color:colors.muted,marginTop:spacing.md},note:{flexDirection:"row",alignItems:"flex-start",gap:12,paddingVertical:14,borderBottomWidth:1,borderBottomColor:colors.line},check:{width:26,height:26,borderWidth:1,borderColor:colors.ink,borderRadius:13,alignItems:"center",justifyContent:"center",marginTop:2},checkDone:{backgroundColor:colors.accent,borderColor:colors.accent},checkText:{fontWeight:"900",color:colors.ink},noteBody:{flex:1},noteText:{...typography.body,color:colors.text},done:{textDecorationLine:"line-through",color:colors.muted}
});