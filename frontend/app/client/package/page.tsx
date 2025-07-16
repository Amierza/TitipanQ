"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageSection } from "@/components/package/package-section";
import { PackageCardFooter } from "@/components/package/package-card-footer";
import { getUserProfileService } from "@/services/client/get-user-profile-by-id";
import { getUserPackages } from "@/services/client/get-user-packages";
import { getUserPackageHistory } from "@/services/client/get-user-package-history";
import { PackageItem } from "@/types/package";
import { Package, Clock, PackageCheck, CheckCircle, AlertTriangle } from "lucide-react";

export default function UserDashboardPage() {
  // Step 1: Get user profile
  const { data: userProfile, isLoading: isUserLoading, isError: isUserError } = useQuery({
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
      staleTime: 5 * 60 * 1000,
    })),
  });

  // Step 4: Map histories by package_id
  const histories: Record<string, Awaited<ReturnType<typeof getUserPackageHistory>>> = {};
  historyQueries.forEach((query, index) => {
    const pkgId = packages[index]?.package_id;
    if (query.isSuccess && pkgId) {
      histories[pkgId] = query.data!;
    }
  });

  // Step 5: Handle loading & error states
  const isLoading = isUserLoading || isPackagesLoading || historyQueries.some((q) => q.isLoading);
  const isError = isUserError || isPackagesError || historyQueries.some((q) => q.isError);

  // Step 6: Define status order & meta
  const statusOrder = ["delivered", "received", "completed", "expired"];

  const statusMeta: Record<string, { label: string; badgeClass: string; cardClass: string }> = {
    delivered: { label: "Delivered", badgeClass: "bg-blue-500", cardClass: "border-blue-200" },
    received: { label: "Received", badgeClass: "bg-yellow-400 text-black", cardClass: "border-yellow-200" },
    completed: { label: "Completed", badgeClass: "bg-green-500", cardClass: "border-green-200" },
    expired: { label: "Expired", badgeClass: "bg-red-500", cardClass: "border-red-200" },
    default: { label: "Other", badgeClass: "bg-gray-300 text-black", cardClass: "border-gray-200" },
  };

  const iconMap: Record<string, JSX.Element> = {
    delivered: <PackageCheck className="w-5 h-5 text-blue-500" />,
    received: <Clock className="w-5 h-5 text-yellow-500" />,
    completed: <CheckCircle className="w-5 h-5 text-green-500" />,
    expired: <AlertTriangle className="w-5 h-5 text-red-500" />,
  };

  // Step 7: Group packages by normalized status
  const groupedPackages = useMemo(() => {
    const map: Record<string, PackageItem[]> = {};
    packages.forEach((pkg) => {
      const status = pkg.package_status?.toLowerCase() ?? "default";
      if (!map[status]) map[status] = [];
      map[status].push(pkg);
    });
    return map;
  }, [packages]);

  const hasAnyPackages = packages.length > 0;

  // Step 8: Render
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-muted-foreground">
        <span className="animate-pulse">Loading package...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-red-500">
        <Package className="w-10 h-10 mb-2" />
        <p className="text-sm">Failed to load package.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Package</h1>
          <p className="text-muted-foreground py-3">Total {packages.length} packages</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOrder.map((status) => {
            const meta = statusMeta[status] ?? statusMeta.default;
            return (
              <Badge key={status} variant="default" className={`flex items-center gap-1 ${meta.badgeClass}`}>
                {meta.label} {groupedPackages[status]?.length ?? 0}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      {statusOrder.map((status) => {
        const meta = statusMeta[status] ?? statusMeta.default;
        const icon = iconMap[status];
        const items = groupedPackages[status] ?? [];

        if (items.length === 0) return null;

        const latestItems = [...items]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);

        return (
          <div key={status} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-lg font-semibold">Package {meta.label}</h2>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={{ pathname: "/client/package/all-package", query: { status } }}>
                  View All Packages
                </Link>
              </Button>
            </div>
            <PackageSection
              title=""
              icon={status}
              items={latestItems}
              cardProps={{
                topRightBadge: () => (
                  <Badge variant="default" className={`text-xs ${meta.badgeClass}`}>
                    {meta.label}
                  </Badge>
                ),
                cardClassName: `${meta.cardClass} hover:shadow-md transition-shadow`,
                footer: (item) => (
                  <PackageCardFooter status={item.package_status} histories={histories[item.package_id] ?? []} />
                ),
              }}
            />
          </div>
        );
      })}

      {/* Empty state */}
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
