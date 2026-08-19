'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { useClickOutside } from './useClickOutside';

/**
 * Kebab-menu for row-level actions. The popover is rendered through a
 * portal straight onto <body> with fixed coordinates, so it escapes the
 * table's `overflow-x-auto` / `overflow-hidden` wrappers. Solid opaque
 * surface + generous padding keeps it cleanly above row content.
 */
export type RowAction = {
  label: string;
  onClick: () => void | Promise<void>;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

export function RowActionsMenu({ actions }: { actions: RowAction[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false), [menuRef]);
  if (!actions.length) return null;

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      // Width matches the w-40 below; keep the menu within the viewport.
      setPos({ top: r.bottom + 6, left: Math.max(4, r.right - 160) });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="inline-block" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        aria-label="Row actions"
        onClick={toggle}
        className="grid h-8 w-8 place-items-center rounded-md transition hover:bg-[color:var(--adm-bg)]"
        style={{ color: 'var(--adm-fg-muted)' }}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{
            top: pos.top,
            left: pos.left,
            // Portal renders on <body>, outside the .admin-scope root where the
            // --adm-* tokens are defined — so use concrete values instead of
            // vars (they'd resolve to transparent there).
            background: '#FFFFFF',
            borderColor: '#E4E4E7',
            boxShadow: '0 12px 32px -8px rgba(24, 24, 27, 0.15)',
          }}
          className="fixed z-[100] w-40 overflow-hidden rounded-lg border p-1"
        >
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              disabled={a.disabled}
              onClick={async () => { setOpen(false); await a.onClick(); }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] transition disabled:opacity-50 hover:bg-[#F4F4F5]"
              style={{ color: a.danger ? '#EF4444' : '#27272A' }}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}