"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getUserPackages } from "@/services/client/get-user-packages";
import { getUserProfileService } from "@/services/client/get-user-profile-by-id";
import { PackageItem } from "@/types/package";
import { Input } from "@/components/ui/input";
import { PackageSection } from "@/components/package/package-section";
import { Badge } from "@/components/ui/badge";
import { PackageCardFooter } from "@/components/package/package-card-footer";
import { 
  Package, 
  Calendar, 
  Filter, 
  ArrowUpDown, 
  Grid3X3,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  TrendingUp,
  Package2
} from "lucide-react";

export default function AllPackagePage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfileService,
  });

  const userId = userProfile?.data?.user_id ?? "";

  const { 
    data: packages = [], 
    isLoading, 
    isError 
  } = useQuery<PackageItem[]>({
    queryKey: ["user-packages", userId],
    queryFn: () => getUserPackages(userId),
    enabled: !!userId,
  });

  const filteredPackages = useMemo(() => {
    const result = packages
      .filter((pkg) =>
        initialStatus ? pkg.package_status === initialStatus : true
      )
      .filter((pkg) =>
      searchTerm ? pkg.package_description.toLowerCase().includes(searchTerm.toLowerCase()) : true
      )
      .filter((pkg) =>
        dateFilter ? pkg.updated_at.startsWith(dateFilter) : true
      );

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name":
        result.sort((a, b) => a.package_description.localeCompare(b.package_description));
        break;
    }

    return result;
  }, [packages, initialStatus, searchTerm, dateFilter, sortBy]);

  // Status configuration
  const statusConfig = {
    completed: { 
      icon: CheckCircle, 
      color: "bg-emerald-500 text-white", 
      label: "Completed",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    expired: { 
      icon: XCircle, 
      color: "bg-red-500 text-white", 
      label: "Expired",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    delivered: { 
      icon: Truck, 
      color: "bg-blue-500 text-white", 
      label: "Delivered",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    received: { 
      icon: Clock, 
      color: "bg-amber-500 text-white", 
      label: "Received",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    default: { 
      icon: Package2, 
      color: "bg-slate-500 text-white", 
      label: "Other",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200"
    }
  };

  const currentStatusConfig = statusConfig[initialStatus as keyof typeof statusConfig] || statusConfig.default;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
            <div className="relative">
              <Package className="w-12 h-12 mb-4 animate-bounce text-blue-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading packages...</h3>
            <p className="text-sm animate-pulse">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh] text-red-600">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200">
              <XCircle className="w-16 h-16 mb-4 mx-auto text-red-500" />
              <h3 className="text-xl font-semibold mb-2 text-center">Failed to load packages</h3>
              <p className="text-sm text-red-600/80 text-center">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 lg:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shadow-lg ${currentStatusConfig.color}`}>
                  <currentStatusConfig.icon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">
                    {initialStatus ? `${currentStatusConfig.label} Packages` : "All Packages"}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    <p className="text-sm">
                      Total <span className="font-semibold text-blue-600">{filteredPackages.length}</span> packages
                      {initialStatus && (
                        <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded-full">
                          filtered by {currentStatusConfig.label.toLowerCase()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid" 
                      ? "bg-white shadow-sm text-blue-600" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>

              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Filters & Search</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Sort Options */}
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name")}
                  className="w-full pl-10 h-11 border border-slate-300 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Active filters display */}
            {(searchTerm || dateFilter || initialStatus) && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-600">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="outline" className="gap-1">
                      Search: {searchTerm}
                      <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-500">
                        ×
                      </button>
                    </Badge>
                  )}
                  {dateFilter && (
                    <Badge variant="outline" className="gap-1">
                      Date: {dateFilter}
                      <button onClick={() => setDateFilter("")} className="ml-1 hover:text-red-500">
                        ×
                      </button>
                    </Badge>
                  )}
                  {initialStatus && (
                    <Badge variant="outline" className="gap-1">
                      Status: {currentStatusConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Package Section */}
          {filteredPackages.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <PackageSection
                title=""
                icon="received"
                items={filteredPackages}
                cardProps={{
                  topRightBadge: (item) => {
                    const config = statusConfig[item.package_status as keyof typeof statusConfig] || statusConfig.default;
                    return (
                      <Badge variant="default" className={`text-xs flex items-center gap-1 ${config.color}`}>
                        <config.icon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                    );
                  },
                  cardClassName: `hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-slate-200`,
                  footer: (item) => (
                    <PackageCardFooter
                      status={item.package_status}
                      histories={[]}
                    />
                  ),
                }}
              />
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="relative mb-6">
                  <Package className="w-20 h-20 mx-auto text-slate-400 mb-4" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">0</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  No packages found
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || dateFilter || initialStatus
                    ? "Try adjusting your filters or search terms to find more packages."
                    : "You don't have any packages yet. They will appear here once you receive them."}
                </p>
                
                {(searchTerm || dateFilter) && (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setDateFilter("");
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}