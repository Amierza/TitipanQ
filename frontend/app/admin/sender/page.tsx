import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import SenderSection from '@/components/admin/sender/SenderSection';

export default function SenderPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SenderSection />
    </SidebarProvider>
  );
}
