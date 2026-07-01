import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY =
  "BM90dboZwGKJMTYW3vZNbjCn8L0bYhRNaKuMov7xbIhvGtmlbSwjssTPO3mUvourLawBwgOw-MUSvAJsF4wN844";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

const STORAGE_KEY = "unx_push_registered";

export async function registerPushForCurrentUser(userId: string): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (sessionStorage.getItem(STORAGE_KEY) === userId) return;

    const permission = Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
    if (permission !== "granted") { sessionStorage.setItem(STORAGE_KEY, userId); return; }

    const reg =
      (await navigator.serviceWorker.getRegistration("/sw.js")) ??
      (await navigator.serviceWorker.register("/sw.js"));
    await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const p256dh = arrayBufferToBase64(sub.getKey("p256dh"));
    const authKey = arrayBufferToBase64(sub.getKey("auth"));

    await supabase.from("push_subscriptions").upsert(
      { user_id: userId, endpoint: sub.endpoint, p256dh, auth_key: authKey },
      { onConflict: "endpoint" },
    );
    sessionStorage.setItem(STORAGE_KEY, userId);
  } catch (err) {
    console.warn("push registration failed", err);
  }
}
