"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { PackageSection } from "@/components/package/package-section";
import { PackageCardFooter } from "@/components/package/package-card-footer";
import { getUserProfileService } from "@/services/client/get-user-profile-by-id";
import { getUserPackages } from "@/services/client/get-user-packages";
import { getUserPackageHistory } from "@/services/client/get-user-package-history";
import { PackageItem } from "@/types/package";
import { Package } from "lucide-react";

export default function HistoryPage() {
  // Step 1: Get user profile
  const {
    data: userProfile,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfileService,
  });

  const userId = userProfile?.data?.user_id ?? "";

  // Step 2: Get user packages
  const {
    data: packages = [],
    isLoading: isPackagesLoading,
    isError: isPackagesError,
  } = useQuery<PackageItem[]>({
    queryKey: ["user-packages", userId],
    queryFn: () => getUserPackages(userId),
    enabled: !!userId,
  });

  // Step 3: Get all histories for all packages
  const historyQueries = useQueries({
    queries: packages.map((pkg) => ({
      queryKey: ["package-history", pkg.package_id],
      queryFn: () => getUserPackageHistory(pkg.package_id),
      enabled: !!pkg.package_id,
      staleTime: 5 * 60 * 1000, // 5 menit
    })),
  });

  // Step 4: Map histories by package_id
  const histories: Record<
    string,
    Awaited<ReturnType<typeof getUserPackageHistory>>
  > = {};
  historyQueries.forEach((query, index) => {
    const pkgId = packages[index]?.package_id;
    if (query.isSuccess && pkgId) {
      histories[pkgId] = query.data!;
    }
  });

  // Step 5: Handle loading and error states
  const isLoadingHistories = historyQueries.some((q) => q.isLoading);
  const isErrorHistories = historyQueries.some((q) => q.isError);

  const isLoading = isUserLoading || isPackagesLoading || isLoadingHistories;
  const isError = isUserError || isPackagesError || isErrorHistories;

  // Step 6: Get all unique statuses from packages
  const groupedPackages = useMemo(() => {
    const map: Record<string, PackageItem[]> = {};
    packages.forEach((pkg) => {
      if (!map[pkg.package_status]) {
        map[pkg.package_status] = [];
      }
      map[pkg.package_status].push(pkg);
    });
    return map;
  }, [packages]);

  // Step 7: Status to badge + color map
  const statusMeta: Record<
    string,
    { label: string; badgeClass: string; cardClass: string }
  > = {
    completed: {
      label: "completed",
      badgeClass: "bg-green-500",
      cardClass: "border-green-200",
    },
    expired: {
      label: "Expired",
      badgeClass: "bg-red-500",
      cardClass: "border-red-200",
    },
    delivered: {
      label: "Delivered",
      badgeClass: "bg-blue-500",
      cardClass: "border-blue-200",
    },
    received: {
      label: "Received",
      badgeClass: "bg-yellow-400 text-black",
      cardClass: "border-yellow-200",
    },
    // default fallback
    default: {
      label: "Other",
      badgeClass: "bg-gray-300 text-black",
      cardClass: "border-gray-200",
    },
  };

  // Step 8: UI States
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-muted-foreground">
        <span className="animate-pulse">Loading package history...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-red-500">
        <Package className="w-10 h-10 mb-2" />
        <p className="text-sm">Failed to load package history.</p>
      </div>
    );
  }

  const hasAnyPackages = packages.length > 0;
  const iconMap: Record<
    string,
    "received" | "delivered" | "completed" | "expired"
  > = {
    received: "received",
    delivered: "delivered",
    completed: "completed",
    expired: "expired",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Package History</h1>
          <p className="text-muted-foreground">
            Total {packages.length} packages in history
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(groupedPackages).map(([status, items]) => (
            <Badge
              key={status}
              variant="default"
              className={`flex items-center gap-1 ${
                statusMeta[status]?.badgeClass ?? statusMeta.default.badgeClass
              }`}
            >
              {statusMeta[status]?.label ?? status} {items.length}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sections */}
      {Object.entries(groupedPackages).map(([status, items]) => {
        const meta = statusMeta[status] ?? statusMeta.default;
        const icon = iconMap[status] ?? "received"; // default fallback

        return (
          <PackageSection
            key={status}
            title={`Package ${meta.label}`}
            icon={icon}
            items={items}
            cardProps={{
              topRightBadge: () => (
                <Badge
                  variant="default"
                  className={`text-xs ${meta.badgeClass}`}
                >
                  {meta.label}
                </Badge>
              ),
              cardClassName: `${meta.cardClass} hover:shadow-md transition-shadow`,
              footer: (item) => (
                <PackageCardFooter
                  status={item.package_status}
                  histories={histories[item.package_id] ?? []}
                />
              ),
            }}
          />
        );
      })}

      {/* Empty */}
      {!hasAnyPackages && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No package history</h3>
          <p className="text-sm">Your package history will appear here.</p>
        </div>
      )}
    </div>
  );
}
