import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ManageCompaniesSection from "@/components/admin/ManageCompanies";

export default function AccountSettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <ManageCompaniesSection />
    </SidebarProvider>
  );
}
