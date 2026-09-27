import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useWildday } from "@/state/WilddayContext";
import { colors, radii, spacing, typography } from "@/theme";

export default function ReflectScreen() {
  const { focusMinutes, reflection, saveReflection, completedToday } = useWildday();
  const [text, setText] = useState(reflection);

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>REFLECT</Text>
      <Text style={styles.title}>What did the week teach you?</Text>
      <Text style={styles.body}>No grade. No streak. Just enough honesty to make the next week more workable.</Text>
      <View style={styles.stats}>
        <View><Text style={styles.stat}>{completedToday}</Text><Text style={styles.label}>moves done</Text></View>
        <View><Text style={styles.stat}>{focusMinutes}</Text><Text style={styles.label}>focus min</Text></View>
      </View>
      <TextInput multiline value={text} onChangeText={setText} placeholder="What worked? What got in the way? What should change?" placeholderTextColor={colors.muted} style={styles.input} textAlignVertical="top" />
      <Pressable onPress={() => saveReflection(text)} style={styles.button}>
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
  button:{backgroundColor:colors.ink,borderRadius:radii.md,padding:16,alignItems:"center"},buttonText:{color:colors.paper,fontWeight:"800",fontSize:16}
});