import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "muted" | "success" | "warning";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        {
          "bg-[var(--muted)] text-[var(--muted-foreground)]": variant === "default" || variant === "muted",
          "bg-[var(--accent)] text-white": variant === "accent",
          "bg-green-900/50 text-green-400": variant === "success",
          "bg-amber-900/50 text-amber-400": variant === "warning",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
