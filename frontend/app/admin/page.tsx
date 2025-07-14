import { AppSidebar } from "@/components/app-sidebar";
import HomePage from "@/components/admin/HomePage";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <HomePage />
    </SidebarProvider>
  );
}
