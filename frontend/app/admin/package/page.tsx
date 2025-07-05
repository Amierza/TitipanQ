'use client';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import PackageList from "@/components/package/package-list";
import type { PackageItem } from "@/types/package";

const dummyPackages: PackageItem[] = [
  {
    id: "1",
    userId: "u1",
    userName: "Andi",
    type: "document",
    description: "Surat penting",
    photoUrl: "/assets/paket1.jpg",
  },
  {
    id: "2",
    userId: "u1",
    userName: "Andi",
    type: "package",
    description: "Package penting",
    photoUrl: "/assets/paket2.jpg",
  },
];

export default function PackagePage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Package</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main Content */}
        <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Packages
                </h1>
                <p className="text-gray-600">Manage and track all packages</p>
              </div>
              <a href="/admin/package/new">
                <Button>+ Add Package</Button>
              </a>
            </div>

            <PackageList packages={dummyPackages} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
