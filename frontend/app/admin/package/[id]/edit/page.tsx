import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import EditPackageSection from "@/components/admin/EditPackage";

export default function EditPackagePage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <EditPackageSection />
    </SidebarProvider>
  );
}
