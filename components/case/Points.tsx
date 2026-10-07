/** Titled statements: problems, roles, reflections. Sits in the right column. */
export function Points({ children }: { children: React.ReactNode }) {
  return <div className="rc flex flex-col gap-6 md:max-w-[40rem]">{children}</div>;
}

export function Point({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="text-base leading-[26px]">
      <h3>{title}</h3>
      {children && <div className="mt-0.5">{children}</div>}
    </div>
  );
}

/** A progression (Ask → Configure → Govern); same treatment as Points. */
export function Pillars({ children }: { children: React.ReactNode }) {
  return <div className="rc flex flex-col gap-6 md:max-w-[40rem]">{children}</div>;
}

export function Pillar({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-base leading-[26px]">
      <h3>{title}</h3>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
