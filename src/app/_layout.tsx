import { Redirect, Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useWildday } from "@/state/WilddayContext";

function NotificationObserver() {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const url = response?.notification.request.content.data?.url;
    if (response && response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER && typeof url === "string") {
      router.push(url as never);
    }
  }, [response]);
  return null;
}

function NavigationGate() {
  const { ready, onboarded, storageError, retryPersistence } = useWildday();
  if (!ready) return null;
  if (storageError) return <View style={{flex:1,backgroundColor:"#F5F3EE",padding:24,justifyContent:"center"}}><Text style={{fontSize:11,fontWeight:"800",letterSpacing:1.5,color:"#77756D"}}>WILDDAY</Text><Text style={{fontSize:30,fontWeight:"800",marginTop:8,color:"#171714"}}>Your local data needs attention.</Text><Text style={{fontSize:16,lineHeight:23,color:"#77756D",marginTop:16}}>{storageError}</Text><Pressable onPress={retryPersistence} style={{marginTop:24,backgroundColor:"#171714",borderRadius:14,padding:16,alignItems:"center"}}><Text style={{color:"#FFFEFA",fontWeight:"800"}}>Try saving again</Text></Pressable></View>;
  return onboarded ? <Stack screenOptions={{ headerShown: false }} /> : <Redirect href="/onboarding" />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NotificationObserver />
      <NavigationGate />
    </SafeAreaProvider>
  );
}