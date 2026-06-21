"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Search, BookOpen, User, LogOut, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isActive = session?.user?.subscriptionStatus === "ACTIVE";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-[var(--accent)] font-bold text-xl tracking-tight">Pasmiño</span>
          <span className="text-[var(--foreground)] font-light text-xl">Drama</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/search" className="px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--muted)]">
            Explorar
          </Link>
          {session && (
            <Link href="/library" className="px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--muted)]">
              Mi Biblioteca
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--muted)]">
              Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon" aria-label="Buscar">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {session ? (
            <div className="flex items-center gap-2">
              {!isActive && (
                <Link href="/subscribe">
                  <Button size="sm" className="gap-1.5">
                    <Crown className="h-3.5 w-3.5" />
                    Suscribirse
                  </Button>
                </Link>
              )}
              <Link href="/account">
                <Button variant="ghost" size="icon" aria-label="Mi cuenta">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-3 flex flex-col gap-1">
          <Link href="/search" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--muted)]">
            <Search className="h-4 w-4" /> Explorar
          </Link>
          {session && (
            <Link href="/library" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--muted)]">
              <BookOpen className="h-4 w-4" /> Mi Biblioteca
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--muted)]">
              <Settings className="h-4 w-4" /> Admin
            </Link>
          )}
          {session ? (
            <>
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--muted)]">
                <User className="h-4 w-4" /> Mi cuenta
              </Link>
              {!isActive && (
                <Link href="/subscribe" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full mt-1 gap-1.5">
                    <Crown className="h-3.5 w-3.5" /> Suscribirse — $3.99/mes
                  </Button>
                </Link>
              )}
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--muted)] text-red-400 w-full text-left"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex gap-2 mt-1">
              <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Iniciar sesión</Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
