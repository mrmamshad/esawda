import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  LayoutDashboard, Users, PackageCheck, FolderTree, CreditCard,
  Receipt, Newspaper, Settings, ShieldCheck, ExternalLink, LogOut,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AdminSidebar } from './AdminSidebar';
import type { User } from '@/types/api';

/**
 * Layout shell for every /admin/* page. Sticky sidebar on md+, stacked on
 * mobile. Header shows the logged-in admin.
 */
export function AdminShell({ user, children }: { user: User; children: ReactNode }) {
  const items = [
    { href: '/admin' as Route,               label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
    { href: '/admin/users' as Route,         label: 'Users',        icon: <Users           size={18} /> },
    { href: '/admin/ads' as Route,           label: 'Ads',          icon: <PackageCheck    size={18} /> },
    { href: '/admin/categories' as Route,    label: 'Categories',   icon: <FolderTree      size={18} /> },
    { href: '/admin/plans' as Route,         label: 'Plans',        icon: <CreditCard      size={18} /> },
    { href: '/admin/transactions' as Route,  label: 'Transactions', icon: <Receipt         size={18} /> },
    { href: '/admin/blog' as Route,          label: 'Blog',         icon: <Newspaper       size={18} /> },
    { href: '/admin/settings' as Route,      label: 'Settings',     icon: <Settings        size={18} /> },
  ];

  return (
    <>
      <div className="border-b border-line bg-white">
        <div className="container-page flex items-center justify-between gap-4">
          <Header variant="default" user={user} />
          <span className="hidden items-center gap-2 rounded-pill bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-800 md:inline-flex">
            <ShieldCheck size={14} /> Admin
          </span>
        </div>
      </div>
      <main className="container-page py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="md:sticky md:top-6 md:self-start">
            <AdminSidebar items={items} />
            <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3 text-xs">
              <p className="mb-2 font-semibold text-brand-800">Quick actions</p>
              <Link href={'/shop/ads/new' as Route}
                className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-brand-700 hover:bg-brand-100"
              >+ Post Product</Link>
              <Link href={'/' as Route}
                className="mt-2 flex items-center gap-1 text-brand-700 hover:text-brand-600"
              ><ExternalLink size={12} /> View site as guest</Link>
            </div>

            {/* Prominent sign-out link, mirrors the shop sidebar */}
            <Link
              href={'/auth/logout' as Route}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-danger/30 bg-white px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/5"
            >
              <LogOut size={16} /> Sign out
            </Link>
          </aside>
          <section className="min-w-0 space-y-6">{children}</section>
        </div>
      </main>
    </>
  );
}
