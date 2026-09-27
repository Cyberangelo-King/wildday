import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useWildday } from "@/state/WilddayContext";
import { colors, radii, spacing, typography } from "@/theme";

export default function FocusScreen() {
  const { nextAction, recordFocus } = useWildday();
  const [seconds, setSeconds] = useState((nextAction?.duration ?? 20) * 60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"work" | "break">("work");

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setRunning(false);
          if (phase === "work") recordFocus(nextAction?.id, nextAction?.duration);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, nextAction?.id, recordFocus]);

  useEffect(() => {
    setSeconds((nextAction?.duration ?? 20) * 60);
    setRunning(false);
    setPhase("work");
  }, [nextAction?.id, nextAction?.duration]);

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{phase === "work" ? "FOCUS" : "BREAK"}</Text>
      <Text style={styles.title}>Stay here.</Text>
      <Text style={styles.action}>{phase === "work" ? (nextAction?.title ?? "Choose a next move first.") : "Step away. Let your attention reset."}</Text>
      <View style={styles.clock}><Text style={styles.clockText}>{minutes}:{secs}</Text></View>
      <Text style={styles.hint}>{running ? "One thing. Nothing else." : "Your attention is worth protecting."}</Text>
      <Pressable onPress={() => setRunning((value) => !value)} style={styles.button}>
        <Text style={styles.buttonText}>{running ? "Pause" : seconds === 0 ? "Start again" : "Start focus"}</Text>
      </Pressable>
      <Pressable onPress={() => { setRunning(false); setSeconds((nextAction?.duration ?? 20) * 60); }} style={styles.reset}>
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.ink,padding:spacing.lg,paddingTop:72,alignItems:"center"},
  eyebrow:{...typography.eyebrow,color:colors.mutedOnInk,alignSelf:"flex-start"},title:{...typography.title,color:colors.paper,alignSelf:"flex-start",marginTop:6},
  action:{...typography.body,color:colors.mutedOnInk,alignSelf:"flex-start",marginTop:spacing.md,maxWidth:320},clock:{marginTop:64,width:260,height:260,borderRadius:130,borderWidth:2,borderColor:colors.lineOnInk,alignItems:"center",justifyContent:"center"},
  clockText:{fontSize:58,fontWeight:"800",color:colors.paper,letterSpacing:2},hint:{...typography.small,color:colors.mutedOnInk,marginTop:spacing.lg},
  button:{backgroundColor:colors.accent,borderRadius:radii.md,paddingHorizontal:32,paddingVertical:16,marginTop:"auto",width:"100%",alignItems:"center"},buttonText:{color:colors.ink,fontWeight:"800",fontSize:16},
  reset:{padding:14},resetText:{color:colors.mutedOnInk,fontWeight:"700"}
});