import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import LockerSection from '@/components/admin/locker/LockerSection';

export default function LockerPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <LockerSection />
    </SidebarProvider>
  );
}
