"use client";

import { useMemo, useState } from "react";
import { userPackages } from "@/lib/data/user-packages";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Package } from "lucide-react";
import { PackageSection } from "@/components/package/package-section";
import { PackageCardFooter } from "@/components/package/package-card-footer";


export default function HistoryPage() {
  const [search] = useState("");

  const filteredPackages = useMemo(() => {
    return userPackages.filter(
      (p) =>
        (p.status === "expired" || p.status === "Picked up") &&
        p.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const completedPackages = filteredPackages.filter(
    (p) => p.status === "Picked up"
  );
  const expiredPackages = filteredPackages.filter(
    (p) => p.status === "expired"
  );

  const renderSection = (
    title: string,
    icon: "done" | "expired",
    items: typeof userPackages,
    badge: React.ReactNode,
    cardClassName: string
  ) => {
    if (items.length === 0) return null;
    return (
      <PackageSection
        title={title}
        icon={icon}
        items={items}
        cardProps={{
          topRightBadge: () => badge,
          cardClassName,
          footer: (item) => <PackageCardFooter status={item.status} />,
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Package History</h1>
          <p className="text-muted-foreground">
            Total {filteredPackages.length} packages in history
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

      {/* Search Form */}


      {/* Sections */}
      {renderSection(
        "Package Picked up",
        "done",
        completedPackages,
        <Badge variant="default" className="text-xs bg-green-500">
          Done
        </Badge>,
        "border-green-200 hover:shadow-md transition-shadow"
      )}

      {renderSection(
        "Package expired",
        "expired",
        expiredPackages,
        <Badge variant="destructive" className="text-xs">
          Expired
        </Badge>,
        "border-red-200 opacity-90 hover:opacity-100 transition-opacity"
      )}

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No history found</h3>
          <p className="text-muted-foreground">
            A history of taken or expired packages will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
