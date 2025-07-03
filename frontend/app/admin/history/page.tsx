import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { HistoryTable } from "../../../components/history-table"
import { dummyPackageHistory } from "../../../lib/data/dummy-history"
import { AppSidebar } from "@/components/app-sidebar"

export default function PackageHistoryPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Package History</h1>
              <p className="text-gray-600">View picked-up or expired packages from all companies</p>
            </div>

            <div className="flex-1">
              <HistoryTable data={dummyPackageHistory} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
