import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>WILDDAY</Text>
      <Text style={styles.title}>That path wandered off.</Text>
      <Text style={styles.body}>The screen you asked for does not exist. Nothing is lost.</Text>
      <Link href="/" style={styles.link}>Back to today</Link>
    </View>
  );
}
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.background,padding:spacing.lg,paddingTop:72,justifyContent:"center"},
 eyebrow:{...typography.eyebrow,color:colors.muted},title:{...typography.title,color:colors.text,marginTop:8},body:{...typography.body,color:colors.muted,marginTop:spacing.md,maxWidth:340},
 link:{marginTop:spacing.xl,color:colors.text,fontWeight:"800",fontSize:16}
});