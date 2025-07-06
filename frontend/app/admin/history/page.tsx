import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import HistoryPackageSection from "@/components/admin/HistoryPackage";

export default function PackageHistoryPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <HistoryPackageSection />
    </SidebarProvider>
  );
}
