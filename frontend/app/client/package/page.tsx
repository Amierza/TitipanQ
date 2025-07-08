"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PackageSection } from "@/components/package/package-section";
import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";
import { getUserProfileService } from "@/services/client/get-user-profile-by-id";
import { getUserPackages } from "@/services/client/get-user-packages";
import { PackageItem } from "@/types/package";

export default function UserDashboardPage() {
  const {
    data: userProfileData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfileService,
  });

  const userId = userProfileData?.status ? userProfileData.data.user_id : "";

  const {
    data: packages = [],
    isLoading: isPackagesLoading,
    isError: isPackagesError,
  } = useQuery<PackageItem[]>({
    queryKey: ["user-packages", userId],
    queryFn: () => getUserPackages(userId),
    enabled: !!userId,
  });

  const isLoading = isUserLoading || isPackagesLoading;
  const isError = isUserError || isPackagesError || !userId;

  const {
    receivedPackages,
    deliveredPackages,
    pickedUpPackages,
    expiredPackages,
  } = useMemo(() => {
    const received = packages.filter((p) => p.package_status === "received");
    const delivered = packages.filter((p) => p.package_status === "delivered");
    const pickedUp = packages.filter((p) => p.package_status === "completed"); // pastikan di backend ini bukan "pickup"
    const expired = packages.filter((p) => p.package_status === "expired");

    return {
      receivedPackages: received,
      deliveredPackages: delivered,
      pickedUpPackages: pickedUp,
      expiredPackages: expired,
    };
  }, [packages]);

  const isEmpty =
    packages.length === 0 ||
    (receivedPackages.length === 0 &&
      deliveredPackages.length === 0 &&
      pickedUpPackages.length === 0 &&
      expiredPackages.length === 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-muted-foreground">
        <span className="animate-pulse text-sm">Loading packages...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-red-500 space-y-2">
        <Package className="w-10 h-10" />
        <p className="text-sm">
          Failed to load package data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Package</h1>
          <p className="text-muted-foreground text-sm">
            {receivedPackages.length + deliveredPackages.length} waiting to be
            picked up
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-sm px-2 py-1"
          >
            <Clock className="w-3 h-3" />
            {receivedPackages.length + deliveredPackages.length} Pending
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 text-sm px-2 py-1"
          >
            <Package className="w-3 h-3" />
            {pickedUpPackages.length} Done
          </Badge>
        </div>
      </div>

      {/* Sections */}
      {receivedPackages.length > 0 && (
        <PackageSection
          title="Waiting to be picked up"
          icon="received"
          items={receivedPackages}
          highlight
        />
      )}

      {deliveredPackages.length > 0 && (
        <PackageSection
          title="Delivered"
          icon="delivered"
          items={deliveredPackages}
          highlight
        />
      )}

      {pickedUpPackages.length > 0 && (
        <PackageSection
          title="Picked up"
          icon="completed"
          items={pickedUpPackages}
        />
      )}

      {expiredPackages.length > 0 && (
        <PackageSection
          title="Expired"
          icon="expired"
          items={expiredPackages}
        />
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No packages yet</h3>
          <p className="text-sm">The received packages will appear here.</p>
        </div>
      )}
    </div>
  );
}
