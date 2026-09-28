import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme";

export function PersistenceError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <View style={styles.screen}>
    <Text style={styles.eyebrow}>WILDDAY</Text>
    <Text style={styles.title}>Your local data needs attention.</Text>
    <Text style={styles.body}>{message}</Text>
    <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
      <Text style={styles.buttonText}>Try saving again</Text>
    </Pressable>
  </View>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.background,padding:spacing.lg,justifyContent:"center"},eyebrow:{...typography.eyebrow,color:colors.muted},title:{...typography.title,color:colors.text,marginTop:8},body:{...typography.body,color:colors.muted,marginTop:spacing.md},button:{marginTop:spacing.xl,backgroundColor:colors.ink,borderRadius:radii.md,padding:16,alignItems:"center"},buttonText:{color:colors.paper,fontWeight:"800"}});
