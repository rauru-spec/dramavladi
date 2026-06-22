import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planificador de Clósets a Medida',
  description: 'Diseña tu clóset empotrado paso a paso y obtén el despiece, lista de herrajes y estimación de costo.',
};

export default function ClosetPlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ colorScheme: 'light' }}>
      {children}
    </div>
  );
}
