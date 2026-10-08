import type { ReactNode } from 'react';

const WorkplaceSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="min-w-0 py-4">
    <h2 className="mb-3 text-base font-semibold text-content-primary">{title}</h2>
    {children}
  </section>
);

export default WorkplaceSection;
