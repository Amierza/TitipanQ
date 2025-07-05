import { userPackages } from "@/lib/data/user-packages";
import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";
import { PackageSection } from "@/components/package/package-section";

export default function UserDashboardPage() {
  const pendingPackages = userPackages.filter(
    (p) => p.status === "Waiting to be picked up"
  );
  const completedPackages = userPackages.filter(
    (p) => p.status === "Picked up"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Package</h1>
          <p className="text-muted-foreground">
            {pendingPackages.length} Waiting to be picked up
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {pendingPackages.length} Pending
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {completedPackages.length} Done
          </Badge>
        </div>
      </div>

      {/* Sections */}
      {pendingPackages.length > 0 && (
        <PackageSection
          title="Waiting to be picked up"
          icon="pending"
          items={pendingPackages}
          highlight
        />
      )}

      {completedPackages.length > 0 && (
        <PackageSection
          title="Picked up"
          icon="done"
          items={completedPackages}
        />
      )}

      {/* Empty State */}
      {userPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No package yet</h3>
          <p className="text-muted-foreground">
            The received packages will appear here
          </p>
        </div>
      )}
    </div>
  );
}
