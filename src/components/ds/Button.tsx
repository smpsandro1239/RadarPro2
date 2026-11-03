import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "link";
export type ButtonSize = "md" | "lg";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-rp font-medium no-underline transition-[transform,box-shadow,color,background-color,border-color] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)]";

const SIZES: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: {
    md: "min-h-11 px-5 py-2.5 text-[15px]",
    lg: "min-h-12 px-6 py-3 text-[16px]",
  },
  secondary: {
    md: "min-h-11 px-5 py-2.5 text-[15px]",
    lg: "min-h-12 px-6 py-3 text-[16px]",
  },
  link: {
    md: "min-h-11 px-0 py-1 text-[15px]",
    lg: "min-h-12 px-0 py-1.5 text-[16px]",
  },
};

function appearance(variant: ButtonVariant, disabled: boolean): string {
  if (variant === "primary") {
    return disabled
      ? "border border-rp-ink bg-rp-ink text-rp-surface opacity-55 cursor-not-allowed"
      : "border border-rp-ink bg-rp-ink text-rp-surface shadow-rp-2 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--rp-cobalt)] active:translate-x-0 active:translate-y-0";
  }

  if (variant === "secondary") {
    return disabled
      ? "border border-rp-line bg-rp-surface text-rp-ink opacity-55 cursor-not-allowed"
      : "border border-rp-line bg-rp-surface text-rp-ink shadow-rp-1 hover:-translate-y-px hover:shadow-[5px_5px_0_rgba(18,24,33,.18)] active:translate-y-0";
  }

  return disabled
    ? "text-rp-cobalt underline decoration-[1px] underline-offset-4 opacity-55 cursor-not-allowed"
    : "text-rp-cobalt underline decoration-[1px] underline-offset-4 hover:text-rp-ink hover:decoration-2";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className,
  type = "button",
  onClick,
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  const classes = [BASE, SIZES[variant][size], appearance(variant, disabled), className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    if (disabled) {
      return (
        <a role="link" aria-disabled="true" aria-label={ariaLabel} tabIndex={-1} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} onClick={onClick} aria-label={ariaLabel} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={classes}>
      {children}
    </button>
  );
}
