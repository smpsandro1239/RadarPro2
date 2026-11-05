"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  propertyId: string;
  createdAt: string | null;
  readAt: string | null;
  property: {
    id: string;
    title: string;
    district: string;
    municipality: string;
    price: number;
    score: number | null;
    type: string;
  } | null;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const items: Notification[] = data.notifications ?? [];
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.readAt).length);
    } catch {
      // sem sessao / sem backend: bell permanece vazio
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
        aria-label="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b text-sm font-bold">Notificações</div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-sm text-secondary text-center">Sem notificações</div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  markRead(n.id);
                  if (n.propertyId) router.push(`/imovel/${n.propertyId}`);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 border-b last:border-0 hover:bg-slate-50 transition"
              >
                <div className="text-sm font-medium">{n.property?.title ?? "Oportunidade"}</div>
                {n.property && (
                  <div className="text-xs text-secondary mt-1">
                    {n.property.municipality}, {n.property.district} · {n.property.price.toLocaleString("pt-PT")}€
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
