import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NewPackageSection from "@/components/admin/NewPackage";

export default function PackagePage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <NewPackageSection />
    </SidebarProvider>
  );
}
