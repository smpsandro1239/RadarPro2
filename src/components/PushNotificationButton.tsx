"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing } from "lucide-react";
import Button from "@/components/ds/Button";

export default function PushNotificationButton() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
    }
  }, []);

  async function subscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      setSubscribed(true);
    } catch (error) {
      console.error("Push subscription failed:", error);
    }
  }

  if (!supported) return null;

  return (
    <Button onClick={subscribe} disabled={subscribed} variant="secondary" size="md">
      {subscribed ? (
        <BellRing size={16} aria-hidden="true" />
      ) : (
        <Bell size={16} aria-hidden="true" />
      )}
      {subscribed ? "Notificações ativadas" : "Ativar notificações push"}
    </Button>
  );
}
