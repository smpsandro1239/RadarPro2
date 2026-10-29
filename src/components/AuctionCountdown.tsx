"use client";

import { useState, useEffect } from "react";
import { Clock, Gavel } from "lucide-react";

interface AuctionCountdownProps {
  endDate: number; // Unix timestamp in seconds
  compact?: boolean;
}

export default function AuctionCountdown({ endDate, compact = false }: AuctionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const now = Math.floor(Date.now() / 1000);
      const diff = endDate - now;

      if (diff <= 0) {
        setTimeLeft("Terminado");
        return;
      }

      const days = Math.floor(diff / (24 * 60 * 60));
      const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    }

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
        <Clock size={12} /> {timeLeft}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Gavel size={16} className="text-orange-600" />
      <span className="font-bold text-orange-600">Termina em: {timeLeft}</span>
    </div>
  );
}
