import { AppSidebar } from "@/components/app-sidebar";
import NewPackageSection from "@/components/admin/NewPackage";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function NewPackagePage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <NewPackageSection />
    </SidebarProvider>
  );
}
