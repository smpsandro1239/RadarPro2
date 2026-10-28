"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

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
    <button
      onClick={subscribe}
      disabled={subscribed}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
        subscribed
          ? "bg-success/10 text-success"
          : "bg-primary/10 text-primary hover:bg-primary/20"
      }`}
    >
      <Bell size={16} />
      {subscribed ? "Notificações ativadas" : "Ativar notificações push"}
    </button>
  );
}
