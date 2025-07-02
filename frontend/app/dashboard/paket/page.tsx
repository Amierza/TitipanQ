import { userPackages } from "@/lib/data/user-packages";
import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";
import { PackageSection } from "@/components/package-section";

export default function UserDashboardPage() {
  const pendingPackages = userPackages.filter((p) => p.status === "Menunggu diambil");
  const completedPackages = userPackages.filter((p) => p.status === "Sudah diambil");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paket Saya</h1>
          <p className="text-muted-foreground">
            {pendingPackages.length} paket menunggu diambil
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {pendingPackages.length} Pending
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {completedPackages.length} Selesai
          </Badge>
        </div>
      </div>

      {/* Sections */}
      {pendingPackages.length > 0 && (
        <PackageSection
          title="Menunggu Diambil"
          icon="pending"
          items={pendingPackages}
          highlight
        />
      )}

      {completedPackages.length > 0 && (
        <PackageSection
          title="Sudah Diambil"
          icon="done"
          items={completedPackages}
        />
      )}

      {/* Empty State */}
      {userPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada paket</h3>
          <p className="text-muted-foreground">
            Paket yang diterima akan muncul di sini
          </p>
        </div>
      )}
    </div>
  );
}
