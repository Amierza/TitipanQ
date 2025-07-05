'use client';

import PackageForm from "@/components/package/package-form";
import type { PackageFormData } from "@/types/package";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

const dummyUsers = [
  { id: "u1", name: "Andi" },
  { id: "u2", name: "Budi" },
];

const dummyPackage: Partial<PackageFormData> = {
  userId: "u1",
  type: "document",
  description: "Important letter",
  photo: null,
};

export default function EditPackagePage() {
  const handleSubmit = (data: PackageFormData) => {
    console.log("Updated package:", data);
    // fetch('/api/packages/:id', { method: "PUT", body: ..., ... })
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Edit Package</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main Content */}
        <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Edit Package
              </h1>
              <p className="text-gray-600">Update package information</p>
            </div>

            <PackageForm
              onSubmit={handleSubmit}
              users={dummyUsers}
              initialData={dummyPackage}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
