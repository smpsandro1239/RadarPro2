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
      <span className="rp-eyebrow inline-flex items-center gap-1 rounded-rp border border-rp-orange bg-[rgba(242,107,58,.14)] px-2 py-[4px] text-[12px] text-rp-anomaly">
        <Clock size={12} aria-hidden="true" />
        <span className="rp-num">{timeLeft}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[14px]">
      <Gavel size={16} className="text-rp-orange" aria-hidden="true" />
      <span className="font-medium text-rp-ink-2">Termina em:</span>
      <span className="rp-num font-medium text-rp-anomaly">{timeLeft}</span>
    </div>
  );
}
