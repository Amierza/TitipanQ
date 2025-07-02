import { userPackages } from "@/lib/data/user-packages";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Package } from "lucide-react";
import { PackageSection } from "@/components/package-section";
import { PackageCardFooter } from "@/components/package-card-footer";

export default function HistoryPage() {
  const historyPackages = userPackages.filter(
    (p) => p.status === "Kadaluarsa" || p.status === "Sudah diambil"
  );

  const completedPackages = historyPackages.filter((p) => p.status === "Sudah diambil");
  const expiredPackages = historyPackages.filter((p) => p.status === "Kadaluarsa");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Paket</h1>
          <p className="text-muted-foreground">
            Total {historyPackages.length} paket dalam riwayat
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {completedPackages.length} Diambil
          </Badge>
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {expiredPackages.length} Kadaluarsa
          </Badge>
        </div>
      </div>

      {/* Completed Section */}
      {completedPackages.length > 0 && (
        <PackageSection
          title="Paket Sudah Diambil"
          icon="done"
          items={completedPackages}
          cardProps={{
            topRightBadge: () => (
              <Badge variant="default" className="text-xs bg-green-500">
                ✓ Selesai
              </Badge>
            ),
            cardClassName: "border-green-200 hover:shadow-md transition-shadow",
            footer: (item) => <PackageCardFooter status={item.status} />,
          }}
        />
      )}

      {/* Expired Section */}
      {expiredPackages.length > 0 && (
        <PackageSection
          title="Paket Kadaluarsa"
          icon="expired"
          items={expiredPackages}
          cardProps={{
            topRightBadge: () => (
              <Badge variant="destructive" className="text-xs">
                ⚠ Expired
              </Badge>
            ),
            cardClassName: "border-red-200 opacity-90 hover:opacity-100 transition-opacity",
            footer: (item) => <PackageCardFooter status={item.status} />,
          }}
        />
      )}

      {/* Empty */}
      {historyPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada riwayat</h3>
          <p className="text-muted-foreground">
            Riwayat paket yang sudah diambil atau kadaluarsa akan muncul di sini
          </p>
        </div>
      )}
    </div>
  );
}
