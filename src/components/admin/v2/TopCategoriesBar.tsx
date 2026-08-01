export type CategoryScore = { name: string; count: number };

export function TopCategoriesBar({
  data, title = 'Top categories', metric = 'ads',
}: {
  data: CategoryScore[];
  title?: string;
  metric?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <section
      className="rounded-xl border p-5"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
      <header className="mb-4">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--adm-fg)' }}>{title}</h2>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>By {metric} volume</p>
      </header>
      <ul className="space-y-3">
        {data.slice(0, 6).map((d, i) => {
          const pct = Math.round((d.count / max) * 100);
          return (
            <li key={d.name}>
              <div className="mb-1 flex items-center justify-between text-[12.5px]">
                <span className="truncate" style={{ color: 'var(--adm-fg)' }}>{i + 1}. {d.name}</span>
                <span className="tabular-nums" style={{ color: 'var(--adm-fg-muted)' }}>{d.count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--adm-bg)' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #E43356, #EC5470)' }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
