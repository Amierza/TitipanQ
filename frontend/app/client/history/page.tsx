import { userPackages } from "@/lib/data/user-packages";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Package } from "lucide-react";
import { PackageSection } from "@/components/package/package-section";
import { PackageCardFooter } from "@/components/package/package-card-footer";

export default function HistoryPage() {
  const historyPackages = userPackages.filter(
    (p) => p.status === "Kadaluarsa" || p.status === "Sudah diambil"
  );

  const completedPackages = historyPackages.filter(
    (p) => p.status === "Sudah diambil"
  );
  const expiredPackages = historyPackages.filter(
    (p) => p.status === "Kadaluarsa"
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Package History</h1>
          <p className="text-muted-foreground">
            Total {historyPackages.length} packages in history
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {completedPackages.length} Taken
          </Badge>
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {expiredPackages.length} Expired
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
                ✓ Done
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
            cardClassName:
              "border-red-200 opacity-90 hover:opacity-100 transition-opacity",
            footer: (item) => <PackageCardFooter status={item.status} />,
          }}
        />
      )}

      {/* Empty */}
      {historyPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No history yet</h3>
          <p className="text-muted-foreground">
            A history of taken or expired packages will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
