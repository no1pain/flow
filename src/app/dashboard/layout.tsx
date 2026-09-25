'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1">{children}</main>
      <ScrollToTop />
    </div>
  );
}
