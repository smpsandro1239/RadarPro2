import Link from "next/link";
import Badge, { type BadgeKind } from "@/components/ds/Badge";
import PriceEstimateBar from "@/components/ds/PriceEstimateBar";
import { formatEuros } from "@/lib/format";

export interface PropertyCardBadge {
  kind: BadgeKind;
  label?: string;
}

export interface PropertyCardProps {
  title: string;
  location: string;
  askingPrice: number;
  estimatedValue: number | null;
  rangePct?: number | null;
  badges?: PropertyCardBadge[];
  href?: string;
  source?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  status?: "estimated" | "to-verify";
}

export default function PropertyCard({
  title,
  location,
  askingPrice,
  estimatedValue,
  rangePct = null,
  badges = [],
  href,
  source,
  imageUrl = null,
  imageAlt,
  status = "estimated",
}: PropertyCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-rp border border-[var(--rp-line)] bg-rp-surface shadow-rp-1 transition-[transform,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(18,24,33,.18)]">
      {imageUrl ? (
        <div className="aspect-[16/9] w-full overflow-hidden border-b border-[var(--rp-line)] bg-rp-ceramic">
          {href ? (
            <Link href={href} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
              <img src={imageUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </Link>
          ) : (
            <img
              src={imageUrl}
              alt={imageAlt ?? ""}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4">
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={`${badge.kind}-${index}`} kind={badge.kind} label={badge.label} />
            ))}
          </div>
        ) : null}

        <div>
          <h3 className="rp-display text-[20px] leading-snug text-[var(--rp-ink)]">
            {href ? (
              <Link href={href} className="underline-offset-4 hover:underline">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <p className="mt-1 text-[13px] text-[var(--rp-muted)]">{location}</p>
        </div>

        <div>
          <p className="rp-eyebrow text-[var(--rp-muted)]">preço pedido</p>
          <p className="rp-num text-[24px] font-medium leading-tight text-[var(--rp-ink)]">
            {formatEuros(askingPrice)}
          </p>
        </div>

        <PriceEstimateBar
          askingPrice={askingPrice}
          estimatedValue={estimatedValue}
          rangePct={rangePct}
          status={status}
        />

        {source ? (
          <p className="mt-auto pt-1 text-[12px] text-[var(--rp-muted)]">Fonte: {source}</p>
        ) : null}
      </div>
    </article>
  );
}
