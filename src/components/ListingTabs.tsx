"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tag, Gavel } from "lucide-react";

interface ListingTabProps {
  className?: string;
}

const TABS = [
  { id: "fixed", label: "Preço fixo", icon: Tag },
  { id: "auction", label: "Leilões", icon: Gavel },
] as const;

export default function ListingTabs({ className }: ListingTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"fixed" | "auction">("fixed");

  const currentListingType = searchParams.get("listing_type") || undefined;
  const currentIsAuction = searchParams.get("is_auction") || undefined;

  // Sincronizar tab ativo com query params ao montar
  if (currentListingType?.startsWith("auction_") || currentIsAuction === "true") {
    setActiveTab("auction");
  } else {
    setActiveTab("fixed");
  }

  const switchTab = (tab: "fixed" | "auction") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());

    if (tab === "auction") {
      params.set("listing_type", "auction_*");
      params.set("is_auction", "true");
      params.delete("leilao");
    } else {
      params.set("listing_type", "fixed_price");
      params.delete("is_auction");
      params.set("leilao", "venda");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <div role="tablist" aria-label="Tipo de anúncio" className="flex gap-1 border-b border-rp-line">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => switchTab(tab.id)}
              className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 py-3 text-[14px] transition-colors duration-[var(--rp-dur-1)] ${
                selected
                  ? "border-rp-cobalt text-rp-cobalt"
                  : "border-transparent text-rp-ink-2 hover:text-rp-cobalt"
              }`}
            >
              <Icon size={14} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
