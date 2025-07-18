"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { JSX, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageSection } from "@/components/package/package-section";
import { PackageCardFooter } from "@/components/package/package-card-footer";
import { getUserProfileService } from "@/services/client/get-user-profile-by-id";
import { getUserPackages } from "@/services/client/get-user-packages";
import { getUserPackageHistory } from "@/services/client/get-user-package-history";
import { PackageItem } from "@/types/package";
import {
  Package,
  Clock,
  PackageCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type PackageStatus = "received" | "delivered" | "completed" | "expired";

interface StatusMeta {
  label: string;
  badgeClass: string;
  cardClass: string;
}

interface PackageHistory {
  [packageId: string]: Awaited<ReturnType<typeof getUserPackageHistory>>;
}

export default function UserDashboardPage() {
  // Step 1: Get user profile
  const {
    data: userProfile,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
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
    error: packagesError,
  } = useQuery<PackageItem[]>({
    queryKey: ["user-packages", userId],
    queryFn: () => getUserPackages(userId),
    enabled: !!userId,
    select: (data) => data ?? [],
  });

  // Step 3: Get all histories for all packages
  const historyQueries = useQueries({
    queries: packages.map((pkg) => ({
      queryKey: ["package-history", pkg.package_id],
      queryFn: () => getUserPackageHistory(pkg.package_id),
      enabled: !!pkg.package_id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    })),
  });

  // Step 4: Map histories by package_id with better error handling
  const histories: PackageHistory = useMemo(() => {
    const historyMap: PackageHistory = {};

    historyQueries.forEach((query, index) => {
      const pkgId = packages[index]?.package_id;
      if (query.isSuccess && pkgId && query.data) {
        historyMap[pkgId] = query.data;
      }
    });

    return historyMap;
  }, [historyQueries, packages]);

  // Step 5: Handle loading & error states
  const isLoading =
    isUserLoading ||
    isPackagesLoading ||
    historyQueries.some((q) => q.isLoading);
  const hasHistoryErrors = historyQueries.some((q) => q.isError);
  const isError = isUserError || isPackagesError;

  // Step 6: Define status order & meta - improved type safety
  const statusOrder: PackageStatus[] = [
    "received",
    "delivered",
    "completed",
    "expired",
  ];

  const statusMeta: Record<PackageStatus, StatusMeta> = {
    received: {
      label: "Received",
      badgeClass: "bg-yellow-400 text-black",
      cardClass: "border-yellow-200",
    },
    delivered: {
      label: "Delivered",
      badgeClass: "bg-blue-500",
      cardClass: "border-blue-200",
    },
    completed: {
      label: "Completed",
      badgeClass: "bg-green-500",
      cardClass: "border-green-200",
    },
    expired: {
      label: "Expired",
      badgeClass: "bg-red-500",
      cardClass: "border-red-200",
    },
  };

  const iconMap: Record<PackageStatus, JSX.Element> = {
    received: <Clock className="w-5 h-5 text-yellow-500" />,
    delivered: <PackageCheck className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle className="w-5 h-5 text-green-500" />,
    expired: <AlertTriangle className="w-5 h-5 text-red-500" />,
  };

  // Step 7: Group packages by status with improved logic
  const groupedPackages = useMemo(() => {
    const map: Record<PackageStatus, PackageItem[]> = {
      received: [],
      delivered: [],
      completed: [],
      expired: [],
    };

    packages.forEach((pkg) => {
      const status = pkg.package_status;
      if (status && status in map) {
        map[status].push(pkg);
      }
    });

    return map;
  }, [packages]);

  const hasAnyPackages = packages.length > 0;
  const totalPackages = packages.length;

  // Step 8: Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <span className="animate-pulse">Loading packages...</span>
      </div>
    );
  }

  // Step 9: Render error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-red-500">
        <Package className="w-10 h-10 mb-2" />
        <p className="text-sm mb-2">Failed to load packages.</p>
        {(userError || packagesError) && (
          <p className="text-xs text-muted-foreground">
            {userError?.message ||
              packagesError?.message ||
              "Unknown error occurred"}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Packages</h1>
          <p className="text-muted-foreground py-3">
            Total {totalPackages} package{totalPackages !== 1 ? "s" : ""}
          </p>
          {hasHistoryErrors && (
            <p className="text-xs text-orange-600">
              Some package histories may not be up to date
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOrder.map((status) => {
            const meta = statusMeta[status];
            const count = groupedPackages[status]?.length ?? 0;

            return (
              <Badge
                key={status}
                variant="default"
                className={`flex items-center gap-1 ${meta.badgeClass}`}
              >
                {meta.label} {count}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Package Sections */}
      {statusOrder.map((status) => {
        const meta = statusMeta[status];
        const icon = iconMap[status];
        const items = groupedPackages[status] ?? [];

        if (items.length === 0) return null;

        // Sort by created_at (newest first) and take latest 3
        const latestItems = [...items]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 3);

        return (
          <div key={status} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-lg font-semibold">
                  {meta.label} Packages ({items.length})
                </h2>
              </div>
              {items.length > 3 && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={{
                      pathname: "/client/package/all-package",
                      query: { status },
                    }}
                  >
                    View All ({items.length})
                  </Link>
                </Button>
              )}
            </div>

            <PackageSection
              title=""
              icon={status}
              items={latestItems}
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
          </div>
        );
      })}

      {/* Empty state */}
      {!hasAnyPackages && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No packages found</h3>
          <p className="text-sm">
            Your package history will appear here once you have packages.
          </p>
        </div>
      )}
    </div>
  );
}
