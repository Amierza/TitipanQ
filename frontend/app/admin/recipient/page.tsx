import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import RecipientSection from '@/components/admin/recipient/RecipientSection';

export default function RecipientPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <RecipientSection />
    </SidebarProvider>
  );
}
