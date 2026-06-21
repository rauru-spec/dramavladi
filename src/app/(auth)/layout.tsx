export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <span className="text-[var(--accent)] font-bold text-2xl">Pasmiño</span>
        <span className="text-[var(--foreground)] font-light text-2xl"> Drama</span>
      </div>
      {children}
    </div>
  );
}
