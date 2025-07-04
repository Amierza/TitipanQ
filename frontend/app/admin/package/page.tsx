import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UploadPackagePhoto } from "@/components/upload-package-photo";
import { PackageForm } from "@/components/package/package-form";

export default function AddPackagePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Package</h1>
              <p className="text-gray-600">Fill in the details below to register a new package</p>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-full">
                <UploadPackagePhoto />
              </div>
              <div className="h-full">
                <PackageForm />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}