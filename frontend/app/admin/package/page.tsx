import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ManagePackageSection from "@/components/admin/ManagePackage";

export default function PackagePage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <ManagePackageSection />
    </SidebarProvider>
  );
}
