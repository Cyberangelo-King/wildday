import { Platform, Share } from "react-native";

export type SharePayload = { title: string; message: string; url?: string };

export async function shareWildday(payload: SharePayload) {
  try {
    const result = await Share.share(
      Platform.OS === "ios" ? { title: payload.title, message: payload.message, url: payload.url } : { title: payload.title, message: payload.url ? payload.message + "\n" + payload.url : payload.message },
      { dialogTitle: payload.title, subject: payload.title }
    );
    return { ok: result.action !== Share.dismissedAction, action: result.action };
  } catch (error) {
    return { ok: false, error };
  }
}
