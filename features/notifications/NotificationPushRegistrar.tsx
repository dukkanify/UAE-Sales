"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function registerWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

async function syncPushSubscription() {
  const user = getSessionSnapshot();
  if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (Notification.permission !== "granted") return;

  const config = await fetch("/api/notifications/push", { credentials: "include" })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);
  const publicKey = typeof config?.publicKey === "string" ? config.publicKey : "";
  if (!publicKey) return;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      applicationServerKey: urlBase64ToUint8Array(publicKey),
      userVisibleOnly: true,
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.auth || !json.keys?.p256dh) return;

  await fetch("/api/notifications/push", {
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { auth: json.keys.auth, p256dh: json.keys.p256dh },
    }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

export function NotificationPushRegistrar() {
  const router = useRouter();

  useEffect(() => {
    void registerWorker().catch(() => undefined);
  }, []);

  useEffect(() => {
    const sync = () => {
      void syncPushSubscription().catch(() => undefined);
    };
    sync();
    return subscribeSession(sync);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;

    const onMessage = (event: MessageEvent) => {
      const href =
        event.data && typeof event.data === "object" && event.data.type === "sooqna-notification-open"
          ? event.data.href
          : null;
      if (typeof href === "string" && href.startsWith("/")) {
        router.push(href);
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);

  return null;
}

export async function enableBrowserNotifications(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
  if (permission !== "granted") return false;
  await syncPushSubscription();
  return true;
}
