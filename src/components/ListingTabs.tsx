"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tag, Gavel } from "lucide-react";

interface ListingTabProps {
  className?: string;
}

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
      <div className="flex gap-1 border-b border-slate-200">
        <button
          onClick={() => switchTab("fixed")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "fixed"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-secondary hover:text-slate-700"
          }`}
        >
          <Tag size={14} className="mr-2" />
          Preço fixo
        </button>
        <button
          onClick={() => switchTab("auction")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "auction"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-secondary hover:text-slate-700"
          }`}
        >
          <Gavel size={14} className="mr-2" />
          Leilões
        </button>
      </div>
    </div>
  );
}
