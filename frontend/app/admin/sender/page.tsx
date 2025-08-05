import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import HistorySenderSection from '@/components/admin/sender/HistorySender';

export default function PackageHistoryPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <HistorySenderSection />
    </SidebarProvider>
  );
}
