export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6" style={{ background: 'var(--adm-bg)' }}>
      <div className="h-7 w-48 animate-pulse rounded bg-[color:var(--adm-border)]" />
      <div className="h-4 w-72 animate-pulse rounded bg-[color:var(--adm-border)]" />
      <div className="h-px" />
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl" style={{ background: 'var(--adm-border)' }} />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl" style={{ background: 'var(--adm-border)' }} />
    </div>
  );
}