import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function LockerPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>
  );
}
