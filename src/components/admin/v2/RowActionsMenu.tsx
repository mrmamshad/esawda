'use client';

import { useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from './useClickOutside';

/**
 * Kebab-menu for row-level actions. Keeps table rows visually calm —
 * no chip-jungle. Actions render inside a small popover under the
 * trigger, click-outside + Esc closes automatically.
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
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  if (!actions.length) return null;

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        aria-label="Row actions"
        onClick={() => setOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-md transition hover:bg-[color:var(--adm-bg)]"
        style={{ color: 'var(--adm-fg-muted)' }}
      >
        <MoreHorizontal size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{ background: 'var(--adm-elevated)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-lg)' }}
            className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border py-1"
          >
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                disabled={a.disabled}
                onClick={async () => { setOpen(false); await a.onClick(); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] transition disabled:opacity-50 hover:bg-[color:var(--adm-bg)]"
                style={{ color: a.danger ? 'var(--adm-danger)' : 'var(--adm-fg)' }}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
