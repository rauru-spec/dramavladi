import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
        <div className="flex items-center gap-1">
          <span className="text-[var(--accent)] font-bold">Pasmiño</span>
          <span className="font-light">Drama</span>
          <span className="ml-2">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/subscribe" className="hover:text-[var(--foreground)] transition-colors">Suscripción</Link>
          <Link href="/search" className="hover:text-[var(--foreground)] transition-colors">Explorar</Link>
        </div>
      </div>
    </footer>
  );
}
