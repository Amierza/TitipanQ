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
import { Separator } from "@/components/ui/separator";
import { HistoryTable } from "@/components/history-table";
import { dummyPackageHistory } from "@/lib/data/dummy-history";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";

export default function PackageHistoryPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Package History</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main Content */}
        <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {/* Title + Deskripsi */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Package History
              </h1>
              <p className="text-gray-600">
                View picked-up or expired packages from all companies
              </p>
            </div>

            {/* Search form */}
            <div className="mb-4 max-w-md flex items-center gap-2">
              <SearchForm className="flex-1" />
              <Button type="submit" form="search-form">
                Search
              </Button>
            </div>

            {/* Table */}
            <div className="flex-1">
              <HistoryTable data={dummyPackageHistory} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
