import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import UserSettingsSection from "@/components/admin/UserSettings";

export default function AccountSettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <UserSettingsSection />
    </SidebarProvider>
  );
}
