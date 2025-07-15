import DetailPackageSection from "@/components/admin/DetailPackage"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const DetailPackagePage = () => {
    return (
        <SidebarProvider>
            <AppSidebar />

            <DetailPackageSection />
        </SidebarProvider>
    )
}

export default DetailPackagePage