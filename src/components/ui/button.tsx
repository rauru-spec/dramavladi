"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-95":
              variant === "default",
            "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]":
              variant === "outline",
            "bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]":
              variant === "ghost",
            "bg-red-700 text-white hover:bg-red-800":
              variant === "destructive",
            "underline text-[var(--accent)] bg-transparent p-0 h-auto":
              variant === "link",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-5 text-sm": size === "md",
            "h-12 px-7 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      >
        {loading ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : null}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";
